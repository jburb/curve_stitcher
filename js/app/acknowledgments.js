function openAcknowledgmentsViewer(options) {
  options = options || {};
  if (!acknowledgmentsModal) return;
  loadAcknowledgmentsLines().then(function(lines) {
    var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES.slice();
    acknowledgmentsViewerState.lineDurationsMsByIndex = buildAcknowledgmentsLineDurations(safeLines);
    acknowledgmentsViewerState.seriesLineDurationMs = getAcknowledgmentsSeriesLineDurationMs(safeLines.length);
    var requestedIndex = parseBoundedInt(options.lineIndex, 0, Math.max(0, safeLines.length - 1), 0);
    acknowledgmentsViewerState.lineIndex = requestedIndex;
    acknowledgmentsViewerState.autoPlay = (typeof options.autoPlay === 'boolean') ? options.autoPlay : true;
    stopAcknowledgmentsAutoplay();
    acknowledgmentsModal.classList.add('open');
    acknowledgmentsAudio.currentTime = 0;
    updateMusicPlaybackState();
    renderAcknowledgmentsLine(safeLines);
    scheduleAcknowledgmentsAutoplayTick(safeLines);
    if (acknowledgmentsCloseBtn) {
      acknowledgmentsCloseBtn.focus();
    }
  });
}

function closeAcknowledgmentsViewer() {
  if (!acknowledgmentsModal) return;
  stopAcknowledgmentsAutoplay();
  stopAcknowledgmentsStageAnimation();
  acknowledgmentsViewerState.autoPlay = false;
  acknowledgmentsViewerState.lineDurationsMsByIndex = [];
  acknowledgmentsViewerState.seriesLineDurationMs = 0;
  acknowledgmentsModal.classList.remove('open');
  updateMusicPlaybackState();
}

function triggerAcknowledgmentsViewerOpen(autoPlay) {
  syncExperienceInfoPanel(false);
  if (typeof autoPlay === 'boolean') {
    openAcknowledgmentsViewer({ lineIndex: 0, autoPlay: autoPlay });
    return;
  }
  openAcknowledgmentsViewer({ lineIndex: 0 });
}

function attachExperienceInfoAcknowledgmentsBridge() {
  if (!experienceInfoHtmlFrame) return;
  var frameDoc = null;
  try {
    frameDoc = experienceInfoHtmlFrame.contentDocument || (experienceInfoHtmlFrame.contentWindow && experienceInfoHtmlFrame.contentWindow.document) || null;
  } catch (error) {
    frameDoc = null;
  }
  if (!frameDoc || frameDoc.__ackBridgeAttached) return;

  frameDoc.addEventListener('click', function(event) {
    if (!event || !event.target || typeof event.target.closest !== 'function') return;
    var trigger = event.target.closest('[data-open-acknowledgments]');
    if (!trigger) return;
    event.preventDefault();
    triggerAcknowledgmentsViewerOpen();
  });
  frameDoc.__ackBridgeAttached = true;
}

joyAudio.addEventListener('ended', function() {
  if (!shouldMusicBePlaying()) return;
  joyAudio.currentTime = 0;
  playMusicFromCurrentState();
});

function stopAcknowledgmentsAutoplay() {
  if (acknowledgmentsViewerState.timerId) {
    clearTimeout(acknowledgmentsViewerState.timerId);
    acknowledgmentsViewerState.timerId = null;
  }
}

function parseAcknowledgmentsLinesFromText(text) {
  if (typeof text !== 'string') return [];
  return filterAcknowledgmentsLines(text.split(/\r?\n/));
}

function filterAcknowledgmentsLines(sourceLines) {
  if (!Array.isArray(sourceLines)) return [];
  var lines = [];
  for (var i = 0; i < sourceLines.length; i++) {
    var cleaned = String(sourceLines[i] || '').trim();
    if (cleaned.indexOf('//') === 0) continue;
    if (cleaned) {
      lines.push(cleaned);
    }
  }
  return lines;
}

function loadAcknowledgmentsLines() {
  if (acknowledgmentsLinesCache && acknowledgmentsLinesCache.length) {
    return Promise.resolve(acknowledgmentsLinesCache.slice());
  }

  var isFileProtocol = !!(window && window.location && window.location.protocol === 'file:');
  if (isFileProtocol) {
    acknowledgmentsLinesCache = filterAcknowledgmentsLines(
      ACKNOWLEDGMENTS_INLINE_LINES.length
        ? ACKNOWLEDGMENTS_INLINE_LINES
        : ACKNOWLEDGMENTS_FALLBACK_LINES
    );
    if (!acknowledgmentsLinesCache.length) {
      acknowledgmentsLinesCache = filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
    }
    return Promise.resolve(acknowledgmentsLinesCache.slice());
  }

  return fetch(ACKNOWLEDGMENTS_SOURCE_PATH, { cache: 'no-store' })
    .then(function(response) {
      if (!response || !response.ok) {
        throw new Error('Acknowledgments file not available');
      }
      return response.text();
    })
    .then(function(text) {
      var parsed = parseAcknowledgmentsLinesFromText(text);
      acknowledgmentsLinesCache = parsed.length ? parsed : filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
      return acknowledgmentsLinesCache.slice();
    })
    .catch(function() {
      acknowledgmentsLinesCache = filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
      return acknowledgmentsLinesCache.slice();
    });
}

function getAcknowledgmentsStyleForIndex(index) {
  if (!ACKNOWLEDGMENTS_STYLE_SEQUENCE.length) return 'stitching';
  var normalized = Math.max(0, parseBoundedInt(index, 0, 100000, 0));
  return ACKNOWLEDGMENTS_STYLE_SEQUENCE[normalized % ACKNOWLEDGMENTS_STYLE_SEQUENCE.length] || 'stitching';
}

function getAcknowledgmentsStyleLabel(styleId) {
  if (styleId === 'triangula') return 'Triangula';
  if (styleId === 'squarus') return 'Squarus';
  return 'Stitching';
}

