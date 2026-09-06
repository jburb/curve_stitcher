#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DEFAULT_VOICE = 'en_US-hfc_female-medium';
const DEFAULT_DATA_DIR = 'assets/audio/narration/voices';
const DEFAULT_MANIFEST_PATH = 'assets/audio/narration/manifest.json';
const DEFAULT_AUDIO_DIR = 'assets/audio/narration/clips';

function parseArgs(argv) {
  const args = {
    python: '',
    voice: DEFAULT_VOICE,
    dataDir: DEFAULT_DATA_DIR,
    modelPath: '',
    manifestPath: DEFAULT_MANIFEST_PATH,
    audioDir: DEFAULT_AUDIO_DIR,
    force: false,
    manifestOnly: false,
    skipVoiceDownload: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--force') {
      args.force = true;
      continue;
    }
    if (token === '--manifest-only') {
      args.manifestOnly = true;
      continue;
    }
    if (token === '--python' && argv[i + 1]) {
      args.python = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--skip-voice-download') {
      args.skipVoiceDownload = true;
      continue;
    }
    if (token === '--voice' && argv[i + 1]) {
      args.voice = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--data-dir' && argv[i + 1]) {
      args.dataDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--model' && argv[i + 1]) {
      args.modelPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--manifest' && argv[i + 1]) {
      args.manifestPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--audio-dir' && argv[i + 1]) {
      args.audioDir = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return args;
}

function canRunPython(command) {
  const result = spawnSync(command, ['--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) return false;
  return result.status === 0;
}

function resolvePythonCommand(args) {
  const candidates = [];
  function pushCandidate(value) {
    const normalized = String(value || '').trim();
    if (!normalized) return;
    if (candidates.indexOf(normalized) !== -1) return;
    candidates.push(normalized);
  }

  pushCandidate(args.python);
  pushCandidate(process.env.PIPER_PYTHON);
  if (process.env.VIRTUAL_ENV) {
    pushCandidate(path.join(process.env.VIRTUAL_ENV, 'bin', 'python'));
  }
  pushCandidate(path.join(ROOT, '.venv', 'bin', 'python'));
  pushCandidate('python3');
  pushCandidate('python');

  for (const candidate of candidates) {
    if (canRunPython(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'No usable Python interpreter found for Piper CLI. '
    + 'Tried: ' + candidates.join(', ') + '. '
    + 'Pass --python <path> or set PIPER_PYTHON.'
  );
}

function hasPythonPiperModule(pythonCommand) {
  const result = spawnSync(pythonCommand, ['-m', 'piper', '--help'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return result.status === 0;
}

function ensureVoiceAvailable(pythonCommand, voiceName, dataDirAbsPath) {
  const args = ['-m', 'piper.download_voices', voiceName, '--data-dir', dataDirAbsPath];
  const result = spawnSync(pythonCommand, args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.error) {
    throw new Error('Failed to execute piper voice download: ' + String(result.error.message || result.error));
  }
  if (result.status !== 0) {
    throw new Error(
      'piper.download_voices failed (' + String(result.status) + '): '
      + String(result.stderr || result.stdout || '').trim()
    );
  }
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function decodeEscapedString(source) {
  return source
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\'/g, "'")
    .replace(/\\\"/g, '"');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtmlTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

async function collectAboutDocPaths() {
  const sourcePath = path.join(ROOT, 'js/app/experience-library.js');
  const source = await readFile(sourcePath, 'utf8');
  const matches = source.matchAll(/aboutHtmlPath\s*:\s*'([^']+)'/g);
  const paths = [];
  for (const match of matches) {
    const p = String(match[1] || '').trim();
    if (p) paths.push(p);
  }
  return Array.from(new Set(paths));
}

async function collectAboutNarrationTexts() {
  const result = [];
  const aboutPaths = await collectAboutDocPaths();
  for (const relPath of aboutPaths) {
    const absPath = path.join(ROOT, relPath);
    if (!existsSync(absPath)) continue;

    const html = await readFile(absPath, 'utf8');
    const paragraphMatches = html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
    const paragraphs = [];
    for (const match of paragraphMatches) {
      const clean = normalizeText(decodeHtmlEntities(stripHtmlTags(match[1] || '')));
      if (clean) paragraphs.push(clean);
    }

    const fullText = normalizeText(paragraphs.join('\n\n'));
    if (fullText) {
      result.push({
        source: relPath,
        text: fullText,
      });
    }
  }
  return result;
}

async function collectOnboardingTexts() {
  const filePath = path.join(ROOT, 'js/app/onboarding.js');
  const source = await readFile(filePath, 'utf8');
  const texts = [];
  const regex = /(quickStartText|text)\s*:\s*'((?:\\'|[^'])*)'/g;
  const concatRegex = /text\s*:\s*'((?:\\'|[^'])*)'\s*\+\s*experienceLabel\s*\+\s*'((?:\\'|[^'])*)'/g;
  const onboardingExperienceLabels = ['stitching', 'triangula', 'squarus', 'mashrabiya'];

  let match;
  while ((match = regex.exec(source)) !== null) {
    const raw = decodeEscapedString(match[2] || '');
    const normalized = normalizeText(raw);
    if (!normalized) continue;
    texts.push({
      source: 'js/app/onboarding.js',
      text: normalized,
    });
  }

  let concatMatch;
  while ((concatMatch = concatRegex.exec(source)) !== null) {
    const prefix = decodeEscapedString(concatMatch[1] || '');
    const suffix = decodeEscapedString(concatMatch[2] || '');
    for (const experienceLabel of onboardingExperienceLabels) {
      const raw = prefix + experienceLabel + suffix;
      const normalized = normalizeText(raw);
      if (!normalized) continue;
      texts.push({
        source: 'js/app/onboarding.js',
        text: normalized,
      });
    }
  }

  return texts;
}

async function collectStartupSplashText() {
  const filePath = path.join(ROOT, 'stitchlab.html');
  const source = await readFile(filePath, 'utf8');
  const match = source.match(/<p\s+id="startup-splash-text"[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return [];

  const normalized = normalizeText(decodeHtmlEntities(stripHtmlTags(match[1] || '')));
  if (!normalized) return [];

  return [{
    source: 'stitchlab.html#startup-splash-text',
    text: normalized,
    id: 'narration.splash.startup',
  }];
}

function ensureDirForFile(absPath) {
  return mkdir(path.dirname(absPath), { recursive: true });
}

async function listAudioFiles(absAudioDir) {
  if (!existsSync(absAudioDir)) return new Set();
  const entries = await readdir(absAudioDir);
  const files = new Set();
  for (const entry of entries) {
    const full = path.join(absAudioDir, entry);
    const info = await stat(full);
    if (info.isFile()) files.add(entry);
  }
  return files;
}

async function isGitLfsPointerFile(absPath) {
  try {
    const sample = await readFile(absPath, 'utf8');
    return /^version https:\/\/git-lfs\.github\.com\/spec\/v1\s*$/m.test(sample)
      && /^oid sha256:[a-f0-9]{64}\s*$/m.test(sample)
      && /^size \d+\s*$/m.test(sample);
  } catch {
    return false;
  }
}

function runPiperGenerate(options) {
  const args = ['-m', 'piper', '-m', options.modelRef, '-f', options.outputAbsPath];
  if (options.dataDirAbsPath) {
    args.push('--data-dir', options.dataDirAbsPath);
  }
  args.push('--', options.textValue);

  const result = spawnSync(options.pythonCommand, args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw new Error('Failed to execute piper CLI module: ' + String(result.error.message || result.error));
  }
  if (result.status !== 0) {
    throw new Error('python3 -m piper failed (' + String(result.status) + '): ' + String(result.stderr || result.stdout || '').trim());
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pythonCommand = resolvePythonCommand(args);
  const dataDirAbsPath = path.join(ROOT, args.dataDir);
  const modelAbsPath = args.modelPath ? path.join(ROOT, args.modelPath) : '';
  const manifestAbsPath = path.join(ROOT, args.manifestPath);
  const audioAbsDir = path.join(ROOT, args.audioDir);

  const modelExists = !!(modelAbsPath && existsSync(modelAbsPath));
  if (modelExists && await isGitLfsPointerFile(modelAbsPath)) {
    throw new Error(
      'Model file appears to be a Git LFS pointer and not the real .onnx payload: '
      + path.relative(ROOT, modelAbsPath) + '. '
      + 'Run `git lfs pull --include="' + path.relative(ROOT, modelAbsPath) + '"` and try again.'
    );
  }

  const modelRef = modelExists
    ? modelAbsPath
    : String(args.voice || '').trim();
  if (!modelRef) {
    throw new Error('No voice/model reference provided. Use --voice <VOICE_NAME> or --model <MODEL_PATH>.');
  }

  const useDataDir = !modelExists;

  const textCandidates = [];
  textCandidates.push(...await collectStartupSplashText());
  textCandidates.push(...await collectOnboardingTexts());
  textCandidates.push(...await collectAboutNarrationTexts());

  const dedupByHash = new Map();
  for (const item of textCandidates) {
    const normalized = normalizeText(item.text);
    if (!normalized) continue;
    const textHash = sha256Hex(normalized);
    if (!dedupByHash.has(textHash)) {
      dedupByHash.set(textHash, {
        id: item.id ? String(item.id) : '',
        source: item.source,
        text: normalized,
        textHash,
      });
    }
  }

  const clips = Array.from(dedupByHash.values()).map((entry) => {
    const fileName = entry.textHash + '.wav';
    return {
      id: entry.id || undefined,
      source: entry.source,
      textHash: entry.textHash,
      charCount: entry.text.length,
      preview: entry.text.slice(0, 96),
      file: path.posix.join(path.posix.basename(args.audioDir), fileName),
      _text: entry.text,
      _absPath: path.join(audioAbsDir, fileName),
    };
  });

  clips.sort((a, b) => a.textHash.localeCompare(b.textHash));

  await mkdir(audioAbsDir, { recursive: true });

  if (!args.manifestOnly) {
    if (!hasPythonPiperModule(pythonCommand)) {
      throw new Error(
        'Python Piper module not found for interpreter ' + pythonCommand + '. '
        + 'Install with: ' + pythonCommand + ' -m pip install piper-tts'
      );
    }

    if (useDataDir) {
      await mkdir(dataDirAbsPath, { recursive: true });
      if (!args.skipVoiceDownload) {
        ensureVoiceAvailable(pythonCommand, modelRef, dataDirAbsPath);
      }
    }

    const currentAudioFiles = await listAudioFiles(audioAbsDir);
    for (const clip of clips) {
      const outFileName = path.basename(clip._absPath);
      if (!args.force && currentAudioFiles.has(outFileName)) {
        continue;
      }
      runPiperGenerate({
        pythonCommand,
        modelRef,
        dataDirAbsPath: useDataDir ? dataDirAbsPath : '',
        outputAbsPath: clip._absPath,
        textValue: clip._text,
      });
    }
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    hashAlgorithm: 'sha256',
    textNormalization: 'collapse-whitespace-and-trim',
    piper: {
      runner: pythonCommand + ' -m piper',
      modelRef: modelRef,
      dataDir: useDataDir ? args.dataDir : '',
    },
    clips: clips.map((clip) => ({
      ...(clip.id ? { id: clip.id } : {}),
      source: clip.source,
      textHash: clip.textHash,
      charCount: clip.charCount,
      preview: clip.preview,
      file: clip.file,
    })),
  };

  await ensureDirForFile(manifestAbsPath);
  await writeFile(manifestAbsPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log('Narration manifest written:', path.relative(ROOT, manifestAbsPath));
  console.log('Total clips:', String(manifest.clips.length));
  if (args.manifestOnly) {
    console.log('Audio generation skipped (--manifest-only).');
  } else {
    console.log('Audio output directory:', path.relative(ROOT, audioAbsDir));
    if (useDataDir) {
      console.log('Voice data directory:', path.relative(ROOT, dataDirAbsPath));
    }
  }
}

main().catch((error) => {
  console.error(String(error && error.message ? error.message : error));
  process.exitCode = 1;
});
