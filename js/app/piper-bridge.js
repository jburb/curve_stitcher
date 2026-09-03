const LOCAL_VOICE_MODEL_ID = 'en_US-hfc_female-medium';
const RECOGNIZED_VOICE_IDS = {
  'hfc_female [medium]': LOCAL_VOICE_MODEL_ID,
  'hfc_female medium': LOCAL_VOICE_MODEL_ID,
  'hfc_femail [medium]': LOCAL_VOICE_MODEL_ID,
  'hfc_femail medium': LOCAL_VOICE_MODEL_ID,
  [LOCAL_VOICE_MODEL_ID]: LOCAL_VOICE_MODEL_ID,
};

const APP_BASE_URL = new URL('../../', import.meta.url);

function resolveAssetUrl(relativePath) {
  return new URL(relativePath, APP_BASE_URL).toString();
}

const ONNX_BASE = resolveAssetUrl('assets/tts/runtime/onnx/');
const PHONEMIZE_BASE = resolveAssetUrl('assets/tts/runtime/piper/');
const MODEL_BASE = resolveAssetUrl('assets/tts/models/');
const REQUIRED_MODEL_JSON_PATH = resolveAssetUrl('assets/tts/models/en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx.json');

let enginePromise = null;
let activeAudio = null;
let activeObjectUrl = null;
let playbackRequestId = 0;
let lastBridgeError = null;
let piperApiPromise = null;

async function loadPiperApi() {
  if (!piperApiPromise) {
    piperApiPromise = import('../vendor/piper-tts-web.js');
  }
  return piperApiPromise;
}

function normalizeVoiceId(requestedVoiceId) {
  const normalized = String(requestedVoiceId || '').trim().toLowerCase();
  return RECOGNIZED_VOICE_IDS[normalized] || LOCAL_VOICE_MODEL_ID;
}

function cleanupActiveAudio() {
  if (activeAudio) {
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

async function ensureEngine() {
  if (enginePromise) return enginePromise;

  enginePromise = Promise.resolve().then(async () => {
    const piperApi = await loadPiperApi();
    return new piperApi.PiperWebEngine({
      onnxRuntime: new piperApi.OnnxWebRuntime({
        basePath: ONNX_BASE,
      }),
      phonemizeRuntime: new piperApi.PhonemizeWebRuntime({
        basePath: PHONEMIZE_BASE,
      }),
      voiceProvider: new piperApi.RemoteVoiceProvider({
        baseUrl: MODEL_BASE,
      }),
    });
  }).catch((error) => {
    lastBridgeError = error;
    throw error;
  });

  return enginePromise;
}

async function verifyAssetsAvailable() {
  const response = await fetch(REQUIRED_MODEL_JSON_PATH, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Missing local Piper model json at ' + REQUIRED_MODEL_JSON_PATH);
  }
}

async function speak(payload) {
  const text = String(payload && payload.text ? payload.text : '').replace(/\s+/g, ' ').trim();
  if (!text) {
    if (typeof payload.onEnd === 'function') payload.onEnd();
    return;
  }

  const localRequestId = ++playbackRequestId;
  cleanupActiveAudio();

  try {
    const engine = await ensureEngine();
    const modelId = normalizeVoiceId(payload.voiceId);
    const generated = await engine.generate(text, modelId, 0);
    if (localRequestId !== playbackRequestId) {
      return;
    }

    const objectUrl = URL.createObjectURL(generated.file);
    const audio = new Audio();
    activeAudio = audio;
    activeObjectUrl = objectUrl;

    await new Promise((resolve, reject) => {
      audio.onended = function() {
        if (localRequestId !== playbackRequestId) {
          resolve();
          return;
        }
        cleanupActiveAudio();
        if (typeof payload.onEnd === 'function') {
          payload.onEnd();
        }
        resolve();
      };

      audio.onerror = function() {
        const error = new Error('Piper audio playback failed.');
        if (localRequestId === playbackRequestId && typeof payload.onError === 'function') {
          payload.onError(error);
        }
        cleanupActiveAudio();
        reject(error);
      };

      audio.src = objectUrl;
      audio.play().catch((error) => {
        if (localRequestId === playbackRequestId && typeof payload.onError === 'function') {
          payload.onError(error);
        }
        cleanupActiveAudio();
        reject(error);
      });
    });
  } catch (error) {
    lastBridgeError = error;
    console.warn('Piper bridge speak failed.', error);
    if (localRequestId === playbackRequestId && typeof payload.onError === 'function') {
      payload.onError(error);
    }
    throw error;
  }
}

function cancel() {
  playbackRequestId += 1;
  cleanupActiveAudio();
}

async function prewarm(payload) {
  try {
    await verifyAssetsAvailable();
    await ensureEngine();
    normalizeVoiceId(payload && payload.voiceId);
    return true;
  } catch (_error) {
    return false;
  }
}

window.stitchlabPiperTts = {
  speak,
  cancel,
  prewarm,
  getStatus() {
    return {
      modelId: LOCAL_VOICE_MODEL_ID,
      lastError: lastBridgeError ? String(lastBridgeError && lastBridgeError.message ? lastBridgeError.message : lastBridgeError) : '',
      hasEnginePromise: !!enginePromise,
    };
  },
};
