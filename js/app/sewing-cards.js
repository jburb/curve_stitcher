var SEWING_CARDS_SERIES_COUNT = 7;
var SEWING_CARDS_PER_SERIES = 13;
var SEWING_CARDS_BASE_PATH = 'assets/images/curve_sewing_cards';
var SEWING_CARDS_PDF_PATH = 'assets/a_rhythmic_approach_to_mathematics.pdf';
var SEWING_CARDS_PDF_WORKER_PATH = 'js/vendor/pdfjs/pdf.worker.min.js';
var SEWING_CARDS_DEFAULT_SERIES = 1;
var SEWING_CARDS_DEFAULT_CARD_INDEX = 0;
var SEWING_CARDS_DEFAULT_PDF_PAGE = 34;
var SEWING_PDF_DEBUG_EVENT_LIMIT = 40;
var sewingPdfDebugCopyStatusTimerId = null;

var sewingCardsViewerState = {
  seriesNumber: SEWING_CARDS_DEFAULT_SERIES,
  cardIndex: SEWING_CARDS_DEFAULT_CARD_INDEX,
  pdfPage: SEWING_CARDS_DEFAULT_PDF_PAGE,
  renderedSeriesNumber: -1,
  pdfCommitSequence: 0,
  pdfDocument: null,
  pdfLoadingPromise: null,
  pdfRenderTask: null,
  pdfPendingRequest: null,
  pdfRenderedPage: null,
  pdfTotalPages: 0,
  pdfLastRenderDescriptor: '',
  pdfRenderResizeTimerId: null,
  pdfPostOpenRerenderTimerId: null,
  pdfObservedFrameWidth: 0,
  pdfObservedFrameHeight: 0,
  pdfDebugEvents: [],
  pdfDebugEventCounter: 0,
  pdfDebugRenderCount: 0,
  pdfDebugNavClickCount: 0
};

var sewingPdfFrameResizeObserver = null;

