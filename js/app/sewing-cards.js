var SEWING_CARDS_SERIES_COUNT = 7;
var SEWING_CARDS_PER_SERIES = 13;
var SEWING_CARDS_BASE_PATH = 'assets/images/curve_sewing_cards';
var SEWING_CARDS_PDF_PATH = 'assets/a_rhythmic_approach_to_mathematics.pdf';
var SEWING_CARDS_DEFAULT_SERIES = 1;
var SEWING_CARDS_DEFAULT_CARD_INDEX = 0;
var SEWING_CARDS_DEFAULT_PDF_PAGE = 34;

var sewingCardsViewerState = {
  seriesNumber: SEWING_CARDS_DEFAULT_SERIES,
  cardIndex: SEWING_CARDS_DEFAULT_CARD_INDEX,
  pdfPage: SEWING_CARDS_DEFAULT_PDF_PAGE,
  renderedSeriesNumber: -1
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

function buildSewingPdfSrc(pageNumber) {
  var safePage = Math.max(1, clampSewingCardsInt(pageNumber, 1, 5000, SEWING_CARDS_DEFAULT_PDF_PAGE));
  return SEWING_CARDS_PDF_PATH + '#page=' + String(safePage) + '&zoom=page-fit';
}

function commitSewingPdfSrc(src) {
  if (!sewingPdfFrame) return;
  // Force a fresh navigation target so Firefox mobile consistently re-applies page fragments.
  sewingPdfFrame.removeAttribute('src');
  sewingPdfFrame.src = 'about:blank';
  window.setTimeout(function() {
    sewingPdfFrame.src = src;
  }, 0);
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
  commitSewingPdfSrc(buildSewingPdfSrc(safePage));
  if (sewingPdfPageLabel) {
    sewingPdfPageLabel.textContent = 'Page ' + String(safePage);
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
    stepSewingPdfPage(-1);
  });
}

if (sewingPdfNextBtn) {
  sewingPdfNextBtn.addEventListener('click', function() {
    stepSewingPdfPage(1);
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
      stepSewingPdfPage(-1);
      return;
    }
    if (event.key === 'PageDown') {
      event.preventDefault();
      stepSewingPdfPage(1);
    }
  });
}
