#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readdir, stat, unlink, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DEFAULT_MANIFEST = 'assets/audio/narration/manifest.json';
const DEFAULT_CLIPS_DIR = 'assets/audio/narration/clips';

function parseArgs(argv) {
  const args = {
    manifestPath: DEFAULT_MANIFEST,
    clipsDir: DEFAULT_CLIPS_DIR,
    apply: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--apply') {
      args.apply = true;
      continue;
    }
    if (token === '--manifest' && argv[i + 1]) {
      args.manifestPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--clips-dir' && argv[i + 1]) {
      args.clipsDir = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return args;
}

async function listFiles(absDir) {
  if (!existsSync(absDir)) return [];
  const entries = await readdir(absDir);
  const files = [];
  for (const entry of entries) {
    const full = path.join(absDir, entry);
    const info = await stat(full);
    if (info.isFile()) files.push(entry);
  }
  return files;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifestAbs = path.join(ROOT, args.manifestPath);
  const clipsAbs = path.join(ROOT, args.clipsDir);

  if (!existsSync(manifestAbs)) {
    throw new Error('Manifest not found: ' + manifestAbs);
  }
  if (!existsSync(clipsAbs)) {
    throw new Error('Clips directory not found: ' + clipsAbs);
  }

  const manifest = JSON.parse(await readFile(manifestAbs, 'utf8'));
  const clipEntries = Array.isArray(manifest && manifest.clips) ? manifest.clips : [];

  const expectedFiles = new Set();
  for (const clip of clipEntries) {
    const rel = String((clip && clip.file) || '').trim();
    if (!rel) continue;
    expectedFiles.add(path.basename(rel));
  }

  const existingFiles = await listFiles(clipsAbs);
  const orphaned = existingFiles.filter((name) => !expectedFiles.has(name));

  console.log('Manifest clips:', clipEntries.length);
  console.log('Clip files on disk:', existingFiles.length);
  console.log('Orphaned clip files:', orphaned.length);

  if (!orphaned.length) {
    return;
  }

  for (const fileName of orphaned) {
    const absPath = path.join(clipsAbs, fileName);
    if (args.apply) {
      await unlink(absPath);
      console.log('Deleted:', path.relative(ROOT, absPath));
    } else {
      console.log('Would delete:', path.relative(ROOT, absPath));
    }
  }

  if (!args.apply) {
    console.log('Dry run only. Re-run with --apply to delete orphaned clips.');
  }
}

main().catch((error) => {
  console.error(String(error && error.message ? error.message : error));
  process.exitCode = 1;
});