function clampSewingCardsInt(value, min, max, fallback) {
  var parsed = parseInt(value, 10);
  if (!isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

function buildSewingCardsSeriesPath(seriesNumber) {
  return SEWING_CARDS_BASE_PATH + '/series_' + String(seriesNumber);
}

function buildSewingCardImagePath(seriesNumber, cardIndex) {
  return buildSewingCardsSeriesPath(seriesNumber) + '/card_' + String(cardIndex) + '.jpeg';
}

function isMobileDevice() {
  if (!window || !window.navigator) return false;
  var ua = String(window.navigator.userAgent || '').toLowerCase();
  return ua.indexOf('mobile') !== -1
    || ua.indexOf('android') !== -1
    || ua.indexOf('iphone') !== -1
    || ua.indexOf('ipad') !== -1
    || ua.indexOf('ipod') !== -1;
}

function shouldLogSewingPdfDebug() {
  if (isMobileDevice()) return true;
  return !!(window && window.SEWING_PDF_DEBUG === true);
}
// NOTE: Disabled truncation
function summarizeSewingPdfDebugSrc(src) {
  var text = String(src || '');
  if (!text) return '(none)';
  //if (text.length <= 120) return text;
  //return text.slice(0, 117) + '...';
  return text;
}
// NOTE: Disabled truncation
function summarizeSewingPdfDebugPayload(payload) {
  if (!payload) return '';
  try {
    var serialized = JSON.stringify(payload);
    //return serialized.length <= 160 ? serialized : serialized.slice(0, 157) + '...';
    return serialized;
  } catch (error) {
    return '(unserializable payload)';
  }
}

function pushSewingPdfDebugEvent(eventName, payload) {
  var stamp = new Date().toISOString().slice(11, 23);
  sewingCardsViewerState.pdfDebugEventCounter += 1;
  var line = String(sewingCardsViewerState.pdfDebugEventCounter)
    + ' | ' + stamp
    + ' | ' + String(eventName || 'event')
    + ' | ' + summarizeSewingPdfDebugPayload(payload);
  sewingCardsViewerState.pdfDebugEvents.push(line);
  if (sewingCardsViewerState.pdfDebugEvents.length > SEWING_PDF_DEBUG_EVENT_LIMIT) {
    sewingCardsViewerState.pdfDebugEvents = sewingCardsViewerState.pdfDebugEvents.slice(-SEWING_PDF_DEBUG_EVENT_LIMIT);
  }
}

function renderSewingPdfDebugPanel(eventName, payload) {
  if (!sewingPdfDebugPanel) return;

  var enabled = shouldLogSewingPdfDebug();
  sewingPdfDebugPanel.hidden = !enabled;
  if (!enabled) return;

  if (sewingPdfDebugEnabled) {
    sewingPdfDebugEnabled.textContent = 'on';
  }
  if (sewingPdfDebugSeq) {
    sewingPdfDebugSeq.textContent = String(sewingCardsViewerState.pdfCommitSequence || 0);
  }
  if (sewingPdfDebugPage) {
    sewingPdfDebugPage.textContent = String(sewingCardsViewerState.pdfPage || 0);
  }
  if (sewingPdfDebugTimers) {
    var hasPending = sewingCardsViewerState.pdfPendingRequest ? 1 : 0;
    sewingPdfDebugTimers.textContent = String(hasPending);
  }
  if (sewingPdfDebugLastEvent) {
    sewingPdfDebugLastEvent.textContent = String(eventName || '(none)');
  }
  if (sewingPdfDebugSrc) {
    var payloadSrc = payload && payload.src ? payload.src : (sewingPdfFrame ? sewingPdfFrame.src : '');
    sewingPdfDebugSrc.textContent = summarizeSewingPdfDebugSrc(payloadSrc);
  }
  if (sewingPdfDebugLog) {
    sewingPdfDebugLog.textContent = sewingCardsViewerState.pdfDebugEvents.join('\n');
  }
}

function setSewingPdfDebugCopyStatus(message) {
  if (!sewingPdfDebugCopyStatus) return;
  sewingPdfDebugCopyStatus.textContent = String(message || '');
  if (sewingPdfDebugCopyStatusTimerId) {
    clearTimeout(sewingPdfDebugCopyStatusTimerId);
    sewingPdfDebugCopyStatusTimerId = null;
  }
  if (!message) return;
  sewingPdfDebugCopyStatusTimerId = window.setTimeout(function() {
    if (sewingPdfDebugCopyStatus) {
      sewingPdfDebugCopyStatus.textContent = '';
    }
    sewingPdfDebugCopyStatusTimerId = null;
  }, 2600);
}

function buildSewingPdfDebugReport() {
  var ua = (window && window.navigator && window.navigator.userAgent) ? String(window.navigator.userAgent) : '(unknown)';
  var lines = [];
  lines.push('Sewing PDF debug snapshot');
  lines.push('timestamp: ' + new Date().toISOString());
  lines.push('pdfEngine: pdfjs');
  lines.push('isMobileDevice: ' + String(isMobileDevice()));
  lines.push('debugEnabled: ' + String(shouldLogSewingPdfDebug()));
  lines.push('userAgent: ' + ua);
  lines.push('pageLabel: ' + (sewingPdfPageLabel ? String(sewingPdfPageLabel.textContent || '') : '(missing)'));
  lines.push('state.pdfPage: ' + String(sewingCardsViewerState.pdfPage));
  lines.push('state.sequence: ' + String(sewingCardsViewerState.pdfCommitSequence));
  lines.push('state.pendingRequests: ' + String(sewingCardsViewerState.pdfPendingRequest ? 1 : 0));
  lines.push('state.eventCounter: ' + String(sewingCardsViewerState.pdfDebugEventCounter));
  lines.push('state.navClickCount: ' + String(sewingCardsViewerState.pdfDebugNavClickCount));
  lines.push('state.renderCount: ' + String(sewingCardsViewerState.pdfDebugRenderCount));
  lines.push('state.totalPages: ' + String(sewingCardsViewerState.pdfTotalPages || 0));
  lines.push('state.renderedPage: ' + String(sewingCardsViewerState.pdfRenderedPage || 0));
  lines.push('state.lastRender: ' + String(sewingCardsViewerState.pdfLastRenderDescriptor || '(none)'));
  lines.push('events:');
  if (sewingCardsViewerState.pdfDebugEvents && sewingCardsViewerState.pdfDebugEvents.length) {
    for (var i = 0; i < sewingCardsViewerState.pdfDebugEvents.length; i++) {
      lines.push('  ' + sewingCardsViewerState.pdfDebugEvents[i]);
    }
  } else {
    lines.push('  (none)');
  }
  return lines.join('\n');
}

function copyTextWithFallback(text) {
  if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function(resolve, reject) {
    try {
      var probe = document.createElement('textarea');
      probe.value = text;
      probe.setAttribute('readonly', 'readonly');
      probe.style.position = 'fixed';
      probe.style.top = '-1000px';
      probe.style.left = '-1000px';
      document.body.appendChild(probe);
      probe.focus();
      probe.select();
      var copied = document.execCommand('copy');
      document.body.removeChild(probe);
      if (copied) {
        resolve();
        return;
      }
      reject(new Error('Copy command returned false'));
    } catch (error) {
      reject(error);
    }
  });
}

function logSewingPdfDebug(eventName, payload) {
  pushSewingPdfDebugEvent(eventName, payload);
  renderSewingPdfDebugPanel(eventName, payload);
  if (!shouldLogSewingPdfDebug()) return;
  if (typeof console === 'undefined' || !console || typeof console.log !== 'function') return;
  console.log('[sewing-pdf]', eventName, payload || {});
}

function ensurePdfJsConfigured(options) {
  options = options || {};
  var runtime = window ? (window.pdfjsLib || window['pdfjs-dist/build/pdf']) : null;
  if (!window || !runtime) {
    if (!options.silent) {
      logSewingPdfDebug('pdfjs-missing', {});
    }
    return false;
  }
  if (runtime.GlobalWorkerOptions && !runtime.GlobalWorkerOptions.workerSrc) {
    runtime.GlobalWorkerOptions.workerSrc = SEWING_CARDS_PDF_WORKER_PATH;
  }
  if (!window.pdfjsLib) {
    window.pdfjsLib = runtime;
  }
  return true;
}

function waitForPdfJsConfigured(timeoutMs) {
  var waitMs = Math.max(0, clampSewingCardsInt(timeoutMs, 0, 15000, 4000));
  if (ensurePdfJsConfigured()) {
    return Promise.resolve(window.pdfjsLib);
  }

  return new Promise(function(resolve, reject) {
    var started = Date.now();
    function checkAgain() {
      if (ensurePdfJsConfigured({ silent: true })) {
        logSewingPdfDebug('pdfjs-ready', { waitedMs: Date.now() - started });
        resolve(window.pdfjsLib);
        return;
      }
      if (Date.now() - started >= waitMs) {
        logSewingPdfDebug('pdfjs-missing-timeout', { waitedMs: waitMs });
        reject(new Error('PDF.js runtime unavailable'));
        return;
      }
      window.setTimeout(checkAgain, 60);
    }
    window.setTimeout(checkAgain, 60);
  });
}

function loadSewingPdfDocument() {
  if (sewingCardsViewerState.pdfDocument) {
    return Promise.resolve(sewingCardsViewerState.pdfDocument);
  }
  if (sewingCardsViewerState.pdfLoadingPromise) {
    return sewingCardsViewerState.pdfLoadingPromise;
  }
  sewingCardsViewerState.pdfLoadingPromise = waitForPdfJsConfigured(4500).then(function() {
    logSewingPdfDebug('pdf-load-start', { path: SEWING_CARDS_PDF_PATH });
    var loadingTask = window.pdfjsLib.getDocument({
      url: SEWING_CARDS_PDF_PATH
    });
    return loadingTask.promise.then(function(pdfDocument) {
      sewingCardsViewerState.pdfDocument = pdfDocument;
      sewingCardsViewerState.pdfTotalPages = pdfDocument.numPages || 0;
      logSewingPdfDebug('pdf-load-success', {
        pages: sewingCardsViewerState.pdfTotalPages
      });
      return pdfDocument;
    });
  }).catch(function(error) {
    logSewingPdfDebug('pdf-load-error', {
      message: error && error.message ? String(error.message) : 'unknown'
    });
    throw error;
  }).finally(function() {
    sewingCardsViewerState.pdfLoadingPromise = null;
  });

  return sewingCardsViewerState.pdfLoadingPromise;
}

function updateSewingPdfControls() {
  var totalPages = sewingCardsViewerState.pdfTotalPages || 0;
  var safePage = Math.max(1, clampSewingCardsInt(sewingCardsViewerState.pdfPage, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));
  if (sewingPdfPrevBtn) {
    sewingPdfPrevBtn.disabled = safePage <= 1;
  }
  if (sewingPdfNextBtn) {
    sewingPdfNextBtn.disabled = totalPages > 0 ? safePage >= totalPages : false;
  }
}

function updateSewingPdfLabel() {
  if (!sewingPdfPageLabel) return;
  var pageText = 'Page ' + String(sewingCardsViewerState.pdfPage);
  if (sewingCardsViewerState.pdfTotalPages > 0) {
    pageText += ' of ' + String(sewingCardsViewerState.pdfTotalPages);
  }
  sewingPdfPageLabel.textContent = pageText;
}

function renderSewingPdfPage(pageNumber, sequence, source) {
  loadSewingPdfDocument().then(function(pdfDocument) {
    if (!sewingPdfCanvas || !sewingPdfFrame) return;

    var safePage = clampSewingCardsInt(pageNumber, 1, pdfDocument.numPages || 1, SEWING_CARDS_DEFAULT_PDF_PAGE);
    if (safePage !== sewingCardsViewerState.pdfPage) {
      sewingCardsViewerState.pdfPage = safePage;
      updateSewingPdfLabel();
      updateSewingPdfControls();
    }

    if (sewingCardsViewerState.pdfRenderTask && typeof sewingCardsViewerState.pdfRenderTask.cancel === 'function') {
      sewingCardsViewerState.pdfRenderTask.cancel();
      sewingCardsViewerState.pdfRenderTask = null;
    }

    logSewingPdfDebug('pdf-render-start', {
      sequence: sequence,
      page: safePage,
      source: source
    });

    return pdfDocument.getPage(safePage).then(function(page) {
      var frameRect = sewingPdfFrame.getBoundingClientRect ? sewingPdfFrame.getBoundingClientRect() : { width: 600, height: 800 };
      var fitWidth = Math.max(120, Math.floor(frameRect.width - 14));
      var fitHeight = Math.max(140, Math.floor(frameRect.height - 14));
      var rawViewport = page.getViewport({ scale: 1 });
      var widthScale = fitWidth / rawViewport.width;
      var containScale = Math.min(widthScale, fitHeight / rawViewport.height);
      var fitScale = isMobileDevice() ? containScale : widthScale;
      if (!isFinite(fitScale) || fitScale <= 0) {
        fitScale = 1;
      }
      var viewport = page.getViewport({ scale: fitScale });

      var dpr = (window && window.devicePixelRatio) ? window.devicePixelRatio : 1;
      var context = sewingPdfCanvas.getContext('2d', { alpha: false });
      sewingPdfCanvas.width = Math.max(1, Math.floor(viewport.width * dpr));
      sewingPdfCanvas.height = Math.max(1, Math.floor(viewport.height * dpr));
      sewingPdfCanvas.style.width = Math.floor(viewport.width) + 'px';
      sewingPdfCanvas.style.height = Math.floor(viewport.height) + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      var renderTask = page.render({
        canvasContext: context,
        viewport: viewport
      });
      sewingCardsViewerState.pdfRenderTask = renderTask;

      return renderTask.promise.then(function() {
        sewingCardsViewerState.pdfDebugRenderCount += 1;
        sewingCardsViewerState.pdfRenderedPage = safePage;
        sewingCardsViewerState.pdfLastRenderDescriptor = 'page=' + String(safePage) + ', width=' + String(Math.floor(viewport.width)) + ', height=' + String(Math.floor(viewport.height));
        sewingCardsViewerState.pdfRenderTask = null;
        logSewingPdfDebug('pdf-render-success', {
          renderCount: sewingCardsViewerState.pdfDebugRenderCount,
          sequence: sequence,
          page: safePage,
          source: source,
          scaleMode: isMobileDevice() ? 'contain' : 'fit-width',
          scale: Number(fitScale.toFixed(4)),
          viewport: {
            width: Math.floor(viewport.width),
            height: Math.floor(viewport.height)
          }
        });

        if (sewingCardsViewerState.pdfPendingRequest) {
          var pending = sewingCardsViewerState.pdfPendingRequest;
          sewingCardsViewerState.pdfPendingRequest = null;
          renderSewingPdfPage(pending.page, pending.sequence, pending.source);
        }
      }).catch(function(error) {
        sewingCardsViewerState.pdfRenderTask = null;
        var message = error && error.message ? String(error.message) : 'unknown';
        if (message.toLowerCase().indexOf('cancel') !== -1) {
          logSewingPdfDebug('pdf-render-cancelled', {
            sequence: sequence,
            page: safePage,
            source: source
          });
        } else {
          logSewingPdfDebug('pdf-render-error', {
            sequence: sequence,
            page: safePage,
            source: source,
            message: message
          });
        }
      });
    });
  }).catch(function(error) {
    logSewingPdfDebug('pdf-render-aborted', {
      sequence: sequence,
      page: pageNumber,
      source: source,
      message: error && error.message ? String(error.message) : 'unknown'
    });
  });
}

function commitSewingPdfRender(pageNumber, source) {
  var safePage = Math.max(1, clampSewingCardsInt(pageNumber, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));
  sewingCardsViewerState.pdfCommitSequence += 1;
  var currentSequence = sewingCardsViewerState.pdfCommitSequence;
  logSewingPdfDebug('commit-start', {
    requestedPage: pageNumber,
    safePage: safePage,
    sequence: currentSequence,
    source: source || 'sync',
    engine: 'pdfjs'
  });

  if (sewingCardsViewerState.pdfRenderTask) {
    sewingCardsViewerState.pdfPendingRequest = {
      sequence: currentSequence,
      page: safePage,
      source: source || 'sync'
    };
    logSewingPdfDebug('pdf-render-queued', {
      sequence: currentSequence,
      page: safePage,
      source: source || 'sync'
    });
    return;
  }

  renderSewingPdfPage(safePage, currentSequence, source || 'sync');
}

function renderSewingCardsSeriesPicker() {
  if (!sewingCardsSeriesSelect) return;
  if (sewingCardsSeriesSelect.options.length) return;

  for (var seriesNumber = 1; seriesNumber <= SEWING_CARDS_SERIES_COUNT; seriesNumber++) {
    var option = document.createElement('option');
    option.value = String(seriesNumber);
    option.textContent = 'Series ' + String(seriesNumber);
    sewingCardsSeriesSelect.appendChild(option);
  }
}

function renderSewingCardsThumbnails() {
  if (!sewingCardsThumbnails) return;

  if (sewingCardsViewerState.renderedSeriesNumber !== sewingCardsViewerState.seriesNumber) {
    sewingCardsThumbnails.innerHTML = '';
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < SEWING_CARDS_PER_SERIES; i++) {
      var thumbButton = document.createElement('button');
      thumbButton.type = 'button';
      thumbButton.className = 'sewing-cards-thumb';
      thumbButton.setAttribute('role', 'option');
      thumbButton.setAttribute('data-card-index', String(i));
      thumbButton.setAttribute('aria-selected', 'false');
      thumbButton.setAttribute('aria-label', 'Card ' + String(i));

      var thumbImage = document.createElement('img');
      thumbImage.className = 'sewing-cards-thumbnail-image';
      thumbImage.alt = 'Series ' + String(sewingCardsViewerState.seriesNumber) + ', card ' + String(i);
      thumbImage.src = buildSewingCardImagePath(sewingCardsViewerState.seriesNumber, i);
      thumbImage.loading = 'lazy';
      thumbImage.draggable = false;

      thumbButton.appendChild(thumbImage);
      fragment.appendChild(thumbButton);
    }

    sewingCardsThumbnails.appendChild(fragment);
    sewingCardsViewerState.renderedSeriesNumber = sewingCardsViewerState.seriesNumber;
  }

  var buttons = sewingCardsThumbnails.querySelectorAll('.sewing-cards-thumb');
  for (var b = 0; b < buttons.length; b++) {
    var selected = b === sewingCardsViewerState.cardIndex;
    buttons[b].setAttribute('aria-selected', selected ? 'true' : 'false');
  }
}

