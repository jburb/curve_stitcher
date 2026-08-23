function squarusCellKey(x, y) {
  return String(x) + ',' + String(y);
}

function squarusNormalizeCells(cells) {
  var minX = Infinity;
  var minY = Infinity;
  for (var i = 0; i < cells.length; i++) {
    minX = Math.min(minX, cells[i][0]);
    minY = Math.min(minY, cells[i][1]);
  }
  var normalized = [];
  for (var j = 0; j < cells.length; j++) {
    normalized.push([cells[j][0] - minX, cells[j][1] - minY]);
  }
  normalized.sort(function(a, b) {
    if (a[1] === b[1]) return a[0] - b[0];
    return a[1] - b[1];
  });
  return normalized;
}

function squarusCellsSignature(cells) {
  var parts = [];
  for (var i = 0; i < cells.length; i++) {
    parts.push(String(cells[i][0]) + ',' + String(cells[i][1]));
  }
  return parts.join(';');
}

function squarusTransformCells(cells, transformIndex) {
  var transformed = [];
  for (var i = 0; i < cells.length; i++) {
    var x = cells[i][0];
    var y = cells[i][1];
    var tx = x;
    var ty = y;
    if (transformIndex === 0) { tx = x; ty = y; }
    if (transformIndex === 1) { tx = -y; ty = x; }
    if (transformIndex === 2) { tx = -x; ty = -y; }
    if (transformIndex === 3) { tx = y; ty = -x; }
    if (transformIndex === 4) { tx = -x; ty = y; }
    if (transformIndex === 5) { tx = y; ty = x; }
    if (transformIndex === 6) { tx = x; ty = -y; }
    if (transformIndex === 7) { tx = -y; ty = -x; }
    transformed.push([tx, ty]);
  }
  return squarusNormalizeCells(transformed);
}

function squarusCanonicalizeCells(cells) {
  var bestSig = null;
  var bestCells = null;
  for (var i = 0; i < 8; i++) {
    var transformed = squarusTransformCells(cells, i);
    var sig = squarusCellsSignature(transformed);
    if (bestSig === null || sig < bestSig) {
      bestSig = sig;
      bestCells = transformed;
    }
  }
  return { signature: bestSig, cells: bestCells };
}

function squarusHasHole(cells) {
  var occupied = Object.create(null);
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;

  for (var i = 0; i < cells.length; i++) {
    var x = cells[i][0];
    var y = cells[i][1];
    occupied[squarusCellKey(x, y)] = true;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  var startX = minX - 1;
  var startY = minY - 1;
  var endX = maxX + 1;
  var endY = maxY + 1;
  var queue = [[startX, startY]];
  var seen = Object.create(null);
  seen[squarusCellKey(startX, startY)] = true;
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    var point = queue.shift();
    for (var d = 0; d < dirs.length; d++) {
      var nx = point[0] + dirs[d][0];
      var ny = point[1] + dirs[d][1];
      if (nx < startX || nx > endX || ny < startY || ny > endY) continue;
      var key = squarusCellKey(nx, ny);
      if (seen[key] || occupied[key]) continue;
      seen[key] = true;
      queue.push([nx, ny]);
    }
  }

  for (var y = minY; y <= maxY; y++) {
    for (var x = minX; x <= maxX; x++) {
      var k = squarusCellKey(x, y);
      if (!occupied[k] && !seen[k]) {
        return true;
      }
    }
  }
  return false;
}

function squarusComputePieceMeta(cells, signature) {
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var cx = 0;
  var cy = 0;
  var occupied = Object.create(null);

  for (var i = 0; i < cells.length; i++) {
    var x = cells[i][0];
    var y = cells[i][1];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    cx += x + 0.5;
    cy += y + 0.5;
    occupied[squarusCellKey(x, y)] = true;
  }

  var perimeter = 0;
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (var j = 0; j < cells.length; j++) {
    for (var d = 0; d < dirs.length; d++) {
      var nx = cells[j][0] + dirs[d][0];
      var ny = cells[j][1] + dirs[d][1];
      if (!occupied[squarusCellKey(nx, ny)]) {
        perimeter += 1;
      }
    }
  }

  return {
    signature: signature,
    cells: cells,
    area: cells.length,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    bboxArea: (maxX - minX + 1) * (maxY - minY + 1),
    perimeter: perimeter,
    centroidX: cx / cells.length,
    centroidY: cy / cells.length,
    longAxis: (maxX - minX + 1) >= (maxY - minY + 1) ? 0 : (Math.PI / 2)
  };
}

function getSquarusPolyominoes(order) {
  var safeOrder = parseBoundedInt(order, 1, 6, 4);
  if (squarusPolyominoCache[safeOrder]) {
    return squarusPolyominoCache[safeOrder];
  }

  squarusPolyominoCache[1] = [squarusComputePieceMeta([[0, 0]], '0,0')];

  for (var n = 2; n <= safeOrder; n++) {
    if (squarusPolyominoCache[n]) continue;
    var map = Object.create(null);
    var prev = squarusPolyominoCache[n - 1] || [];
    for (var i = 0; i < prev.length; i++) {
      var piece = prev[i];
      var occupied = Object.create(null);
      for (var c = 0; c < piece.cells.length; c++) {
        occupied[squarusCellKey(piece.cells[c][0], piece.cells[c][1])] = true;
      }

      for (var j = 0; j < piece.cells.length; j++) {
        var x = piece.cells[j][0];
        var y = piece.cells[j][1];
        var neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (var k = 0; k < neighbors.length; k++) {
          var nx = neighbors[k][0];
          var ny = neighbors[k][1];
          if (occupied[squarusCellKey(nx, ny)]) continue;
          var candidate = piece.cells.slice();
          candidate.push([nx, ny]);
          if (squarusHasHole(candidate)) continue;
          var canonical = squarusCanonicalizeCells(candidate);
          if (!map[canonical.signature]) {
            map[canonical.signature] = squarusComputePieceMeta(canonical.cells, canonical.signature);
          }
        }
      }
    }

    var list = Object.keys(map).map(function(sig) { return map[sig]; });
    list.sort(function(a, b) {
      if (a.perimeter === b.perimeter) {
        return a.signature < b.signature ? -1 : 1;
      }
      return a.perimeter - b.perimeter;
    });
    squarusPolyominoCache[n] = list;
  }

  return squarusPolyominoCache[safeOrder] || [];
}

