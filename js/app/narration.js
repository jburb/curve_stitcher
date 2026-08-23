function getAllowedAboutDocPathSet() {
  var allowed = Object.create(null);
  var experienceIds = Object.keys(EXPERIENCE_LIBRARY || {});
  for (var i = 0; i < experienceIds.length; i++) {
    var experience = EXPERIENCE_LIBRARY[experienceIds[i]];
    if (!experience || typeof experience.aboutHtmlPath !== 'string') continue;
    var rawPath = experience.aboutHtmlPath.trim();
    if (!rawPath) continue;
    allowed[rawPath] = true;
  }
  return allowed;
}

function extractNarrationParagraphsFromDocument(doc) {
  if (!doc) return '';
  var parts = [];
  var seenTexts = Object.create(null);

  function pushText(value) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (seenTexts[text]) return;
    seenTexts[text] = true;
    parts.push(text);
  }

  var paragraphNodes = [];
  try {
    paragraphNodes = doc.querySelectorAll('p');
  } catch (error) {
    paragraphNodes = [];
  }

  for (var i = 0; i < paragraphNodes.length; i++) {
    pushText(paragraphNodes[i].textContent);
  }

  // If no paragraph tags were found, try common readable content blocks.
  if (!parts.length) {
    var blockNodes = [];
    try {
      blockNodes = doc.querySelectorAll('blockquote, h2, h3, li');
    } catch (error) {
      blockNodes = [];
    }
    for (var j = 0; j < blockNodes.length; j++) {
      pushText(blockNodes[j].textContent);
    }
  }

  // Last-resort fallback: flatten visible body text into paragraph-like chunks.
  if (!parts.length) {
    var rawBodyText = '';
    if (doc.body) {
      rawBodyText = String(doc.body.innerText || doc.body.textContent || '');
    } else if (doc.documentElement) {
      rawBodyText = String(doc.documentElement.textContent || '');
    }

    var lines = rawBodyText.replace(/\r/g, '\n').split(/\n+/);
    for (var k = 0; k < lines.length; k++) {
      var line = String(lines[k] || '').replace(/\s+/g, ' ').trim();
      if (!line) continue;
      pushText(line);
    }
  }

  var extracted = parts.join('\n\n').trim();
  narrationDebugLog('log', 'Extracted narration text from document.', {
    documentUrl: doc.location && doc.location.href ? String(doc.location.href) : '',
    documentTitle: doc.title || '',
    readyState: doc.readyState || '',
    paragraphCount: paragraphNodes.length,
    extractedChunkCount: parts.length,
    textLength: extracted.length,
    text: extracted
  });
  return extracted;
}

