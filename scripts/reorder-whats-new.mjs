import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(workspaceRoot, 'docs', 'whats-new', 'manifest.json');

function parseCsvList(raw) {
  return String(raw || '')
    .split(',')
    .map((value) => String(value || '').trim())
    .filter(Boolean);
}

function printCurrentOrder(items) {
  console.log('[whats-new:reorder] Current order:');
  items.forEach((item, index) => {
    const id = String(item.id || '').trim();
    const title = String(item.title || id || '(untitled)').trim();
    console.log(`${index + 1}. ${id} | ${title}`);
  });
}

function buildIdMap(items) {
  const map = new Map();
  for (const item of items) {
    const id = String(item.id || '').trim();
    if (id) {
      map.set(id.toLowerCase(), item);
    }
  }
  return map;
}

function parseTokenToItem(token, items, idMap) {
  const trimmed = String(token || '').trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    const index = Number(trimmed) - 1;
    if (index >= 0 && index < items.length) {
      return items[index];
    }
    return null;
  }

  return idMap.get(trimmed.toLowerCase()) || null;
}

function reorderItems(items, orderTokens) {
  const idMap = buildIdMap(items);
  const picked = [];
  const seenIds = new Set();

  for (const token of orderTokens) {
    const match = parseTokenToItem(token, items, idMap);
    if (!match) {
      throw new Error(`Unknown order token: "${token}"`);
    }

    const id = String(match.id || '').trim();
    if (!id) {
      throw new Error('Manifest item is missing an id and cannot be reordered safely.');
    }
    if (seenIds.has(id)) {
      throw new Error(`Duplicate item in requested order: "${id}"`);
    }

    seenIds.add(id);
    picked.push(match);
  }

  if (picked.length !== items.length) {
    throw new Error(`Order must include every item exactly once (${items.length} total, received ${picked.length}).`);
  }

  return picked;
}

async function promptForOrder(items) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Interactive reorder requires a TTY. Use --order or WHATS_NEW_REORDER when running non-interactively.');
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log('');
    console.log('[whats-new:reorder] Enter a new order as comma-separated numbers or ids.');
    console.log('[whats-new:reorder] Example (numbers): 3,1,2,4');
    console.log('[whats-new:reorder] Example (ids): formula-mode-improvements,thread-reordering-advanced-pane,...');
    const response = await rl.question('New order: ');
    const tokens = parseCsvList(response);
    if (!tokens.length) {
      throw new Error('No order provided.');
    }
    return tokens;
  } finally {
    rl.close();
  }
}

function parseCliOrder(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--order') {
      return parseCsvList(argv[i + 1] || '');
    }
    if (arg.startsWith('--order=')) {
      return parseCsvList(arg.slice('--order='.length));
    }
  }
  return parseCsvList(process.env.WHATS_NEW_REORDER);
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const items = Array.isArray(manifest.items) ? manifest.items : [];

  if (!items.length) {
    throw new Error(`No manifest items found in ${manifestPath}`);
  }

  printCurrentOrder(items);

  const argv = process.argv.slice(2);
  const listOnly = argv.includes('--list-only');
  if (listOnly) {
    return;
  }

  let orderTokens = parseCliOrder(argv);
  if (!orderTokens.length) {
    orderTokens = await promptForOrder(items);
  }

  const reordered = reorderItems(items, orderTokens);
  manifest.items = reordered;

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log('');
  console.log('[whats-new:reorder] Applied new item order and updated manifest.');
  printCurrentOrder(manifest.items);
}

main().catch((error) => {
  console.error(`[whats-new:reorder] ${error.message || error}`);
  process.exit(1);
});
