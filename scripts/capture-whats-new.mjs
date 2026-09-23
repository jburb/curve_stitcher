import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

const manifestPath = path.join(workspaceRoot, 'docs', 'whats-new', 'manifest.json');
const outputRoot = path.join(workspaceRoot, 'docs', 'whats-new');
const gifsDir = path.join(outputRoot, 'gifs');
const videosDir = path.join(outputRoot, 'videos');
const rawDir = path.join(workspaceRoot, 'test-results', 'whats-new-raw-videos');
const captureStorageStatePath = path.join(workspaceRoot, 'test-results', 'whats-new-capture-storage-state.json');

const APP_URL = process.env.WHATS_NEW_URL || 'http://127.0.0.1:4173/stitchlab.html';
const APP_ORIGIN = new URL(APP_URL).origin;
const ONBOARDING_KEY = 'stitchlab.onboarding.v1';
const KEEP_VIDEOS = ['1', 'true', 'yes'].includes(String(process.env.WHATS_NEW_KEEP_VIDEOS || '').toLowerCase());

function fail(message) {
  console.error(`[whats-new:capture] ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`[whats-new:capture] ${message}`);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function rmIfExists(targetPath) {
  if (await pathExists(targetPath)) {
    await fs.rm(targetPath, { recursive: true, force: true });
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function waitForUrl(url, timeoutMs = 12000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function startHttpServerIfNeeded() {
  return (async () => {
    const reachable = await waitForUrl(APP_URL, 1200);
    if (reachable) {
      log(`Using existing server at ${APP_ORIGIN}`);
      return null;
    }

    log(`Starting HTTP server at ${APP_ORIGIN}`);
    const serverProc = spawn('python3', ['-m', 'http.server', '4173', '--bind', '127.0.0.1'], {
      cwd: workspaceRoot,
      stdio: 'ignore'
    });

    const ready = await waitForUrl(APP_URL, 12000);
    if (!ready) {
      try {
        serverProc.kill('SIGTERM');
      } catch {
        // Ignore kill errors.
      }
      fail('Unable to reach app URL after starting local HTTP server.');
    }

    return serverProc;
  })();
}

function runFfmpegToGif(inputVideoPath, outputGifPath) {
  const fps = process.env.WHATS_NEW_GIF_FPS || '10';
  const width = process.env.WHATS_NEW_GIF_WIDTH || '1200';
  const speed = process.env.WHATS_NEW_GIF_SLOWDOWN || '1.35';
  const vf = `setpts=${speed}*PTS,fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`;

  const result = spawnSync('ffmpeg', ['-y', '-i', inputVideoPath, '-vf', vf, outputGifPath], {
    cwd: workspaceRoot,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.trim() : '(no stderr)';
    throw new Error(`ffmpeg failed converting ${path.basename(inputVideoPath)}: ${stderr}`);
  }
}

async function disableOnboardingAutoplayViaUi(page) {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const quickstart = page.locator('#onboarding-quickstart');
  if (await quickstart.isVisible()) {
    await page.locator('#onboarding-start-tour').click();
  } else {
    await page.locator('#onboarding-help').click();
  }

  const tour = page.locator('#onboarding-tour');
  await tour.waitFor({ state: 'visible', timeout: 8000 });

  const optOut = page.locator('#onboarding-tour-optout');
  if (await optOut.isVisible()) {
    const isChecked = await optOut.isChecked();
    if (!isChecked) {
      await optOut.check();
    }
  }

  await page.locator('#onboarding-tour-skip').click();
  await tour.waitFor({ state: 'hidden', timeout: 8000 });
  await page.waitForTimeout(350);
}

async function createCaptureStorageState(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  try {
    await disableOnboardingAutoplayViaUi(page);
    await context.storageState({ path: captureStorageStatePath });
    log('Prepared shared capture state with onboarding autoplay disabled.');
  } finally {
    await context.close();
  }
}

const scenarioHandlers = {
  async 'list-mode-sequence-or-steps'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(450);
    await page.selectOption('#kid-stitch-by', 'sequence');
    await page.selectOption('#kid-sequence-mode', 'holes');
    await page.locator('#gear').click();
    await page.locator('#jump-sequence-0').fill('1,3,5,8,13');
    await page.waitForTimeout(900);
    await page.selectOption('#kid-sequence-mode', 'steps');
    await page.waitForTimeout(900);
    await page.locator('#kid-tempo-slow').click();
    await page.waitForTimeout(700);
    await page.locator('#animate').click();
    await page.waitForTimeout(3600);
  },

  async 'onboarding-autoplay-tutorial'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('#onboarding-help').click();
    await page.locator('#onboarding-tour-hear-all').click();
    await page.waitForTimeout(4200);
  },

  async 'paramless-random-thread-preview'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(450);
    await page.evaluate(() => {
      if (typeof window.applyRandomizedStitchingStateForParamlessLoad === 'function') {
        window.hasAppliedParamlessStitchingRandomization = false;
        window.applyRandomizedStitchingStateForParamlessLoad();
      }
      if (typeof window.redrawForPathChange === 'function') {
        window.redrawForPathChange();
      }
    });
    await page.locator('#kid-tempo-slow').click();
    await page.waitForTimeout(700);
    await page.locator('#animate').click();
    await page.waitForTimeout(3400);
  },

  async 'hole-number-rotation'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.locator('#gear').click();

    await page.evaluate(() => {
      const slider = document.getElementById('advanced-hole-rotation');
      if (!slider) return;
      slider.value = '7';
      const inputEvt = document.createEvent('Event');
      inputEvt.initEvent('input', true, true);
      slider.dispatchEvent(inputEvt);
      const changeEvt = document.createEvent('Event');
      changeEvt.initEvent('change', true, true);
      slider.dispatchEvent(changeEvt);
    });

    await page.waitForTimeout(900);
    await page.selectOption('#kid-stitch-by', 'add');
    await page.waitForTimeout(700);
    await page.selectOption('#kid-stitch-by', 'multiply');
    await page.waitForTimeout(700);
    await page.selectOption('#kid-stitch-by', 'sequence');
    await page.selectOption('#kid-sequence-mode', 'holes');
    await page.waitForTimeout(800);
    await page.locator('#kid-tempo-slow').click();
    await page.waitForTimeout(700);
    await page.locator('#animate').click();
    await page.waitForTimeout(3000);
  },

  async 'active-thread-overlay'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(450);

    await page.evaluate(() => {
      stopAnimationIfActive();
      nestedFrameEnabled = true;
      if (nestedFrameEnabledInput) nestedFrameEnabledInput.checked = true;
      if (nestedFrameRatioSelect) {
        nestedFrameRatioSelect.disabled = false;
        nestedFrameRatioSelect.value = '0.5';
      }
      nestedFrameRatio = 0.5;

      threads = [
        sanitizeThreadDescriptor({
          jumpMode: 'fixed',
          jump: 20,
          frameMode: 'inner',
          startHole: 1,
          width: 2,
          color: '#1982c4'
        }, null),
        sanitizeThreadDescriptor({
          jumpMode: 'connect',
          connectMultiplier: 3,
          frameMode: 'outer',
          startHole: 1,
          width: 2,
          color: '#ffca3a'
        }, null)
      ];
      selectedThreadIndex = 0;
      renderThreadControls();
      syncKidControlsFromSelectedThread();
      redrawForPathChange();
    });

    await page.locator('#kid-tempo-slow').click();
    await page.waitForTimeout(700);
    await page.locator('#animate').click();
    await page.waitForTimeout(3600);
  },

  async 'formula-mode-improvements'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(450);
    await page.locator('#gear').click();
    await page.selectOption('#jump-mode-0', 'formula');
    await page.locator('#jump-formula-0').fill('currentHole + (index mod 4)');
    await page.waitForTimeout(900);
    await page.locator('#kid-tempo-slow').click();
    await page.waitForTimeout(700);
    await page.locator('#animate').click();
    await page.waitForTimeout(3400);
  },

  async 'stitch-library-offline-first'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.locator('#discovery-toggle').click();
    await page.waitForTimeout(900);
    await page.locator('#pattern-library-export-btn').focus();
    await page.waitForTimeout(3000);
  },

  async 'curve-sewing-cards-viewer'(page) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.locator('#experience-info-toggle').click();
    await page.locator('#experience-sewing-cards-toggle').click();
    await page.waitForTimeout(1200);
    await page.locator('#sewing-cards-next-btn').click();
    await page.waitForTimeout(900);
    await page.locator('#sewing-pdf-next-btn').click();
    await page.waitForTimeout(2800);
  }
};

async function captureFeature(item, browser) {
  const handler = scenarioHandlers[item.scenario];
  if (!handler) {
    throw new Error(`No scenario handler found for "${item.scenario}"`);
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    storageState: captureStorageStatePath,
    recordVideo: {
      dir: rawDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  log(`Capturing ${item.id}`);

  try {
    await handler(page);
  } finally {
    const video = page.video();
    await context.close();

    if (!video) {
      throw new Error(`No recorded video handle for ${item.id}`);
    }

    const rawVideoPath = await video.path();
    const rawVideoExt = path.extname(rawVideoPath) || '.webm';
    const videoTargetPath = path.join(videosDir, `${item.id}${rawVideoExt}`);
    const gifTargetPath = path.join(outputRoot, item.gif);

    await fs.copyFile(rawVideoPath, videoTargetPath);
    runFfmpegToGif(videoTargetPath, gifTargetPath);
    if (!KEEP_VIDEOS) {
      await fs.rm(videoTargetPath, { force: true });
    }
  }
}

async function main() {
  const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  if (ffmpegCheck.status !== 0) {
    fail('ffmpeg is required but not available on PATH.');
  }

  const manifestText = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestText);
  const items = Array.isArray(manifest.items) ? manifest.items : [];

  if (!items.length) {
    fail(`No manifest items found in ${manifestPath}`);
  }

  await ensureDir(outputRoot);
  await rmIfExists(gifsDir);
  await rmIfExists(videosDir);
  await rmIfExists(rawDir);
  await ensureDir(gifsDir);
  await ensureDir(videosDir);
  await ensureDir(rawDir);

  const serverProc = await startHttpServerIfNeeded();

  const browser = await chromium.launch({ headless: true });

  try {
    await createCaptureStorageState(browser);
    for (const item of items) {
      await captureFeature(item, browser);
    }
  } finally {
    await browser.close();
    if (serverProc) {
      try {
        serverProc.kill('SIGTERM');
      } catch {
        // Ignore kill errors.
      }
    }
  }

  if (!KEEP_VIDEOS) {
    await rmIfExists(videosDir);
  }

  await rmIfExists(rawDir);
  await rmIfExists(captureStorageStatePath);

  log(`Done. GIFs: ${path.relative(workspaceRoot, gifsDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