function loadNarrationTextFromExperienceInfoFrame(pathValue) {
  return new Promise(function(resolve, reject) {
    narrationDebugLog('log', 'Trying narration source: experience info iframe.', { path: pathValue });
    var resolvedPath = normalizeAllowedAboutDocPath(pathValue);
    if (!resolvedPath) {
      narrationDebugLog('warn', 'Experience info iframe source rejected: invalid about path.', { path: pathValue });
      reject(new Error('Invalid about html path'));
      return;
    }
    if (!experienceInfoHtmlFrame) {
      narrationDebugLog('warn', 'Experience info iframe source unavailable: iframe element missing.');
      reject(new Error('Narration info iframe unavailable'));
      return;
    }

    var bridgeCachedText = String(aboutNarrationBridgeCache[resolvedPath] || '').trim();
    if (bridgeCachedText) {
      narrationDebugLog('log', 'Narration source success: about iframe message cache.', {
        path: resolvedPath,
        textLength: bridgeCachedText.length
      });
      resolve(bridgeCachedText);
      return;
    }

    function readFromFrame() {
      var assignedSrc = normalizeAllowedAboutDocPath(experienceInfoHtmlFrame.getAttribute('src') || '');
      if (assignedSrc !== resolvedPath) return '';
      var loadedHref = getFrameHref();
      if (!loadedHref || loadedHref === 'about:blank' || loadedHref.indexOf('about:blank') === 0) return '';
      var loadedPath = normalizeLoadedAboutDocPath(loadedHref);
      if (loadedPath !== resolvedPath) {
        narrationDebugLog('log', 'Experience info iframe contains different loaded document; waiting.', {
          expectedPath: resolvedPath,
          loadedHref: loadedHref,
          loadedPath: loadedPath
        });
        return '';
      }
      var frameDoc = null;
      try {
        frameDoc = experienceInfoHtmlFrame.contentDocument || (experienceInfoHtmlFrame.contentWindow && experienceInfoHtmlFrame.contentWindow.document);
      } catch (error) {
        frameDoc = null;
      }
      if (!frameDoc) return '';
      return extractNarrationParagraphsFromDocument(frameDoc);
    }

    function getFrameHref() {
      try {
        if (experienceInfoHtmlFrame.contentWindow && experienceInfoHtmlFrame.contentWindow.location) {
          return String(experienceInfoHtmlFrame.contentWindow.location.href || '');
        }
      } catch (error) {
        // ignore
      }
      return '';
    }

    var immediateText = readFromFrame();
    if (immediateText) {
      narrationDebugLog('log', 'Narration source success: experience info iframe (immediate read).', {
        path: resolvedPath,
        textLength: immediateText.length,
        text: immediateText
      });
      resolve(immediateText);
      return;
    }

    var settled = false;
    var bridgeRequestInFlight = false;

    function settleOk(textValue) {
      if (settled) return;
      settled = true;
      experienceInfoHtmlFrame.removeEventListener('load', handleLoad);
      narrationDebugLog('log', 'Narration source success: experience info iframe (post-load read).', {
        path: resolvedPath,
        textLength: String(textValue || '').length,
        text: String(textValue || '')
      });
      resolve(String(textValue || ''));
    }

    function settleErr(error) {
      if (settled) return;
      settled = true;
      experienceInfoHtmlFrame.removeEventListener('load', handleLoad);
      narrationDebugLog('warn', 'Narration source failed: experience info iframe.', {
        path: resolvedPath,
        error: String((error && error.message) || error || 'unknown error')
      });
      reject(error || new Error('Narration info iframe load failed'));
    }

    function handleLoad() {
      var loadedText = readFromFrame();
      if (loadedText) {
        settleOk(loadedText);
      } else {
        var cachedFromBridge = String(aboutNarrationBridgeCache[resolvedPath] || '').trim();
        if (cachedFromBridge) {
          settleOk(cachedFromBridge);
          return;
        }

        if (!bridgeRequestInFlight) {
          bridgeRequestInFlight = true;
          requestNarrationTextFromAboutFrame(resolvedPath).then(function(textValue) {
            if (settled) return;
            var normalized = String(textValue || '').trim();
            if (!normalized) {
              bridgeRequestInFlight = false;
              return;
            }
            settleOk(normalized);
          }).catch(function() {
            bridgeRequestInFlight = false;
          });
        }

        var currentHref = getFrameHref();
        var currentPath = normalizeLoadedAboutDocPath(currentHref);
        var waitingForTargetDoc = !currentHref
          || currentHref === 'about:blank'
          || currentHref.indexOf('about:blank') === 0
          || currentPath !== resolvedPath;
        if (waitingForTargetDoc) {
          narrationDebugLog('log', 'Experience info iframe load event before target document; waiting.', {
            expectedPath: resolvedPath,
            currentHref: currentHref,
            currentPath: currentPath
          });
          return;
        }

        if (bridgeRequestInFlight) {
          narrationDebugLog('log', 'Experience info iframe waiting for narration bridge response.', {
            expectedPath: resolvedPath
          });
          return;
        }
        settleErr(new Error('Narration info iframe had no paragraph text'));
      }
    }

    experienceInfoHtmlFrame.addEventListener('load', handleLoad);
    var normalizedAssignedSrc = normalizeAllowedAboutDocPath(experienceInfoHtmlFrame.getAttribute('src') || '');
    var currentHref = getFrameHref();
    var frameIsBlank = currentHref === 'about:blank' || currentHref.indexOf('about:blank') === 0;
    if (normalizedAssignedSrc !== resolvedPath || frameIsBlank) {
      narrationDebugLog('log', 'Experience info iframe src differs; setting src for narration read.', { path: resolvedPath });
      experienceInfoHtmlFrame.setAttribute('src', resolvedPath);
    }

    window.setTimeout(function() {
      if (settled) return;
      settleErr(new Error('Narration info iframe request timed out'));
    }, 5000);
  });
}

