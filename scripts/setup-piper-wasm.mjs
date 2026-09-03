#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const PACKAGE_DIST_DIR = path.join(repoRoot, 'node_modules', 'piper-tts-web', 'dist');
const TARGET_VENDOR_FILE = path.join(repoRoot, 'js', 'vendor', 'piper-tts-web.js');

const RUNTIME_COPIES = [
  { from: path.join(PACKAGE_DIST_DIR, 'onnx'), to: path.join(repoRoot, 'assets', 'tts', 'runtime', 'onnx') },
  { from: path.join(PACKAGE_DIST_DIR, 'piper'), to: path.join(repoRoot, 'assets', 'tts', 'runtime', 'piper') },
  { from: path.join(PACKAGE_DIST_DIR, 'worker'), to: path.join(repoRoot, 'assets', 'tts', 'runtime', 'worker') },
];

const MODEL_BASE_URL = 'https://huggingface.co/rhasspy/piper-voices/resolve/main';
const MODEL_RELATIVE_DIR = 'en/en_US/hfc_female/medium';
const MODEL_BASENAME = 'en_US-hfc_female-medium';
const MODEL_TARGET_DIR = path.join(repoRoot, 'assets', 'tts', 'models', MODEL_RELATIVE_DIR);
const MODEL_TARGET_JSON = path.join(MODEL_TARGET_DIR, MODEL_BASENAME + '.onnx.json');
const MODEL_TARGET_ONNX = path.join(MODEL_TARGET_DIR, MODEL_BASENAME + '.onnx');
const FORCE_DOWNLOAD = process.argv.includes('--force');

async function ensureReadable(pathValue) {
  await fs.access(pathValue);
}

async function copyDirectoryContents(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectoryContents(sourcePath, targetPath);
      continue;
    }
    await fs.copyFile(sourcePath, targetPath);
  }
}

async function copyRuntimeAssets() {
  const vendorSource = path.join(PACKAGE_DIST_DIR, 'piper-tts-web.js');
  await fs.mkdir(path.dirname(TARGET_VENDOR_FILE), { recursive: true });
  await fs.copyFile(vendorSource, TARGET_VENDOR_FILE);

  for (const mapping of RUNTIME_COPIES) {
    await copyDirectoryContents(mapping.from, mapping.to);
  }
}

async function writeMinimalVoicesManifest() {
  const voicesTarget = path.join(repoRoot, 'assets', 'tts', 'models', 'voices.json');
  await fs.mkdir(path.dirname(voicesTarget), { recursive: true });
  const voicesManifest = {
    [MODEL_BASENAME]: {
      name: 'HFC Female Medium',
      key: MODEL_BASENAME,
      quality: 'medium',
      language: {
        code: 'en_US',
        family: 'en'
      }
    }
  };
  await fs.writeFile(voicesTarget, JSON.stringify(voicesManifest, null, 2) + '\n', 'utf8');
}

async function downloadToFile(url, targetPath) {
  if (!FORCE_DOWNLOAD) {
    try {
      await fs.access(targetPath);
      process.stdout.write('Skipping existing file: ' + path.relative(repoRoot, targetPath) + '\n');
      return;
    } catch (_error) {
      // Continue to download when file does not exist.
    }
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download ' + url + ' (' + response.status + ')');
  }
  const arrayBuffer = await response.arrayBuffer();
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
}

async function ensureVoiceModel() {
  const jsonUrl = MODEL_BASE_URL + '/' + MODEL_RELATIVE_DIR + '/' + MODEL_BASENAME + '.onnx.json';
  const onnxUrl = MODEL_BASE_URL + '/' + MODEL_RELATIVE_DIR + '/' + MODEL_BASENAME + '.onnx';

  await downloadToFile(jsonUrl, MODEL_TARGET_JSON);
  await downloadToFile(onnxUrl, MODEL_TARGET_ONNX);
}

async function main() {
  await ensureReadable(PACKAGE_DIST_DIR);
  await copyRuntimeAssets();
  await writeMinimalVoicesManifest();
  await ensureVoiceModel();

  process.stdout.write('Piper WASM runtime and voice model are ready in assets/tts.\n');
}

main().catch((error) => {
  process.stderr.write(String(error && error.stack ? error.stack : error) + '\n');
  process.exitCode = 1;
});