function createSvgNode(name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createAcknowledgmentsSeededRng(seed) {
  var state = ((seed >>> 0) || 1) >>> 0;
  return function() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createAcknowledgmentsVisual(styleId, index) {
  var rng = createAcknowledgmentsSeededRng(((index + 1) * 2654435761) ^ (styleId === 'triangula' ? 73 : (styleId === 'squarus' ? 137 : 211)));
  if (styleId === 'triangula') {
    return {
      depth: 3 + Math.floor(rng() * 2),
      mode: rng() > 0.5 ? 'shrink' : 'cut',
      fractalMode: rng() > 0.5 ? 'parallel' : 'series'
    };
  }
  if (styleId === 'squarus') {
    return {
      order: 4 + Math.floor(rng() * 2),
      pieceCount: 8 + Math.floor(rng() * 8),
      sequenceSeed: 1 + Math.floor(rng() * 32),
      layout: rng() > 0.5 ? 'force-directed' : 'grid-packing'
    };
  }
  return {
    holes: 36 + Math.floor(rng() * 24),
    jump: 3 + Math.floor(rng() * 9),
    width: 1 + Math.floor(rng() * 2)
  };
}

function getAcknowledgmentsVisualForIndex(index, styleId) {
  var cacheKey = String(index);
  var cached = acknowledgmentsViewerState.visualByIndex[cacheKey];
  if (cached && cached.styleId === styleId && cached.visual) {
    return cached.visual;
  }
  var visual = createAcknowledgmentsVisual(styleId, index);
  acknowledgmentsViewerState.visualByIndex[cacheKey] = {
    styleId: styleId,
    visual: visual
  };
  return visual;
}

function clearAcknowledgmentsPattern() {
  if (!acknowledgmentsPattern) return;
  while (acknowledgmentsPattern.firstChild) {
    acknowledgmentsPattern.removeChild(acknowledgmentsPattern.firstChild);
  }
  acknowledgmentsViewerState.svgTextGroup = null;
  acknowledgmentsViewerState.svgTextNode = null;
  acknowledgmentsViewerState.svgTextSpec = null;
  acknowledgmentsViewerState.lastRevealText = '';
}

function stopAcknowledgmentsStageAnimation() {
  if (acknowledgmentsViewerState.rafId) {
    cancelAnimationFrame(acknowledgmentsViewerState.rafId);
    acknowledgmentsViewerState.rafId = null;
  }
}

function getAcknowledgmentsStageLogicalSize() {
  var canvasSize = null;
  if (view && view.viewSize && isFinite(view.viewSize.width) && isFinite(view.viewSize.height)) {
    canvasSize = Math.floor(Math.min(view.viewSize.width, view.viewSize.height));
  }
  if (!isFinite(canvasSize) || canvasSize <= 0) {
    canvasSize = ACKNOWLEDGMENTS_STAGE_SIZE;
  }
  return Math.max(240, canvasSize);
}

function configureAcknowledgmentsPatternViewport() {
  var stageSize = getAcknowledgmentsStageLogicalSize();
  if (acknowledgmentsPattern) {
    acknowledgmentsPattern.setAttribute('viewBox', '0 0 ' + stageSize + ' ' + stageSize);
    acknowledgmentsPattern.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  if (acknowledgmentsStage) {
    var canvasSizePx = null;
    var canvasEl = document.getElementById('myCanvas');
    if (canvasEl && isFinite(canvasEl.clientWidth) && canvasEl.clientWidth > 0) {
      canvasSizePx = Math.round(canvasEl.clientWidth);
    }
    if ((!isFinite(canvasSizePx) || canvasSizePx <= 0) && isFinite(stageSize)) {
      canvasSizePx = Math.round(stageSize);
    }
    if (isFinite(canvasSizePx) && canvasSizePx > 0) {
      canvasSizePx = Math.max(520, canvasSizePx);
      acknowledgmentsStage.style.setProperty('--ack-stage-target-size', String(canvasSizePx) + 'px');
    }
  }

  return stageSize;
}

function ensureAcknowledgmentsTextLayerInFront() {
  if (!acknowledgmentsPattern || !acknowledgmentsViewerState.svgTextGroup) return;
  if (acknowledgmentsViewerState.svgTextGroup.parentNode === acknowledgmentsPattern) {
    acknowledgmentsPattern.appendChild(acknowledgmentsViewerState.svgTextGroup);
  }
}

function buildAcknowledgmentsEquilateralTriangle(size, sideScale, baseYRatio) {
  var side = size * sideScale;
  var half = side * 0.5;
  var centerX = size * 0.5;
  var baseY = size * baseYRatio;
  var triHeight = side * (Math.sqrt(3) * 0.5);
  var apexY = baseY - triHeight;
  return {
    apex: { x: centerX, y: apexY },
    left: { x: centerX - half, y: baseY },
    right: { x: centerX + half, y: baseY },
    side: side,
    height: triHeight
  };
}

function getAcknowledgmentsTriangulaSideScale(size) {
  var safeSize = Math.max(220, Number(size) || ACKNOWLEDGMENTS_STAGE_SIZE);
  // Keep a fixed-like footprint (closer to Triangula's base frame) while preserving edge margins.
  var side = Math.max(safeSize * 0.78, safeSize - 64);
  side = Math.min(side, safeSize - 34);
  return Math.max(0.68, Math.min(0.94, side / safeSize));
}

function getAcknowledgmentsPaletteColors() {
  var palette = [];
  function pushColor(value, fallback) {
    var normalized = sanitizeHexColor(value, fallback || '#1982c4');
    var key = String(normalized || '').toLowerCase();
    if (!key || palette.indexOf(normalized) >= 0) return;
    palette.push(normalized);
  }

  if (Array.isArray(threads) && threads.length) {
    for (var i = 0; i < threads.length; i++) {
      pushColor(threads[i] && threads[i].color, '#1982c4');
    }
  }

  pushColor(triangulaBandColors && triangulaBandColors.band1, '#8ac926');
  pushColor(triangulaBandColors && triangulaBandColors.band2, '#6a4c93');
  pushColor(triangulaBandColors && triangulaBandColors.band4, '#1982c4');

  var source = normalizeTriangulaFillColor(triangulaSourceColor, '#8ac926');
  if (source !== 'rainbow') {
    pushColor(source, '#8ac926');
  }

  if (!palette.length) {
    for (var m = 0; m < magicThreadColors.length; m++) {
      pushColor(magicThreadColors[m], '#1982c4');
    }
  }

  return palette.length ? palette : ['#1982c4', '#8ac926', '#6a4c93'];
}

function getAcknowledgmentsSoftenedColor(color, amount) {
  var base = sanitizeHexColor(color, '#6f7f95');
  return squarusApplyShade(base, Math.max(0, Math.min(1, Number(amount) || 0.55)));
}

function getAcknowledgmentsTextFrameSpec(styleId) {
  var size = getAcknowledgmentsStageLogicalSize();
  if (styleId === 'triangula') {
    var triScale = getAcknowledgmentsTriangulaSideScale(size);
    var tri = buildAcknowledgmentsEquilateralTriangle(size, triScale, 0.86);
    var triTopPad = size * 0.136;
    var triBottomPad = size * 0.03;
    return {
      shapeType: 'path',
      shapePath: 'M ' + tri.apex.x + ' ' + tri.apex.y + ' L ' + tri.left.x + ' ' + tri.left.y + ' L ' + tri.right.x + ' ' + tri.right.y + ' Z',
      textX: size * 0.5,
      textY: tri.apex.y + (tri.height * 0.84),
      maxChars: 18,
      maxCharsMax: 26,
      minFontSize: 20,
      maxFontSize: 24,
      textAreaHeight: tri.height * 0.48,
      triangleApexY: tri.apex.y,
      triangleHeight: tri.height,
      triangleSide: tri.side,
      textPadding: size * 0.045,
      textTop: tri.apex.y + triTopPad,
      textBottom: tri.left.y - triBottomPad
    };
  }
  if (styleId === 'squarus') {
    var rectPad = size * 0.055;
    return {
      shapeType: 'rect',
      shapeRect: {
        x: size * 0.14,
        y: size * 0.14,
        width: size * 0.72,
        height: size * 0.72,
        rx: 18
      },
      textX: size * 0.5,
      textY: size * 0.56,
      maxChars: 34,
      maxCharsMax: 44,
      minFontSize: 20,
      maxFontSize: 28,
      textAreaHeight: size * 0.56,
      textPadding: size * 0.05,
      textTop: size * 0.14 + rectPad,
      textBottom: size * 0.86 - rectPad
    };
  }

  var circlePad = size * 0.055;
  return {
    shapeType: 'circle',
    shapeCircle: {
      cx: size * 0.5,
      cy: size * 0.5,
      r: size * 0.35
    },
    textX: size * 0.5,
    textY: size * 0.58,
    maxChars: 30,
    maxCharsMax: 40,
    minFontSize: 20,
    maxFontSize: 27,
    textAreaHeight: size * 0.55,
    textPadding: size * 0.05,
    textTop: (size * 0.5 - size * 0.35) + circlePad,
    textBottom: (size * 0.5 + size * 0.35) - circlePad
  };
}

var acknowledgmentsTextMeasureCanvas = null;

function getAcknowledgmentsTextMeasureContext() {
  if (!acknowledgmentsTextMeasureCanvas) {
    acknowledgmentsTextMeasureCanvas = document.createElement('canvas');
  }
  return acknowledgmentsTextMeasureCanvas.getContext('2d');
}

function measureAcknowledgmentsTextWidth(text, fontSize, fontFamily, fontWeight) {
  var ctx = getAcknowledgmentsTextMeasureContext();
  if (!ctx) return (String(text || '').length * fontSize * 0.62);
  ctx.font = String(fontWeight || 700) + ' ' + String(Math.max(8, fontSize || 12)) + 'px ' + String(fontFamily || 'sans-serif');
  return ctx.measureText(String(text || '')).width;
}

function getAcknowledgmentsLineMaxWidthForY(spec, lineY, stageSize) {
  var safePad = Math.max(6, Number(spec && spec.textPadding) || (stageSize * 0.03));
  var sideGuard = Math.max(8, safePad * 0.5);
  if (!spec) return stageSize - (safePad * 2);

  if (spec.shapeType === 'rect' && spec.shapeRect) {
    return Math.max(20, spec.shapeRect.width - (safePad * 2) - sideGuard);
  }

  if (spec.shapeType === 'circle' && spec.shapeCircle) {
    var dy = lineY - spec.shapeCircle.cy;
    var r = Math.max(1, spec.shapeCircle.r - safePad);
    var inside = (r * r) - (dy * dy);
    if (inside <= 0) return 20;
    return Math.max(20, Math.sqrt(inside) * 2 - sideGuard);
  }

  if (spec.shapeType === 'path' && isFinite(spec.triangleApexY) && isFinite(spec.triangleHeight) && isFinite(spec.triangleSide)) {
    var t = (lineY - spec.triangleApexY) / Math.max(1e-6, spec.triangleHeight);
    t = clamp01(t);
    return Math.max(20, (spec.triangleSide * t) - (safePad * 2) - sideGuard);
  }

  return Math.max(20, stageSize - (safePad * 2) - sideGuard);
}

function buildAcknowledgmentsWrappedLines(text, maxChars, maxLines) {
  var safeText = String(text || '').replace(/\s+/g, ' ').trim();
  if (!safeText) return [];

  var words = safeText.split(' ');
  var lines = [];
  var current = '';
  for (var i = 0; i < words.length; i++) {
    var probe = current ? (current + ' ' + words[i]) : words[i];
    if (probe.length <= maxChars || !current) {
      current = probe;
      continue;
    }
    lines.push(current);
    current = words[i];
    if (maxLines > 0 && lines.length >= maxLines) break;
  }
  if ((maxLines <= 0 || lines.length < maxLines) && current) {
    lines.push(current);
  }
  if (maxLines > 0 && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
  }
  return lines;
}

function createAcknowledgmentsTextLayer(styleId) {
  if (!acknowledgmentsPattern) return;

  configureAcknowledgmentsPatternViewport();

  var spec = getAcknowledgmentsTextFrameSpec(styleId);
  var defs = createSvgNode('defs');
  var clipPath = createSvgNode('clipPath');
  var clipId = 'acknowledgments-text-clip-' + styleId;
  var textFilterId = 'acknowledgments-text-edge-' + styleId;
  clipPath.setAttribute('id', clipId);

  var textFilter = createSvgNode('filter');
  textFilter.setAttribute('id', textFilterId);
  textFilter.setAttribute('x', '-12%');
  textFilter.setAttribute('y', '-12%');
  textFilter.setAttribute('width', '124%');
  textFilter.setAttribute('height', '124%');
  textFilter.setAttribute('color-interpolation-filters', 'sRGB');

  var edgeDilate = createSvgNode('feMorphology');
  edgeDilate.setAttribute('in', 'SourceAlpha');
  edgeDilate.setAttribute('operator', 'dilate');
  edgeDilate.setAttribute('radius', '0.85');
  edgeDilate.setAttribute('result', 'edgeBase');
  textFilter.appendChild(edgeDilate);

  var edgeBlur = createSvgNode('feGaussianBlur');
  edgeBlur.setAttribute('in', 'edgeBase');
  edgeBlur.setAttribute('stdDeviation', '1.15');
  edgeBlur.setAttribute('result', 'edgeBlur');
  textFilter.appendChild(edgeBlur);

  var edgeFlood = createSvgNode('feFlood');
  edgeFlood.setAttribute('flood-color', '#f8fbff');
  edgeFlood.setAttribute('flood-opacity', '0.95');
  edgeFlood.setAttribute('result', 'edgeColor');
  textFilter.appendChild(edgeFlood);

  var edgeComposite = createSvgNode('feComposite');
  edgeComposite.setAttribute('in', 'edgeColor');
  edgeComposite.setAttribute('in2', 'edgeBlur');
  edgeComposite.setAttribute('operator', 'in');
  edgeComposite.setAttribute('result', 'edgeGlow');
  textFilter.appendChild(edgeComposite);

  var textMerge = createSvgNode('feMerge');
  var textMergeEdge = createSvgNode('feMergeNode');
  textMergeEdge.setAttribute('in', 'edgeGlow');
  var textMergeSource = createSvgNode('feMergeNode');
  textMergeSource.setAttribute('in', 'SourceGraphic');
  textMerge.appendChild(textMergeEdge);
  textMerge.appendChild(textMergeSource);
  textFilter.appendChild(textMerge);

  var clipShape = null;
  var frameOutline = null;
  if (spec.shapeType === 'rect') {
    clipShape = createSvgNode('rect');
    clipShape.setAttribute('x', String(spec.shapeRect.x));
    clipShape.setAttribute('y', String(spec.shapeRect.y));
    clipShape.setAttribute('width', String(spec.shapeRect.width));
    clipShape.setAttribute('height', String(spec.shapeRect.height));
    clipShape.setAttribute('rx', String(spec.shapeRect.rx));

    frameOutline = createSvgNode('rect');
    frameOutline.setAttribute('x', String(spec.shapeRect.x));
    frameOutline.setAttribute('y', String(spec.shapeRect.y));
    frameOutline.setAttribute('width', String(spec.shapeRect.width));
    frameOutline.setAttribute('height', String(spec.shapeRect.height));
    frameOutline.setAttribute('rx', String(spec.shapeRect.rx));
  } else if (spec.shapeType === 'circle') {
    clipShape = createSvgNode('circle');
    clipShape.setAttribute('cx', String(spec.shapeCircle.cx));
    clipShape.setAttribute('cy', String(spec.shapeCircle.cy));
    clipShape.setAttribute('r', String(spec.shapeCircle.r));

    frameOutline = createSvgNode('circle');
    frameOutline.setAttribute('cx', String(spec.shapeCircle.cx));
    frameOutline.setAttribute('cy', String(spec.shapeCircle.cy));
    frameOutline.setAttribute('r', String(spec.shapeCircle.r));
  } else {
    clipShape = createSvgNode('path');
    clipShape.setAttribute('d', spec.shapePath);

    frameOutline = createSvgNode('path');
    frameOutline.setAttribute('d', spec.shapePath);
  }

  clipPath.appendChild(clipShape);
  defs.appendChild(clipPath);
  defs.appendChild(textFilter);
  acknowledgmentsPattern.appendChild(defs);

  frameOutline.setAttribute('fill', 'none');
  if (spec.shapeType === 'rect') {
    // Squarus uses an internal square clip frame; keep it invisible.
    frameOutline.setAttribute('stroke', 'none');
    frameOutline.setAttribute('opacity', '0');
  } else {
    frameOutline.setAttribute('stroke', '#748292');
    frameOutline.setAttribute('stroke-width', '2');
    frameOutline.setAttribute('opacity', '0.32');
  }
  acknowledgmentsPattern.appendChild(frameOutline);

  var textGroup = createSvgNode('g');
  textGroup.setAttribute('clip-path', 'url(#' + clipId + ')');
  textGroup.setAttribute('filter', 'url(#' + textFilterId + ')');
  textGroup.setAttribute('opacity', '0');

  var textNode = createSvgNode('text');
  textNode.setAttribute('x', String(spec.textX));
  textNode.setAttribute('y', String(spec.textY));
  textNode.setAttribute('fill', 'rgba(16, 23, 35, 0.9)');
  textNode.setAttribute('text-anchor', 'middle');
  textNode.setAttribute('font-size', '29');
  textNode.setAttribute('font-family', '"Clacon2", "Nunito", sans-serif');
  textNode.setAttribute('font-weight', '700');
  textNode.setAttribute('paint-order', 'stroke');
  textNode.setAttribute('stroke', 'rgba(248, 252, 255, 0.88)');
  textNode.setAttribute('stroke-width', '1.18');
  textNode.setAttribute('stroke-linejoin', 'round');

  textGroup.appendChild(textNode);
  acknowledgmentsPattern.appendChild(textGroup);

  acknowledgmentsViewerState.svgTextGroup = textGroup;
  acknowledgmentsViewerState.svgTextNode = textNode;
  acknowledgmentsViewerState.svgTextSpec = spec;
  acknowledgmentsViewerState.svgTextMaxChars = spec.maxChars;
  acknowledgmentsViewerState.svgTextMaxLines = spec.maxLines || 0;
  acknowledgmentsViewerState.svgTextLineHeight = spec.lineHeight || 32;
  acknowledgmentsViewerState.svgTextAnchorY = spec.textY;
}

function updateAcknowledgmentsSvgText(text) {
  var svgTextNode = acknowledgmentsViewerState.svgTextNode;
  if (!svgTextNode) return;
  var stageSize = getAcknowledgmentsStageLogicalSize();

  var safeText = String(text || '');
  if (acknowledgmentsViewerState.lastRevealText === safeText) return;
  acknowledgmentsViewerState.lastRevealText = safeText;

  while (svgTextNode.firstChild) {
    svgTextNode.removeChild(svgTextNode.firstChild);
  }

  if (!safeText) return;
  var spec = acknowledgmentsViewerState.svgTextSpec || {};
  var maxChars = Math.max(14, parseBoundedInt(acknowledgmentsViewerState.svgTextMaxChars, 14, 64, 32));
  var maxCharsCap = Math.max(maxChars, parseBoundedInt(spec.maxCharsMax, maxChars, 72, maxChars + 10));
  var maxLines = Math.max(0, parseBoundedInt(acknowledgmentsViewerState.svgTextMaxLines, 0, 24, 0));
  var textAreaHeight = Math.max(140, parseBoundedInt(spec.textAreaHeight, 140, stageSize - 40, Math.floor(stageSize * 0.56)));
  var minFontSize = Math.max(12, parseBoundedInt(spec.minFontSize, 12, 26, 15));
  var maxFontSize = Math.max(minFontSize, parseBoundedInt(spec.maxFontSize, minFontSize, 38, 27));
  var lines = [];
  var fontSize = minFontSize;
  var charLimit = maxChars;
  var fontFamily = svgTextNode.getAttribute('font-family') || 'sans-serif';
  var fontWeight = svgTextNode.getAttribute('font-weight') || '400';

  while (true) {
    lines = buildAcknowledgmentsWrappedLines(safeText, charLimit, maxLines);
    if (!lines.length) break;
    var candidate = Math.floor(textAreaHeight / Math.max(1, lines.length * 1.24));
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, candidate));
    if (fontSize > minFontSize || charLimit >= maxCharsCap) break;
    charLimit = Math.min(maxCharsCap, charLimit + 2);
  }
  if (!lines.length) return;

  var lineHeight = Math.max(18, Math.round(fontSize * 1.22));
  var textTop = isFinite(spec.textTop) ? spec.textTop : 80;
  var textBottom = isFinite(spec.textBottom) ? spec.textBottom : (stageSize - 80);
  var availableHeight = Math.max(40, textBottom - textTop);
  var ascentRatio = 0.78;
  var descentRatio = 0.22;
  var topPad = Math.max(2, fontSize * 0.08);
  var bottomPad = Math.max(2, fontSize * 0.06);
  var ascent = fontSize * ascentRatio;
  var descent = fontSize * descentRatio;
  var totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
  while (totalHeight > availableHeight && fontSize > minFontSize) {
    fontSize -= 1;
    lineHeight = Math.max(16, Math.round(fontSize * 1.2));
    topPad = Math.max(2, fontSize * 0.08);
    bottomPad = Math.max(2, fontSize * 0.06);
    ascent = fontSize * ascentRatio;
    descent = fontSize * descentRatio;
    totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
  }

  function fitsAllLineWidths() {
    var baselineStartProbe = textTop + ((availableHeight - totalHeight) * 0.5) + topPad + ascent;
    for (var li = 0; li < lines.length; li++) {
      var ly = baselineStartProbe + li * lineHeight;
      var allowed = getAcknowledgmentsLineMaxWidthForY(spec, ly, stageSize);
      var measured = measureAcknowledgmentsTextWidth(lines[li], fontSize, fontFamily, fontWeight);
      if (measured > allowed) return false;
    }
    return true;
  }

  while (!fitsAllLineWidths() && fontSize > minFontSize) {
    fontSize -= 1;
    lineHeight = Math.max(16, Math.round(fontSize * 1.2));
    topPad = Math.max(2, fontSize * 0.08);
    bottomPad = Math.max(2, fontSize * 0.06);
    ascent = fontSize * ascentRatio;
    descent = fontSize * descentRatio;
    totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
    if (totalHeight > availableHeight) {
      continue;
    }
  }

  svgTextNode.setAttribute('font-size', String(fontSize));
  svgTextNode.setAttribute('stroke-width', String(Math.max(0.45, fontSize * 0.03)));

  var baselineStart = textTop + ((availableHeight - totalHeight) * 0.5) + topPad + ascent;
  if (!isFinite(baselineStart)) baselineStart = textTop + topPad + ascent;
  for (var i = 0; i < lines.length; i++) {
    var lineY = baselineStart + i * lineHeight;
    var maxWidth = getAcknowledgmentsLineMaxWidthForY(spec, lineY, stageSize);
    var measuredWidth = measureAcknowledgmentsTextWidth(lines[i], fontSize, fontFamily, fontWeight);
    var tspan = createSvgNode('tspan');
    tspan.setAttribute('x', svgTextNode.getAttribute('x') || String(stageSize * 0.5));
    tspan.setAttribute('y', String(lineY));
    if (measuredWidth > maxWidth) {
      // Last-resort clamp for edge cases (e.g., very long single tokens).
      tspan.setAttribute('textLength', String(Math.max(18, maxWidth - 2)));
      tspan.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
    tspan.textContent = lines[i];
    svgTextNode.appendChild(tspan);
  }

  ensureAcknowledgmentsTextLayerInFront();
}

function setAcknowledgmentsLineReveal(text, progress) {
  var safeText = String(text || '');
  var p = clamp01(progress);
  var revealText = safeText;
  if (acknowledgmentsLineText) {
    acknowledgmentsLineText.textContent = revealText;
  }
  updateAcknowledgmentsSvgText(revealText);

  if (acknowledgmentsViewerState.svgTextGroup) {
    var fadeStart = ACKNOWLEDGMENTS_TEXT_FADE_START;
    var fadeEnd = Math.max(fadeStart + 0.04, ACKNOWLEDGMENTS_TEXT_FADE_END);
    var alpha = 0;
    if (p >= fadeEnd) {
      alpha = 0.95;
    } else if (p > fadeStart) {
      var local = (p - fadeStart) / (fadeEnd - fadeStart);
      alpha = 0.95 * easeInOutCubic(clamp01(local));
    }
    acknowledgmentsViewerState.svgTextGroup.setAttribute('opacity', String(alpha));
  }
}

function getAcknowledgmentsSecondsPerBeat() {
  return 60 / ACKNOWLEDGMENTS_BPM;
}

function getAcknowledgmentsBaseLineDurationMs() {
  var spb = getAcknowledgmentsSecondsPerBeat();
  return Math.round(ACKNOWLEDGMENTS_LINE_BEATS * spb * 1000);
}

function countAcknowledgmentsWords(text) {
  var safeText = String(text || '').trim();
  if (!safeText) return 0;
  var matches = safeText.match(/\S+/g);
  return matches ? matches.length : 0;
}

function buildAcknowledgmentsLineDurations(lines) {
  var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES;
  var raw = [];
  var totalRaw = 0;
  for (var i = 0; i < safeLines.length; i++) {
    var words = countAcknowledgmentsWords(safeLines[i]);
    var ms = ACKNOWLEDGMENTS_LINE_BASE_MS + (words * ACKNOWLEDGMENTS_MS_PER_WORD);
    ms = Math.max(ACKNOWLEDGMENTS_LINE_MIN_MS, Math.min(ACKNOWLEDGMENTS_LINE_MAX_MS, Math.round(ms)));
    raw.push(ms);
    totalRaw += ms;
  }

  if (!raw.length) return [getAcknowledgmentsBaseLineDurationMs()];

  var trackDurationSec = (acknowledgmentsAudio && isFinite(acknowledgmentsAudio.duration))
    ? acknowledgmentsAudio.duration
    : 0;
  if (!(trackDurationSec > 0) || !(totalRaw > 0)) {
    return raw;
  }

  var trackMs = Math.round(trackDurationSec * 1000);
  var scale = trackMs / totalRaw;
  scale = Math.max(0.72, Math.min(1.4, scale));

  var scaled = [];
  for (var s = 0; s < raw.length; s++) {
    var scaledMs = Math.round(raw[s] * scale);
    scaled.push(Math.max(ACKNOWLEDGMENTS_LINE_MIN_MS, Math.min(ACKNOWLEDGMENTS_LINE_MAX_MS, scaledMs)));
  }
  return scaled;
}

function getAcknowledgmentsSeriesLineDurationMs(lineCount) {
  var count = Math.max(1, parseBoundedInt(lineCount, 1, 9999, 1));
  var trackDurationSec = (acknowledgmentsAudio && isFinite(acknowledgmentsAudio.duration))
    ? acknowledgmentsAudio.duration
    : 0;
  if (trackDurationSec > 0) {
    var perLineMs = Math.round((trackDurationSec * 1000) / count);
    return Math.max(2500, Math.min(14000, perLineMs));
  }
  return getAcknowledgmentsBaseLineDurationMs();
}

function getAcknowledgmentsLineDurationMs(styleId, visual, animatorData) {
  if (Array.isArray(acknowledgmentsViewerState.lineDurationsMsByIndex) && acknowledgmentsViewerState.lineDurationsMsByIndex.length) {
    var index = parseBoundedInt(acknowledgmentsViewerState.lineIndex, 0, acknowledgmentsViewerState.lineDurationsMsByIndex.length - 1, 0);
    var perLine = acknowledgmentsViewerState.lineDurationsMsByIndex[index];
    if (isFinite(perLine) && perLine > 0) {
      return perLine;
    }
  }
  if (isFinite(acknowledgmentsViewerState.seriesLineDurationMs) && acknowledgmentsViewerState.seriesLineDurationMs > 0) {
    return acknowledgmentsViewerState.seriesLineDurationMs;
  }
  return getAcknowledgmentsBaseLineDurationMs();
}

function buildAcknowledgmentsStitchingAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('stitching');
  var width = configureAcknowledgmentsPatternViewport();
  var height = width;
  var centerX = width * 0.5;
  var centerY = height * 0.5;
  var radius = Math.min(width, height) * 0.35;
  var holeCount = Math.max(16, parseBoundedInt(visual && visual.holes, 16, 120, 42));
  var jump = Math.max(2, parseBoundedInt(visual && visual.jump, 2, holeCount - 1, 5));
  var lineWidth = Math.max(1, parseBoundedInt(visual && visual.width, 1, 3, 2));
  var palette = getAcknowledgmentsPaletteColors();

  var pointsList = [];
  for (var i = 0; i < holeCount; i++) {
    var theta = -Math.PI / 2 + (Math.PI * 2 * i / holeCount);
    pointsList.push({
      x: centerX + Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius
    });
  }

  var circle = createSvgNode('circle');
  circle.setAttribute('cx', String(centerX));
  circle.setAttribute('cy', String(centerY));
  circle.setAttribute('r', String(radius));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[0] || '#b5bdc8', 0.5));
  circle.setAttribute('stroke-width', '1');
  circle.setAttribute('stroke-opacity', '0.28');
  acknowledgmentsPattern.appendChild(circle);

  for (var h = 0; h < holeCount; h++) {
    var hole = createSvgNode('circle');
    hole.setAttribute('cx', String(pointsList[h].x));
    hole.setAttribute('cy', String(pointsList[h].y));
    hole.setAttribute('r', '1.8');
    hole.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[h % palette.length] || '#8e98a8', 0.56));
    hole.setAttribute('opacity', '0.44');
    acknowledgmentsPattern.appendChild(hole);
  }

  var sequence = [];
  var visited = new Array(holeCount).fill(false);
  var current = 0;
  for (var s = 0; s < holeCount; s++) {
    if (visited[current]) break;
    visited[current] = true;
    sequence.push(current);
    current = (current + jump) % holeCount;
  }

  var segments = [];
  for (var si = 0; si < sequence.length; si++) {
    var from = pointsList[sequence[si]];
    var to = pointsList[sequence[(si + 1) % sequence.length]];
    var line = createSvgNode('line');
    line.setAttribute('x1', String(from.x));
    line.setAttribute('y1', String(from.y));
    line.setAttribute('x2', String(from.x));
    line.setAttribute('y2', String(from.y));
    line.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[si % palette.length] || '#2c323a', 0.4));
    line.setAttribute('stroke-width', String(lineWidth));
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.6');
    acknowledgmentsPattern.appendChild(line);
    segments.push({ line: line, from: from, to: to });
  }

  return {
    segmentCount: segments.length,
    render: function(progress) {
    var p = clamp01(progress);
    var scaled = p * segments.length;
    var fullCount = Math.floor(scaled);
    var partial = scaled - fullCount;

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (i < fullCount) {
        seg.line.setAttribute('x2', String(seg.to.x));
        seg.line.setAttribute('y2', String(seg.to.y));
      } else if (i === fullCount) {
        var px = seg.from.x + (seg.to.x - seg.from.x) * partial;
        var py = seg.from.y + (seg.to.y - seg.from.y) * partial;
        seg.line.setAttribute('x2', String(px));
        seg.line.setAttribute('y2', String(py));
      } else {
        seg.line.setAttribute('x2', String(seg.from.x));
        seg.line.setAttribute('y2', String(seg.from.y));
      }
    }
    }
  };
}

