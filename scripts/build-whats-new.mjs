import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

const manifestPath = path.join(workspaceRoot, 'docs', 'whats-new', 'manifest.json');
const outputHtmlPath = path.join(workspaceRoot, 'docs', 'whats-new', 'index.html');
const outputMarkdownPath = path.join(workspaceRoot, 'docs', 'whats-new', 'README.md');
const outputManifestJsPath = path.join(workspaceRoot, 'docs', 'whats-new', 'manifest.js');

function shouldPromptDescriptions() {
  return ['1', 'true', 'yes'].includes(String(process.env.WHATS_NEW_PROMPT_DESCRIPTIONS || '').toLowerCase());
}

async function maybePromptForDescriptions(manifest) {
  if (!shouldPromptDescriptions()) return manifest;
  if (!process.stdin.isTTY || !process.stdout.isTTY) return manifest;

  const items = Array.isArray(manifest.items) ? manifest.items : [];
  if (!items.length) return manifest;

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log('[whats-new:build] Prompt mode enabled. Press Enter to keep existing description.');
    for (const item of items) {
      const title = String(item.title || item.id || 'Update').trim();
      const existingNote = String(item.note || '').trim();
      console.log('');
      console.log(`Feature: ${title}`);
      console.log(`Current: ${existingNote}`);
      const response = await rl.question('New description (optional): ');
      const nextNote = String(response || '').trim();
      if (nextNote) {
        item.note = nextNote;
      }
    }
  } finally {
    rl.close();
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`[whats-new:build] Updated ${path.relative(workspaceRoot, manifestPath)} from prompt input.`);
  return manifest;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const manifest = await maybePromptForDescriptions(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
  const title = String(manifest.title || "StitchLab What's New");
  const intro = String(manifest.intro || '');
  const items = Array.isArray(manifest.items) ? manifest.items : [];

  const now = new Date().toISOString();
  const cardHtml = [];
  const markdownLines = [];

  markdownLines.push(`# ${title}`);
  markdownLines.push('');
  if (intro) {
    markdownLines.push(intro);
    markdownLines.push('');
  }
  markdownLines.push(`Generated: ${now}`);
  markdownLines.push('');

  for (const item of items) {
    const id = String(item.id || '').trim();
    const featureTitle = String(item.title || id || 'Feature');
    const note = String(item.note || '');
    const gifRelPath = String(item.gif || '').trim();
    const gifAbsPath = path.join(workspaceRoot, 'docs', 'whats-new', gifRelPath);
    const gifExists = gifRelPath ? await fileExists(gifAbsPath) : false;
    const safeId = escapeHtml(id || featureTitle.toLowerCase().replace(/\s+/g, '-'));
    const safeTitle = escapeHtml(featureTitle);
    const safeNote = escapeHtml(note);
    const safeGifSrc = escapeHtml(gifRelPath || '');

    cardHtml.push(`
      <article class="feature-card" id="${safeId}">
        <h2>${safeTitle}</h2>
        ${gifExists
          ? `<img src="${safeGifSrc}" alt="${safeTitle} demonstration GIF" loading="lazy">`
          : '<p class="missing">GIF missing. Run npm run whats-new:generate.</p>'}
        <p>${safeNote}</p>
      </article>
    `);

    markdownLines.push(`## ${featureTitle}`);
    markdownLines.push('');
    if (gifExists) {
      markdownLines.push(`![${featureTitle}](${gifRelPath})`);
    } else {
      markdownLines.push('_GIF missing. Run `npm run whats-new:generate`._');
    }
    markdownLines.push('');
    markdownLines.push(note);
    markdownLines.push('');
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #f4efe6;
      --ink: #1e2a32;
      --muted: #6d757d;
      --card: #fffdf7;
      --accent: #0f766e;
      --border: #d9cfbe;
      --shadow: rgba(30, 42, 50, 0.08);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #1a2129;
        --ink: #e5edf6;
        --muted: #9fb0c3;
        --card: #222d39;
        --accent: #7cd9cf;
        --border: #3f5266;
        --shadow: rgba(4, 7, 11, 0.45);
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
      background: radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--card) 55%, var(--bg) 45%) 0%, var(--bg) 55%, color-mix(in srgb, var(--bg) 85%, #000 15%) 100%);
    }
    header {
      padding: 2rem 1rem 1.25rem;
      max-width: 1360px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 0.5rem;
      letter-spacing: 0.02em;
    }
    .stamp {
      color: var(--muted);
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }
    .intro {
      margin: 0;
      color: var(--muted);
      max-width: 70ch;
    }
    .grid {
      max-width: 1360px;
      margin: 0 auto;
      padding: 0.5rem 1rem 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(520px, 1fr));
      gap: 1.25rem;
    }
    .feature-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 10px 24px var(--shadow);
      padding: 1rem;
      display: grid;
      gap: 0.85rem;
      align-content: start;
    }
    .feature-card h2 {
      margin: 0;
      font-size: 1.12rem;
      line-height: 1.3;
      color: var(--accent);
    }
    .feature-card img {
      width: 100%;
      height: auto;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: color-mix(in srgb, var(--card) 80%, var(--bg) 20%);
      display: block;
    }
    .feature-card p {
      margin: 0;
      line-height: 1.45;
    }
    .missing {
      color: #8a2d2d;
      font-weight: 600;
      background: #fff1f1;
      border: 1px solid #f0c8c8;
      border-radius: 8px;
      padding: 0.6rem 0.7rem;
    }
    @media (max-width: 920px) {
      header { padding-top: 1.25rem; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p class="intro">${escapeHtml(intro)}</p>
    <p class="stamp">Generated: ${escapeHtml(now)}</p>
  </header>
  <main class="grid">
    ${cardHtml.join('\n')}
  </main>
</body>
</html>
`;

  await fs.writeFile(outputHtmlPath, html, 'utf8');
  await fs.writeFile(outputMarkdownPath, `${markdownLines.join('\n')}\n`, 'utf8');
  await fs.writeFile(
    outputManifestJsPath,
    `window.stitchlabWhatsNewManifest = ${JSON.stringify(manifest, null, 2)};\n`,
    'utf8'
  );

  console.log(`[whats-new:build] Wrote ${path.relative(workspaceRoot, outputHtmlPath)}`);
  console.log(`[whats-new:build] Wrote ${path.relative(workspaceRoot, outputMarkdownPath)}`);
  console.log(`[whats-new:build] Wrote ${path.relative(workspaceRoot, outputManifestJsPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
