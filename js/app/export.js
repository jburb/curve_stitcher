function openExportOptionsModal() {
  var isTriangulaExport = currentExperienceId === 'triangula';
  var isSquarusExport = currentExperienceId === 'squarus';
  var isMashrabiyaExport = currentExperienceId === 'mashrabiya';
  var hideThreadsControl = isTriangulaExport || isSquarusExport || isMashrabiyaExport;
  var threadsRow = exportIncludeThreadsInput ? exportIncludeThreadsInput.closest('.modal-row') : null;
  var previewRow = exportIncludePreviewInput ? exportIncludePreviewInput.closest('.modal-row') : null;

  syncExportUiCopy();
  exportNameInput.value = ensureExportBaseNameHasExperiencePrefix(getTimestampLabel());
  exportIncludeThreadsInput.checked = false;
  exportIncludeThreadsInput.disabled = hideThreadsControl;
  exportIncludeGuideInput.checked = true;
  exportIncludePreviewInput.checked = isTriangulaExport ? false : true;
  exportIncludePreviewInput.disabled = isTriangulaExport;
  if (exportMashrabiyaDebugLabelsInput) {
    exportMashrabiyaDebugLabelsInput.checked = false;
  }
  if (threadsRow) {
    threadsRow.style.display = hideThreadsControl ? 'none' : '';
  }
  if (previewRow) {
    previewRow.style.display = isTriangulaExport ? 'none' : '';
  }
  if (exportMashrabiyaDebugRow) {
    exportMashrabiyaDebugRow.style.display = (isMashrabiyaExport && mashrabiyaDebugLabelsEnabled) ? '' : 'none';
  }
  exportOptionsModal.classList.add('open');
  exportNameInput.focus();
  exportNameInput.select();
}

function closeExportOptionsModal() {
  exportOptionsModal.classList.remove('open');
}

function openKidSaveModal() {
  if (!kidSaveModal) return;
  kidSaveModal.classList.add('open');
  syncKidSaveToggleButton();
}

function closeKidSaveModal() {
  if (!kidSaveModal) return;
  kidSaveModal.classList.remove('open');
  syncKidSaveToggleButton();
}

async function runExportFromModalSelection() {
  var isTriangulaExport = currentExperienceId === 'triangula';
  var isSquarusExport = currentExperienceId === 'squarus';
  var isMashrabiyaExport = currentExperienceId === 'mashrabiya';
  var includeThreadsAllowed = !isTriangulaExport && !isSquarusExport && !isMashrabiyaExport;
  var baseName = ensureExportBaseNameHasExperiencePrefix(normalizeExportBaseName(exportNameInput.value));
  var options = {
    includeThreads: includeThreadsAllowed ? exportIncludeThreadsInput.checked : false,
    includeGuide: exportIncludeGuideInput.checked,
    includePreview: isTriangulaExport ? false : exportIncludePreviewInput.checked,
    mashrabiyaIncludeDebugLabels: !!(isMashrabiyaExport && mashrabiyaDebugLabelsEnabled && exportMashrabiyaDebugLabelsInput && exportMashrabiyaDebugLabelsInput.checked)
  };

  try {
    if (typeof JSZip === 'undefined') {
      // Fallback path if zip library fails to load.
      downloadCurrentDesignSvg(baseName, options);
      if (options.includeGuide) {
        downloadStitchingGuide(baseName, options);
      }
      if (options.includePreview) {
        downloadPreviewImage(baseName);
      }
    } else {
      await downloadExportZipBundle(baseName, options);
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  }

  closeExportOptionsModal();
}

async function runKidFriendlySaveSelection(mode) {
  var normalizedMode = mode === 'make' ? 'make' : 'image';
  var proposedName = normalizeExportBaseName(getTimestampLabel());
  var requestedName = window.prompt('What would you like to call it?', proposedName);
  if (requestedName === null) {
    return;
  }
  var baseName = ensureExportBaseNameHasExperiencePrefix(normalizeExportBaseName(requestedName));
  var options = {
    includeThreads: false,
    includeGuide: normalizedMode === 'make',
    includePreview: true,
    forceStitchingBorder: normalizedMode === 'make' && currentExperienceId === 'stitching',
    forceStitchingHoleNumbers: normalizedMode === 'make' && currentExperienceId === 'stitching'
  };

  try {
    if (normalizedMode === 'image') {
      downloadPreviewImage(baseName, { appendPreviewSuffix: false });
    } else if (typeof JSZip === 'undefined') {
      downloadCurrentDesignSvg(baseName, options);
      if (options.includeGuide) {
        downloadStitchingGuide(baseName, options);
      }
      if (options.includePreview) {
        downloadPreviewImage(baseName);
      }
    } else {
      await downloadExportZipBundle(baseName, options);
    }
  } catch (error) {
    console.error('Kid save failed:', error);
    alert('Save failed. Please try again.');
  }

  closeKidSaveModal();
}

function normalizeExportBaseName(rawName) {
  var fallback = 'stitchlab-' + getTimestampLabel();
  var source = String(rawName || '').trim();
  if (!source) return fallback;
  var cleaned = source
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\-.]+|[_\-.]+$/g, '');
  return cleaned || fallback;
}

function parseBoundedInt(rawValue, minValue, maxValue, fallback) {
  var parsed = parseInt(rawValue, 10);
  if (!isFinite(parsed)) return fallback;
  if (isFinite(minValue) && parsed < minValue) parsed = minValue;
  if (isFinite(maxValue) && parsed > maxValue) parsed = maxValue;
  return parsed;
}

function triggerBlobDownload(blob, fileName) {
  var url = URL.createObjectURL(blob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 0);
}