function syncSewingCardsStageImage() {
  if (!sewingCardsActiveImage) return;

  var src = buildSewingCardImagePath(sewingCardsViewerState.seriesNumber, sewingCardsViewerState.cardIndex);
  sewingCardsActiveImage.src = src;
  sewingCardsActiveImage.alt = 'Boole curve sewing card, series ' + String(sewingCardsViewerState.seriesNumber) + ', card ' + String(sewingCardsViewerState.cardIndex);

  if (sewingCardsCardCaption) {
    sewingCardsCardCaption.textContent = 'Series ' + String(sewingCardsViewerState.seriesNumber)
      + ' | Card ' + String(sewingCardsViewerState.cardIndex)
      + ' of ' + String(SEWING_CARDS_PER_SERIES - 1);
  }

  if (sewingCardsPrevBtn) {
    sewingCardsPrevBtn.disabled = sewingCardsViewerState.cardIndex <= 0;
  }
  if (sewingCardsNextBtn) {
    sewingCardsNextBtn.disabled = sewingCardsViewerState.cardIndex >= (SEWING_CARDS_PER_SERIES - 1);
  }
}

function syncSewingPdfViewer() {
  if (!sewingPdfFrame || !sewingPdfCanvas) return;

  var safePage = Math.max(1, clampSewingCardsInt(sewingCardsViewerState.pdfPage, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));
  sewingCardsViewerState.pdfPage = safePage;
  logSewingPdfDebug('sync-viewer', {
    page: safePage,
    labelBefore: sewingPdfPageLabel ? String(sewingPdfPageLabel.textContent || '') : ''
  });
  updateSewingPdfLabel();
  updateSewingPdfControls();
  logSewingPdfDebug('label-updated', {
    label: sewingPdfPageLabel ? String(sewingPdfPageLabel.textContent || '') : '',
    page: safePage
  });
  commitSewingPdfRender(safePage, 'sync');
}