function splitAcknowledgmentsTriangle(vertices) {
  var m01 = { x: (vertices[0].x + vertices[1].x) / 2, y: (vertices[0].y + vertices[1].y) / 2 };
  var m12 = { x: (vertices[1].x + vertices[2].x) / 2, y: (vertices[1].y + vertices[2].y) / 2 };
  var m20 = { x: (vertices[2].x + vertices[0].x) / 2, y: (vertices[2].y + vertices[0].y) / 2 };
  return {
    central: [m01, m12, m20],
    children: [
      { vertices: [vertices[0], m01, m20], slot: 1 },
      { vertices: [m01, vertices[1], m12], slot: 2 },
      { vertices: [m20, m12, vertices[2]], slot: 4 }
    ]
  };
}

function collectAcknowledgmentsTriangles(vertices, depth, slot, collector) {
  if (depth <= 0) {
    collector.push({ vertices: vertices, slot: slot || 1 });
    return;
  }
  var split = splitAcknowledgmentsTriangle(vertices);
  for (var i = 0; i < split.children.length; i++) {
    collectAcknowledgmentsTriangles(split.children[i].vertices, depth - 1, split.children[i].slot, collector);
  }
}

function collectAcknowledgmentsCutCenters(vertices, depth, collector) {
  if (depth <= 0) return;
  var split = splitAcknowledgmentsTriangle(vertices);
  if (depth === 1) {
    collector.push(split.central);
    return;
  }
  for (var i = 0; i < split.children.length; i++) {
    collectAcknowledgmentsCutCenters(split.children[i].vertices, depth - 1, collector);
  }
}

