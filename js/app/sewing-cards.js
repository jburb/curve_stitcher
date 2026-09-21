var SEWING_CARDS_SERIES_COUNT = 7;
var SEWING_CARDS_PER_SERIES = 13;
var SEWING_CARDS_BASE_PATH = 'assets/images/curve_sewing_cards';
var SEWING_CARDS_PDF_PATH = 'assets/a_rhythmic_approach_to_mathematics.pdf';
var SEWING_CARDS_DEFAULT_SERIES = 1;
var SEWING_CARDS_DEFAULT_CARD_INDEX = 0;
var SEWING_CARDS_DEFAULT_PDF_PAGE = 34;
var SEWING_PDF_DEBUG_EVENT_LIMIT = 14;
var sewingPdfDebugCopyStatusTimerId = null;

var sewingCardsViewerState = {
  seriesNumber: SEWING_CARDS_DEFAULT_SERIES,
  cardIndex: SEWING_CARDS_DEFAULT_CARD_INDEX,
  pdfPage: SEWING_CARDS_DEFAULT_PDF_PAGE,
  renderedSeriesNumber: -1,
  pdfCommitSequence: 0,
  pdfWorkaroundTimerIds: [],
  pdfDebugEvents: []
};

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

function buildSewingPdfSrc(pageNumber, options) {
  options = options || {};
  var safePage = Math.max(1, clampSewingCardsInt(pageNumber, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));
  var basePath = SEWING_CARDS_PDF_PATH;
  var useSimplePageFragment = !!options.simplePageFragment;
  if (options.cacheBustToken !== undefined && options.cacheBustToken !== null) {
    basePath += (basePath.indexOf('?') === -1 ? '?' : '&') + 'nonce=' + encodeURIComponent(String(options.cacheBustToken));
  }
  if (useSimplePageFragment) {
    return basePath + '#page=' + String(safePage);
  }
  return basePath + '#page=' + String(safePage) + '&zoom=page-fit&view=FitH&pagemode=none';
}

function shouldUseMobilePdfWorkaround() {
  if (!window || !window.navigator) return false;
  var ua = String(window.navigator.userAgent || '').toLowerCase();
  return ua.indexOf('mobile') !== -1
    || ua.indexOf('android') !== -1
    || ua.indexOf('iphone') !== -1
    || ua.indexOf('ipad') !== -1
    || ua.indexOf('ipod') !== -1;
}

function shouldLogSewingPdfDebug() {
  if (shouldUseMobilePdfWorkaround()) return true;
  return !!(window && window.SEWING_PDF_DEBUG === true);
}

function summarizeSewingPdfDebugSrc(src) {
  var text = String(src || '');
  if (!text) return '(none)';
  if (text.length <= 120) return text;
  return text.slice(0, 117) + '...';
}

function summarizeSewingPdfDebugPayload(payload) {
  if (!payload) return '';
  try {
    var serialized = JSON.stringify(payload);
    return serialized.length <= 160 ? serialized : serialized.slice(0, 157) + '...';
  } catch (error) {
    return '(unserializable payload)';
  }
}