function syncSewingCardsViewer(options) {
  if (!sewingCardsModal) return;
  options = options || {};

  renderSewingCardsSeriesPicker();
  if (sewingCardsSeriesSelect) {
    sewingCardsSeriesSelect.value = String(sewingCardsViewerState.seriesNumber);
  }
  renderSewingCardsThumbnails();
  syncSewingCardsStageImage();
  if (options.syncPdf) {
    syncSewingPdfViewer();
  }
}

function stepSewingCard(delta) {
  var nextIndex = sewingCardsViewerState.cardIndex + (delta < 0 ? -1 : 1);
  sewingCardsViewerState.cardIndex = clampSewingCardsInt(nextIndex, 0, SEWING_CARDS_PER_SERIES - 1, 0);
  syncSewingCardsViewer();
}

function stepSewingPdfPage(delta, source) {
  source = source || 'unknown';
  var nextPage = sewingCardsViewerState.pdfPage + (delta < 0 ? -1 : 1);
  sewingCardsViewerState.pdfPage = Math.max(1, nextPage);
  logSewingPdfDebug('step-page', {
    source: source,
    delta: delta,
    nextPage: nextPage,
    committedPage: sewingCardsViewerState.pdfPage
  });
  syncSewingPdfViewer();
}

function openSewingCardsViewer(options) {
  if (!sewingCardsModal) return;
  options = options || {};

  var requestedSeries = clampSewingCardsInt(options.seriesNumber, 1, SEWING_CARDS_SERIES_COUNT, SEWING_CARDS_DEFAULT_SERIES);
  var requestedCardIndex = clampSewingCardsInt(options.cardIndex, 0, SEWING_CARDS_PER_SERIES - 1, SEWING_CARDS_DEFAULT_CARD_INDEX);
  var requestedPdfPage = Math.max(1, clampSewingCardsInt(options.pdfPage, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));

  sewingCardsViewerState.seriesNumber = requestedSeries;
  sewingCardsViewerState.cardIndex = requestedCardIndex;
  sewingCardsViewerState.pdfPage = requestedPdfPage;
  sewingCardsViewerState.renderedSeriesNumber = -1;
  sewingCardsViewerState.pdfDebugEvents = [];
  sewingCardsViewerState.pdfDebugEventCounter = 0;
  sewingCardsViewerState.pdfDebugRenderCount = 0;
  sewingCardsViewerState.pdfDebugNavClickCount = 0;
  sewingCardsViewerState.pdfPendingRequest = null;
  sewingCardsViewerState.pdfRenderedPage = null;
  sewingCardsViewerState.pdfLastRenderDescriptor = '';
  sewingCardsViewerState.pdfObservedFrameWidth = 0;
  sewingCardsViewerState.pdfObservedFrameHeight = 0;
  logSewingPdfDebug('open-viewer', {
    requestedSeries: requestedSeries,
    requestedCardIndex: requestedCardIndex,
    requestedPdfPage: requestedPdfPage,
    engine: 'pdfjs'
  });

  sewingCardsModal.classList.add('open');
  syncSewingCardsViewer();
  window.requestAnimationFrame(function() {
    syncSewingPdfViewer();
  });
  if (sewingCardsViewerState.pdfPostOpenRerenderTimerId) {
    clearTimeout(sewingCardsViewerState.pdfPostOpenRerenderTimerId);
    sewingCardsViewerState.pdfPostOpenRerenderTimerId = null;
  }
  // Layout can continue settling briefly after modal open (fonts/images/grid),
  // so force one extra rerender with final dimensions.
  sewingCardsViewerState.pdfPostOpenRerenderTimerId = window.setTimeout(function() {
    sewingCardsViewerState.pdfPostOpenRerenderTimerId = null;
    if (!sewingCardsModal.classList.contains('open')) return;
    logSewingPdfDebug('pdf-post-open-rerender', {
      page: sewingCardsViewerState.pdfPage
    });
    syncSewingPdfViewer();
  }, 220);
  if (sewingCardsCloseBtn) {
    sewingCardsCloseBtn.focus();
  }
}