function normalizeAllowedAboutDocPath(pathValue) {
  if (typeof pathValue !== 'string') return '';
  var rawPath = pathValue.trim();
  if (!rawPath) return '';

  var cleanedPath = rawPath.split('#')[0].split('?')[0].trim();
  if (!cleanedPath) return '';

  // Block protocol/absolute traversal-like inputs and allow only known about docs.
  if (/^[a-z][a-z0-9+.-]*:/i.test(cleanedPath)) return '';
  if (cleanedPath.indexOf('//') === 0) return '';
  if (cleanedPath.charAt(0) === '/') return '';
  if (cleanedPath.indexOf('..') !== -1) return '';

  var allowedSet = getAllowedAboutDocPathSet();
  if (!allowedSet[cleanedPath]) return '';
  return cleanedPath;
}

function normalizeLoadedAboutDocPath(pathValue) {
  if (typeof pathValue !== 'string') return '';
  var rawPath = pathValue.trim();
  if (!rawPath) return '';

  var candidatePath = rawPath;
  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(candidatePath)) {
      candidatePath = String(new URL(candidatePath, window.location.href).pathname || '');
    }
  } catch (error) {
    // Keep the original value and continue with best-effort normalization.
  }

  var cleanedPath = candidatePath.split('#')[0].split('?')[0].trim().replace(/\\/g, '/');
  if (!cleanedPath) return '';

  var strictMatch = normalizeAllowedAboutDocPath(cleanedPath);
  if (strictMatch) return strictMatch;

  var withoutLeadingSlash = cleanedPath.replace(/^\/+/, '');
  strictMatch = normalizeAllowedAboutDocPath(withoutLeadingSlash);
  if (strictMatch) return strictMatch;

  var allowedSet = getAllowedAboutDocPathSet();
  var allowedPaths = Object.keys(allowedSet);
  for (var i = 0; i < allowedPaths.length; i++) {
    var allowedPath = allowedPaths[i];
    if (withoutLeadingSlash === allowedPath || withoutLeadingSlash.slice(-allowedPath.length - 1) === '/' + allowedPath) {
      return allowedPath;
    }
  }

  return '';
}

var aboutNarrationBridgeCache = Object.create(null);
var aboutNarrationBridgePendingByRequestId = Object.create(null);
var aboutNarrationBridgeRequestCounter = 0;

function cacheAboutNarrationBridgeText(pathValue, textValue) {
  var normalizedPath = normalizeLoadedAboutDocPath(pathValue || '');
  if (!normalizedPath) return '';
  var normalizedText = String(textValue || '').trim();
  if (!normalizedText) return '';
  aboutNarrationBridgeCache[normalizedPath] = normalizedText;
  return normalizedText;
}

function requestNarrationTextFromAboutFrame(pathValue) {
  return new Promise(function(resolve, reject) {
    var resolvedPath = normalizeAllowedAboutDocPath(pathValue);
    if (!resolvedPath) {
      reject(new Error('Invalid about html path for narration request'));
      return;
    }
    if (!experienceInfoHtmlFrame || !experienceInfoHtmlFrame.contentWindow) {
      reject(new Error('Narration request target frame unavailable'));
      return;
    }

    var cached = String(aboutNarrationBridgeCache[resolvedPath] || '').trim();
    if (cached) {
      resolve(cached);
      return;
    }

    var requestId = 'about-narration-' + String(Date.now()) + '-' + String(++aboutNarrationBridgeRequestCounter);
    var timeoutId = window.setTimeout(function() {
      if (!aboutNarrationBridgePendingByRequestId[requestId]) return;
      delete aboutNarrationBridgePendingByRequestId[requestId];
      reject(new Error('Narration bridge request timed out'));
    }, 2200);

    aboutNarrationBridgePendingByRequestId[requestId] = {
      expectedPath: resolvedPath,
      resolve: function(textValue) {
        window.clearTimeout(timeoutId);
        resolve(String(textValue || ''));
      },
      reject: function(error) {
        window.clearTimeout(timeoutId);
        reject(error || new Error('Narration bridge request failed'));
      }
    };

    try {
      experienceInfoHtmlFrame.contentWindow.postMessage({
        type: 'stitchlab-about-narration-request',
        requestId: requestId,
        path: resolvedPath
      }, '*');
    } catch (error) {
      delete aboutNarrationBridgePendingByRequestId[requestId];
      window.clearTimeout(timeoutId);
      reject(error);
    }
  });
}