function toAcknowledgmentsPath(vertices) {
  return 'M ' + vertices[0].x + ' ' + vertices[0].y + ' L ' + vertices[1].x + ' ' + vertices[1].y + ' L ' + vertices[2].x + ' ' + vertices[2].y + ' Z';
}

function buildAcknowledgmentsTriangulaAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('triangula');
  var width = configureAcknowledgmentsPatternViewport();
  var height = width;
  var depth = Math.max(2, parseBoundedInt(visual && visual.depth, 2, 5, 3));
  var mode = visual && visual.mode === 'cut' ? 'cut' : 'shrink';
  var palette = getAcknowledgmentsPaletteColors();
  var triScale = getAcknowledgmentsTriangulaSideScale(width);
  var tri = buildAcknowledgmentsEquilateralTriangle(width, triScale, 0.86);
  var base = [tri.apex, tri.left, tri.right];

  var basePath = createSvgNode('path');
  basePath.setAttribute('d', toAcknowledgmentsPath(base));
  basePath.setAttribute('fill', 'none');
  basePath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[0] || '#3d4652', 0.48));
  basePath.setAttribute('stroke-width', '2');
  basePath.setAttribute('opacity', '0.54');
  acknowledgmentsPattern.appendChild(basePath);

  var elements = [];
  var timelineBeats = 0;
  var slotPalette = {
    1: getTriangulaFillColorForSlot(1, 0),
    2: getTriangulaFillColorForSlot(2, 1),
    4: getTriangulaFillColorForSlot(4, 2)
  };
  if (mode === 'cut') {
    for (var d = 1; d <= depth; d++) {
      var cuts = [];
      collectAcknowledgmentsCutCenters(base, d, cuts);
      timelineBeats += (visual && visual.fractalMode === 'parallel') ? 1.85 : (cuts.length * 0.95);
      for (var c = 0; c < cuts.length; c++) {
        var cutPath = createSvgNode('path');
        cutPath.setAttribute('d', toAcknowledgmentsPath(cuts[c]));
        cutPath.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[(c + d) % palette.length] || '#6f7b8a', 0.48));
        cutPath.setAttribute('fill-opacity', '0.46');
        cutPath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[(c + d + 1) % palette.length] || '#353f4b', 0.38));
        cutPath.setAttribute('stroke-opacity', '0.56');
        cutPath.setAttribute('stroke-width', '1.2');
        cutPath.setAttribute('opacity', '0');
        acknowledgmentsPattern.appendChild(cutPath);
        elements.push(cutPath);
      }
    }
  } else {
    for (var level = 1; level <= depth; level++) {
      var triangles = [];
      collectAcknowledgmentsTriangles(base, level, 1, triangles);
      timelineBeats += (visual && visual.fractalMode === 'parallel') ? 1.75 : (triangles.length * 0.92);
      for (var t = 0; t < triangles.length; t++) {
        var trianglePath = createSvgNode('path');
        trianglePath.setAttribute('d', toAcknowledgmentsPath(triangles[t].vertices));
        trianglePath.setAttribute('fill', getAcknowledgmentsSoftenedColor(slotPalette[triangles[t].slot] || palette[t % palette.length], 0.5));
        trianglePath.setAttribute('fill-opacity', '0.48');
        trianglePath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[(t + level) % palette.length] || '#2f3946', 0.4));
        trianglePath.setAttribute('stroke-opacity', '0.58');
        trianglePath.setAttribute('stroke-width', String(Math.max(0.6, 1.2 - level * 0.1)));
        trianglePath.setAttribute('opacity', '0');
        acknowledgmentsPattern.appendChild(trianglePath);
        elements.push(trianglePath);
      }
    }
  }

  return {
    timelineBeats: timelineBeats,
    render: function(progress) {
    var p = clamp01(progress);
    var scaled = p * elements.length;
    var fullCount = Math.floor(scaled);
    var partial = scaled - fullCount;
    for (var i = 0; i < elements.length; i++) {
      if (i < fullCount) {
        elements[i].setAttribute('opacity', mode === 'cut' ? '0.72' : '0.66');
      } else if (i === fullCount) {
        elements[i].setAttribute('opacity', String(mode === 'cut' ? (partial * 0.72) : (partial * 0.66)));
      } else {
        elements[i].setAttribute('opacity', '0');
      }
    }
    }
  };
}