function closeSewingCardsViewer() {
  if (!sewingCardsModal) return;
  if (sewingCardsViewerState.pdfRenderTask && typeof sewingCardsViewerState.pdfRenderTask.cancel === 'function') {
    sewingCardsViewerState.pdfRenderTask.cancel();
    sewingCardsViewerState.pdfRenderTask = null;
  }
  if (sewingCardsViewerState.pdfPostOpenRerenderTimerId) {
    clearTimeout(sewingCardsViewerState.pdfPostOpenRerenderTimerId);
    sewingCardsViewerState.pdfPostOpenRerenderTimerId = null;
  }
  sewingCardsViewerState.pdfPendingRequest = null;
  renderSewingPdfDebugPanel('close-viewer', { src: sewingCardsViewerState.pdfLastRenderDescriptor || '' });
  sewingCardsModal.classList.remove('open');
}

function triggerSewingCardsViewerOpen() {
  if (typeof syncExperienceInfoPanel === 'function') {
    syncExperienceInfoPanel(false);
  }
  openSewingCardsViewer({
    seriesNumber: SEWING_CARDS_DEFAULT_SERIES,
    cardIndex: SEWING_CARDS_DEFAULT_CARD_INDEX,
    pdfPage: SEWING_CARDS_DEFAULT_PDF_PAGE
  });
}