function enforceExperienceInfoFrameAllowlist() {
  if (!experienceInfoHtmlFrame) return;

  var currentExperience = getExperienceById(currentExperienceId);
  var safePath = normalizeAllowedAboutDocPath(currentExperience.aboutHtmlPath || '');
  if (!safePath) {
    experienceInfoHtmlFrame.removeAttribute('src');
    return;
  }

  var assignedSrc = normalizeAllowedAboutDocPath(experienceInfoHtmlFrame.getAttribute('src') || '');
  if (assignedSrc !== safePath) {
    experienceInfoHtmlFrame.setAttribute('src', safePath);
  }
}

var currentExperienceId = 'stitching';
var experienceNarrationUtterance = null;
var experienceNarrationFetchById = Object.create(null);
var experienceNarrationRequestToken = 0;
var experienceNarrationRequestInFlight = false;
var experienceNarrationLastToggleAtMs = 0;
var NARRATION_DEBUG = true;

function narrationDebugLog(level, message, details) {
  if (!NARRATION_DEBUG || !window.console) return;
  var fn = console[level] || console.log;
  if (typeof details === 'undefined') {
    fn.call(console, '[Narration] ' + message);
  } else {
    fn.call(console, '[Narration] ' + message, details);
  }
}
var triangulaColorMode = 'band-1';
var triangulaConstructionMode = 'shrink-duplicate';
var triangulaStartCount = 1;
var triangulaTargetCount = 27;
var triangulaFractalMode = 'series';
var triangulaFitMode = 'locked';
var triangulaAnimationState = null;
var squarusOrder = 5;
var squarusLayout = 'force-directed';
var squarusAnimationMode = 'sequential';
var squarusContactMode = 'formula-only';
var squarusPieceCount = null;
var squarusSequenceSeed = 1;
var mashrabiyaFold = 12;
var mashrabiyaGeometryMode = 'stitch-vertex';
var mashrabiyaStarColor = '#f4d35e';
var mashrabiyaPetalColor = '#ee964b';
var mashrabiyaPointColor = '#f95738';
var mashrabiyaFillBorderWidth = 2;
var mashrabiyaKeepConstructionLines = false;
var mashrabiyaFillPhaseBeatScale = 1.7;
var mashrabiyaDebugLabelsEnabled = false; // set to false for final release
var mashrabiyaDebugKeepStitchLinesVisible = false; // debug: force true to inspect line topology
var mashrabiyaDebugFillOpacityScale = 1;
var SQUARUS_PIECE_SCALE_FACTOR = 0.75;
var SQUARUS_SCATTER_EDGE_PADDING = 10;
var SQUARUS_SCATTER_WOBBLE_AMPLITUDE = 0;
var SQUARUS_SCATTER_WOBBLE_SPEED = 0;
var SQUARUS_ENTRY_FADE_MS = 220;
var squarusEntryFadeStartMs = 0;
var squarusEntryFadeActive = false;
var squarusEntryFadeRafPending = false;
var squarusPolyominoCache = Object.create(null);
var stitchingFrameShape = 'circle';
var triangulaBandColors = {
  band1: '#8ac926',
  band2: '#6a4c93',
  band4: '#8ac926'
};
var triangulaSourceColor = '#8ac926';