function getAcknowledgmentsPieceWorldPoint(piece, target, cellX, cellY) {
  var cosR = Math.cos(target.rotation);
  var sinR = Math.sin(target.rotation);
  var localX = (cellX - piece.centroidX) * target.scale;
  var localY = (cellY - piece.centroidY) * target.scale;
  return {
    x: target.x + (localX * cosR - localY * sinR),
    y: target.y + (localX * sinR + localY * cosR)
  };
}

function buildAcknowledgmentsViewportMapper(points) {
  var width = getAcknowledgmentsStageLogicalSize();
  var height = width;
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  for (var i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxX = Math.max(maxX, points[i].x);
    maxY = Math.max(maxY, points[i].y);
  }
  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    minX = 0; minY = 0; maxX = 1; maxY = 1;
  }
  var pad = 16;
  var sx = (width - pad * 2) / Math.max(1e-3, maxX - minX);
  var sy = (height - pad * 2) / Math.max(1e-3, maxY - minY);
  var scale = Math.min(sx, sy);
  var offsetX = pad + (width - pad * 2 - ((maxX - minX) * scale)) * 0.5;
  var offsetY = pad + (height - pad * 2 - ((maxY - minY) * scale)) * 0.5;
  return function(point) {
    return {
      x: offsetX + (point.x - minX) * scale,
      y: offsetY + (point.y - minY) * scale,
      scale: scale
    };
  };
}

function buildAcknowledgmentsSquarusAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('squarus');
  var stageSize = configureAcknowledgmentsPatternViewport();
  var previousOrder = squarusOrder;
  var previousLayout = squarusLayout;
  var previousPieceCount = squarusPieceCount;
  var previousSequenceSeed = squarusSequenceSeed;
  var previousContactMode = squarusContactMode;
  var previousAnimationMode = squarusAnimationMode;

  var order = Math.max(2, parseBoundedInt(visual && visual.order, 2, 6, 4));
  var requestedLayout = (visual && visual.layout) ? String(visual.layout) : 'force-directed';
  var sequenceSeed = Math.max(1, parseBoundedInt(visual && visual.sequenceSeed, 1, 999, 7));

  squarusOrder = order;
  squarusLayout = requestedLayout;
  squarusContactMode = 'formula-only';
  squarusAnimationMode = 'sequential';
  squarusSequenceSeed = sequenceSeed;

  var orderedPieces = getSquarusSequencedPieces(squarusOrder, squarusSequenceSeed);
  var pieceCount = Math.max(1, Math.min(orderedPieces.length, parseBoundedInt(visual && visual.pieceCount, 1, orderedPieces.length || 1, 10)));
  squarusPieceCount = pieceCount;
  var pieces = orderedPieces.slice(0, pieceCount);
  var targets = buildSquarusTargets(pieces, squarusLayout).slice(0, pieceCount);

  squarusOrder = previousOrder;
  squarusLayout = previousLayout;
  squarusPieceCount = previousPieceCount;
  squarusSequenceSeed = previousSequenceSeed;
  squarusContactMode = previousContactMode;
  squarusAnimationMode = previousAnimationMode;

  var allPoints = [];
  for (var i = 0; i < pieceCount; i++) {
    var target = targets[i];
    var piece = pieces[i];
    allPoints.push({ x: target.x, y: target.y });
    for (var c = 0; c < piece.cells.length; c++) {
      var p1 = getAcknowledgmentsPieceWorldPoint(piece, target, piece.cells[c][0], piece.cells[c][1]);
      var p2 = getAcknowledgmentsPieceWorldPoint(piece, target, piece.cells[c][0] + 1, piece.cells[c][1] + 1);
      allPoints.push(p1);
      allPoints.push(p2);
    }
  }
  var mapPoint = buildAcknowledgmentsViewportMapper(allPoints);
  var palette = getAcknowledgmentsPaletteColors();
  var groups = [];

  for (var p = 0; p < pieceCount; p++) {
    var pieceMeta = pieces[p];
    var targetMeta = targets[p];
    var mappedTarget = mapPoint({ x: targetMeta.x, y: targetMeta.y });
    var targetScale = targetMeta.scale * mappedTarget.scale;
    var group = createSvgNode('g');
    group.setAttribute('opacity', '0.12');
    acknowledgmentsPattern.appendChild(group);

    for (var rc = 0; rc < pieceMeta.cells.length; rc++) {
      var rect = createSvgNode('rect');
      rect.setAttribute('x', String((pieceMeta.cells[rc][0] - pieceMeta.centroidX) * targetScale));
      rect.setAttribute('y', String((pieceMeta.cells[rc][1] - pieceMeta.centroidY) * targetScale));
      rect.setAttribute('width', String(targetScale));
      rect.setAttribute('height', String(targetScale));
      rect.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[p % palette.length], 0.52));
      rect.setAttribute('fill-opacity', '0.46');
      rect.setAttribute('stroke', '#6a7a90');
      rect.setAttribute('stroke-opacity', '0.44');
      rect.setAttribute('stroke-width', String(Math.max(0.55, targetScale * 0.045)));
      group.appendChild(rect);
    }

    var seedAngle = p * (Math.PI * (3 - Math.sqrt(5)));
    var scatterRadius = 130 * mappedTarget.scale;
    groups.push({
      group: group,
      targetX: mappedTarget.x,
      targetY: mappedTarget.y,
      targetR: (targetMeta.rotation * 180 / Math.PI),
      scatterX: (stageSize * 0.5) + Math.cos(seedAngle) * scatterRadius,
      scatterY: (stageSize * 0.5) + Math.sin(seedAngle) * scatterRadius,
      scatterR: (seedAngle * 180 / Math.PI) + 90
    });
  }

  var defaultBpm = DEFAULT_ANIMATION_BPM;
  var scale = defaultBpm / ACKNOWLEDGMENTS_BPM;
  var d = {
    scatter: 0.7 * scale,
    reveal: 0,
    travel: 2.0 * scale,
    snap: 0.5 * scale,
    fade: 0.5 * scale
  };
  var pieceMotion = d.scatter + d.reveal + d.travel + d.snap;
  var totalSeconds = pieceCount > 0 ? (pieceMotion * pieceCount + d.fade) : d.scatter;

  return {
    pieceCount: pieceCount,
    durationMs: Math.round(totalSeconds * 1000),
    render: function(progress) {
      var elapsedSeconds = clamp01(progress) * totalSeconds;
      for (var i = 0; i < groups.length; i++) {
        var localT = elapsedSeconds - (i * pieceMotion);
        var x = groups[i].scatterX;
        var y = groups[i].scatterY;
        var rot = groups[i].scatterR;
        var localOpacity = 0.16;

        if (localT > 0 && localT < d.scatter) {
          localOpacity = 0.28;
        } else if (localT >= d.scatter && localT < (d.scatter + d.reveal + d.travel)) {
          var travelP = easeInOutCubic(clamp01((localT - d.scatter - d.reveal) / Math.max(1e-4, d.travel)));
          x = groups[i].scatterX + (groups[i].targetX - groups[i].scatterX) * travelP;
          y = groups[i].scatterY + (groups[i].targetY - groups[i].scatterY) * travelP;
          rot = groups[i].scatterR + (groups[i].targetR - groups[i].scatterR) * travelP;
          localOpacity = 0.2 + 0.52 * travelP;
        } else if (localT >= (d.scatter + d.reveal + d.travel)) {
          x = groups[i].targetX;
          y = groups[i].targetY;
          rot = groups[i].targetR;
          localOpacity = 0.74;
        }

        groups[i].group.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + rot + ')');
        groups[i].group.setAttribute('opacity', String(localOpacity));
      }
    }
  };
}