if (sewingCardsSeriesSelect) {
  sewingCardsSeriesSelect.addEventListener('change', function() {
    var nextSeries = clampSewingCardsInt(sewingCardsSeriesSelect.value, 1, SEWING_CARDS_SERIES_COUNT, SEWING_CARDS_DEFAULT_SERIES);
    sewingCardsViewerState.seriesNumber = nextSeries;
    sewingCardsViewerState.cardIndex = 0;
    sewingCardsViewerState.renderedSeriesNumber = -1;
    syncSewingCardsViewer();
  });
}

if (sewingCardsPrevBtn) {
  sewingCardsPrevBtn.addEventListener('click', function() {
    stepSewingCard(-1);
  });
}

if (sewingCardsNextBtn) {
  sewingCardsNextBtn.addEventListener('click', function() {
    stepSewingCard(1);
  });
}

if (sewingPdfPrevBtn) {
  sewingPdfPrevBtn.addEventListener('click', function() {
    sewingCardsViewerState.pdfDebugNavClickCount += 1;
    logSewingPdfDebug('nav-prev-click', {
      navClickCount: sewingCardsViewerState.pdfDebugNavClickCount,
      pageBefore: sewingCardsViewerState.pdfPage,
      disabled: !!sewingPdfPrevBtn.disabled
    });
    stepSewingPdfPage(-1, 'button-prev');
  });
}