function createSquarusSeededRandom(seed) {
  var state = (seed >>> 0) || 1;
  return function() {
    state = (state + 0x6D2B79F5) >>> 0;
    var t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function buildSquarusPermutationByIndex(baseList, index) {
  var pool = baseList.slice();
  var result = [];
  var remaining = Math.max(0, Math.floor(index));

  for (var n = pool.length; n > 0; n--) {
    var blockSize = 1;
    for (var i = 2; i < n; i++) {
      blockSize *= i;
    }
    var pick = blockSize > 0 ? Math.floor(remaining / blockSize) : 0;
    if (pick < 0) pick = 0;
    if (pick >= pool.length) pick = pool.length - 1;
    result.push(pool.splice(pick, 1)[0]);
    remaining = blockSize > 0 ? (remaining % blockSize) : 0;
  }

  return result;
}

function getSquarusSequencedPieces(order, sequenceSeed) {
  var safeOrder = parseBoundedInt(order, 1, 6, squarusOrder);
  var base = getSquarusPolyominoes(safeOrder);
  var list = base.slice();
  var seed = normalizeSquarusSequenceSeed(sequenceSeed, 0, safeOrder);
  if (list.length <= 1) return list;

  if (safeOrder <= 4) {
    return buildSquarusPermutationByIndex(list, seed);
  }

  if (seed <= 0 || list.length <= 1) return list;

  var rng = createSquarusSeededRandom(seed);
  for (var i = list.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

function squarusHilbertD2XY(side, index) {
  var t = index;
  var x = 0;
  var y = 0;
  for (var s = 1; s < side; s *= 2) {
    var rx = 1 & Math.floor(t / 2);
    var ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      var temp = x;
      x = y;
      y = temp;
    }
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return { x: x, y: y };
}

function squarusHexToRgb(color) {
  var value = String(color || '').trim();
  var match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return { r: 90, g: 75, b: 178 };
  var hex = match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function squarusRgbToHex(r, g, b) {
  function channelHex(value) {
    var safe = Math.max(0, Math.min(255, Math.round(value)));
    var hex = safe.toString(16);
    return hex.length === 1 ? ('0' + hex) : hex;
  }
  return '#' + channelHex(r) + channelHex(g) + channelHex(b);
}

function squarusBlendHexColor(colorA, colorB, t) {
  var a = squarusHexToRgb(colorA);
  var b = squarusHexToRgb(colorB);
  var blend = Math.max(0, Math.min(1, Number(t) || 0));
  return squarusRgbToHex(
    a.r + ((b.r - a.r) * blend),
    a.g + ((b.g - a.g) * blend),
    a.b + ((b.b - a.b) * blend)
  );
}

function squarusGreatestCommonDivisor(a, b) {
  var x = Math.abs(Math.floor(a));
  var y = Math.abs(Math.floor(b));
  while (y !== 0) {
    var temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function squarusReorderColorsForContrast(colors) {
  var count = colors.length;
  if (count <= 2) return colors.slice();

  // Walk the same set of generated colors with a large coprime step so
  // consecutive pieces are assigned farther-apart gradient positions.
  var step = Math.floor(count / 2) + 1;
  while (squarusGreatestCommonDivisor(step, count) !== 1) {
    step += 1;
  }

  var reordered = [];
  var index = 0;
  for (var i = 0; i < count; i++) {
    reordered.push(colors[index]);
    index = (index + step) % count;
  }
  return reordered;
}

function squarusApplyShade(color, shadeAmount) {
  var amount = Math.max(-1, Math.min(1, Number(shadeAmount) || 0));
  if (amount > 0) {
    return squarusBlendHexColor(color, '#ffffff', amount);
  }
  if (amount < 0) {
    return squarusBlendHexColor(color, '#000000', Math.abs(amount));
  }
  return color;
}

function getSquarusPieceColorSequence(total) {
  var count = Math.max(0, Math.floor(total || 0));
  var basePalette = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
  if (!count) return [];

  if (count <= basePalette.length) {
    return basePalette.slice(0, count);
  }

  var sequence = [];
  var segmentCount = basePalette.length - 1;
  for (var i = 0; i < count; i++) {
    var t = count <= 1 ? 0 : (i / (count - 1));
    var pos = t * segmentCount;
    var lower = Math.floor(pos);
    var upper = Math.min(basePalette.length - 1, lower + 1);
    var local = pos - lower;
    var color = squarusBlendHexColor(basePalette[lower], basePalette[upper], local);

    if (i > 0 && String(color).toLowerCase() === String(sequence[i - 1]).toLowerCase()) {
      if (upper < basePalette.length - 1) {
        color = squarusBlendHexColor(basePalette[upper], basePalette[upper + 1], 0.16);
      } else {
        color = squarusBlendHexColor(basePalette[Math.max(0, lower - 1)], basePalette[lower], 0.84);
      }
    }

    sequence.push(color);
  }

  return squarusReorderColorsForContrast(sequence);
}

function getSquarusPieceColor(index, total) {
  var sequence = getSquarusPieceColorSequence(total);
  if (!sequence.length) return '#5a4bb2';
  return sequence[Math.abs(Math.floor(index)) % sequence.length];
}

function getSquarusPieceRenderRadius(piece, scale) {
  var farthest = 0;
  var halfDiag = (scale * Math.SQRT2) * 0.5;
  for (var i = 0; i < piece.cells.length; i++) {
    var dx = (piece.cells[i][0] + 0.5) - piece.centroidX;
    var dy = (piece.cells[i][1] + 0.5) - piece.centroidY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > farthest) farthest = dist;
  }
  return farthest * scale + halfDiag;
}

function getSquarusQuarterTurnRotation(turns) {
  var normalized = ((turns % 4) + 4) % 4;
  return normalized * (Math.PI / 2);
}

function getSquarusCellsCentroid(cells) {
  var cx = 0;
  var cy = 0;
  for (var i = 0; i < cells.length; i++) {
    cx += cells[i][0] + 0.5;
    cy += cells[i][1] + 0.5;
  }
  return {
    x: cx / Math.max(1, cells.length),
    y: cy / Math.max(1, cells.length)
  };
}

function buildSquarusPlacedCells(cells, offsetX, offsetY) {
  var placed = [];
  for (var i = 0; i < cells.length; i++) {
    placed.push({ x: cells[i][0] + offsetX, y: cells[i][1] + offsetY });
  }
  return placed;
}

function areSquarusCellsTouching(cellsA, cellsBLookup) {
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (var i = 0; i < cellsA.length; i++) {
    for (var d = 0; d < dirs.length; d++) {
      var neighborKey = squarusCellKey(cellsA[i].x + dirs[d][0], cellsA[i].y + dirs[d][1]);
      if (cellsBLookup[neighborKey]) return true;
    }
  }
  return false;
}

function anySquarusOverlap(cells, occupiedLookup) {
  for (var i = 0; i < cells.length; i++) {
    if (occupiedLookup[squarusCellKey(cells[i].x, cells[i].y)]) return true;
  }
  return false;
}

function applySquarusConnectedTouchConstraint(pieces, targets) {
  if (!pieces || !targets || pieces.length !== targets.length || !pieces.length) return;

  var count = pieces.length;
  var stagedTargets = targets.map(function(target) {
    return {
      x: target.x,
      y: target.y,
      rotation: target.rotation
    };
  });
  var center = view.center;
  var unit = Math.max(1, Number(targets[0] && targets[0].scale) || 1);
  var occupied = Object.create(null);
  var placedPieces = new Array(count);

  function desiredGridForIndex(index) {
    return {
      x: (targets[index].x - center.x) / unit,
      y: (targets[index].y - center.y) / unit
    };
  }

  function rotationPenalty(targetRotation, candidateRotation) {
    var diff = targetRotation - candidateRotation;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) * 0.08;
  }

  for (var index = 0; index < count; index++) {
    var desired = desiredGridForIndex(index);
    var best = null;

    for (var turns = 0; turns < 4; turns++) {
      var rotated = squarusTransformCells(pieces[index].cells, turns);
      var centroid = getSquarusCellsCentroid(rotated);
      var rotation = getSquarusQuarterTurnRotation(turns);

      if (index === 0) {
        var baseOffsetX = Math.round(desired.x - centroid.x);
        var baseOffsetY = Math.round(desired.y - centroid.y);
        var baseCells = buildSquarusPlacedCells(rotated, baseOffsetX, baseOffsetY);
        if (anySquarusOverlap(baseCells, occupied)) continue;
        var baseCx = centroid.x + baseOffsetX;
        var baseCy = centroid.y + baseOffsetY;
        var baseScore = Math.pow(baseCx - desired.x, 2) + Math.pow(baseCy - desired.y, 2) + rotationPenalty(stagedTargets[index].rotation, rotation);
        if (!best || baseScore < best.score) {
          best = {
            score: baseScore,
            cells: baseCells,
            centroidX: baseCx,
            centroidY: baseCy,
            rotation: rotation
          };
        }
        continue;
      }

      var prevLookup = placedPieces[index - 1].lookup;
      var prevCells = placedPieces[index - 1].cells;
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      var seenOffsets = Object.create(null);

      for (var p = 0; p < prevCells.length; p++) {
        for (var d = 0; d < dirs.length; d++) {
          var touchX = prevCells[p].x + dirs[d][0];
          var touchY = prevCells[p].y + dirs[d][1];
          for (var c = 0; c < rotated.length; c++) {
            var offX = touchX - rotated[c][0];
            var offY = touchY - rotated[c][1];
            var offsetKey = String(offX) + ',' + String(offY);
            if (seenOffsets[offsetKey]) continue;
            seenOffsets[offsetKey] = true;

            var candidateCells = buildSquarusPlacedCells(rotated, offX, offY);
            if (anySquarusOverlap(candidateCells, occupied)) continue;
            if (!areSquarusCellsTouching(candidateCells, prevLookup)) continue;

            var candidateCx = centroid.x + offX;
            var candidateCy = centroid.y + offY;
            var score = Math.pow(candidateCx - desired.x, 2) + Math.pow(candidateCy - desired.y, 2) + rotationPenalty(stagedTargets[index].rotation, rotation);
            if (!best || score < best.score) {
              best = {
                score: score,
                cells: candidateCells,
                centroidX: candidateCx,
                centroidY: candidateCy,
                rotation: rotation
              };
            }
          }
        }
      }
    }

    if (!best) {
      return;
    }

    var lookup = Object.create(null);
    for (var add = 0; add < best.cells.length; add++) {
      var key = squarusCellKey(best.cells[add].x, best.cells[add].y);
      occupied[key] = true;
      lookup[key] = true;
    }

    placedPieces[index] = {
      cells: best.cells,
      lookup: lookup,
      rotation: best.rotation,
      centroidX: best.centroidX,
      centroidY: best.centroidY
    };

    stagedTargets[index].x = center.x + best.centroidX * unit;
    stagedTargets[index].y = center.y + best.centroidY * unit;
    stagedTargets[index].rotation = best.rotation;
  }

  for (var applyIndex = 0; applyIndex < count; applyIndex++) {
    targets[applyIndex].x = stagedTargets[applyIndex].x;
    targets[applyIndex].y = stagedTargets[applyIndex].y;
    targets[applyIndex].rotation = stagedTargets[applyIndex].rotation;
  }
}

function getMaxRadiusAlongAngleFromCenter(angle) {
  var center = view.center;
  var width = view.size.width;
  var height = view.size.height;
  var dx = Math.cos(angle);
  var dy = Math.sin(angle);
  var maxRadius = Infinity;

  if (Math.abs(dx) > 1e-6) {
    var limitX = dx > 0 ? (width - center.x) / dx : (0 - center.x) / dx;
    if (limitX >= 0) maxRadius = Math.min(maxRadius, limitX);
  }

  if (Math.abs(dy) > 1e-6) {
    var limitY = dy > 0 ? (height - center.y) / dy : (0 - center.y) / dy;
    if (limitY >= 0) maxRadius = Math.min(maxRadius, limitY);
  }

  if (!isFinite(maxRadius)) {
    maxRadius = Math.min(width, height) * 0.5;
  }
  return Math.max(0, maxRadius);
}

function applySquarusTargetsFitToCanvas(pieces, targets) {
  if (!pieces || !targets || pieces.length !== targets.length || !targets.length) return;

  var canvasEl = document.getElementById('myCanvas');
  var titleBottomOnCanvas = 0;
  if (canvasEl && experienceInline && typeof canvasEl.getBoundingClientRect === 'function' && typeof experienceInline.getBoundingClientRect === 'function') {
    var canvasRect = canvasEl.getBoundingClientRect();
    var titleRect = experienceInline.getBoundingClientRect();
    titleBottomOnCanvas = Math.max(0, titleRect.bottom - canvasRect.top);
  }

  var center = view.center;
  var padding = 10;
  var safeLeft = padding;
  var safeRight = view.size.width - padding;
  var safeTop = Math.max(padding, titleBottomOnCanvas + 6);
  var safeBottom = view.size.height - padding;
  if (safeBottom <= safeTop + 1) {
    safeTop = padding;
  }

  var fitScale = 1;
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;

  for (var i = 0; i < targets.length; i++) {
    var dx = targets[i].x - center.x;
    var dy = targets[i].y - center.y;
    var radius = getSquarusPieceRenderRadius(pieces[i], targets[i].scale);
    minX = Math.min(minX, targets[i].x - radius);
    maxX = Math.max(maxX, targets[i].x + radius);
    minY = Math.min(minY, targets[i].y - radius);
    maxY = Math.max(maxY, targets[i].y + radius);

    var needX = Math.abs(dx) + radius;
    var needY = Math.abs(dy) + radius;
    if (needX > 1e-6) fitScale = Math.min(fitScale, (view.size.width * 0.5 - padding) / needX);
    if (needY > 1e-6) fitScale = Math.min(fitScale, (view.size.height * 0.5 - padding) / needY);
  }

  var spanX = Math.max(1e-6, maxX - minX);
  var spanY = Math.max(1e-6, maxY - minY);
  fitScale = Math.min(fitScale, Math.max(0.08, (safeRight - safeLeft) / spanX));
  fitScale = Math.min(fitScale, Math.max(0.08, (safeBottom - safeTop) / spanY));

  if (!isFinite(fitScale) || fitScale >= 1) return;
  fitScale = Math.max(0.08, fitScale);

  for (var t = 0; t < targets.length; t++) {
    targets[t].x = center.x + ((targets[t].x - center.x) * fitScale);
    targets[t].y = center.y + ((targets[t].y - center.y) * fitScale);
    targets[t].scale = targets[t].scale * fitScale;
  }

  var postMinY = Infinity;
  var postMaxY = -Infinity;
  for (var p = 0; p < targets.length; p++) {
    var postRadius = getSquarusPieceRenderRadius(pieces[p], targets[p].scale);
    postMinY = Math.min(postMinY, targets[p].y - postRadius);
    postMaxY = Math.max(postMaxY, targets[p].y + postRadius);
  }

  var shiftY = 0;
  if (postMinY < safeTop) shiftY = safeTop - postMinY;
  if ((postMaxY + shiftY) > safeBottom) shiftY = Math.min(shiftY, safeBottom - postMaxY);
  if (Math.abs(shiftY) > 1e-6) {
    for (var s = 0; s < targets.length; s++) {
      targets[s].y += shiftY;
    }
  }
}

function buildSquarusTargets(pieces, layoutKey) {
  var count = pieces.length;
  var center = view.center;
  var minDim = Math.min(view.size.width, view.size.height);
  var points = [];
  var rotations = [];
  var scales = [];
  var defaultScale = minDim / (Math.ceil(Math.sqrt(Math.max(1, count))) + 2.4);

  function finalizeWithSpacing(spacing) {
    var unit = Math.max(7, spacing * 0.62);
    for (var i = 0; i < count; i++) {
      scales[i] = unit;
    }
  }

  if (layoutKey === 'grid-packing') {
    var k = Math.ceil(Math.sqrt(Math.max(1, count)));
    var spacing = minDim / (k + 2.5);
    for (var gi = 0; gi < count; gi++) {
      var row = Math.floor(gi / k);
      var col = gi % k;
      points.push({
        x: center.x + (col - ((k - 1) / 2)) * spacing,
        y: center.y + (row - ((k - 1) / 2)) * spacing
      });
    }
    finalizeWithSpacing(spacing);
  } else if (layoutKey === 'hilbert-curve') {
    var side = 1;
    while (side * side < count) side *= 2;
    var spacingHilbert = minDim / (side + 2.5);
    for (var hi = 0; hi < count; hi++) {
      var hp = squarusHilbertD2XY(side, hi);
      points.push({
        x: center.x + (hp.x - ((side - 1) / 2)) * spacingHilbert,
        y: center.y + (hp.y - ((side - 1) / 2)) * spacingHilbert
      });
    }
    for (var hr = 0; hr < count; hr++) {
      var prev = points[Math.max(0, hr - 1)];
      var next = points[Math.min(count - 1, hr + 1)];
      rotations[hr] = Math.atan2(next.y - prev.y, next.x - prev.x);
    }
    finalizeWithSpacing(spacingHilbert);
  } else if (layoutKey === 'symmetry-d4') {
    var ringSpacing = minDim * 0.12;
    for (var di = 0; di < count; di++) {
      var ring = Math.floor(di / 8);
      var slot = di % 8;
      var radius = ringSpacing * (ring + 1);
      var angle = (Math.PI / 4) * slot;
      points.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      });
      rotations[di] = (slot % 4) * (Math.PI / 2);
    }
    finalizeWithSpacing(ringSpacing * 0.9);
  } else if (layoutKey === 'spiral-packing') {
    var spiralStep = minDim * 0.05;
    for (var sp = 0; sp < count; sp++) {
      var theta = sp * 0.68;
      var radiusSpiral = spiralStep * Math.sqrt(sp + 1);
      points.push({
        x: center.x + Math.cos(theta) * radiusSpiral,
        y: center.y + Math.sin(theta) * radiusSpiral
      });
      rotations[sp] = theta + (Math.PI / 2);
    }
    finalizeWithSpacing(spiralStep * 2.1);
  } else if (layoutKey === 'circle-packing') {
    var packed = [];
    for (var cp = 0; cp < count; cp++) {
      var rad = 0.7 + (Math.sqrt(pieces[cp].width * pieces[cp].width + pieces[cp].height * pieces[cp].height) * 0.28);
      var best = null;
      for (var ringTry = 0; ringTry < 28 && !best; ringTry++) {
        var ringRadius = ringTry * 0.95;
        for (var a = 0; a < 36; a++) {
          var ang = (Math.PI * 2 * a) / 36;
          var px = Math.cos(ang) * ringRadius;
          var py = Math.sin(ang) * ringRadius;
          var ok = true;
          for (var o = 0; o < packed.length; o++) {
            var dx = px - packed[o].x;
            var dy = py - packed[o].y;
            var minDist = rad + packed[o].r + 0.25;
            if ((dx * dx + dy * dy) < (minDist * minDist)) {
              ok = false;
              break;
            }
          }
          if (ok) {
            best = { x: px, y: py, r: rad, angle: ang };
            break;
          }
        }
      }
      if (!best) best = { x: cp * 0.8, y: 0, r: rad, angle: 0 };
      packed.push(best);
      points.push({ x: center.x + best.x * defaultScale * 0.9, y: center.y + best.y * defaultScale * 0.9 });
    }
    for (var cr = 0; cr < count; cr++) {
      rotations[cr] = 0;
      scales[cr] = Math.max(7, defaultScale * 0.58);
    }
  } else if (layoutKey === 'radial-tree') {
    var clusters = Object.create(null);
    for (var rt = 0; rt < count; rt++) {
      var clusterKey = String(pieces[rt].width) + 'x' + String(pieces[rt].height);
      if (!clusters[clusterKey]) clusters[clusterKey] = [];
      clusters[clusterKey].push(rt);
    }
    var keys = Object.keys(clusters).sort();
    var clusterRadius = minDim * 0.16;
    for (var ck = 0; ck < keys.length; ck++) {
      var indices = clusters[keys[ck]];
      var baseAngle = (Math.PI * 2 * ck) / keys.length;
      var cx = center.x + Math.cos(baseAngle) * clusterRadius;
      var cy = center.y + Math.sin(baseAngle) * clusterRadius;
      for (var ci = 0; ci < indices.length; ci++) {
        var leafAngle = baseAngle + ((ci - ((indices.length - 1) / 2)) * 0.38);
        var leafRadius = minDim * 0.06 * (1 + Math.floor(ci / 4));
        points[indices[ci]] = {
          x: cx + Math.cos(leafAngle) * leafRadius,
          y: cy + Math.sin(leafAngle) * leafRadius
        };
        rotations[indices[ci]] = leafAngle;
      }
    }
    finalizeWithSpacing(minDim * 0.09);
  } else {
    var forcePoints = [];
    for (var f = 0; f < count; f++) {
      var ang0 = (Math.PI * 2 * f) / Math.max(1, count);
      forcePoints.push({ x: Math.cos(ang0), y: Math.sin(ang0), vx: 0, vy: 0 });
    }
    for (var iter = 0; iter < 110; iter++) {
      for (var a1 = 0; a1 < count; a1++) {
        var fx = -forcePoints[a1].x * 0.02;
        var fy = -forcePoints[a1].y * 0.02;
        for (var b1 = 0; b1 < count; b1++) {
          if (a1 === b1) continue;
          var dx1 = forcePoints[a1].x - forcePoints[b1].x;
          var dy1 = forcePoints[a1].y - forcePoints[b1].y;
          var dist2 = Math.max(0.0025, dx1 * dx1 + dy1 * dy1);
          var rep = 0.004 / dist2;
          fx += (dx1 / Math.sqrt(dist2)) * rep;
          fy += (dy1 / Math.sqrt(dist2)) * rep;
        }
        forcePoints[a1].vx = (forcePoints[a1].vx + fx) * 0.92;
        forcePoints[a1].vy = (forcePoints[a1].vy + fy) * 0.92;
      }
      for (var u = 0; u < count; u++) {
        forcePoints[u].x += forcePoints[u].vx;
        forcePoints[u].y += forcePoints[u].vy;
      }
    }
    var maxAbs = 0.001;
    for (var fm = 0; fm < count; fm++) {
      maxAbs = Math.max(maxAbs, Math.abs(forcePoints[fm].x), Math.abs(forcePoints[fm].y));
    }
    var forceScale = (minDim * 0.36) / maxAbs;
    for (var fi = 0; fi < count; fi++) {
      points.push({
        x: center.x + forcePoints[fi].x * forceScale,
        y: center.y + forcePoints[fi].y * forceScale
      });
      rotations[fi] = 0;
      scales[fi] = Math.max(7, defaultScale * 0.58);
    }
  }

  var colorSequence = getSquarusPieceColorSequence(count);
  var targets = [];
  for (var t = 0; t < count; t++) {
    var baseScale = Math.max(7, scales[t] || (defaultScale * 0.58));
    targets.push({
      x: points[t].x,
      y: points[t].y,
      rotation: isFinite(rotations[t]) ? rotations[t] : pieces[t].longAxis,
      scale: Math.max(6, baseScale * SQUARUS_PIECE_SCALE_FACTOR),
      color: colorSequence[t] || getSquarusPieceColor(t, count)
    });
  }

  if (squarusContactMode === 'connected-touch') {
    applySquarusConnectedTouchConstraint(pieces, targets);
  }

  applySquarusTargetsFitToCanvas(pieces, targets);

  return targets;
}

function drawSquarusGuide(layoutKey, targets, opacity) {
  var o = clamp01(opacity);
  if (o <= 0 || !targets || !targets.length) return;

  if (layoutKey === 'grid-packing' || layoutKey === 'hilbert-curve') {
    for (var i = 1; i < targets.length; i++) {
      var path = new Path();
      path.strokeColor = toRgbaColor('#8ea4b0', 0.12 * o);
      path.strokeWidth = 1;
      path.add(new Point(targets[i - 1].x, targets[i - 1].y));
      path.add(new Point(targets[i].x, targets[i].y));
    }
    return;
  }

  var center = view.center;
  for (var j = 0; j < targets.length; j++) {
    var spoke = new Path();
    spoke.strokeColor = toRgbaColor('#8ea4b0', 0.12 * o);
    spoke.strokeWidth = 1;
    spoke.add(center);
    spoke.add(new Point(targets[j].x, targets[j].y));
  }
}

function drawSquarusPiece(piece, x, y, scale, rotation, color, opacity, sharedEdgeMap, pieceIndex) {
  var cosR = Math.cos(rotation);
  var sinR = Math.sin(rotation);
  var edgeMap = Object.create(null);
  var outerStrokeWidth = Math.max(0.9, scale * 0.06);
  var innerStrokeWidth = Math.max(0.45, outerStrokeWidth * 0.58);

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

  function addEdge(x1, y1, x2, y2) {
    var key = edgeKey(x1, y1, x2, y2);
    if (!edgeMap[key]) {
      edgeMap[key] = { x1: x1, y1: y1, x2: x2, y2: y2, count: 0 };
    }
    edgeMap[key].count += 1;
  }

  function toWorldPoint(gridX, gridY) {
    var localX = (gridX - piece.centroidX) * scale;
    var localY = (gridY - piece.centroidY) * scale;
    return new Point(
      x + (localX * cosR - localY * sinR),
      y + (localX * sinR + localY * cosR)
    );
  }

  function worldEdgeKey(p1, p2) {
    var a = { x: p1.x, y: p1.y };
    var b = { x: p2.x, y: p2.y };
    if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
      var temp = a;
      a = b;
      b = temp;
    }
    return a.x.toFixed(4) + ',' + a.y.toFixed(4) + '|' + b.x.toFixed(4) + ',' + b.y.toFixed(4);
  }

  for (var i = 0; i < piece.cells.length; i++) {
    var cellX = piece.cells[i][0];
    var cellY = piece.cells[i][1];
    var corners = [
      { x: cellX, y: cellY },
      { x: cellX + 1, y: cellY },
      { x: cellX + 1, y: cellY + 1 },
      { x: cellX, y: cellY + 1 }
    ];

    var rect = new Path();
    rect.closed = true;
    for (var c = 0; c < corners.length; c++) {
      rect.add(toWorldPoint(corners[c].x, corners[c].y));
    }

    rect.fillColor = color;
    rect.opacity = opacity;

    addEdge(cellX, cellY, cellX + 1, cellY);
    addEdge(cellX + 1, cellY, cellX + 1, cellY + 1);
    addEdge(cellX + 1, cellY + 1, cellX, cellY + 1);
    addEdge(cellX, cellY + 1, cellX, cellY);
  }

  var edgeKeys = Object.keys(edgeMap);
  for (var e = 0; e < edgeKeys.length; e++) {
    var edge = edgeMap[edgeKeys[e]];
    var p1 = toWorldPoint(edge.x1, edge.y1);
    var p2 = toWorldPoint(edge.x2, edge.y2);
    var width = edge.count > 1 ? innerStrokeWidth : outerStrokeWidth;

    if (sharedEdgeMap) {
      var sharedKey = worldEdgeKey(p1, p2);
      if (!sharedEdgeMap[sharedKey]) {
        sharedEdgeMap[sharedKey] = {
          p1: p1,
          p2: p2,
          count: 0,
          owners: Object.create(null),
          innerStrokeWidth: innerStrokeWidth,
          outerStrokeWidth: outerStrokeWidth,
          opacity: opacity
        };
      }
      sharedEdgeMap[sharedKey].count += edge.count;
      if (isFinite(pieceIndex)) {
        sharedEdgeMap[sharedKey].owners[pieceIndex] = true;
      }
      sharedEdgeMap[sharedKey].innerStrokeWidth = Math.max(sharedEdgeMap[sharedKey].innerStrokeWidth, innerStrokeWidth);
      sharedEdgeMap[sharedKey].outerStrokeWidth = Math.max(sharedEdgeMap[sharedKey].outerStrokeWidth, outerStrokeWidth);
      sharedEdgeMap[sharedKey].opacity = Math.max(sharedEdgeMap[sharedKey].opacity, opacity);
      continue;
    }

    var line = new Path();
    line.add(p1);
    line.add(p2);
    line.strokeColor = '#000000';
    line.strokeWidth = width;
    line.strokeCap = 'butt';
    line.opacity = opacity;
  }
}

function drawSquarusSharedEdges(sharedEdgeMap) {
  if (!sharedEdgeMap) return;
  var keys = Object.keys(sharedEdgeMap);
  for (var i = 0; i < keys.length; i++) {
    var edge = sharedEdgeMap[keys[i]];
    var ownerCount = 0;
    for (var owner in edge.owners) {
      if (edge.owners[owner]) ownerCount += 1;
    }

    var isInterPieceSharedEdge = ownerCount > 1;
    var isInternalCellEdge = ownerCount <= 1 && edge.count > 1;
    var strokeWidth = isInternalCellEdge ? edge.innerStrokeWidth : edge.outerStrokeWidth;
    if (isInterPieceSharedEdge) {
      strokeWidth = edge.outerStrokeWidth * 1.08;
    }

    var line = new Path();
    line.add(edge.p1);
    line.add(edge.p2);
    line.strokeColor = '#000000';
    line.strokeWidth = strokeWidth;
    line.strokeCap = 'butt';
    line.opacity = edge.opacity;
  }
}

function getSquarusAnimationDurations() {
  var base = {
    scatter: 0.7,
    reveal: 0.0,
    travel: 2.0,
    snap: 0.5,
    fade: 0.5
  };

  var defaultSeconds = (60 / DEFAULT_ANIMATION_BPM) * BEATS_PER_STITCH_SEGMENT;
  var currentSeconds = getAnimationSecondsPerSegment();
  var scale = currentSeconds / Math.max(0.001, defaultSeconds);

  return {
    scatter: base.scatter * scale,
    reveal: base.reveal * scale,
    travel: base.travel * scale,
    snap: base.snap * scale,
    fade: base.fade * scale
  };
}

function getSquarusVisiblePieceCount(totalCount) {
  return normalizeSquarusPieceCount(squarusPieceCount, totalCount, squarusOrder);
}

function buildSquarusAnimationState() {
  var allPieces = getSquarusSequencedPieces(squarusOrder, squarusSequenceSeed);
  var allTargets = buildSquarusTargets(allPieces, squarusLayout);
  var placedCount = getSquarusVisiblePieceCount(allPieces.length);
  var minDim = Math.min(view.size.width, view.size.height);
  var center = view.center;
  var items = [];

  for (var i = 0; i < allPieces.length; i++) {
    var seedAngle = i * (Math.PI * (3 - Math.sqrt(5)));
    var desiredScatterRadius = minDim * (0.52 + ((i % 5) * 0.035));
    var pieceRadius = getSquarusPieceRenderRadius(allPieces[i], allTargets[i].scale);
    var orbitAllowance = (SQUARUS_SCATTER_WOBBLE_AMPLITUDE * allTargets[i].scale) + 2;
    var edgeAllowance = pieceRadius + orbitAllowance + SQUARUS_SCATTER_EDGE_PADDING;
    var maxRadius = getMaxRadiusAlongAngleFromCenter(seedAngle) - edgeAllowance;
    var scatterRadius = Math.max(0, Math.min(desiredScatterRadius, maxRadius));
    items.push({
      piece: allPieces[i],
      target: allTargets[i],
      scatterX: center.x + Math.cos(seedAngle) * scatterRadius,
      scatterY: center.y + Math.sin(seedAngle) * scatterRadius,
      scatterRotation: seedAngle + (Math.PI * 0.5)
    });
  }

  return {
    order: squarusOrder,
    layout: squarusLayout,
    mode: squarusAnimationMode,
    placedCount: placedCount,
    elapsed: 0,
    durations: getSquarusAnimationDurations(),
    items: items,
    targets: allTargets
  };
}

function getSquarusEntryFadeOpacity() {
  if (!squarusEntryFadeActive) return 1;
  var nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var elapsedMs = Math.max(0, nowMs - squarusEntryFadeStartMs);
  var t = clamp01(elapsedMs / Math.max(1, SQUARUS_ENTRY_FADE_MS));
  var eased = t * t * (3 - (2 * t));
  if (t >= 1) {
    squarusEntryFadeActive = false;
    return 1;
  }
  return eased;
}

function scheduleSquarusEntryFadeRedraw() {
  if (squarusEntryFadeRafPending || !squarusEntryFadeActive) return;
  squarusEntryFadeRafPending = true;
  requestAnimationFrame(function() {
    squarusEntryFadeRafPending = false;
    if (!squarusEntryFadeActive || currentExperienceId !== 'squarus') {
      squarusEntryFadeActive = false;
      return;
    }
    if (animationActive && squarusAnimationState) {
      return;
    }
    drawSquarusStatic();
  });
}

function renderSquarusAnimationStateFrame(state, opacityScale) {
  if (!state) return;
  var sceneOpacityScale = clamp01(isFinite(opacityScale) ? opacityScale : 1);
  var d = getSquarusAnimationDurations();
  state.durations = d;
  var t = state.elapsed;
  var pieceMotionDuration = d.scatter + d.reveal + d.travel + d.snap;
  var isSequential = state.mode === 'sequential';
  var timelineCoreEnd = state.placedCount > 0
    ? (isSequential ? (pieceMotionDuration * state.placedCount) : pieceMotionDuration)
    : 0;
  var tEnd = timelineCoreEnd + d.fade;

  project.activeLayer.removeChildren();

  var guideOpacity = 0;
  if (t >= d.scatter && t < (d.scatter + d.reveal)) {
    guideOpacity = (t - d.scatter) / d.reveal;
  } else if (t >= (d.scatter + d.reveal) && t < timelineCoreEnd) {
    guideOpacity = 1;
  } else if (t >= timelineCoreEnd) {
    guideOpacity = 1 - clamp01((t - timelineCoreEnd) / d.fade);
  }
  drawSquarusGuide(state.layout, state.targets.slice(0, state.placedCount), guideOpacity * sceneOpacityScale);
  var sharedEdgeMap = Object.create(null);

  for (var i = 0; i < state.items.length; i++) {
    var item = state.items[i];
    var isPlacedPiece = i < state.placedCount;
    var localT = isSequential ? (t - (i * pieceMotionDuration)) : t;
    var x = item.scatterX;
    var y = item.scatterY;
    var rotation = item.scatterRotation;
    var scale = item.target.scale;
    var opacity = 0.94 * sceneOpacityScale;

    if (!isPlacedPiece) {
      drawSquarusPiece(item.piece, x, y, scale, rotation, item.target.color, opacity, sharedEdgeMap, i);
      continue;
    }

    if (localT <= 0) {
      drawSquarusPiece(item.piece, x, y, scale, rotation, item.target.color, opacity, sharedEdgeMap, i);
      continue;
    }

    if (localT < d.scatter) {
      x = item.scatterX;
      y = item.scatterY;
    } else if (localT < (d.scatter + d.reveal + d.travel)) {
      var travelP = easeInOutCubic(clamp01((localT - d.scatter - d.reveal) / d.travel));
      x = item.scatterX + (item.target.x - item.scatterX) * travelP;
      y = item.scatterY + (item.target.y - item.scatterY) * travelP;
      rotation = interpolateAngleShortest(item.scatterRotation, item.target.rotation, travelP);
    } else if (localT < pieceMotionDuration) {
      x = item.target.x;
      y = item.target.y;
      rotation = item.target.rotation;
    } else {
      x = item.target.x;
      y = item.target.y;
      rotation = item.target.rotation;
    }

    drawSquarusPiece(item.piece, x, y, scale, rotation, item.target.color, opacity, sharedEdgeMap, i);
  }

  drawSquarusSharedEdges(sharedEdgeMap);

  if (t >= tEnd) {
    drawSquarusGuide(state.layout, state.targets.slice(0, state.placedCount), 0);
  }
}

function drawSquarusStatic() {
  var state = buildSquarusAnimationState();
  if (!state) {
    clearHighlightedHoleNumbers();
    return;
  }
  var d = getSquarusAnimationDurations();
  state.durations = d;
  var pieceMotionDuration = d.scatter + d.reveal + d.travel + d.snap;
  if (state.placedCount > 0) {
    state.elapsed = (state.mode === 'sequential' ? (pieceMotionDuration * state.placedCount) : pieceMotionDuration) + d.fade + 0.01;
  } else {
    state.elapsed = d.scatter + 0.01;
  }
  var entryOpacity = getSquarusEntryFadeOpacity();
  renderSquarusAnimationStateFrame(state, entryOpacity);
  if (entryOpacity < 1) {
    scheduleSquarusEntryFadeRedraw();
  }
  clearHighlightedHoleNumbers();
}

function runSquarusAnimationFrame(event) {
  if (!animationActive || !squarusAnimationState) return;
  squarusAnimationState.elapsed += Math.min(event.delta || 0, 0.1);
  renderSquarusAnimationStateFrame(squarusAnimationState);

  var d = getSquarusAnimationDurations();
  squarusAnimationState.durations = d;
  var pieceMotionDuration = d.scatter + d.reveal + d.travel + d.snap;
  var total = squarusAnimationState.placedCount > 0
    ? ((squarusAnimationState.mode === 'sequential')
      ? (pieceMotionDuration * squarusAnimationState.placedCount + d.fade)
      : (pieceMotionDuration + d.fade))
    : d.scatter;
  if (squarusAnimationState.elapsed < total) return;

  animationActive = false;
  animationPlaybackState = 'idle';
  view.onFrame = null;
  squarusAnimationState = null;
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  drawSquarusStatic();
}

function animateSquarus() {
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  mashrabiyaAnimationState = null;
  squarusAnimationState = buildSquarusAnimationState();
  if (!squarusAnimationState || !squarusAnimationState.items.length || squarusAnimationState.placedCount <= 0) {
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    scheduleUrlStateSync(false);
    drawSquarusStatic();
    return;
  }

  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderSquarusAnimationStateFrame(squarusAnimationState);
  view.onFrame = runSquarusAnimationFrame;
}