function buildAcknowledgmentsStageAnimator(styleId, visual) {
  if (styleId === 'triangula') {
    return buildAcknowledgmentsTriangulaAnimator(visual);
  }
  if (styleId === 'squarus') {
    return buildAcknowledgmentsSquarusAnimator(visual);
  }
  return buildAcknowledgmentsStitchingAnimator(visual);
}

function playAcknowledgmentsStage(styleId, visual, lineText) {
  stopAcknowledgmentsStageAnimation();
  configureAcknowledgmentsPatternViewport();
  var animatorBundle = buildAcknowledgmentsStageAnimator(styleId, visual);
  var animator = (typeof animatorBundle === 'function') ? { render: animatorBundle } : animatorBundle;
  var start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var durationMs = getAcknowledgmentsLineDurationMs(styleId, visual, animator);
  acknowledgmentsViewerState.currentLineDurationMs = durationMs;

  function tick(nowMs) {
    var now = isFinite(nowMs) ? nowMs : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
    var progress = clamp01((now - start) / durationMs);
    if (animator && typeof animator.render === 'function') {
      animator.render(progress);
    }
    setAcknowledgmentsLineReveal(lineText, clamp01((progress - 0.06) / 0.9));
    if (progress >= 1) {
      setAcknowledgmentsLineReveal(lineText, 1);
      acknowledgmentsViewerState.rafId = null;
      return;
    }
    acknowledgmentsViewerState.rafId = requestAnimationFrame(tick);
  }

  acknowledgmentsViewerState.rafId = requestAnimationFrame(tick);
}