if (sewingPdfNextBtn) {
  sewingPdfNextBtn.addEventListener('click', function() {
    sewingCardsViewerState.pdfDebugNavClickCount += 1;
    logSewingPdfDebug('nav-next-click', {
      navClickCount: sewingCardsViewerState.pdfDebugNavClickCount,
      pageBefore: sewingCardsViewerState.pdfPage,
      disabled: !!sewingPdfNextBtn.disabled
    });
    stepSewingPdfPage(1, 'button-next');
  });
}

if (sewingPdfDebugCopyBtn) {
  sewingPdfDebugCopyBtn.addEventListener('click', function() {
    var debugText = buildSewingPdfDebugReport();
    copyTextWithFallback(debugText).then(function() {
      setSewingPdfDebugCopyStatus('Copied');
      logSewingPdfDebug('debug-copy-success', {
        chars: debugText.length
      });
    }).catch(function(error) {
      setSewingPdfDebugCopyStatus('Copy failed');
      logSewingPdfDebug('debug-copy-failure', {
        message: error && error.message ? String(error.message) : 'unknown'
      });
    });
  });
}

if (sewingCardsThumbnails) {
  sewingCardsThumbnails.addEventListener('click', function(event) {
    if (!event || !event.target || typeof event.target.closest !== 'function') return;
    var thumb = event.target.closest('.sewing-cards-thumb');
    if (!thumb) return;
    var cardIndex = clampSewingCardsInt(thumb.getAttribute('data-card-index'), 0, SEWING_CARDS_PER_SERIES - 1, 0);
    sewingCardsViewerState.cardIndex = cardIndex;
    syncSewingCardsViewer();
  });
}

