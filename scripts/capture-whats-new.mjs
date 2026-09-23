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
const ONBOARDING_AUTOPLAY_PREFERENCE_KEY = 'stitchlab.onboarding.startupTutorialOptOut.v1';
const KEEP_VIDEOS = ['1', 'true', 'yes'].includes(String(process.env.WHATS_NEW_KEEP_VIDEOS || '').toLowerCase());
const SHOW_CURSOR = !['0', 'false', 'no'].includes(String(process.env.WHATS_NEW_SHOW_CURSOR || '1').toLowerCase());
const CURSOR_BASE_MOVE_MS = Number(process.env.WHATS_NEW_CURSOR_MOVE_MS || 280);
const CURSOR_STEP_PIXELS = Number(process.env.WHATS_NEW_CURSOR_STEP_PX || 20);
const CURSOR_POST_ACTION_MS = Number(process.env.WHATS_NEW_CURSOR_POST_ACTION_MS || 100);
const CURSOR_TYPE_DELAY_MS = Number(process.env.WHATS_NEW_CURSOR_TYPE_DELAY_MS || 28);
const CURSOR_CLICK_HOLD_MS = Number(process.env.WHATS_NEW_CURSOR_CLICK_HOLD_MS || 55);

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

function getScenarioRequestedShape(item) {
  const requested = item && typeof item.frameShape === 'string' ? item.frameShape.trim().toLowerCase() : '';
  if (requested === 'circle' || requested === 'triangle' || requested === 'square' || requested === 'star' || requested === 'heart') {
    return requested;
  }
  return 'circle';
}

