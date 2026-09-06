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

const MANIFEST_URL = resolveAssetUrl('assets/audio/narration/manifest.json');

let manifestPromise = null;
let manifestCache = null;
let activeAudio = null;
let playbackRequestId = 0;
let lastBridgeError = null;
const preparedClipUrlByHash = Object.create(null);
const hashByText = Object.create(null);

function isNarrationDebugEnabled() {
  try {
    var query = String(window.location && window.location.search ? window.location.search : '');
    if (/(\?|&)debugNarration=1(&|$)/.test(query)) return true;
  } catch (_error) {
    // ignore
  }
  try {
    return String(window.localStorage && window.localStorage.getItem('stitchlabNarrationDebug') || '') === '1';
  } catch (_error) {
    return false;
  }
}

function bridgeDebugLog(level, message, details) {
  if (!isNarrationDebugEnabled() || !window.console) return;
  var fn = console[level] || console.log;
  if (typeof details === 'undefined') {
    fn.call(console, '[NarrationBridge] ' + message);
  } else {
    fn.call(console, '[NarrationBridge] ' + message, details);
  }
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanupActiveAudio() {
  if (!activeAudio) return;
  activeAudio.onended = null;
  activeAudio.onerror = null;
  activeAudio.pause();
  activeAudio.src = '';
  activeAudio = null;
}

function normalizeManifest(rawManifest) {
  var manifest = {
    byHash: Object.create(null),
    byId: Object.create(null),
    clipCount: 0,
  };

  var clips = rawManifest && Array.isArray(rawManifest.clips) ? rawManifest.clips : [];
  for (var i = 0; i < clips.length; i++) {
    var clip = clips[i] || {};
    var textHash = String(clip.textHash || '').trim().toLowerCase();
    var filePath = String(clip.file || '').trim();
    if (!textHash || !filePath) continue;

    var normalized = {
      id: clip.id ? String(clip.id) : '',
      textHash: textHash,
      file: filePath,
      url: new URL(filePath, MANIFEST_URL).toString(),
    };

    manifest.byHash[textHash] = normalized;
    if (normalized.id) {
      manifest.byId[normalized.id] = normalized;
    }
  }

  manifest.clipCount = Object.keys(manifest.byHash).length;
  return manifest;
}

async function loadManifest() {
  if (manifestCache) return manifestCache;
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL, { cache: 'no-store' })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Narration manifest missing at ' + MANIFEST_URL);
        }
        return response.json();
      })
      .then(function(rawManifest) {
        manifestCache = normalizeManifest(rawManifest);
        return manifestCache;
      })
      .catch(function(error) {
        lastBridgeError = error;
        throw error;
      });
  }
  return manifestPromise;
}