if (sewingCardsModal) {
  sewingCardsModal.addEventListener('contextmenu', function(event) {
    if (!event || !event.target || typeof event.target.closest !== 'function') return;
    if (event.target.closest('.sewing-cards-image') || event.target.closest('.sewing-cards-thumbnail-image')) {
      event.preventDefault();
    }
  });

  sewingCardsModal.addEventListener('dragstart', function(event) {
    if (!event || !event.target || typeof event.target.closest !== 'function') return;
    if (event.target.closest('.sewing-cards-image') || event.target.closest('.sewing-cards-thumbnail-image')) {
      event.preventDefault();
    }
  });

  sewingCardsModal.addEventListener('keydown', function(event) {
    if (!event) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      stepSewingCard(-1);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      stepSewingCard(1);
      return;
    }
    if (event.key === 'PageUp') {
      event.preventDefault();
      sewingCardsViewerState.pdfDebugNavClickCount += 1;
      logSewingPdfDebug('nav-key-pageup', {
        navClickCount: sewingCardsViewerState.pdfDebugNavClickCount,
        pageBefore: sewingCardsViewerState.pdfPage
      });
      stepSewingPdfPage(-1, 'key-pageup');
      return;
    }
    if (event.key === 'PageDown') {
      event.preventDefault();
      sewingCardsViewerState.pdfDebugNavClickCount += 1;
      logSewingPdfDebug('nav-key-pagedown', {
        navClickCount: sewingCardsViewerState.pdfDebugNavClickCount,
        pageBefore: sewingCardsViewerState.pdfPage
      });
      stepSewingPdfPage(1, 'key-pagedown');
    }
  });
}

if (window && typeof window.addEventListener === 'function') {
  window.addEventListener('resize', function() {
    if (!sewingCardsModal || !sewingCardsModal.classList.contains('open')) return;
    if (sewingCardsViewerState.pdfRenderResizeTimerId) {
      clearTimeout(sewingCardsViewerState.pdfRenderResizeTimerId);
      sewingCardsViewerState.pdfRenderResizeTimerId = null;
    }
    sewingCardsViewerState.pdfRenderResizeTimerId = window.setTimeout(function() {
      sewingCardsViewerState.pdfRenderResizeTimerId = null;
      if (!sewingCardsModal.classList.contains('open')) return;
      logSewingPdfDebug('pdf-resize-rerender', {
        page: sewingCardsViewerState.pdfPage
      });
      syncSewingPdfViewer();
    }, 140);
  });
}

if (window && typeof window.ResizeObserver === 'function' && sewingPdfFrame) {
  sewingPdfFrameResizeObserver = new window.ResizeObserver(function(entries) {
    if (!entries || !entries.length) return;
    if (!sewingCardsModal || !sewingCardsModal.classList.contains('open')) return;

    var entry = entries[0];
    var width = Math.round(entry.contentRect && entry.contentRect.width ? entry.contentRect.width : 0);
    var height = Math.round(entry.contentRect && entry.contentRect.height ? entry.contentRect.height : 0);
    if (width <= 0 || height <= 0) return;

    var priorWidth = sewingCardsViewerState.pdfObservedFrameWidth || 0;
    var priorHeight = sewingCardsViewerState.pdfObservedFrameHeight || 0;
    var widthDelta = Math.abs(width - priorWidth);
    var heightDelta = Math.abs(height - priorHeight);
    sewingCardsViewerState.pdfObservedFrameWidth = width;
    sewingCardsViewerState.pdfObservedFrameHeight = height;

    if (widthDelta < 6 && heightDelta < 6) return;

    if (sewingCardsViewerState.pdfRenderResizeTimerId) {
      clearTimeout(sewingCardsViewerState.pdfRenderResizeTimerId);
      sewingCardsViewerState.pdfRenderResizeTimerId = null;
    }
    sewingCardsViewerState.pdfRenderResizeTimerId = window.setTimeout(function() {
      sewingCardsViewerState.pdfRenderResizeTimerId = null;
      if (!sewingCardsModal.classList.contains('open')) return;
      logSewingPdfDebug('pdf-frame-resize-rerender', {
        width: width,
        height: height,
        page: sewingCardsViewerState.pdfPage
      });
      syncSewingPdfViewer();
    }, 120);
  });
  sewingPdfFrameResizeObserver.observe(sewingPdfFrame);
}