async function ensureDemoCursor(page) {
  if (!SHOW_CURSOR) {
    return;
  }

  await page.evaluate(() => {
    const CURSOR_ID = '__whats_new_demo_cursor';
    const STYLE_ID = '__whats_new_demo_cursor_style';

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        #${CURSOR_ID} {
          position: fixed;
          width: 20px;
          height: 20px;
          pointer-events: none;
          z-index: 2147483647;
          transform: translate(-50%, -50%);
          left: -120px;
          top: -120px;
        }

        #${CURSOR_ID} .cursor-core {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          border: 2px solid rgba(18, 18, 18, 0.92);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.85),
            0 8px 18px rgba(0, 0, 0, 0.34);
          transition: transform 70ms linear;
        }

        #${CURSOR_ID}.is-pressed .cursor-core {
          transform: scale(0.84);
        }

        #${CURSOR_ID} .cursor-pulse {
          position: absolute;
          width: 10px;
          height: 10px;
          left: 50%;
          top: 50%;
          border-radius: 50%;
          border: 2px solid rgba(44, 133, 255, 0.9);
          transform: translate(-50%, -50%) scale(0.2);
          opacity: 0;
        }

        #${CURSOR_ID}.is-clicking .cursor-pulse {
          animation: whatsNewCursorPulse 260ms cubic-bezier(0.12, 0.7, 0.3, 1) 1;
        }

        @keyframes whatsNewCursorPulse {
          0% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(0.25);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.6);
          }
        }
      `;
      document.head.appendChild(style);
    }

    let cursor = document.getElementById(CURSOR_ID);
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = CURSOR_ID;
      cursor.innerHTML = '<div class="cursor-core"></div><div class="cursor-pulse"></div>';
      document.body.appendChild(cursor);
    }

    if (!window.__whatsNewDemoCursor) {
      window.__whatsNewDemoCursor = {
        x: 56,
        y: 56,
        set(x, y) {
          const clampedX = Number.isFinite(x) ? x : this.x;
          const clampedY = Number.isFinite(y) ? y : this.y;
          this.x = clampedX;
          this.y = clampedY;
          cursor.style.left = `${clampedX}px`;
          cursor.style.top = `${clampedY}px`;
        },
        press() {
          cursor.classList.add('is-pressed');
        },
        release() {
          cursor.classList.remove('is-pressed');
        },
        pulse() {
          cursor.classList.remove('is-clicking');
          // Force restart of CSS animation.
          void cursor.offsetWidth;
          cursor.classList.add('is-clicking');
          setTimeout(() => cursor.classList.remove('is-clicking'), 280);
        }
      };
      window.__whatsNewDemoCursor.set(56, 56);
      return;
    }

    window.__whatsNewDemoCursor.set(window.__whatsNewDemoCursor.x, window.__whatsNewDemoCursor.y);
  });
}

async function getCursorPosition(page) {
  if (!SHOW_CURSOR) {
    return { x: 56, y: 56 };
  }
  return page.evaluate(() => {
    const cursor = window.__whatsNewDemoCursor;
    if (!cursor) return { x: 56, y: 56 };
    return { x: Number(cursor.x) || 56, y: Number(cursor.y) || 56 };
  });
}

function computeMoveDurationMs(from, to) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const extra = Math.min(420, distance * 1.2);
  return Math.round(CURSOR_BASE_MOVE_MS + extra);
}

function buildMovePath(from, to) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const minSteps = 9;
  const steps = Math.max(minSteps, Math.ceil(distance / Math.max(8, CURSOR_STEP_PIXELS)));
  const jitterMagnitude = Math.min(1.35, distance / 260);

  const points = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const eased = t * t * (3 - 2 * t);
    const jitter = (Math.sin(t * Math.PI * 1.7) + Math.cos(t * Math.PI * 2.4)) * 0.5 * jitterMagnitude;
    const x = from.x + (to.x - from.x) * eased + jitter;
    const y = from.y + (to.y - from.y) * eased - jitter * 0.6;
    points.push({ x, y });
  }
  points[points.length - 1] = { x: to.x, y: to.y };
  return points;
}

async function setCursorPoint(page, point) {
  if (!SHOW_CURSOR) return;
  await page.evaluate(({ x, y }) => {
    const cursor = window.__whatsNewDemoCursor;
    if (cursor) cursor.set(x, y);
  }, point);
}

async function moveCursorToPoint(page, point) {
  if (!SHOW_CURSOR) return;
  await ensureDemoCursor(page);
  const current = await getCursorPosition(page);
  const path = buildMovePath(current, point);
  const totalDuration = computeMoveDurationMs(current, point);
  const perStep = Math.max(12, Math.round(totalDuration / Math.max(path.length, 1)));

  for (const step of path) {
    await setCursorPoint(page, step);
    await page.waitForTimeout(perStep);
  }
}

async function elementCenter(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`Unable to resolve bounding box for selector: ${selector}`);
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function moveCursorToSelector(page, selector) {
  if (!SHOW_CURSOR) return;
  const center = await elementCenter(page, selector);
  await moveCursorToPoint(page, center);
}

async function cursorPress(page) {
  if (!SHOW_CURSOR) return;
  await page.evaluate(() => {
    const cursor = window.__whatsNewDemoCursor;
    if (cursor) cursor.press();
  });
}

async function cursorRelease(page, pulse = false) {
  if (!SHOW_CURSOR) return;
  await page.evaluate((doPulse) => {
    const cursor = window.__whatsNewDemoCursor;
    if (!cursor) return;
    cursor.release();
    if (doPulse) cursor.pulse();
  }, pulse);
}

async function demoClick(page, selector, options = {}) {
  const { postDelayMs = CURSOR_POST_ACTION_MS, double = false } = options;
  await moveCursorToSelector(page, selector);
  await cursorPress(page);
  await page.waitForTimeout(CURSOR_CLICK_HOLD_MS);
  await page.locator(selector).first().click({ clickCount: double ? 2 : 1 });
  await cursorRelease(page, true);
  if (postDelayMs > 0) {
    await page.waitForTimeout(postDelayMs);
  }
}

async function demoCheck(page, selector, options = {}) {
  const { postDelayMs = CURSOR_POST_ACTION_MS } = options;
  await moveCursorToSelector(page, selector);
  await cursorPress(page);
  await page.waitForTimeout(CURSOR_CLICK_HOLD_MS);
  await page.locator(selector).first().check();
  await cursorRelease(page, true);
  if (postDelayMs > 0) {
    await page.waitForTimeout(postDelayMs);
  }
}

async function demoSelect(page, selector, value, options = {}) {
  const { postDelayMs = CURSOR_POST_ACTION_MS } = options;
  await moveCursorToSelector(page, selector);
  await cursorPress(page);
  await page.waitForTimeout(CURSOR_CLICK_HOLD_MS);
  await page.locator(selector).first().selectOption(value);
  await cursorRelease(page, true);
  if (postDelayMs > 0) {
    await page.waitForTimeout(postDelayMs);
  }
}

async function demoFill(page, selector, value, options = {}) {
  const { postDelayMs = CURSOR_POST_ACTION_MS, typeDelayMs = CURSOR_TYPE_DELAY_MS } = options;
  await moveCursorToSelector(page, selector);
  await cursorPress(page);
  await page.waitForTimeout(CURSOR_CLICK_HOLD_MS);
  await page.locator(selector).first().click();
  await cursorRelease(page, true);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  if (typeDelayMs > 0) {
    await page.keyboard.type(value, { delay: typeDelayMs });
  } else {
    await page.keyboard.type(value);
  }
  if (postDelayMs > 0) {
    await page.waitForTimeout(postDelayMs);
  }
}

async function demoFocus(page, selector, options = {}) {
  const { postDelayMs = CURSOR_POST_ACTION_MS } = options;
  await moveCursorToSelector(page, selector);
  await cursorPress(page);
  await page.waitForTimeout(CURSOR_CLICK_HOLD_MS);
  await page.locator(selector).first().focus();
  await cursorRelease(page, true);
  if (postDelayMs > 0) {
    await page.waitForTimeout(postDelayMs);
  }
}

async function setupCapturePage(page) {
  await ensureDemoCursor(page);
  if (SHOW_CURSOR) {
    await moveCursorToPoint(page, { x: 56, y: 56 });
    await page.waitForTimeout(160);
  }
}

async function isModalOpen(page, selector) {
  try {
    return await page.locator(selector).first().evaluate((el) => {
      return !!(el && el.classList && el.classList.contains('open'));
    });
  } catch {
    return false;
  }
}

async function waitForModalOpenClass(page, selector, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isModalOpen(page, selector)) {
      return;
    }
    await page.waitForTimeout(120);
  }
  throw new Error(`Timed out waiting for modal to open: ${selector}`);
}

async function waitForModalCloseClass(page, selector, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await isModalOpen(page, selector))) {
      return;
    }
    await page.waitForTimeout(120);
  }
  throw new Error(`Timed out waiting for modal to close: ${selector}`);
}

async function finalizePatternSaveOrRecover(page, name, description) {
  const graceDeadline = Date.now() + 5200;
  while (Date.now() < graceDeadline) {
    if (!(await isModalOpen(page, '#pattern-save-modal'))) {
      return;
    }
    await page.waitForTimeout(140);
  }

  const feedbackText = String((await page.locator('#pattern-save-feedback').textContent().catch(() => '')) || '').trim();
  log(`Pattern save modal stayed open; applying fallback save path. Feedback: ${feedbackText || '(none)'}`);

  await page.evaluate(async ({ patternName, patternDescription }) => {
    try {
      if (typeof window.saveUserPatternFromCurrentState === 'function') {
        await window.saveUserPatternFromCurrentState(patternName, patternDescription);
      }
    } catch {
      // Ignore and continue to close modal overlay.
    }

    var modal = document.getElementById('pattern-save-modal');
    if (modal && modal.classList) {
      modal.classList.remove('open');
    }

    if (typeof window.renderDiscoveryLibrary === 'function') {
      window.renderDiscoveryLibrary();
    }
  }, {
    patternName: name,
    patternDescription: description
  });

  await waitForModalCloseClass(page, '#pattern-save-modal', 5000);
}

async function demoFillInstant(page, selector, value, options = {}) {
  const { postDelayMs = CURSOR_POST_ACTION_MS } = options;
  await moveCursorToSelector(page, selector);
  await cursorPress(page);
  await page.waitForTimeout(CURSOR_CLICK_HOLD_MS);
  await page.locator(selector).first().click();
  await cursorRelease(page, true);
  await page.locator(selector).first().fill(value);
  if (postDelayMs > 0) {
    await page.waitForTimeout(postDelayMs);
  }
}

async function ensureScenarioFrameShape(page, item) {
  const targetShape = getScenarioRequestedShape(item);
  const selector = `.shape-btn[data-shape="${targetShape}"]`;
  const alreadyActive = await page.locator(`${selector}.active`).count();
  if (!alreadyActive) {
    await demoClick(page, selector, { postDelayMs: 180 });
  }
}

async function prepareAutoplayEnabledSplashCapture(context) {
  await context.addInitScript(({ onboardingKey, autoplayPrefKey }) => {
    try {
      if (window.localStorage) {
        var raw = window.localStorage.getItem(onboardingKey);
        var parsed = null;
        if (raw) {
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = null;
          }
        }
        var next = Object.assign({}, (parsed && typeof parsed === 'object') ? parsed : {});
        next.quickStartDismissed = false;
        next.tourCompleted = false;
        next.startupTutorialOptOut = false;
        window.localStorage.setItem(onboardingKey, JSON.stringify(next));
        window.localStorage.setItem(autoplayPrefKey, '0');
      }
    } catch {
      // Ignore local storage failures in constrained contexts.
    }

    // Force splash behavior in automated runs.
    window.__STITCHLAB_FORCE_SPLASH_FOR_TESTS__ = true;
  }, {
    onboardingKey: ONBOARDING_KEY,
    autoplayPrefKey: ONBOARDING_AUTOPLAY_PREFERENCE_KEY
  });
}

const scenarioHandlers = {
  async 'list-mode-sequence-or-steps'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);
    await page.waitForTimeout(450);
    await ensureScenarioFrameShape(page, item);
    await demoSelect(page, '#kid-stitch-by', 'sequence');
    await demoSelect(page, '#kid-sequence-mode', 'holes');
    await demoClick(page, '#gear');
    await demoFill(page, '#jump-sequence-0', '1,3,5,8,13');
    await page.waitForTimeout(900);
    await demoSelect(page, '#kid-sequence-mode', 'steps');
    await page.waitForTimeout(900);
    await demoClick(page, '#kid-tempo-slow');
    await page.waitForTimeout(700);
    await demoClick(page, '#animate', { postDelayMs: 200 });
    await page.waitForTimeout(3600);
  },

  async 'onboarding-autoplay-tutorial'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);

    await page.locator('#startup-splash').waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(280);
    await demoClick(page, '#startup-splash-continue', { postDelayMs: 220 });

    await ensureScenarioFrameShape(page, item);
    await page.locator('#onboarding-tour').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#onboarding-tour-title').waitFor({ state: 'visible', timeout: 8000 });
    var sawSecondHint = false;
    var secondHintDeadline = Date.now() + 16000;
    while (Date.now() < secondHintDeadline) {
      var titleText = String((await page.locator('#onboarding-tour-title').textContent()) || '').trim().toLowerCase();
      if (titleText.indexOf('stitching frame') >= 0) {
        sawSecondHint = true;
        break;
      }
      await page.waitForTimeout(260);
    }
    if (!sawSecondHint) {
      log('Tutorial autoplay did not reach the second hint within timeout; continuing with available tutorial state.');
    }
    await page.waitForTimeout(900);

    await page.evaluate(({ autoplayPrefKey, onboardingKey }) => {
      try {
        if (typeof window.setOnboardingTutorialOptOutPreference === 'function') {
          window.setOnboardingTutorialOptOutPreference(true);
          return;
        }
        if (window.localStorage) {
          window.localStorage.setItem(autoplayPrefKey, '1');
          var raw = window.localStorage.getItem(onboardingKey);
          var parsed = null;
          if (raw) {
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = null;
            }
          }
          var next = Object.assign({}, (parsed && typeof parsed === 'object') ? parsed : {});
          next.startupTutorialOptOut = true;
          window.localStorage.setItem(onboardingKey, JSON.stringify(next));
        }
      } catch {
        // Ignore storage write failures in constrained contexts.
      }
    }, {
      autoplayPrefKey: ONBOARDING_AUTOPLAY_PREFERENCE_KEY,
      onboardingKey: ONBOARDING_KEY
    });
  },

  async 'paramless-random-thread-preview'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);
    await page.waitForTimeout(450);
    await moveCursorToPoint(page, { x: 200, y: 82 });
    await page.waitForTimeout(220);
    await page.evaluate(() => {
      if (typeof window.applyRandomizedStitchingStateForParamlessLoad === 'function') {
        window.hasAppliedParamlessStitchingRandomization = false;
        window.applyRandomizedStitchingStateForParamlessLoad();
      }
      if (typeof window.redrawForPathChange === 'function') {
        window.redrawForPathChange();
      }
    });
    await ensureScenarioFrameShape(page, item);
    await demoClick(page, '#kid-tempo-slow');
    await page.waitForTimeout(700);
    await demoClick(page, '#animate', { postDelayMs: 200 });
    await page.waitForTimeout(3400);
  },

  async 'hole-number-rotation'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);
    await page.waitForTimeout(500);
    await ensureScenarioFrameShape(page, item);
    await demoClick(page, '#gear');

    await moveCursorToSelector(page, '#advanced-hole-rotation');
    await cursorPress(page);
    await page.waitForTimeout(CURSOR_CLICK_HOLD_MS);
    await cursorRelease(page, true);

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
    await demoSelect(page, '#kid-stitch-by', 'add');
    await page.waitForTimeout(700);
    await demoSelect(page, '#kid-stitch-by', 'multiply');
    await page.waitForTimeout(700);
    await demoSelect(page, '#kid-stitch-by', 'sequence');
    await demoSelect(page, '#kid-sequence-mode', 'holes');
    await page.waitForTimeout(800);
    await demoClick(page, '#kid-tempo-slow');
    await page.waitForTimeout(700);
    await demoClick(page, '#animate', { postDelayMs: 200 });
    await page.waitForTimeout(3000);
  },

  async 'active-thread-overlay'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);
    await page.waitForTimeout(450);
    await ensureScenarioFrameShape(page, item);

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

    await demoClick(page, '#kid-tempo-slow');
    await page.waitForTimeout(700);
    await demoClick(page, '#animate', { postDelayMs: 200 });
    await page.waitForTimeout(3600);
  },

  async 'formula-mode-improvements'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);
    await page.waitForTimeout(450);
    await ensureScenarioFrameShape(page, item);
    await demoClick(page, '#gear');
    await demoSelect(page, '#jump-mode-0', 'formula');
    await demoFill(page, '#jump-formula-0', 'currentHole + (index mod 4)');
    await page.waitForTimeout(900);
    await demoClick(page, '#kid-tempo-slow');
    await page.waitForTimeout(700);
    await demoClick(page, '#animate', { postDelayMs: 200 });
    await page.waitForTimeout(3400);
  },

  async 'stitch-library-offline-first'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);
    await page.waitForTimeout(520);
    await ensureScenarioFrameShape(page, item);

    const firstPatternName = `Whats New Pattern A ${Date.now()}`;
    const secondPatternName = `Whats New Pattern B ${Date.now()}`;

    await demoClick(page, '#kid-save-toggle');
    await waitForModalOpenClass(page, '#pattern-save-modal', 8000);
    await demoFillInstant(page, '#pattern-save-name-input', firstPatternName);
    const firstPatternDescription = 'First saved library pattern for the What\'s New walkthrough.';
    await demoFillInstant(page, '#pattern-save-description-input', firstPatternDescription);
    await demoClick(page, '#pattern-save-confirm-btn', { postDelayMs: 240 });
    await finalizePatternSaveOrRecover(page, firstPatternName, firstPatternDescription);

    await demoClick(page, '.shape-btn[data-shape="square"]', { postDelayMs: 180 });
    await page.waitForTimeout(220);
    await demoClick(page, '#kid-save-toggle');
    await waitForModalOpenClass(page, '#pattern-save-modal', 8000);
    await demoFillInstant(page, '#pattern-save-name-input', secondPatternName);
    const secondPatternDescription = 'Second saved library pattern for the What\'s New walkthrough.';
    await demoFillInstant(page, '#pattern-save-description-input', secondPatternDescription);
    await demoClick(page, '#pattern-save-confirm-btn', { postDelayMs: 240 });
    await finalizePatternSaveOrRecover(page, secondPatternName, secondPatternDescription);

    await demoClick(page, '#discovery-toggle', { postDelayMs: 240 });
    const firstSavedCard = page.locator('.discovery-card').filter({ hasText: firstPatternName }).first();
    await firstSavedCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstSavedCard.getByRole('button', { name: /View Pattern/i }).click();
    await page.waitForTimeout(300);
    await demoClick(page, '#pattern-detail-load-btn', { postDelayMs: 260 });
    await page.waitForTimeout(2200);
  },

  async 'curve-sewing-cards-viewer'(page, item) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await setupCapturePage(page);
    await page.waitForTimeout(500);
    await ensureScenarioFrameShape(page, item);
    await demoClick(page, '#experience-info-toggle');
    await demoClick(page, '#experience-sewing-cards-toggle');
    await page.waitForTimeout(1200);
    await demoClick(page, '#sewing-cards-next-btn');
    await page.waitForTimeout(900);
    await demoClick(page, '#sewing-pdf-next-btn');
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

  if (item && item.scenario === 'onboarding-autoplay-tutorial') {
    await prepareAutoplayEnabledSplashCapture(context);
  }

  const page = await context.newPage();
  log(`Capturing ${item.id}`);

  try {
    await handler(page, item);
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