function fallbackHash(text) {
  var hash = 2166136261;
  for (var i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

async function hashText(text) {
  var normalized = normalizeText(text);
  if (!normalized) return '';
  if (hashByText[normalized]) return hashByText[normalized];

  var hashValue = '';
  if (window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined') {
    try {
      var encoded = new TextEncoder().encode(normalized);
      var digest = await window.crypto.subtle.digest('SHA-256', encoded);
      var bytes = new Uint8Array(digest);
      var hex = '';
      for (var i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      hashValue = hex;
    } catch (_error) {
      hashValue = fallbackHash(normalized);
    }
  } else {
    hashValue = fallbackHash(normalized);
  }

  hashByText[normalized] = hashValue;
  return hashValue;
}

async function resolveClipEntry(payload) {
  var manifest = await loadManifest();
  var clipId = payload && payload.clipId ? String(payload.clipId).trim() : '';
  if (clipId && manifest.byId[clipId]) {
    bridgeDebugLog('log', 'Clip resolved by clipId.', { clipId: clipId });
    return manifest.byId[clipId];
  }

  var text = normalizeText(payload && payload.text ? payload.text : '');
  if (!text) return null;

  var textHash = await hashText(text);
  if (!textHash) return null;
  var clip = manifest.byHash[textHash] || null;
  bridgeDebugLog(clip ? 'log' : 'warn', clip ? 'Clip resolved by text hash.' : 'No clip found for text hash.', {
    textLength: text.length,
    textHash: textHash,
    preview: text.slice(0, 160),
    clipFound: !!clip,
    clipFile: clip ? clip.file : ''
  });
  return clip;
}

function cachePreparedClipUrl(textHash, objectUrl) {
  var key = String(textHash || '').trim().toLowerCase();
  if (!key || !objectUrl) return;

  var previous = preparedClipUrlByHash[key];
  if (previous && previous !== objectUrl) {
    try {
      URL.revokeObjectURL(previous);
    } catch (_error) {
      // Ignore object URL cleanup failures.
    }
  }
  preparedClipUrlByHash[key] = objectUrl;
}

async function prepare(payload) {
  try {
    var clip = await resolveClipEntry(payload || {});
    if (!clip) {
      return false;
    }

    if (preparedClipUrlByHash[clip.textHash]) {
      return true;
    }

    var response = await fetch(clip.url, { cache: 'force-cache' });
    if (!response.ok) {
      throw new Error('Narration audio clip missing at ' + clip.url);
    }
    var blob = await response.blob();
    cachePreparedClipUrl(clip.textHash, URL.createObjectURL(blob));
    return true;
  } catch (_error) {
    return false;
  }
}

async function prewarm() {
  try {
    await loadManifest();
    return true;
  } catch (_error) {
    return false;
  }
}

async function speak(payload) {
  var text = normalizeText(payload && payload.text ? payload.text : '');
  if (!text) {
    if (payload && typeof payload.onEnd === 'function') {
      payload.onEnd();
    }
    return;
  }

  var localRequestId = ++playbackRequestId;
  cleanupActiveAudio();
  bridgeDebugLog('log', 'Bridge speak request started.', {
    requestId: localRequestId,
    textLength: text.length,
    preview: text.slice(0, 120)
  });

  try {
    var clip = await resolveClipEntry(payload || {});
    if (!clip) {
      throw new Error('No prebuilt narration clip found for text.');
    }

    var clipSource = preparedClipUrlByHash[clip.textHash] || clip.url;
    var audio = new Audio();
    activeAudio = audio;

    await new Promise(function(resolve, reject) {
      audio.onended = function() {
        if (localRequestId !== playbackRequestId) {
          cleanupActiveAudio();
          resolve();
          return;
        }
        cleanupActiveAudio();
        if (payload && typeof payload.onEnd === 'function') {
          payload.onEnd();
        }
        resolve();
      };

      audio.onerror = function() {
        var error = new Error('Prebuilt narration audio playback failed.');
        bridgeDebugLog('warn', 'Audio element error during narration playback.', {
          requestId: localRequestId,
          clipUrl: clipSource
        });
        if (localRequestId === playbackRequestId && payload && typeof payload.onError === 'function') {
          payload.onError(error);
        }
        cleanupActiveAudio();
        reject(error);
      };

      audio.src = clipSource;
      audio.play().catch(function(error) {
        bridgeDebugLog('warn', 'Audio play() rejected.', {
          requestId: localRequestId,
          clipUrl: clipSource,
          error: String((error && error.message) || error || 'unknown error')
        });
        if (localRequestId === playbackRequestId && payload && typeof payload.onError === 'function') {
          payload.onError(error);
        }
        cleanupActiveAudio();
        reject(error);
      });
    });

    lastBridgeError = null;
    bridgeDebugLog('log', 'Bridge speak request completed.', { requestId: localRequestId });
  } catch (error) {
    lastBridgeError = error;
    bridgeDebugLog('warn', 'Bridge speak request failed.', {
      requestId: localRequestId,
      error: String((error && error.message) || error || 'unknown error')
    });
    if (localRequestId === playbackRequestId && payload && typeof payload.onError === 'function') {
      payload.onError(error);
    }
    throw error;
  }
}

function cancel() {
  playbackRequestId += 1;
  cleanupActiveAudio();
}

window.stitchlabPiperTts = {
  speak,
  cancel,
  prewarm,
  prepare,
  getStatus() {
    return {
      bridgeScriptUrl: resolveBridgeScriptUrl(),
      manifestUrl: MANIFEST_URL,
      manifestLoaded: !!manifestCache,
      clipCount: manifestCache ? manifestCache.clipCount : 0,
      preparedClipCount: Object.keys(preparedClipUrlByHash).length,
      lastError: lastBridgeError ? String(lastBridgeError && lastBridgeError.message ? lastBridgeError.message : lastBridgeError) : '',
      engine: 'prebuilt-audio',
    };
  },
};