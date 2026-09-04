const LOCAL_VOICE_MODEL_ID = 'en_US-hfc_female-medium';
const RECOGNIZED_VOICE_IDS = {
  'hfc_female [medium]': LOCAL_VOICE_MODEL_ID,
  'hfc_female medium': LOCAL_VOICE_MODEL_ID,
  'hfc_femail [medium]': LOCAL_VOICE_MODEL_ID,
  'hfc_femail medium': LOCAL_VOICE_MODEL_ID,
  [LOCAL_VOICE_MODEL_ID]: LOCAL_VOICE_MODEL_ID,
};

function resolveBridgeScriptUrl() {
  if (document.currentScript && document.currentScript.src) {
    return document.currentScript.src;
  }

  var scripts = document.getElementsByTagName('script');
  for (var i = scripts.length - 1; i >= 0; i--) {
    var src = scripts[i] && scripts[i].src;
    if (src && src.indexOf('/js/app/piper-bridge.js') !== -1) {
      return src;
    }
  }

  return new URL('js/app/piper-bridge.js', window.location.href).toString();
}

const APP_BASE_URL = new URL('../../', resolveBridgeScriptUrl());

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
let preparedGenerationByKey = Object.create(null);
const PIPER_TARGET_CHUNK_CHARS = 260;
const PIPER_MAX_CHUNK_CHARS = 420;

function withNativeSymbolScope(work) {
  var nativeSymbol = window.__stitchlabNativeSymbol;
  if (!nativeSymbol || typeof nativeSymbol.for !== 'function') {
    return Promise.resolve().then(work);
  }

  var originalSymbol = window.Symbol;
  window.Symbol = nativeSymbol;

  return Promise.resolve()
    .then(work)
    .finally(function() {
      window.Symbol = originalSymbol;
    });
}

async function loadPiperApi() {
  if (!piperApiPromise) {
    piperApiPromise = withNativeSymbolScope(function() {
      return import('../vendor/piper-tts-web.js');
    });
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

function splitTextIntoChunks(text, options) {
  options = options || {};
  var preferFastStart = options.preferFastStart !== false;
  var normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  var sentenceLike = normalized.match(/[^.!?]+(?:[.!?]+|$)/g) || [normalized];
  var sentences = [];
  for (var i = 0; i < sentenceLike.length; i++) {
    var sentence = String(sentenceLike[i] || '').replace(/\s+/g, ' ').trim();
    if (!sentence) continue;
    sentences.push(sentence);
  }

  var chunks = [];
  var current = '';
  var startIndex = 0;

  if (preferFastStart && sentences.length) {
    // Keep the first chunk as a single complete sentence to minimize start delay.
    chunks.push(sentences[0]);
    startIndex = 1;
  }

  for (var j = startIndex; j < sentences.length; j++) {
    var nextSentence = sentences[j];
    var candidate = current ? current + ' ' + nextSentence : nextSentence;
    if (!current) {
      current = nextSentence;
      continue;
    }

    if (candidate.length <= PIPER_MAX_CHUNK_CHARS) {
      current = candidate;
      if (current.length >= PIPER_TARGET_CHUNK_CHARS) {
        chunks.push(current);
        current = '';
      }
      continue;
    }

    chunks.push(current);
    current = nextSentence;
    if (current.length >= PIPER_MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = '';
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function generateChunk(engine, text, modelId) {
  return withNativeSymbolScope(function() {
    return engine.generate(text, modelId, 0);
  });
}

function getPreparationKey(text, modelId) {
  return modelId + '::' + text;
}

function playGeneratedAudio(file, requestId, payload) {
  var objectUrl = URL.createObjectURL(file);
  var audio = new Audio();
  activeAudio = audio;
  activeObjectUrl = objectUrl;

  return new Promise((resolve, reject) => {
    audio.onended = function() {
      cleanupActiveAudio();
      resolve();
    };

    audio.onerror = function() {
      const error = new Error('Piper audio playback failed.');
      if (requestId === playbackRequestId && typeof payload.onError === 'function') {
        payload.onError(error);
      }
      cleanupActiveAudio();
      reject(error);
    };

    audio.src = objectUrl;
    audio.play().catch((error) => {
      if (requestId === playbackRequestId && typeof payload.onError === 'function') {
        payload.onError(error);
      }
      cleanupActiveAudio();
      reject(error);
    });
  });
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
    const chunks = splitTextIntoChunks(text, { preferFastStart: true });
    const firstChunkText = chunks[0];
    const firstPreparationKey = getPreparationKey(firstChunkText, modelId);
    let currentGeneratedPromise = preparedGenerationByKey[firstPreparationKey];
    if (currentGeneratedPromise) {
      delete preparedGenerationByKey[firstPreparationKey];
    } else {
      currentGeneratedPromise = generateChunk(engine, firstChunkText, modelId);
    }
    let currentGenerated = await currentGeneratedPromise;
    let nextGeneratedPromise = null;

    for (var i = 0; i < chunks.length; i++) {
      if (localRequestId !== playbackRequestId) {
        return;
      }

      if (i + 1 < chunks.length) {
        nextGeneratedPromise = generateChunk(engine, chunks[i + 1], modelId);
      } else {
        nextGeneratedPromise = null;
      }

      await playGeneratedAudio(currentGenerated.file, localRequestId, payload);
      if (localRequestId !== playbackRequestId) {
        return;
      }

      if (nextGeneratedPromise) {
        currentGenerated = await nextGeneratedPromise;
      }
    }

    lastBridgeError = null;
    if (localRequestId === playbackRequestId && typeof payload.onEnd === 'function') {
      payload.onEnd();
    }
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

async function prepare(payload) {
  try {
    const text = String(payload && payload.text ? payload.text : '').replace(/\s+/g, ' ').trim();
    if (!text) {
      return prewarm(payload);
    }

    const modelId = normalizeVoiceId(payload && payload.voiceId);
    const chunks = splitTextIntoChunks(text, { preferFastStart: true });
    if (!chunks.length) {
      return prewarm(payload);
    }

    await verifyAssetsAvailable();
    const engine = await ensureEngine();
    const key = getPreparationKey(chunks[0], modelId);
    if (!preparedGenerationByKey[key]) {
      preparedGenerationByKey[key] = generateChunk(engine, chunks[0], modelId)
        .catch(function(error) {
          delete preparedGenerationByKey[key];
          throw error;
        });
    }

    await preparedGenerationByKey[key];
    return true;
  } catch (_error) {
    return false;
  }
}

window.stitchlabPiperTts = {
  speak,
  cancel,
  prewarm,
  prepare,
  getStatus() {
    return {
      bridgeScriptUrl: resolveBridgeScriptUrl(),
      modelId: LOCAL_VOICE_MODEL_ID,
      lastError: lastBridgeError ? String(lastBridgeError && lastBridgeError.message ? lastBridgeError.message : lastBridgeError) : '',
      hasEnginePromise: !!enginePromise,
      nativeSymbolForType: window.__stitchlabNativeSymbol ? typeof window.__stitchlabNativeSymbol.for : 'missing',
      globalSymbolForType: typeof Symbol.for,
      chunkMode: 'sentence-group',
      targetChunkChars: PIPER_TARGET_CHUNK_CHARS,
      maxChunkChars: PIPER_MAX_CHUNK_CHARS,
    };
  },
};