function pushSewingPdfDebugEvent(eventName, payload) {
  var stamp = new Date().toISOString().slice(11, 23);
  var line = stamp + ' ' + String(eventName || 'event') + ' ' + summarizeSewingPdfDebugPayload(payload);
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
    var timerCount = sewingCardsViewerState.pdfWorkaroundTimerIds ? sewingCardsViewerState.pdfWorkaroundTimerIds.length : 0;
    sewingPdfDebugTimers.textContent = String(timerCount);
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
  lines.push('mobileWorkaround: ' + String(shouldUseMobilePdfWorkaround()));
  lines.push('debugEnabled: ' + String(shouldLogSewingPdfDebug()));
  lines.push('userAgent: ' + ua);
  lines.push('pageLabel: ' + (sewingPdfPageLabel ? String(sewingPdfPageLabel.textContent || '') : '(missing)'));
  lines.push('state.pdfPage: ' + String(sewingCardsViewerState.pdfPage));
  lines.push('state.sequence: ' + String(sewingCardsViewerState.pdfCommitSequence));
  lines.push('state.activeTimers: ' + String(sewingCardsViewerState.pdfWorkaroundTimerIds ? sewingCardsViewerState.pdfWorkaroundTimerIds.length : 0));
  lines.push('iframe.src: ' + (sewingPdfFrame ? String(sewingPdfFrame.src || '') : '(missing)'));
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

function clearSewingPdfWorkaroundTimers() {
  var priorCount = sewingCardsViewerState.pdfWorkaroundTimerIds ? sewingCardsViewerState.pdfWorkaroundTimerIds.length : 0;
  if (!sewingCardsViewerState.pdfWorkaroundTimerIds || !sewingCardsViewerState.pdfWorkaroundTimerIds.length) return;
  for (var i = 0; i < sewingCardsViewerState.pdfWorkaroundTimerIds.length; i++) {
    clearTimeout(sewingCardsViewerState.pdfWorkaroundTimerIds[i]);
  }
  sewingCardsViewerState.pdfWorkaroundTimerIds = [];
  logSewingPdfDebug('timers-cleared', { cleared: priorCount });
}

function commitSewingPdfSrc(pageNumber) {
  if (!sewingPdfFrame) return;

  var safePage = Math.max(1, clampSewingCardsInt(pageNumber, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));
  var useMobileWorkaround = shouldUseMobilePdfWorkaround();
  sewingCardsViewerState.pdfCommitSequence += 1;
  var currentSequence = sewingCardsViewerState.pdfCommitSequence;
  logSewingPdfDebug('commit-start', {
    requestedPage: pageNumber,
    safePage: safePage,
    sequence: currentSequence,
    mobileWorkaround: useMobileWorkaround,
    simpleFragment: useMobileWorkaround
  });
  clearSewingPdfWorkaroundTimers();

  if (!useMobileWorkaround) {
    var desktopSrc = buildSewingPdfSrc(safePage, {
      cacheBustToken: String(currentSequence) + '-' + String(Date.now())
    });
    sewingPdfFrame.src = desktopSrc;
    logSewingPdfDebug('commit-desktop-src', {
      sequence: currentSequence,
      page: safePage,
      src: desktopSrc
    });
    return;
  }

  // Mobile PDF viewers can ignore fragment-only page changes in iframes.
  // Apply the target PDF immediately, then reapply at relaxed intervals to avoid churn.
  var initialMobileSrc = buildSewingPdfSrc(safePage, {
    simplePageFragment: true,
    cacheBustToken: String(currentSequence) + '-initial-' + String(Date.now())
  });
  sewingPdfFrame.src = initialMobileSrc;
  logSewingPdfDebug('mobile-initial-apply', {
    sequence: currentSequence,
    page: safePage,
    src: initialMobileSrc
  });

  var reloadDelays = [650, 1500];
  for (var i = 0; i < reloadDelays.length; i++) {
    (function(attemptIndex) {
      logSewingPdfDebug('mobile-reload-scheduled', {
        sequence: currentSequence,
        page: safePage,
        attempt: attemptIndex,
        delayMs: reloadDelays[attemptIndex]
      });
      var timerId = window.setTimeout(function() {
        if (!sewingPdfFrame) return;
        if (sewingCardsViewerState.pdfCommitSequence !== currentSequence) {
          logSewingPdfDebug('mobile-reload-skipped-stale', {
            expectedSequence: currentSequence,
            activeSequence: sewingCardsViewerState.pdfCommitSequence,
            attempt: attemptIndex,
            page: safePage
          });
          return;
        }
        var mobileSrc = buildSewingPdfSrc(safePage, {
          simplePageFragment: true,
          cacheBustToken: String(currentSequence) + '-retry-' + String(attemptIndex) + '-' + String(Date.now())
        });
        sewingPdfFrame.src = mobileSrc;
        logSewingPdfDebug('mobile-reload-applied', {
          sequence: currentSequence,
          page: safePage,
          attempt: attemptIndex,
          src: mobileSrc
        });
      }, reloadDelays[attemptIndex]);
      sewingCardsViewerState.pdfWorkaroundTimerIds.push(timerId);
    })(i);
  }
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
  if (!sewingPdfFrame) return;

  var safePage = Math.max(1, clampSewingCardsInt(sewingCardsViewerState.pdfPage, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));
  sewingCardsViewerState.pdfPage = safePage;
  logSewingPdfDebug('sync-viewer', {
    page: safePage,
    labelBefore: sewingPdfPageLabel ? String(sewingPdfPageLabel.textContent || '') : ''
  });
  commitSewingPdfSrc(safePage);
  if (sewingPdfPageLabel) {
    sewingPdfPageLabel.textContent = 'Page ' + String(safePage);
    logSewingPdfDebug('label-updated', {
      label: sewingPdfPageLabel.textContent,
      page: safePage
    });
  }
  if (sewingPdfPrevBtn) {
    sewingPdfPrevBtn.disabled = safePage <= 1;
  }
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

function stepSewingPdfPage(delta) {
  var nextPage = sewingCardsViewerState.pdfPage + (delta < 0 ? -1 : 1);
  sewingCardsViewerState.pdfPage = Math.max(1, nextPage);
  logSewingPdfDebug('step-page', {
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
  logSewingPdfDebug('open-viewer', {
    requestedSeries: requestedSeries,
    requestedCardIndex: requestedCardIndex,
    requestedPdfPage: requestedPdfPage,
    mobileWorkaround: shouldUseMobilePdfWorkaround()
  });

  sewingCardsModal.classList.add('open');
  syncSewingCardsViewer();
  window.requestAnimationFrame(function() {
    syncSewingPdfViewer();
  });
  if (sewingCardsCloseBtn) {
    sewingCardsCloseBtn.focus();
  }
}

function closeSewingCardsViewer() {
  if (!sewingCardsModal) return;
  clearSewingPdfWorkaroundTimers();
  renderSewingPdfDebugPanel('close-viewer', { src: sewingPdfFrame ? sewingPdfFrame.src : '' });
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
    logSewingPdfDebug('nav-prev-click', {
      pageBefore: sewingCardsViewerState.pdfPage,
      disabled: !!sewingPdfPrevBtn.disabled
    });
    stepSewingPdfPage(-1);
  });
}

if (sewingPdfNextBtn) {
  sewingPdfNextBtn.addEventListener('click', function() {
    logSewingPdfDebug('nav-next-click', {
      pageBefore: sewingCardsViewerState.pdfPage,
      disabled: !!sewingPdfNextBtn.disabled
    });
    stepSewingPdfPage(1);
  });
}

if (sewingPdfFrame) {
  sewingPdfFrame.addEventListener('load', function() {
    logSewingPdfDebug('iframe-load', {
      sequence: sewingCardsViewerState.pdfCommitSequence,
      src: sewingPdfFrame.src
    });
  });
  sewingPdfFrame.addEventListener('error', function() {
    logSewingPdfDebug('iframe-error', {
      sequence: sewingCardsViewerState.pdfCommitSequence,
      src: sewingPdfFrame.src
    });
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
      logSewingPdfDebug('nav-key-pageup', {
        pageBefore: sewingCardsViewerState.pdfPage
      });
      stepSewingPdfPage(-1);
      return;
    }
    if (event.key === 'PageDown') {
      event.preventDefault();
      logSewingPdfDebug('nav-key-pagedown', {
        pageBefore: sewingCardsViewerState.pdfPage
      });
      stepSewingPdfPage(1);
    }
  });
}