function renderAcknowledgmentsPattern(styleId, visual, lineText) {
  playAcknowledgmentsStage(styleId, visual, lineText);
}

function syncAcknowledgmentsControls(linesLength) {
  var total = Math.max(0, parseBoundedInt(linesLength, 0, 9999, 0));
  var index = Math.max(0, parseBoundedInt(acknowledgmentsViewerState.lineIndex, 0, Math.max(0, total - 1), 0));
  if (acknowledgmentsPrevBtn) {
    acknowledgmentsPrevBtn.disabled = index <= 0;
  }
  if (acknowledgmentsNextBtn) {
    acknowledgmentsNextBtn.disabled = index >= (total - 1);
  }
  if (acknowledgmentsAutoplayBtn) {
    acknowledgmentsAutoplayBtn.setAttribute('aria-pressed', acknowledgmentsViewerState.autoPlay ? 'true' : 'false');
    acknowledgmentsAutoplayBtn.textContent = acknowledgmentsViewerState.autoPlay ? 'Pause' : 'Auto play';
  }
}

function renderAcknowledgmentsLine(lines) {
  var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES;
  if (!safeLines.length) {
    safeLines = ['Acknowledgments unavailable.'];
  }
  acknowledgmentsViewerState.lineIndex = Math.max(0, Math.min(acknowledgmentsViewerState.lineIndex, safeLines.length - 1));
  var lineIndex = acknowledgmentsViewerState.lineIndex;
  var styleId = getAcknowledgmentsStyleForIndex(lineIndex);
  var visual = getAcknowledgmentsVisualForIndex(lineIndex, styleId);
  var activeLine = safeLines[lineIndex];

  if (acknowledgmentsLineText) {
    acknowledgmentsLineText.textContent = '';
  }
  if (acknowledgmentsProgress) {
    acknowledgmentsProgress.textContent = String(lineIndex + 1) + ' / ' + String(safeLines.length);
  }

  renderAcknowledgmentsPattern(styleId, visual, activeLine);
  syncAcknowledgmentsControls(safeLines.length);
}

function scheduleAcknowledgmentsAutoplayTick(lines) {
  stopAcknowledgmentsAutoplay();
  if (!acknowledgmentsViewerState.autoPlay) return;
  var safeLines = Array.isArray(lines) ? lines : [];
  if (!safeLines.length) return;
  if (acknowledgmentsViewerState.lineIndex >= safeLines.length - 1) {
    acknowledgmentsViewerState.autoPlay = false;
    syncAcknowledgmentsControls(safeLines.length);
    return;
  }

  var delayMs = Math.max(1200, parseBoundedInt(
    acknowledgmentsViewerState.currentLineDurationMs,
    1200,
    30000,
    ACKNOWLEDGMENTS_AUTOPLAY_DELAY_MS
  ));

  acknowledgmentsViewerState.timerId = window.setTimeout(function() {
    if (!acknowledgmentsModal || !acknowledgmentsModal.classList.contains('open')) return;
    if (!acknowledgmentsViewerState.autoPlay) return;
    acknowledgmentsViewerState.lineIndex = Math.min(acknowledgmentsViewerState.lineIndex + 1, safeLines.length - 1);
    renderAcknowledgmentsLine(safeLines);
    scheduleAcknowledgmentsAutoplayTick(safeLines);
  }, delayMs);
}