function buildTriangulaDesignSvgString() {
  var width = Math.round(view.viewSize.width);
  var height = Math.round(view.viewSize.height);
  var lines = [];
  var borderStrokeColor = BORDER_STROKE_COLOR;
  var holeFillColor = HOLE_FILL_COLOR;
  var holeLabelColor = HOLE_LABEL_COLOR;
  var base = getTriangulaBaseTriangle(1);
  var endDepth = triangulaCountToDepth(triangulaTargetCount);

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
  lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');

  lines.push(
    '<path d="' + svgPathFromPoints(base) +
    '" fill="' + colorToSvg(getTriangulaFillColorForSlot(1, 0)) +
    '" stroke="#234b61" stroke-width="' + formatSvgNumber(triangulaConstructionMode === 'cut' ? 1.7 : 1.1) +
    '" opacity="0.95"/>'
  );

  if (triangulaConstructionMode === 'cut') {
    for (var level = 1; level <= endDepth; level++) {
      var cutTriangles = [];
      collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
      for (var c = 0; c < cutTriangles.length; c++) {
        lines.push(
          '<path d="' + svgPathFromPoints(cutTriangles[c].vertices) +
          '" fill="#ffffff" stroke="#ffffff" stroke-width="1.08" opacity="0.97"/>'
        );
      }
    }
  } else {
    for (var d = 1; d <= endDepth; d++) {
      var triangles = [];
      collectTrianglesAtDepth(base, d, 0, 1, triangles);
      for (var t = 0; t < triangles.length; t++) {
        lines.push(
          '<path d="' + svgPathFromPoints(triangles[t].vertices) +
          '" fill="' + colorToSvg(getTriangulaFillColorForSlot(triangles[t].slot, t)) +
          '" stroke="' + colorToSvg(getTriangulaStrokeColorForSlot(triangles[t].slot, t)) +
          '" stroke-width="' + formatSvgNumber(Math.max(0.7, 1.3 - (d * 0.1))) +
          '" opacity="' + formatSvgNumber(Math.max(0.45, 0.92 - (d * 0.08))) +
          '"/>'
        );
      }
    }
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function getExportExperiencePrefix() {
  var id = String(currentExperienceId || 'stitching').toLowerCase();
  return 'stitchlab-' + id;
}

function ensureExportBaseNameHasExperiencePrefix(baseName) {
  var raw = String(baseName || '').trim();
  var prefix = getExportExperiencePrefix();
  var prefixWithDash = prefix + '-';
  if (!raw) {
    return prefixWithDash + getTimestampLabel();
  }
  if (raw === prefix || raw.indexOf(prefixWithDash) === 0) {
    return raw;
  }
  return prefixWithDash + raw;
}

function syncExportUiCopy() {
  var exportExperience = currentExperienceId;

  if (advancedExportHelp) {
    if (exportExperience === 'triangula') {
      advancedExportHelp.textContent = 'Exports Triangula target composition as SVG with instructions (preview PNG is omitted for this experience).';
    } else if (exportExperience === 'squarus') {
      advancedExportHelp.textContent = 'Exports Squarus cut-sheet SVG, parameterized PNG preview, and Squarus assembly instructions.';
    } else if (exportExperience === 'mashrabiya') {
      advancedExportHelp.textContent = 'Exports Mashrabiya rosette composition as SVG with instructions and optional preview.';
    } else {
      advancedExportHelp.textContent = 'Exports current Stitching view (borders, threads, holes, and visible hole numbers).';
    }
  }

  if (exportOptionsTitle) {
    if (exportExperience === 'triangula') {
      exportOptionsTitle.textContent = 'Triangula Export Options';
    } else if (exportExperience === 'squarus') {
      exportOptionsTitle.textContent = 'Squarus Export Options';
    } else if (exportExperience === 'mashrabiya') {
      exportOptionsTitle.textContent = 'Mashrabiya Export Options';
    } else {
      exportOptionsTitle.textContent = 'Stitching Export Options';
    }
  }

  if (exportNameInput) {
    exportNameInput.placeholder = ensureExportBaseNameHasExperiencePrefix('') ;
  }
}

function buildSquarusCutSheetSvgString() {
  var pieces = getSquarusPolyominoes(squarusOrder);
  var unit = 28;
  var spacing = Math.round(unit * 1.4);
  var padding = Math.round(unit * 0.9);
  var titleBand = Math.round(unit * 1.25);
  var labelBand = Math.round(unit * 0.95);
  var strokeWidth = 1.6;
  var maxHeightCells = 1;
  var maxWidthCells = 1;
  var i;

  for (i = 0; i < pieces.length; i++) {
    maxHeightCells = Math.max(maxHeightCells, pieces[i].height || 1);
    maxWidthCells = Math.max(maxWidthCells, pieces[i].width || 1);
  }

  var contentHeight = maxHeightCells * unit;
  var xCursor = padding;
  var placements = [];

  for (i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    var pieceWidth = Math.max(1, piece.width || 1) * unit;
    var offsetX = xCursor - (Math.min.apply(null, piece.cells.map(function(cell) { return cell[0]; })) * unit);
    var minY = Math.min.apply(null, piece.cells.map(function(cell) { return cell[1]; }));
    var yPadding = (contentHeight - (Math.max(1, piece.height || 1) * unit)) * 0.5;
    var offsetY = titleBand + padding + yPadding - (minY * unit);

    placements.push({
      piece: piece,
      offsetX: offsetX,
      offsetY: offsetY,
      centerX: xCursor + (pieceWidth * 0.5)
    });

    xCursor += pieceWidth + spacing;
  }

  var width = Math.max(240, Math.round(xCursor - spacing + padding));
  var height = Math.max(160, Math.round(titleBand + padding + contentHeight + labelBand + padding));
  var lines = [];

  function edgeKey(x1, y1, x2, y2) {
    if (x1 > x2 || (x1 === x2 && y1 > y2)) {
      var tx = x1;
      var ty = y1;
      x1 = x2;
      y1 = y2;
      x2 = tx;
      y2 = ty;
    }
    return String(x1) + ',' + String(y1) + '|' + String(x2) + ',' + String(y2);
  }

  function collectBoundaryEdges(cells) {
    var edgeMap = Object.create(null);
    for (var c = 0; c < cells.length; c++) {
      var cellX = cells[c][0];
      var cellY = cells[c][1];
      var edges = [
        [cellX, cellY, cellX + 1, cellY],
        [cellX + 1, cellY, cellX + 1, cellY + 1],
        [cellX + 1, cellY + 1, cellX, cellY + 1],
        [cellX, cellY + 1, cellX, cellY]
      ];
      for (var e = 0; e < edges.length; e++) {
        var key = edgeKey(edges[e][0], edges[e][1], edges[e][2], edges[e][3]);
        if (!edgeMap[key]) {
          edgeMap[key] = { x1: edges[e][0], y1: edges[e][1], x2: edges[e][2], y2: edges[e][3], count: 0 };
        }
        edgeMap[key].count += 1;
      }
    }
    return edgeMap;
  }

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
  lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');
  lines.push('<text x="' + formatSvgNumber(width * 0.5) + '" y="' + formatSvgNumber(padding) + '" fill="#1d1d1d" font-size="16" font-family="Nunito, sans-serif" text-anchor="middle" dominant-baseline="hanging">Squarus cut sheet - Order ' + String(squarusOrder) + '</text>');

  for (i = 0; i < placements.length; i++) {
    var placement = placements[i];
    var boundaryEdges = collectBoundaryEdges(placement.piece.cells);
    var keys = Object.keys(boundaryEdges);

    for (var k = 0; k < keys.length; k++) {
      var edge = boundaryEdges[keys[k]];
      if (edge.count !== 1) continue;
      lines.push(
        '<line x1="' + formatSvgNumber(placement.offsetX + edge.x1 * unit) +
        '" y1="' + formatSvgNumber(placement.offsetY + edge.y1 * unit) +
        '" x2="' + formatSvgNumber(placement.offsetX + edge.x2 * unit) +
        '" y2="' + formatSvgNumber(placement.offsetY + edge.y2 * unit) +
        '" stroke="#111111" stroke-width="' + formatSvgNumber(strokeWidth) + '" stroke-linecap="square"/>'
      );
    }

    lines.push(
      '<text x="' + formatSvgNumber(placement.centerX) +
      '" y="' + formatSvgNumber(titleBand + padding + contentHeight + (labelBand * 0.65)) +
      '" fill="#444444" font-size="12" font-family="Nunito, sans-serif" text-anchor="middle">P' + String(i + 1) + '</text>'
    );
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function buildMashrabiyaDesignSvgString(options) {
  options = options || {};
  var includeDebugLabels = options.mashrabiyaIncludeDebugLabels === true;
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  var width = Math.max(120, Math.round(view.viewSize.width || 900));
  var height = Math.max(120, Math.round(view.viewSize.height || 900));
  var lines = [];

  function toSvgPoints(vertices) {
    var chunks = [];
    for (var i = 0; i < vertices.length; i++) {
      chunks.push(formatSvgNumber(vertices[i].x) + ',' + formatSvgNumber(vertices[i].y));
    }
    return chunks.join(' ');
  }

  function pointKey(point) {
    if (!point) return '';
    return formatSvgNumber(point.x) + ',' + formatSvgNumber(point.y);
  }

  function edgeKey(a, b) {
    var aKey = pointKey(a);
    var bKey = pointKey(b);
    if (!aKey || !bKey) return '';
    return aKey < bKey ? (aKey + '|' + bKey) : (bKey + '|' + aKey);
  }

  function normalizePoint(point) {
    return {
      x: Math.round(point.x * 1000) / 1000,
      y: Math.round(point.y * 1000) / 1000
    };
  }

  function isPointOnSegment(point, from, to) {
    var epsilon = 1e-6;
    var abx = to.x - from.x;
    var aby = to.y - from.y;
    var apx = point.x - from.x;
    var apy = point.y - from.y;
    var cross = (abx * apy) - (aby * apx);
    if (Math.abs(cross) > epsilon) return false;
    var dot = (apx * abx) + (apy * aby);
    if (dot < -epsilon) return false;
    var lenSq = (abx * abx) + (aby * aby);
    if (dot > lenSq + epsilon) return false;
    return true;
  }

  function splitEdge(edgeStart, edgeEnd, allPoints) {
    var pieces = [];
    if (!edgeStart || !edgeEnd || !allPoints || !allPoints.length) return pieces;

    var pointsOnEdge = [];
    for (var i = 0; i < allPoints.length; i++) {
      var candidate = allPoints[i];
      if (isPointOnSegment(candidate, edgeStart, edgeEnd)) {
        pointsOnEdge.push(candidate);
      }
    }
    if (pointsOnEdge.length < 2) return pieces;

    var dominantAxis = Math.abs(edgeEnd.x - edgeStart.x) >= Math.abs(edgeEnd.y - edgeStart.y) ? 'x' : 'y';
    pointsOnEdge.sort(function(a, b) {
      if (dominantAxis === 'x') {
        if (a.x !== b.x) return a.x - b.x;
        return a.y - b.y;
      }
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    for (var j = 0; j < pointsOnEdge.length - 1; j++) {
      var from = pointsOnEdge[j];
      var to = pointsOnEdge[j + 1];
      if (Math.abs(from.x - to.x) < 1e-6 && Math.abs(from.y - to.y) < 1e-6) continue;
      pieces.push({ from: from, to: to });
    }

    return pieces;
  }

  function collectBoundaryEdges(polygons) {
    var edgeCounts = Object.create(null);
    var edgeRefs = Object.create(null);
    var edges = [];
    if (!polygons || !polygons.length) return edges;

    var pointMap = Object.create(null);
    for (var i = 0; i < polygons.length; i++) {
      var polygon = polygons[i];
      if (!polygon || !polygon.length) continue;
      for (var v = 0; v < polygon.length; v++) {
        var normalizedVertex = normalizePoint(polygon[v]);
        var vertexKey = pointKey(normalizedVertex);
        if (!pointMap[vertexKey]) {
          pointMap[vertexKey] = normalizedVertex;
        }
      }
    }
    var allPoints = Object.keys(pointMap).map(function(key) {
      return pointMap[key];
    });

    for (var p = 0; p < polygons.length; p++) {
      var vertices = polygons[p];
      if (!vertices || vertices.length < 2) continue;
      for (var j = 0; j < vertices.length; j++) {
        var from = normalizePoint(vertices[j]);
        var to = normalizePoint(vertices[(j + 1) % vertices.length]);
        if (!from || !to) continue;
        var subEdges = splitEdge(from, to, allPoints);
        for (var s = 0; s < subEdges.length; s++) {
          var subEdge = subEdges[s];
          var key = edgeKey(subEdge.from, subEdge.to);
          if (!key) continue;
          edgeCounts[key] = (edgeCounts[key] || 0) + 1;
          if (!edgeRefs[key]) {
            edgeRefs[key] = {
              from: subEdge.from,
              to: subEdge.to
            };
          }
        }
      }
    }

    var keys = Object.keys(edgeCounts);
    for (var k = 0; k < keys.length; k++) {
      var edgeLookupKey = keys[k];
      if (edgeCounts[edgeLookupKey] === 1 && edgeRefs[edgeLookupKey]) {
        edges.push(edgeRefs[edgeLookupKey]);
      }
    }

    return edges;
  }

  function appendBoundaryEdges(polygons, strokeColor, strokeWidth) {
    if (!polygons || !polygons.length || !isFinite(strokeWidth) || strokeWidth <= 0) return;
    var edges = collectBoundaryEdges(polygons);
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (!edge || !edge.from || !edge.to) continue;
      lines.push(
        '<line x1="' + formatSvgNumber(edge.from.x) + '" y1="' + formatSvgNumber(edge.from.y) +
        '" x2="' + formatSvgNumber(edge.to.x) + '" y2="' + formatSvgNumber(edge.to.y) +
        '" stroke="' + strokeColor + '" stroke-width="' + formatSvgNumber(strokeWidth) +
        '" stroke-linecap="round" stroke-linejoin="round"/>'
      );
    }
  }

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
  lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');

  if (includeDebugLabels) {
    function appendPolyline(vertices, strokeColor, strokeWidth, opacity, closePath) {
      if (!vertices || vertices.length < 2) return;
      var path = ['M ' + formatSvgNumber(vertices[0].x) + ' ' + formatSvgNumber(vertices[0].y)];
      for (var i = 1; i < vertices.length; i++) {
        path.push('L ' + formatSvgNumber(vertices[i].x) + ' ' + formatSvgNumber(vertices[i].y));
      }
      if (closePath) {
        path.push('Z');
      }
      lines.push(
        '<path d="' + path.join(' ') + '" fill="none" stroke="' + strokeColor +
        '" stroke-width="' + formatSvgNumber(strokeWidth) +
        '" stroke-linecap="round" stroke-linejoin="round" opacity="' + formatSvgNumber(opacity) + '"/>'
      );
    }

    function appendSequence(pointsList, sequence, strokeColor, strokeWidth, opacity) {
      if (!pointsList || !pointsList.length || !sequence || sequence.length < 2) return;
      var firstPoint = pointsList[sequence[0]];
      if (!firstPoint) return;
      var path = ['M ' + formatSvgNumber(firstPoint.x) + ' ' + formatSvgNumber(firstPoint.y)];
      var lastPoint = firstPoint;
      for (var i = 1; i < sequence.length; i++) {
        var point = pointsList[sequence[i]];
        if (!point) continue;
        path.push('L ' + formatSvgNumber(point.x) + ' ' + formatSvgNumber(point.y));
        lastPoint = point;
      }
      if (lastPoint !== firstPoint) {
        path.push('L ' + formatSvgNumber(firstPoint.x) + ' ' + formatSvgNumber(firstPoint.y));
      }
      lines.push(
        '<path d="' + path.join(' ') + '" fill="none" stroke="' + strokeColor +
        '" stroke-width="' + formatSvgNumber(strokeWidth) +
        '" stroke-linecap="round" stroke-linejoin="round" opacity="' + formatSvgNumber(opacity) + '"/>'
      );
    }

    function appendSegments(segments, strokeColor, strokeWidth, opacity) {
      if (!segments || !segments.length) return;
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        if (!seg || !seg.from || !seg.to) continue;
        lines.push(
          '<line x1="' + formatSvgNumber(seg.from.x) + '" y1="' + formatSvgNumber(seg.from.y) +
          '" x2="' + formatSvgNumber(seg.to.x) + '" y2="' + formatSvgNumber(seg.to.y) +
          '" stroke="' + strokeColor + '" stroke-width="' + formatSvgNumber(strokeWidth) +
          '" stroke-linecap="round" stroke-linejoin="round" opacity="' + formatSvgNumber(opacity) + '"/>'
        );
      }
    }

    appendPolyline(geometry.guideCircleVertices, '#82511f', 2, 0.9, true);
    appendSequence(geometry.scaffoldPoints || geometry.holePoints, geometry.firstPolygonSequence, '#82511f', 2, 0.9);
    appendSequence(geometry.scaffoldPoints || geometry.holePoints, geometry.offsetPolygonSequence, '#82511f', 2, 0.9);
    appendPolyline(geometry.innerGuideCircleVertices, '#82511f', 2, 0.9, true);
    appendSegments(geometry.starThreadSegments, '#82511f', 2, 0.9);

    var faces = geometry.faceDiagnostics && geometry.faceDiagnostics.faces
      ? geometry.faceDiagnostics.faces
      : [];
    for (var f = 0; f < faces.length; f++) {
      var face = faces[f];
      if (!face || !face.centroid) continue;
      var classToken = 'O';
      var classColor = '#666666';
      if (face.classification === 'star') {
        classToken = 'S';
        classColor = '#9c6f1d';
      } else if (face.classification === 'petal') {
        classToken = 'P';
        classColor = '#a9491e';
      } else if (face.classification === 'point') {
        classToken = 'T';
        classColor = '#a73631';
      }
      lines.push(
        '<text x="' + formatSvgNumber(face.centroid.x) + '" y="' + formatSvgNumber(face.centroid.y + 3) +
        '" fill="' + classColor + '" font-size="8" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" opacity="0.92">' +
        'F' + String(face.id) + ' ' + classToken + ' b' + String(face.bin) +
        '</text>'
      );
    }

    lines.push('</svg>');
    return lines.join('\n');
  }

  var fillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);
  var starPolygons = (geometry.starRegions && geometry.starRegions.length)
    ? geometry.starRegions
    : [geometry.starPathVertices];

  for (var p = 0; p < geometry.petals.length; p++) {
    lines.push('<polygon points="' + toSvgPoints(geometry.petals[p]) + '" fill="' + mashrabiyaPetalColor + '"/>');
  }

  for (var q = 0; q < geometry.pointRegions.length; q++) {
    lines.push('<polygon points="' + toSvgPoints(geometry.pointRegions[q]) + '" fill="' + mashrabiyaPointColor + '"/>');
  }

  for (var s = 0; s < starPolygons.length; s++) {
    lines.push('<polygon points="' + toSvgPoints(starPolygons[s]) + '" fill="' + mashrabiyaStarColor + '"/>');
  }

  if (fillBorderWidth > 0) {
    appendBoundaryEdges(starPolygons, '#82511f', fillBorderWidth);
    appendBoundaryEdges(geometry.petals, '#82511f', fillBorderWidth);
    appendBoundaryEdges(geometry.pointRegions, '#82511f', fillBorderWidth);
  }
  lines.push('</svg>');
  return lines.join('\n');
}

function buildCurrentDesignSvgString(options) {
  options = options || {};
  if (currentExperienceId === 'triangula') {
    return buildTriangulaDesignSvgString();
  }
  if (currentExperienceId === 'squarus') {
    return buildSquarusCutSheetSvgString();
  }
  if (currentExperienceId === 'mashrabiya') {
    return buildMashrabiyaDesignSvgString(options);
  }

  var includeThreads = options.includeThreads !== false;
  var includeStitchingBorder = borderEnabled;
  var includeStitchingHoleNumbers = shouldShowHoleNumbersNow();
  if (options.forceStitchingBorder === true) {
    includeStitchingBorder = true;
  }
  if (options.forceStitchingHoleNumbers === true) {
    includeStitchingHoleNumbers = true;
  }
  var borderStrokeColor = BORDER_STROKE_COLOR;
  var holeFillColor = HOLE_FILL_COLOR;
  var holeLabelColor = HOLE_LABEL_COLOR;

  // Export a fresh static snapshot independent from transient animation artifacts.
  computePoints();

  var width = Math.round(view.viewSize.width);
  var height = Math.round(view.viewSize.height);
  var lines = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');

  if (includeStitchingBorder && BORDER_INCLUDE_IN_SVG) {
    function appendBorderPair(borderGeometry) {
      if (!borderGeometry || !borderGeometry.outerSamples || !borderGeometry.innerSamples) return;
      var lineJoin = borderGeometry.isPolygon ? 'miter' : 'round';
      var outerPathData = svgPathFromPoints(borderGeometry.outerSamples);
      var innerPathData = svgPathFromPoints(borderGeometry.innerSamples);
      lines.push('<path d="' + outerPathData + '" fill="none" stroke="' + borderStrokeColor + '" stroke-width="' + BORDER_STROKE_WIDTH + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
      lines.push('<path d="' + innerPathData + '" fill="none" stroke="' + borderStrokeColor + '" stroke-width="' + BORDER_STROKE_WIDTH + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
    }

    appendBorderPair(getBorderGeometryForCurrentShape());

    if (nestedFrameEnabled) {
      var geometry = getShapeGeometry();
      var nestedGeometry = {
        center: geometry.center,
        radius: geometry.radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)
      };
      appendBorderPair(getBorderGeometryForGeometry(nestedGeometry));
    }
  }

  if (includeThreads) {
    for (var t = 0; t < threads.length; t++) {
      var thread = threads[t];
      var segments = computeSegments(thread);
      for (var s = 0; s < segments.length; s++) {
        var parts = getThreadSegmentDrawParts(thread, segments[s]);
        var strokeColor = thread.color === 'rainbow'
          ? colorToSvg(rainbowColor(s / Math.max(1, segments.length)))
          : colorToSvg(thread.color);

        for (var p = 0; p < parts.length; p++) {
          lines.push(
            '<line x1="' + formatSvgNumber(parts[p].fromPoint.x) + '" y1="' + formatSvgNumber(parts[p].fromPoint.y) +
            '" x2="' + formatSvgNumber(parts[p].toPoint.x) + '" y2="' + formatSvgNumber(parts[p].toPoint.y) +
            '" stroke="' + strokeColor + '" stroke-width="' + formatSvgNumber(thread.width) +
            '" stroke-linecap="round" stroke-linejoin="round"/>'
          );
        }
      }
    }
  }

  function exportRingHoles(ringPoints) {
    if (!ringPoints || !ringPoints.length) return;
    for (var i = 0; i < ringPoints.length; i++) {
      lines.push('<circle cx="' + formatSvgNumber(ringPoints[i].x) + '" cy="' + formatSvgNumber(ringPoints[i].y) + '" r="3" fill="' + holeFillColor + '"/>');
    }
  }

  exportRingHoles(outerFramePoints.length ? outerFramePoints : points);
  if (nestedFrameEnabled && innerFramePoints.length) {
    exportRingHoles(innerFramePoints);
  }

  if (includeStitchingHoleNumbers) {
    var holeCount = getCurrentStitchHoleCount();
    if (!isFinite(holeCount)) holeCount = DEFAULT_HOLES;
    var fontSize = getHoleNumberFontSize(holeCount);

    function exportRingLabels(ringPoints, invertOutward, isInnerRing) {
      if (!ringPoints || !ringPoints.length) return;
      var ccw = signedAreaOfClosedPolyline(ringPoints) > 0;
      var ringFontSize = isInnerRing ? Math.max(6, fontSize * 0.9) : fontSize;
      var maxExtent = 0;

      for (var e = 0; e < ringPoints.length; e++) {
        var sampleText = String(e + 1);
        var sampleExtent = estimateTextExtentAlongDirection(sampleText, ringFontSize);
        if (sampleExtent > maxExtent) {
          maxExtent = sampleExtent;
        }
      }

      var metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE_SVG, LABEL_HOLE_CLEARANCE_SVG);
      if (metrics.maxOffset < metrics.minOffset) {
        var availableBand = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + LABEL_BORDER_CLEARANCE_SVG) - (3 + LABEL_HOLE_CLEARANCE_SVG);
        var reducedFont = Math.max(6, Math.min(ringFontSize, availableBand * 1.6));
        if (reducedFont < ringFontSize) {
          ringFontSize = reducedFont;
          maxExtent = 0;
          for (var r = 0; r < ringPoints.length; r++) {
            var reducedExtent = estimateTextExtentAlongDirection(String(r + 1), ringFontSize);
            if (reducedExtent > maxExtent) {
              maxExtent = reducedExtent;
            }
          }
          metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE_SVG, LABEL_HOLE_CLEARANCE_SVG);
        }
      }

      var sharedOffset = metrics.offset;
      for (var j = 0; j < ringPoints.length; j++) {
        var text = String(j + 1);
        var outward = getOutwardDirectionAtHoleFromRing(ringPoints, j, ccw, invertOutward);
        var labelPos = ringPoints[j].add(outward.multiply(sharedOffset));
        lines.push(
          '<text x="' + formatSvgNumber(labelPos.x) + '" y="' + formatSvgNumber(labelPos.y) +
          '" fill="' + holeLabelColor + '" font-size="' + formatSvgNumber(ringFontSize) +
          '" font-family="Nunito, sans-serif" text-anchor="middle" dominant-baseline="middle">' +
          text +
          '</text>'
        );
      }
    }

    exportRingLabels(outerFramePoints.length ? outerFramePoints : points, false, false);
    if (nestedFrameEnabled && innerFramePoints.length) {
      exportRingLabels(innerFramePoints, false, true);
    }
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function downloadCurrentDesignSvg(fileBaseName, options) {
  var svgString = buildCurrentDesignSvgString(options);
  var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerBlobDownload(blob, fileBaseName + '.svg');
}

function createCurrentDesignSvgBlob(options) {
  var svgString = buildCurrentDesignSvgString(options);
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

function buildStitchingGuideText(fileBaseName, options) {
  options = options || {};
  var includeStitchingHoleNumbers = shouldShowHoleNumbersNow() || options.forceStitchingHoleNumbers === true;

  function getReadableStitchMode(mode) {
    if (mode === 'connect') return 'Multiplication';
    if (mode === 'sequence') return 'Sequence';
    if (mode === 'formula') return 'Expression';
    return 'Addition';
  }

  function getReadableSequenceMode(mode) {
    return sanitizeThreadSequenceMode(mode, 'holes') === 'steps'
      ? 'Interval sequence'
      : 'Hole sequence';
  }

  function getReadableFrameMode(mode) {
    var normalized = sanitizeThreadFrameMode(mode, 'outer');
    if (normalized === 'inner') return 'Inner ring';
    if (normalized === 'bridge') return 'Bridge outer -> inner';
    if (normalized === 'bridge-reverse') return 'Bridge inner -> outer';
    if (normalized === 'bridge-reverse-project') return 'Bridge inner -> outer radial projection';
    return 'Outer ring';
  }

  function formatHoleReference(index, holeCount) {
    if (!nestedFrameEnabled) {
      return String(index + 1);
    }
    if (index >= holeCount) {
      return 'I' + String((index - holeCount) + 1);
    }
    return 'O' + String(index + 1);
  }

  function appendConnections(targetLines, segments, thread) {
    var holeCount = Math.max(1, getCurrentStitchHoleCount());
    var frameMode = sanitizeThreadFrameMode(thread && thread.frameMode, 'outer');
    for (var idx = 0; idx < segments.length; idx++) {
      var fromRef = formatHoleReference(segments[idx][0], holeCount);
      var toRef = formatHoleReference(segments[idx][1], holeCount);
      if (frameMode === 'bridge-reverse-project') {
        toRef += ' (+ radial extensions to outer frame at both ends)';
      }
      targetLines.push('    ' + fromRef + ' -> ' + toRef);
    }
  }

  computePoints();

  var lines = [];
  var now = new Date();
  lines.push('StitchLab manual stitching guide');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Global');
  lines.push('Shape: ' + currentShape);
  lines.push('Holes per frame: ' + holesSlider.value);
  lines.push('Inner frame enabled: ' + (nestedFrameEnabled ? 'yes' : 'no'));
  if (nestedFrameEnabled) {
    lines.push('Inner frame ratio: ' + String(sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)) + ' of outer radius');
    lines.push('Inner frame holes: ' + String(getCurrentInnerStitchHoleCount()));
    lines.push('Total physical holes: ' + String(getCurrentTotalStitchHoleCount()));
  }
  lines.push('Border enabled: ' + (borderEnabled ? 'yes' : 'no'));
  lines.push('Hole numbers visible in export: ' + (includeStitchingHoleNumbers ? 'yes' : 'no'));
  lines.push('Include stitched threads in SVG: ' + (options.includeThreads ? 'yes' : 'no'));
  lines.push('');
  lines.push('Threads');

  for (var p = 0; p < threads.length; p++) {
    var paramThread = threads[p];
    ensureThreadConnectConfig(paramThread);
    lines.push('Thread ' + (p + 1));
    lines.push('  Color: ' + String(paramThread.color));
    lines.push('  Size: ' + String(paramThread.width));
    lines.push('  Stitch mode: ' + getReadableStitchMode(paramThread.jumpMode));
    lines.push('  Frame path: ' + getReadableFrameMode(paramThread.frameMode));
    lines.push('  Start hole: ' + String(parseBoundedInt(paramThread.startHole, 1, Math.max(1, getThreadSourceHoleCount(paramThread)), 1)));
    lines.push('  Add value: ' + String(paramThread.jump));
    if (paramThread.jumpMode === 'connect') {
      lines.push('  Multiply by: ' + String(paramThread.connectMultiplier));
    }
    if (paramThread.jumpMode === 'sequence') {
      lines.push('  Sequence type: ' + getReadableSequenceMode(paramThread.jumpSequenceMode));
      lines.push('  Sequence values: ' + String(paramThread.jumpSequence || ''));
    }
    if (paramThread.jumpMode === 'formula') {
      lines.push('  Expression: ' + String(paramThread.jumpFormula || 'skip'));
    }
  }

  lines.push('');
  lines.push('Preparation');
  if (nestedFrameEnabled) {
    lines.push('1. Manufacture two concentric "' + currentShape + '" frames with matching hole counts.');
    lines.push('2. Outer frame: ' + String(getCurrentStitchHoleCount()) + ' holes, numbered clockwise O1..O' + String(getCurrentStitchHoleCount()) + '.');
    lines.push('3. Inner frame: ' + String(getCurrentInnerStitchHoleCount()) + ' holes at radius ratio ' + String(sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)) + ', numbered clockwise I1..I' + String(getCurrentInnerStitchHoleCount()) + '.');
    lines.push('4. Keep O1 and I1 angularly aligned as shown in the SVG preview.');
    lines.push('5. Use one thread sequence section per listed thread below.');
  } else {
    lines.push('1. Manufacture the board with shape "' + currentShape + '" and ' + String(points.length) + ' numbered holes.');
    lines.push('2. Number holes clockwise as shown in the preview/export from 1 to ' + String(points.length) + '.');
    lines.push('3. Use one thread sequence section per listed thread below.');
  }
  lines.push('');

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    ensureThreadConnectConfig(thread);
    var segments = computeSegments(thread);
    var modeName = getReadableStitchMode(thread.jumpMode);
    lines.push('Thread ' + (i + 1));
    lines.push('  Mode: ' + modeName);
    lines.push('  Color: ' + String(thread.color));
    lines.push('  Width: ' + String(thread.width));
    lines.push('  Frame path: ' + getReadableFrameMode(thread.frameMode));
    lines.push('  Start hole: ' + String(parseBoundedInt(thread.startHole, 1, Math.max(1, getThreadSourceHoleCount(thread)), 1)));

    if (thread.jumpMode === 'connect') {
      lines.push('  Rule: start at Start hole and count forward as i = 1..n, then target = ((start + multiplier * i - 2) mod n) + 1.');
      lines.push('  n is source ring holes (' + String(getThreadSourceHoleCount(thread)) + ').');
      lines.push('  Multiplier: ' + String(thread.connectMultiplier));
      lines.push('  Start value: ' + String(parseBoundedInt(thread.startHole, 1, Math.max(1, getThreadSourceHoleCount(thread)), 1)));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    } else if (thread.jumpMode === 'sequence') {
      if (sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes') === 'steps') {
        lines.push('  Rule: repeat the provided interval sequence from each current hole, wrapping modulo n.');
        lines.push('  Sequence type: Interval sequence');
      } else {
        lines.push('  Rule: stitch each consecutive pair from the provided hole sequence, in order.');
        lines.push('  Stop condition: the first value greater than n ends the sequence (no modulo wrap).');
        lines.push('  Sequence type: Hole sequence');
      }
      lines.push('  Sequence values: ' + String(thread.jumpSequence || ''));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    } else if (thread.jumpMode === 'formula') {
      lines.push('  Rule: evaluate expression per step, then connect current -> (current + step) mod n.');
      lines.push('  Expression: ' + String(thread.jumpFormula || 'skip'));
      lines.push('  Base add value: ' + String(thread.jump));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    } else {
      lines.push('  Rule: next = ((current + add - 1) mod n) + 1.');
      lines.push('  n is source ring holes (' + String(getThreadSourceHoleCount(thread)) + ').');
      lines.push('  Add value: ' + String(thread.jump));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    }

    lines.push('');
  }

  lines.push('Notes');
  if (nestedFrameEnabled) {
    lines.push('- Connection labels use O# for outer and I# for inner frame references.');
    lines.push('- Keep both frames centered and aligned during fabrication for accurate stitching.');
  }
  lines.push('- If threads are hidden in the exported SVG, use this guide for reconstruction.');
  lines.push('- Keep consistent thread tension to match the on-screen reference closely.');

  return lines.join('\n');
}

function buildTriangulaGuideText(fileBaseName, options) {
  options = options || {};
  var now = new Date();
  var startDepth = triangulaCountToDepth(triangulaStartCount);
  var targetDepth = triangulaCountToDepth(triangulaTargetCount);
  var lines = [];

  lines.push('StitchLab Triangula instructions');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Experience: Triangula');
  lines.push('Construction mode: ' + triangulaConstructionMode);
  lines.push('Fractal mode: ' + triangulaFractalMode);
  lines.push('Canvas fit mode: ' + triangulaFitMode);
  lines.push('Color mode: ' + triangulaColorMode);
  lines.push('Start triangles: ' + String(triangulaStartCount) + ' (depth ' + String(startDepth) + ')');
  lines.push('Target triangles: ' + String(triangulaTargetCount) + ' (depth ' + String(targetDepth) + ')');
  lines.push('Band 1 color: ' + String(triangulaBandColors.band1));
  lines.push('Band 2 color: ' + String(triangulaBandColors.band2));
  lines.push('Band 4 color: ' + String(triangulaBandColors.band4));
  lines.push('Rainbow source color: ' + String(triangulaSourceColor || triangulaBandColors.band1));
  lines.push('');
  lines.push('Reconstruction');
  lines.push('1. Open Triangula in StitchLab.');
  lines.push('2. Set mode, color mode, and start/target values to match parameters above.');
  lines.push('3. Apply band/rainbow colors as listed above.');
  lines.push('4. Exported SVG captures the fully completed target-state triangle composition with colors.');
  lines.push('');
  lines.push('Notes');
  lines.push('- Triangula exports intentionally skip preview PNG files.');
  lines.push('- Include instructions controls whether this file is exported.');

  return lines.join('\n');
}

function buildSquarusGuideText(fileBaseName, options) {
  options = options || {};
  var now = new Date();
  var catalogPieces = getSquarusPolyominoes(squarusOrder);
  var totalPieces = getSquarusTotalPiecesForOrder(squarusOrder);
  var orderedPieces = getSquarusSequencedPieces(squarusOrder, squarusSequenceSeed);
  var colorSequence = getSquarusPieceColorSequence(Math.max(1, orderedPieces.length));
  var visibleCount = getSquarusVisiblePieceCount(totalPieces);
  var signatureToPieceNumber = Object.create(null);
  var orderedPieceNumbers = [];
  var linesForConnections = [];
  var lines = [];

  for (var c = 0; c < catalogPieces.length; c++) {
    if (catalogPieces[c] && catalogPieces[c].signature) {
      signatureToPieceNumber[catalogPieces[c].signature] = c + 1;
    }
  }

  for (var o = 0; o < orderedPieces.length; o++) {
    var sig = orderedPieces[o] && orderedPieces[o].signature ? orderedPieces[o].signature : '';
    orderedPieceNumbers.push(signatureToPieceNumber[sig] || (o + 1));
  }

  var visiblePieceNumbers = orderedPieceNumbers.slice(0, Math.max(0, visibleCount));
  for (var step = 1; step < visiblePieceNumbers.length; step++) {
    linesForConnections.push('  Step ' + String(step) + ': P' + String(visiblePieceNumbers[step - 1]) + ' -> P' + String(visiblePieceNumbers[step]));
  }

  lines.push('StitchLab Squarus instructions');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Experience: Squarus');
  lines.push('Squares order: ' + String(squarusOrder));
  lines.push('Polyomino set size: ' + String(totalPieces));
  lines.push('Layout formula: ' + String(squarusLayout));
  lines.push('Animation mode: ' + String(squarusAnimationMode));
  lines.push('Contact mode: ' + String(squarusContactMode));
  lines.push('Piece order seed: ' + String(squarusSequenceSeed));
  lines.push('Pieces placed: ' + String(visibleCount) + ' / ' + String(totalPieces));
  lines.push('Include preview PNG: ' + (options.includePreview ? 'yes' : 'no'));
  lines.push('SVG piece IDs are enumerated left-to-right as P1..P' + String(totalPieces) + '.');
  lines.push('');
  lines.push('Export outputs');
  lines.push('1. SVG: linear, evenly spaced cut sheet of the selected-order polyomino set (outline-only pieces for printing/cutting).');
  lines.push('2. PNG: on-canvas Squarus arrangement using active parameters and colors.');
  lines.push('3. This instructions file: parameter snapshot and assembly notes.');
  lines.push('');
  lines.push('Assembly notes');
  lines.push('1. Print the SVG at 100% scale to keep all pieces dimensionally consistent.');
  lines.push('2. Cut each outlined polyomino as an individual piece.');
  lines.push('3. Use the PNG preview as the reference arrangement for the selected layout formula and piece order.');
  lines.push('4. Deterministic piece placement order by SVG piece ID (full sequence): ' + orderedPieceNumbers.map(function(id) { return 'P' + String(id); }).join(' -> '));
  if (visiblePieceNumbers.length > 1) {
    lines.push('5. Piece connection order for current Pieces Placed setting:');
    for (var li = 0; li < linesForConnections.length; li++) {
      lines.push(linesForConnections[li]);
    }
  } else if (visiblePieceNumbers.length === 1) {
    lines.push('5. Piece connection order for current Pieces Placed setting: only P' + String(visiblePieceNumbers[0]) + ' is placed.');
  } else {
    lines.push('5. Piece connection order for current Pieces Placed setting: no pieces currently placed.');
  }
  lines.push('6. Color sequence preview (piece order): ' + colorSequence.join(', '));

  return lines.join('\n');
}

function getExportGuideFileName(fileBaseName) {
  if (currentExperienceId === 'triangula') {
    return fileBaseName + '-triangula-instructions.txt';
  }
  if (currentExperienceId === 'squarus') {
    return fileBaseName + '-squarus-instructions.txt';
  }
  return fileBaseName + '-stitching-guide.txt';
}

function buildExportGuideText(fileBaseName, options) {
  if (currentExperienceId === 'triangula') {
    return buildTriangulaGuideText(fileBaseName, options || {});
  }
  if (currentExperienceId === 'squarus') {
    return buildSquarusGuideText(fileBaseName, options || {});
  }
  return buildStitchingGuideText(fileBaseName, options || {});
}

function downloadStitchingGuide(fileBaseName, options) {
  var text = buildExportGuideText(fileBaseName, options || {});
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  triggerBlobDownload(blob, getExportGuideFileName(fileBaseName));
}

function createStitchingGuideBlob(fileBaseName, options) {
  var text = buildExportGuideText(fileBaseName, options || {});
  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}

function downloadPreviewImage(fileBaseName, options) {
  options = options || {};
  var appendPreviewSuffix = options.appendPreviewSuffix !== false;
  capturePreviewImageBlob(function(blob) {
    if (!blob) return;
    var fileName = appendPreviewSuffix ? (fileBaseName + '-preview.png') : (fileBaseName + '.png');
    triggerBlobDownload(blob, fileName);
  });
}

function createPreviewImageBlob() {
  return new Promise(function(resolve) {
    capturePreviewImageBlob(function(blob) {
      resolve(blob || null);
    });
  });
}

function capturePreviewImageBlob(callback) {
  var canvas = document.getElementById('myCanvas');
  if (!canvas || typeof canvas.toBlob !== 'function') {
    callback(null);
    return;
  }

  var previousForcedExportColors = forceExportRenderColors;
  forceExportRenderColors = true;
  redrawAnimationInPlace();

  canvas.toBlob(function(blob) {
    forceExportRenderColors = previousForcedExportColors;
    redrawAnimationInPlace();
    callback(blob || null);
  }, 'image/png');
}

async function downloadExportZipBundle(fileBaseName, options) {
  var zip = new JSZip();
  zip.file(fileBaseName + '.svg', createCurrentDesignSvgBlob(options));

  if (options.includeGuide) {
    zip.file(getExportGuideFileName(fileBaseName), createStitchingGuideBlob(fileBaseName, options));
  }

  if (options.includePreview) {
    var previewBlob = await createPreviewImageBlob();
    if (previewBlob) {
      zip.file(fileBaseName + '-preview.png', previewBlob);
    }
  }

  var zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(zipBlob, fileBaseName + '.zip');
}

