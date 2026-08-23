function redrawForPathChange() {
  // Path/topology changes invalidate the current stitch progression.
  stopAnimationIfActive();
  drawStatic();
  scheduleDiscoveryEvaluation();
  scheduleUrlStateSync(false);
}

function drawAnimatedSegments(thread, segments, segmentCount) {
  if (!segments || !segments.length || segmentCount <= 0) return;
  var maxSegments = Math.min(segmentCount, segments.length);
  for (var i = 0; i < maxSegments; i++) {
    var parts = getThreadSegmentDrawParts(thread, segments[i]);
    for (var p = 0; p < parts.length; p++) {
      var seg = new Path();
      seg.strokeWidth = thread.width;
      if (thread.color === 'rainbow') {
        seg.strokeColor = rainbowColor(i / Math.max(1, segments.length));
      } else {
        seg.strokeColor = thread.color;
      }
      seg.add(parts[p].fromPoint);
      seg.add(parts[p].toPoint);
    }
  }
}

function getAnimationSecondsPerSegment() {
  var secondsPerSegment = (60 / currentAnimationBpm) * BEATS_PER_STITCH_SEGMENT;
  if (!isFinite(secondsPerSegment) || secondsPerSegment <= 0) {
    secondsPerSegment = (60 / DEFAULT_ANIMATION_BPM) * BEATS_PER_STITCH_SEGMENT;
  }
  return secondsPerSegment;
}

function drawAnimatedSegmentProgress(thread, segments, segmentIndex, progress) {
  if (!segments || !segments.length || segmentIndex < 0 || segmentIndex >= segments.length) return null;

  var endpoint = getThreadSegmentEndpoints(thread, segments[segmentIndex]);
  if (!endpoint) return null;
  var startPoint = endpoint.fromPoint;
  var endPoint = endpoint.toPoint;

  var p = Math.max(0, Math.min(1, progress));
  // A slight ease-out makes the pull feel more organic without changing tempo.
  var eased = 1 - Math.pow(1 - p, 2);
  var currentPoint = startPoint.add(endPoint.subtract(startPoint).multiply(eased));

  var seg = new Path();
  seg.strokeWidth = thread.width;

  if (thread.color === 'rainbow') {
    seg.strokeColor = rainbowColor(segmentIndex / Math.max(1, segments.length));
  } else {
    seg.strokeColor = thread.color;
  }

  seg.add(startPoint);
  seg.add(currentPoint);

  if (p < 1) {
    var pullHead = new Path.Circle(currentPoint, Math.max(1.8, thread.width * 0.7));
    pullHead.fillColor = seg.strokeColor;
    pullHead.opacity = 0.88;
  }

  return endpoint.highlightPair;
}

function drawSegmentSettleAccent(settle) {
  if (!settle || settle.remaining <= 0 || settle.duration <= 0) return;
  if (settle.threadIndex < 0 || settle.threadIndex >= threads.length) return;

  var segments = settle.segments;
  if (!segments || !segments.length || settle.segmentIndex < 0 || settle.segmentIndex >= segments.length) return;

  var thread = threads[settle.threadIndex];
  var endpoint = getThreadSegmentEndpoints(thread, segments[settle.segmentIndex]);
  if (!endpoint) return;
  var startPoint = endpoint.fromPoint;
  var endPoint = endpoint.toPoint;

  var ratio = Math.max(0, Math.min(1, settle.remaining / settle.duration));
  var settleStrength = ratio * ratio;
  var distance = startPoint.getDistance(endPoint);
  var overshootAmount = Math.min(8, distance * STITCH_PULL_SETTLE_OVERSHOOT * settleStrength);
  if (overshootAmount <= 0.01) return;

  // Blend incoming and outgoing directions so the overshoot follows local flow.
  var incoming = endPoint.subtract(startPoint);
  if (incoming.length <= 0) return;

  var nextSegment = segments[(settle.segmentIndex + 1) % segments.length];
  var nextEndpoint = nextSegment ? getThreadSegmentEndpoints(thread, nextSegment) : null;
  var nextPoint = nextEndpoint ? nextEndpoint.toPoint : null;
  var outgoing = nextPoint ? nextPoint.subtract(endPoint) : null;

  var tangent = incoming.normalize(1);
  if (outgoing && outgoing.length > 0) {
    tangent = incoming.normalize(0.7).add(outgoing.normalize(0.3));
    if (tangent.length <= 0) {
      tangent = incoming.normalize(1);
    }
  }

  var overshootPoint = endPoint.add(tangent.normalize(overshootAmount));

  var color = thread.color === 'rainbow'
    ? rainbowColor(settle.segmentIndex / Math.max(1, segments.length))
    : thread.color;

  var settleLine = new Path();
  settleLine.strokeColor = color;
  settleLine.strokeWidth = Math.max(1, thread.width * (0.75 + 0.35 * ratio));
  settleLine.opacity = 0.65 * ratio;
  settleLine.add(endPoint);
  settleLine.add(overshootPoint);

  var settleHead = new Path.Circle(overshootPoint, Math.max(1.4, thread.width * 0.55));
  settleHead.fillColor = color;
  settleHead.opacity = 0.7 * ratio;
}

function renderAnimationFrame() {
  if (!animationState) {
    drawStatic();
    return;
  }

  project.activeLayer.removeChildren();
  computePoints();
  drawShapeBorder();
  drawHoles();

  for (var i = 0; i < animationState.threadIndex; i++) {
    drawAnimatedSegments(threads[i], animationState.segmentLists[i], (animationState.segmentLists[i] || []).length);
  }

  var activePair = null;
  if (animationState.threadIndex >= 0 && animationState.threadIndex < threads.length) {
    var activeThread = threads[animationState.threadIndex];
    var activeSegments = animationState.segmentLists[animationState.threadIndex] || [];

    drawAnimatedSegments(activeThread, activeSegments, animationState.step);

    if (animationState.step < activeSegments.length) {
      var segmentProgress = animationState.elapsed / getAnimationSecondsPerSegment();
      activePair = drawAnimatedSegmentProgress(activeThread, activeSegments, animationState.step, segmentProgress);
    }
  }

  drawSegmentSettleAccent(animationState.settle);

  animationState.activeHolePair = activePair;
  syncHoleNumberHighlightFromAnimationState();
  bringHoleNumbersToFront();
}

function redrawAnimationInPlace() {
  // Style-only updates should preserve current animation progress.
  if (squarusAnimationState) {
    renderSquarusAnimationStateFrame(squarusAnimationState);
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  if (triangulaAnimationState) {
    renderTriangulaAnimationStateFrame(triangulaAnimationState);
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  if (mashrabiyaAnimationState) {
    renderMashrabiyaAnimationStateFrame(mashrabiyaAnimationState);
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  if (!animationState) {
    drawStatic();
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  renderAnimationFrame();
  scheduleDiscoveryEvaluation();
  scheduleUrlStateSync(false);
}

function scheduleFitCanvasToStage() {
  if (pendingCanvasFit) return;
  pendingCanvasFit = true;
  requestAnimationFrame(function() {
    pendingCanvasFit = false;
    fitCanvasToStage();
  });
}

function fitCanvasToStage() {
  var stageHost = canvasStage.parentElement || canvasContainer;
  var containerRect = stageHost.getBoundingClientRect();

  var maxWidth = parseFloat(getComputedStyle(canvasStage).maxWidth);
  if (!isFinite(maxWidth) || maxWidth <= 0) {
    maxWidth = Infinity;
  }

  var viewportCap = Infinity;
  if (window.visualViewport) {
    viewportCap = Math.min(window.visualViewport.width, window.visualViewport.height);
  }

  var size = Math.floor(Math.min(containerRect.width, containerRect.height, maxWidth, viewportCap));

  if ((!isFinite(size) || size <= 0) && canvasContainer) {
    var fallbackWidth = canvasContainer.clientWidth || 0;
    var fallbackHeight = canvasContainer.clientHeight || 0;
    size = Math.floor(Math.min(fallbackWidth, fallbackHeight, maxWidth));
  }

  if (!isFinite(size) || size <= 0) return;

  // Keep the stage physically square so canvas rendering never stretches.
  var pixelSize = size + 'px';
  if (canvasStage.style.width !== pixelSize) {
    canvasStage.style.width = pixelSize;
  }
  if (canvasStage.style.height !== pixelSize) {
    canvasStage.style.height = pixelSize;
  }

  if (view.viewSize.width === size && view.viewSize.height === size) {
    if (!project.activeLayer.children.length) {
      drawStatic();
    }
    return;
  }

  view.viewSize = new Size(size, size);

  // Viewport changes (zoom/orientation) can invalidate frame timing/state.
  // Always normalize playback state so controls never get stuck in paused/resume limbo.
  if (animationActive || animationPlaybackState === 'paused') {
    stopAnimationIfActive();
  }

  drawStatic();
}

/* ------------------------------
   RAINBOW HELPER
------------------------------ */
function rainbowColor(t) {
  return new Color({ hue: t * 360, saturation: 1, brightness: 1 });
}

/* ------------------------------
   SHAPE GENERATION
------------------------------ */
var currentShape = "circle";

function getShapeGeometry() {
  var radius = Math.min(view.size.width, view.size.height) * 0.35;
  var center = view.center.clone();
  var sampleCount = 360;
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;

  // Auto-center by the shape's own bounding box so all frame types stay centered
  // without maintaining hand-tuned per-shape offsets.
  for (var i = 0; i < sampleCount; i++) {
    var t = (2 * Math.PI * i) / sampleCount;
    var p = shapePointAtAngle(t, new Point(0, 0), radius);
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  var shapeBoundsCenter = new Point((minX + maxX) * 0.5, (minY + maxY) * 0.5);
  center = center.subtract(shapeBoundsCenter);

  return {
    center: center,
    radius: radius
  };
}

function polygonPoint(theta, sides, radius, center) {
  var sector = (2 * Math.PI) / sides;
  var a = ((theta % sector) + sector) % sector - sector / 2;
  var r = radius * Math.cos(Math.PI / sides) / Math.cos(a);
  return new Point(
    center.x + r * Math.cos(theta),
    center.y + r * Math.sin(theta)
  );
}

function shapePointAtAngle(t, center, radius) {

  if (currentShape === 'triangle') {
    var trianglePoint = polygonPoint(t, 3, radius, center);
    return trianglePoint.rotate(-90, center);
  }

  if (currentShape === 'square') {
    var c = Math.cos(t);
    var s = Math.sin(t);
    var m = Math.max(Math.abs(c), Math.abs(s));
    return new Point(
      center.x + (radius * c) / m,
      center.y + (radius * s) / m
    );
  }

  if (currentShape === 'star') {
    var starRadius = radius * (0.62 + 0.38 * Math.cos(5 * t));
    return new Point(
      center.x + starRadius * Math.cos(t - Math.PI / 2),
      center.y + starRadius * Math.sin(t - Math.PI / 2)
    );
  }

  if (currentShape === 'heart') {
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    var scale = radius / 18;
    return new Point(
      center.x + x * scale,
      center.y - y * scale
    );
  }

  return new Point(
    center.x + radius * Math.cos(t),
    center.y + radius * Math.sin(t)
  );
}

function buildShapeBoundarySamples(sampleCount, center, radius) {
  var samples = [];
  var angleOffset = currentShape === 'square' ? -Math.PI / 2 : 0;
  for (var i = 0; i < sampleCount; i++) {
    var t = angleOffset + ((2 * Math.PI * i) / sampleCount);
    samples.push(shapePointAtAngle(t, center, radius));
  }
  return samples;
}

function sampleEvenlyAlongClosedPolyline(vertices, count) {
  if (!vertices || !vertices.length || count <= 0) return [];

  var edgeLengths = [];
  var totalLength = 0;

  for (var i = 0; i < vertices.length; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % vertices.length];
    var edgeLength = start.getDistance(end);
    edgeLengths.push(edgeLength);
    totalLength += edgeLength;
  }

  if (!isFinite(totalLength) || totalLength <= 0) {
    return [vertices[0]];
  }

  var result = [];
  var stepLength = totalLength / count;
  var edgeIndex = 0;
  var traversed = 0;

  for (var targetIndex = 0; targetIndex < count; targetIndex++) {
    var targetDistance = targetIndex * stepLength;

    while (
      edgeIndex < edgeLengths.length - 1 &&
      traversed + edgeLengths[edgeIndex] < targetDistance
    ) {
      traversed += edgeLengths[edgeIndex];
      edgeIndex++;
    }

    var edgeStart = vertices[edgeIndex];
    var edgeEnd = vertices[(edgeIndex + 1) % vertices.length];
    var edgeLen = edgeLengths[edgeIndex];
    var localDistance = targetDistance - traversed;
    var ratio = edgeLen > 0 ? localDistance / edgeLen : 0;

    result.push(edgeStart.add(edgeEnd.subtract(edgeStart).multiply(ratio)));
  }

  return result;
}

function computePoints() {
  var outerCount = getCurrentStitchHoleCount();
  var innerCount = getCurrentInnerStitchHoleCount();
  var geometry = getShapeGeometry();
  var center = geometry.center;
  var radius = geometry.radius;

  points = [];
  outerFramePoints = [];
  innerFramePoints = [];
  if (!isFinite(outerCount) || outerCount < 3) return;

  // Circle already has exact uniform spacing with equal-angle sampling.
  if (currentShape === 'circle') {
    for (var i = 0; i < outerCount; i++) {
      var t = (-Math.PI / 2) + ((2 * Math.PI * i) / outerCount);
      outerFramePoints.push(shapePointAtAngle(t, center, radius));
    }

    if (nestedFrameEnabled && innerCount > 0) {
      var innerRadiusCircle = radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
      for (var ci = 0; ci < innerCount; ci++) {
        var tc = (-Math.PI / 2) + ((2 * Math.PI * ci) / innerCount);
        innerFramePoints.push(shapePointAtAngle(tc, center, innerRadiusCircle));
      }
    }
    points = nestedFrameEnabled ? outerFramePoints.concat(innerFramePoints) : outerFramePoints.slice();
    return;
  }

  // Non-circular shapes need perimeter-based resampling for visual uniformity.
  var sampleCount = Math.max(360, outerCount * 12);
  var boundarySamples = buildShapeBoundarySamples(sampleCount, center, radius);
  outerFramePoints = sampleEvenlyAlongClosedPolyline(boundarySamples, outerCount);

  if (nestedFrameEnabled && innerCount > 0) {
    var innerRadius = radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
    var innerBoundarySamples = buildShapeBoundarySamples(sampleCount, center, innerRadius);
    innerFramePoints = sampleEvenlyAlongClosedPolyline(innerBoundarySamples, innerCount);
  }

  points = nestedFrameEnabled ? outerFramePoints.concat(innerFramePoints) : outerFramePoints.slice();
}

function signedAreaOfClosedPolyline(vertices) {
  if (!vertices || vertices.length < 3) return 0;
  var twiceArea = 0;
  for (var i = 0; i < vertices.length; i++) {
    var current = vertices[i];
    var next = vertices[(i + 1) % vertices.length];
    twiceArea += (current.x * next.y) - (next.x * current.y);
  }
  return twiceArea / 2;
}

function offsetClosedPolyline(vertices, distance) {
  if (!vertices || vertices.length < 3 || !isFinite(distance) || distance === 0) {
    return vertices ? vertices.slice() : [];
  }

  var ccw = signedAreaOfClosedPolyline(vertices) > 0;
  var outwardRotation = ccw ? -90 : 90;
  var result = [];

  for (var i = 0; i < vertices.length; i++) {
    var prev = vertices[(i - 1 + vertices.length) % vertices.length];
    var curr = vertices[i];
    var next = vertices[(i + 1) % vertices.length];

    var incoming = curr.subtract(prev);
    var outgoing = next.subtract(curr);

    var n1 = incoming.length > 0 ? incoming.normalize(1).rotate(outwardRotation) : null;
    var n2 = outgoing.length > 0 ? outgoing.normalize(1).rotate(outwardRotation) : null;

    var normal = null;
    if (n1 && n2) {
      normal = n1.add(n2);
      if (normal.length <= 1e-6) {
        normal = n1;
      }
    } else {
      normal = n1 || n2;
    }

    if (!normal || normal.length <= 1e-6) {
      var tangent = next.subtract(prev);
      normal = tangent.length > 0 ? tangent.normalize(1).rotate(outwardRotation) : new Point(0, -1);
    }

    result.push(curr.add(normal.normalize(distance)));
  }

  return result;
}

function lineIntersection(a1, a2, b1, b2) {
  var r = a2.subtract(a1);
  var s = b2.subtract(b1);
  var rxs = r.cross(s);
  if (Math.abs(rxs) <= 1e-8) {
    return null;
  }
  var t = b1.subtract(a1).cross(s) / rxs;
  return a1.add(r.multiply(t));
}

function lineSegmentIntersection(lineStart, lineEnd, segmentStart, segmentEnd) {
  var lineDir = lineEnd.subtract(lineStart);
  var segDir = segmentEnd.subtract(segmentStart);
  var cross = lineDir.cross(segDir);
  if (Math.abs(cross) <= 1e-8) {
    return null;
  }

  var delta = segmentStart.subtract(lineStart);
  var t = delta.cross(segDir) / cross;
  var u = delta.cross(lineDir) / cross;
  if (u < -1e-7 || u > 1 + 1e-7) {
    return null;
  }

  return lineStart.add(lineDir.multiply(t));
}

function getOuterBoundaryVerticesForProjection() {
  var geometry = getShapeGeometry();
  var polygonVertices = getPolygonCornerVerticesForGeometry(geometry);
  if (polygonVertices && polygonVertices.length >= 3) {
    return polygonVertices;
  }
  return buildShapeBoundarySamples(960, geometry.center, geometry.radius);
}

function getOuterIntersectionsForInfiniteLine(lineStart, lineEnd) {
  var vertices = getOuterBoundaryVerticesForProjection();
  if (!vertices || vertices.length < 2) return [];

  var hits = [];
  for (var i = 0; i < vertices.length; i++) {
    var segmentStart = vertices[i];
    var segmentEnd = vertices[(i + 1) % vertices.length];
    var hit = lineSegmentIntersection(lineStart, lineEnd, segmentStart, segmentEnd);
    if (!hit) continue;

    var duplicate = false;
    for (var h = 0; h < hits.length; h++) {
      if (hits[h].getDistance(hit) <= 0.5) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) {
      hits.push(hit);
    }
  }

  return hits;
}

function getPolygonCornerVertices() {
  var geometry = getShapeGeometry();
  return getPolygonCornerVerticesForGeometry(geometry);
}

function getPolygonCornerVerticesForGeometry(geometry) {
  var vertices = [];
  if (!geometry) return null;

  if (currentShape === 'triangle') {
    for (var i = 0; i < 3; i++) {
      var tTri = i * 2 * Math.PI / 3;
      vertices.push(shapePointAtAngle(tTri, geometry.center, geometry.radius));
    }
    return vertices;
  }

  if (currentShape === 'square') {
    for (var j = 0; j < 4; j++) {
      var tSq = (Math.PI / 4) + (j * Math.PI / 2);
      vertices.push(shapePointAtAngle(tSq, geometry.center, geometry.radius));
    }
    return vertices;
  }

  return null;
}

function offsetConvexPolygon(vertices, distance) {
  if (!vertices || vertices.length < 3 || !isFinite(distance) || distance === 0) {
    return vertices ? vertices.slice() : [];
  }

  var n = vertices.length;
  var ccw = signedAreaOfClosedPolyline(vertices) > 0;
  var outwardRotation = ccw ? -90 : 90;
  var offsetLines = [];

  for (var i = 0; i < n; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % n];
    var edge = end.subtract(start);
    if (edge.length <= 1e-8) continue;

    var outward = edge.normalize(1).rotate(outwardRotation).normalize(distance);
    offsetLines.push({
      p1: start.add(outward),
      p2: end.add(outward)
    });
  }

  if (offsetLines.length < 3) {
    return vertices.slice();
  }

  var result = [];
  for (var k = 0; k < offsetLines.length; k++) {
    var prevLine = offsetLines[(k - 1 + offsetLines.length) % offsetLines.length];
    var thisLine = offsetLines[k];
    var corner = lineIntersection(prevLine.p1, prevLine.p2, thisLine.p1, thisLine.p2);
    if (!corner) {
      corner = thisLine.p1;
    }
    result.push(corner);
  }

  return result;
}

function drawShapeBorder() {
  if (!borderEnabled) return;
  var borderStrokeColor = getThemeBorderStrokeColor();

  function drawBorderPair(borderGeometry) {
    if (!borderGeometry || !borderGeometry.outerSamples || !borderGeometry.innerSamples) return;

    var polygonVertices = borderGeometry.isPolygon ? borderGeometry.polygonVertices : null;

    var outerPath = new Path(borderGeometry.outerSamples);
    outerPath.closed = true;
    outerPath.strokeColor = borderStrokeColor;
    outerPath.strokeWidth = BORDER_STROKE_WIDTH;
    outerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
    outerPath.strokeCap = 'round';
    outerPath.miterLimit = 8;

    var innerPath = new Path(borderGeometry.innerSamples);
    innerPath.closed = true;
    innerPath.strokeColor = borderStrokeColor;
    innerPath.strokeWidth = BORDER_STROKE_WIDTH;
    innerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
    innerPath.strokeCap = 'round';
    innerPath.miterLimit = 8;
  }

  drawBorderPair(getBorderGeometryForCurrentShape());

  if (!nestedFrameEnabled) return;
  var geometry = getShapeGeometry();
  var nestedGeometry = {
    center: geometry.center,
    radius: geometry.radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)
  };
  drawBorderPair(getBorderGeometryForGeometry(nestedGeometry));
}

function getBorderGeometryForCurrentShape() {
  return getBorderGeometryForGeometry(getShapeGeometry());
}

function getBorderGeometryForGeometry(geometry) {
  if (!geometry) return null;

  var polygonVertices = getPolygonCornerVerticesForGeometry(geometry);
  var outerSamples;
  var innerSamples;

  if (polygonVertices && polygonVertices.length >= 3) {
    // For polygons, offset exact edges and intersect them for crisp, stable corners.
    outerSamples = offsetConvexPolygon(polygonVertices, BORDER_OUTER_GAP);
    innerSamples = offsetConvexPolygon(polygonVertices, -BORDER_INNER_GAP);
  } else {
    // Curved/organic shapes continue to use dense polyline offsets.
    var boundarySamples = buildShapeBoundarySamples(480, geometry.center, geometry.radius);
    if (!boundarySamples.length) return;
    outerSamples = offsetClosedPolyline(boundarySamples, BORDER_OUTER_GAP);
    innerSamples = offsetClosedPolyline(boundarySamples, -BORDER_INNER_GAP);
  }

  return {
    outerSamples: outerSamples,
    innerSamples: innerSamples,
    isPolygon: !!(polygonVertices && polygonVertices.length >= 3),
    polygonVertices: polygonVertices
  };
}

/* ------------------------------
   DRAWING THREADS
------------------------------ */
function computeSequence(thread, holeCount) {
  var n = parseBoundedInt(holeCount, 3, MAX_HOLES, getCurrentStitchHoleCount());
  if (!n) return [];

  if (thread.sequence && thread.sequence.type === 'custom') {
    return thread.sequence.list;
  }

  var jumpMode = thread.jumpMode || 'fixed';
  if (!isExpressionStitchModeEnabled() && jumpMode === 'formula') {
    jumpMode = 'fixed';
  }
  var visited = new Array(n).fill(false);
  var startIndex = parseBoundedInt(thread.startHole, 1, n, 1) - 1;
  var current = startIndex;
  var prev = startIndex;
  var seq = [];
  var maxSteps = n * 4;

  function normalizeJump(value) {
    var k = Math.round(Number(value));
    if (!isFinite(k)) return 1;
    k = k % n;
    if (k === 0) return 1;
    return k;
  }

  function parseJumpSequence(text) {
    if (!text) return [];
    return text
      .split(/[\s,]+/)
      .map(Number)
      .filter((num) => isFinite(num))
      .map((num) => Math.round(num))
      .filter((num) => num !== 0);
  }

  function parseHoleSequence(text) {
    if (!text) return [];
    var values = text
      .split(/[\s,]+/)
      .map(Number)
      .filter((num) => isFinite(num))
      .map((num) => Math.round(num));

    var parsed = [];
    for (var idx = 0; idx < values.length; idx++) {
      var label = values[idx];
      if (label > n) {
        break;
      }
      if (label < 1) {
        continue;
      }
      parsed.push(label - 1);
    }
    return parsed;
  }

  function normalizeFormulaExpression(expression) {
    if (!expression) return 'skip';
    return String(expression)
      .trim()
      .replace(/[×·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/\bmod\b/gi, '%');
  }

  var jumpResolver;
  if (jumpMode === 'sequence') {
    var sequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    if (sequenceMode === 'holes') {
      return parseHoleSequence(thread.jumpSequence);
    }
    var stepList = parseJumpSequence(thread.jumpSequence);
    jumpResolver = function(i) {
      if (!stepList.length) return normalizeJump(thread.jump);
      return normalizeJump(stepList[i % stepList.length]);
    };
  } else if (jumpMode === 'formula') {
    var formula = normalizeFormulaExpression(thread.jumpFormula || 'skip');
    jumpResolver = function(i, currentIndex, previousIndex) {
      try {
        var evaluate = new Function(
          'i', 'n', 'current', 'prev', 'skip', 'jump',
          'abs', 'floor', 'ceil', 'round', 'sqrt', 'pow', 'min', 'max', 'sin', 'cos', 'tan', 'pi',
          'return (' + formula + ');'
        );
        return normalizeJump(
          evaluate(
            i, n, currentIndex, previousIndex, thread.jump, thread.jump,
            Math.abs, Math.floor, Math.ceil, Math.round, Math.sqrt, Math.pow,
            Math.min, Math.max, Math.sin, Math.cos, Math.tan, Math.PI
          )
        );
      } catch (err) {
        return normalizeJump(thread.jump);
      }
    };
  } else {
    jumpResolver = function() {
      return normalizeJump(thread.sequence ? thread.sequence.k : thread.jump);
    };
  }

  for (var i = 0; i < maxSteps; i++) {
    if (visited[current]) break;
    visited[current] = true;
    seq.push(current);
    var step = jumpResolver(i, current, prev);
    prev = current;
    current = (current + step) % n;
    if (current < 0) current += n;
  }
  return seq;
}

function computeSegments(thread) {
  var nOuter = getCurrentStitchHoleCount();
  var nInner = nestedFrameEnabled ? getCurrentInnerStitchHoleCount() : 0;
  if (!nOuter || !thread) return [];

  function resolveFrameMode() {
    if (!nestedFrameEnabled) return 'outer';
    return sanitizeThreadFrameMode(thread.frameMode, 'outer');
  }

  function countForRing(ring) {
    if (ring === 'inner') {
      return nInner > 0 ? nInner : nOuter;
    }
    return nOuter;
  }

  function toGlobalIndex(localIndex, ring) {
    var ringCount = countForRing(ring);
    var idx = ((localIndex % ringCount) + ringCount) % ringCount;
    if (ring === 'inner' && nestedFrameEnabled && nInner > 0) {
      return nOuter + idx;
    }
    return idx;
  }

  function remapLocalIndex(localIndex, fromCount, toCount) {
    if (!isFinite(fromCount) || fromCount <= 0 || !isFinite(toCount) || toCount <= 0) return 0;
    var normalized = ((localIndex % fromCount) + fromCount) % fromCount;
    // Use nearest angular neighbor when mapping between rings.
    var projected = Math.round((normalized * toCount) / fromCount);
    return ((projected % toCount) + toCount) % toCount;
  }

  function remapInnerToOuterBridge(localInnerIndex) {
    if (!isFinite(localInnerIndex) || nInner <= 0 || nOuter <= 0) {
      return 0;
    }
    var normalized = ((localInnerIndex % nInner) + nInner) % nInner;
    // Deterministic index-proportional mapping from inner ring to outer ring.
    var projected = Math.floor((normalized * nOuter) / nInner);
    return ((projected % nOuter) + nOuter) % nOuter;
  }

  function mapPair(sourceLocal, mappedLocal) {
    var frameMode = resolveFrameMode();
    var sourceRing = 'outer';
    var targetRing = 'outer';
    if (frameMode === 'inner') {
      sourceRing = 'inner';
      targetRing = 'inner';
    } else if (frameMode === 'bridge') {
      sourceRing = 'outer';
      targetRing = 'inner';
    } else if (frameMode === 'bridge-reverse') {
      sourceRing = 'inner';
      targetRing = 'outer';
    } else if (frameMode === 'bridge-reverse-project') {
      sourceRing = 'inner';
      targetRing = 'inner';
    }

    var sourceCount = countForRing(sourceRing);
    var targetCount = countForRing(targetRing);
    var sourceResolved = ((sourceLocal % sourceCount) + sourceCount) % sourceCount;
    var targetResolved = remapLocalIndex(mappedLocal, sourceCount, targetCount);

    if (frameMode === 'bridge-reverse') {
      // Inner-gated bridge: each outward bridge passes through a relay inner hole.
      var relayInner = ((mappedLocal % sourceCount) + sourceCount) % sourceCount;
      var mappedOuter = remapInnerToOuterBridge(relayInner);
      var bridgeSegments = [];
      if (sourceResolved !== relayInner) {
        bridgeSegments.push([
          toGlobalIndex(sourceResolved, 'inner'),
          toGlobalIndex(relayInner, 'inner')
        ]);
      }
      bridgeSegments.push([
        toGlobalIndex(relayInner, 'inner'),
        toGlobalIndex(mappedOuter, 'outer')
      ]);
      return bridgeSegments;
    }

    return [[toGlobalIndex(sourceResolved, sourceRing), toGlobalIndex(targetResolved, targetRing)]];
  }

  var sourceHoleCount = getThreadSourceHoleCount(thread);
  if (!isFinite(sourceHoleCount) || sourceHoleCount < 1) return [];

  if (thread.jumpMode === 'connect') {
    ensureThreadConnectConfig(thread);
    var segments = [];
    var multiplier = Math.round(Number(thread.connectMultiplier || 2));
    var startOffset = parseBoundedInt(thread.startHole, 1, sourceHoleCount, 1) - 1;
    for (var i = 0; i < sourceHoleCount; i++) {
      // Multiplication mode honors startHole as ring phase origin.
      var sourceIndex = (startOffset + i) % sourceHoleCount;
      // i is 0-based within the phased ring; convert to 1-based for the multiplication rule.
      var phaseLabel = i + 1;
      var mapped = (startOffset + (multiplier * phaseLabel - 1)) % sourceHoleCount;
      if (mapped < 0) mapped += sourceHoleCount;
      var mappedSegments = mapPair(sourceIndex, mapped);
      for (var m = 0; m < mappedSegments.length; m++) {
        segments.push(mappedSegments[m]);
      }
    }
    return segments;
  }

  if (thread.jumpMode === 'sequence' && sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes') === 'holes') {
    var holeSequence = computeSequence(thread, sourceHoleCount);
    var holeSegments = [];
    for (var h = 0; h < holeSequence.length - 1; h++) {
      var mappedHoleSegments = mapPair(holeSequence[h], holeSequence[h + 1]);
      for (var hs = 0; hs < mappedHoleSegments.length; hs++) {
        holeSegments.push(mappedHoleSegments[hs]);
      }
    }
    return holeSegments;
  }

  var seq = computeSequence(thread, sourceHoleCount);
  var chained = [];
  for (var j = 0; j < seq.length; j++) {
    var mappedChainSegments = mapPair(seq[j], seq[(j + 1) % seq.length]);
    for (var cs = 0; cs < mappedChainSegments.length; cs++) {
      chained.push(mappedChainSegments[cs]);
    }
  }
  return chained;
}

function isThreadRadialProjectionMode(thread) {
  if (!nestedFrameEnabled) return false;
  return sanitizeThreadFrameMode(thread && thread.frameMode, 'outer') === 'bridge-reverse-project';
}

function getThreadSegmentEndpoints(thread, segment) {
  if (!segment || !segment.length) return null;
  var fromIndex = segment[0];
  var toIndex = segment[1];
  if (!isFinite(fromIndex) || !isFinite(toIndex)) return null;

  var fromPoint = points[fromIndex];
  var toPoint = points[toIndex];
  if (!fromPoint || !toPoint) return null;

  return {
    fromIndex: fromIndex,
    toIndex: toIndex,
    fromPoint: fromPoint,
    toPoint: toPoint,
    highlightPair: [fromIndex, toIndex]
  };
}

function getOuterProjectionPairForSegment(fromPoint, toPoint) {
  if (!fromPoint || !toPoint) return { fromHit: null, toHit: null };

  var segmentDirection = toPoint.subtract(fromPoint);
  var segmentLength = segmentDirection.length;
  if (segmentLength <= 0.001) return { fromHit: null, toHit: null };

  var unit = segmentDirection.normalize(1);
  var hits = getOuterIntersectionsForInfiniteLine(fromPoint, toPoint);
  if (!hits || !hits.length) return { fromHit: null, toHit: null };

  var fromHit = null;
  var toHit = null;
  var bestBefore = -Infinity;
  var bestAfter = Infinity;
  var minT = Infinity;
  var maxT = -Infinity;
  var minPoint = null;
  var maxPoint = null;

  for (var i = 0; i < hits.length; i++) {
    var t = hits[i].subtract(fromPoint).dot(unit);

    if (t < minT) {
      minT = t;
      minPoint = hits[i];
    }
    if (t > maxT) {
      maxT = t;
      maxPoint = hits[i];
    }

    if (t < -1e-4 && t > bestBefore) {
      bestBefore = t;
      fromHit = hits[i];
    }
    if (t > segmentLength + 1e-4 && t < bestAfter) {
      bestAfter = t;
      toHit = hits[i];
    }
  }

  // Fallback for edge/tangent degeneracies: use extremal hits along the segment axis.
  if (!fromHit) {
    fromHit = minPoint;
  }
  if (!toHit) {
    toHit = maxPoint;
  }

  return {
    fromHit: fromHit,
    toHit: toHit
  };
}

function getThreadSegmentDrawParts(thread, segment) {
  var endpoint = getThreadSegmentEndpoints(thread, segment);
  if (!endpoint) return [];

  if (!isThreadRadialProjectionMode(thread)) {
    return [
      {
        fromPoint: endpoint.fromPoint,
        toPoint: endpoint.toPoint
      }
    ];
  }

  var projection = getOuterProjectionPairForSegment(endpoint.fromPoint, endpoint.toPoint);
  var projectedFrom = projection.fromHit;
  var projectedTo = projection.toHit;
  var parts = [];

  if (projectedFrom && projectedFrom.getDistance(endpoint.fromPoint) > 0.001) {
    parts.push({ fromPoint: projectedFrom, toPoint: endpoint.fromPoint });
  }

  parts.push({ fromPoint: endpoint.fromPoint, toPoint: endpoint.toPoint });

  if (projectedTo && projectedTo.getDistance(endpoint.toPoint) > 0.001) {
    parts.push({ fromPoint: endpoint.toPoint, toPoint: projectedTo });
  }

  return parts;
}

function drawThread(thread) {
  var segments = computeSegments(thread);

  for (var i = 0; i < segments.length; i++) {
    var parts = getThreadSegmentDrawParts(thread, segments[i]);
    for (var p = 0; p < parts.length; p++) {
      var seg = new Path();
      seg.strokeWidth = thread.width;

      if (thread.color === 'rainbow') {
        seg.strokeColor = rainbowColor(i / Math.max(1, segments.length));
      } else {
        seg.strokeColor = thread.color;
      }

      seg.add(parts[p].fromPoint);
      seg.add(parts[p].toPoint);
    }
  }
}

function drawHoles() {
  var numbersVisible = shouldShowHoleNumbersNow();
  var holeCount = getCurrentStitchHoleCount();
  if (!isFinite(holeCount)) holeCount = DEFAULT_HOLES;
  var fontSize = getHoleNumberFontSize(holeCount);
  var holeFillColor = getThemeHoleFillColor();
  var holeLabelColor = getThemeHoleLabelColor();
  holeNumberLabelsByIndex = Object.create(null);
  highlightedHoleNumbers = [];

  function drawRingHoles(ringPoints, indexOffset, invertOutward, isInnerRing) {
    if (!ringPoints || !ringPoints.length) return;
    var ccw = signedAreaOfClosedPolyline(ringPoints) > 0;
    var ringBaseFontSize = isInnerRing ? Math.max(6, fontSize * 0.9) : fontSize;
    var ringLabels = [];
    var ringOutward = [];
    var maxExtent = 0;

    for (var i = 0; i < ringPoints.length; i++) {
      new Path.Circle(ringPoints[i], 3).fillColor = holeFillColor;
      if (!numbersVisible) continue;

      var outward = getOutwardDirectionAtHoleFromRing(ringPoints, i, ccw, invertOutward);
      ringOutward[i] = outward;

      var label = new PointText(ringPoints[i]);
      label.justification = 'center';
      label.fillColor = holeLabelColor;
      label.fontSize = ringBaseFontSize;
      label.fontWeight = 'normal';
      label.content = String(i + 1);
      ringLabels[i] = label;

      var extent = getBoundsExtentAlongDirection(label, outward);
      if (extent > maxExtent) {
        maxExtent = extent;
      }
    }

    if (!numbersVisible) return;

    var metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE, LABEL_HOLE_CLEARANCE);
    if (metrics.maxOffset < metrics.minOffset) {
      var availableBand = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + LABEL_BORDER_CLEARANCE) - (3 + LABEL_HOLE_CLEARANCE);
      var targetFont = Math.max(6, Math.min(ringBaseFontSize, availableBand * 1.6));
      if (targetFont < ringBaseFontSize) {
        ringBaseFontSize = targetFont;
        maxExtent = 0;
        for (var j = 0; j < ringLabels.length; j++) {
          if (!ringLabels[j]) continue;
          ringLabels[j].fontSize = ringBaseFontSize;
          var resizedExtent = getBoundsExtentAlongDirection(ringLabels[j], ringOutward[j]);
          if (resizedExtent > maxExtent) {
            maxExtent = resizedExtent;
          }
        }
        metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE, LABEL_HOLE_CLEARANCE);
      }
    }

    var sharedOffset = metrics.offset;
    for (var k = 0; k < ringLabels.length; k++) {
      if (!ringLabels[k]) continue;
      ringLabels[k].position = ringPoints[k].add(ringOutward[k].multiply(sharedOffset));
      holeNumberLabelsByIndex[indexOffset + k] = ringLabels[k];
    }
  }

  drawRingHoles(outerFramePoints.length ? outerFramePoints : points, 0, false, false);
  if (nestedFrameEnabled && innerFramePoints.length) {
    drawRingHoles(innerFramePoints, getCurrentStitchHoleCount(), false, true);
  }
}

/* ------------------------------
   STATIC DRAW
------------------------------ */
function drawStatic() {
  if (currentExperienceId === 'triangula') {
    drawTriangulaStatic();
    return;
  }

  if (currentExperienceId === 'squarus') {
    drawSquarusStatic();
    return;
  }

  if (currentExperienceId === 'mashrabiya') {
    drawMashrabiyaStatic();
    return;
  }

  project.activeLayer.removeChildren();
  computePoints();

  // Border is a style-only layer for Stitching mode and should sit behind holes/threads.
  drawShapeBorder();

  // Draw holes
  drawHoles();

  // Draw threads
  for (var i = 0; i < threads.length; i++) {
    drawThread(threads[i]);
  }

  clearHighlightedHoleNumbers();
  bringHoleNumbersToFront();
}

function bringHoleNumbersToFront() {
  if (!shouldShowHoleNumbersNow()) return;
  var children = project.activeLayer.children;
  var labels = [];
  for (var i = 0; i < children.length; i++) {
    if (children[i] instanceof PointText) {
      labels.push(children[i]);
    }
  }
  for (var j = 0; j < labels.length; j++) {
    labels[j].bringToFront();
  }
}

/* ------------------------------
   ANIMATION
------------------------------ */
function runAnimationFrameTick(event) {
  if (!animationActive) return;

  if (!animationState || !animationState.segmentLists.length) {
    animationActive = false;
    view.onFrame = null;
    animationState = null;
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    clearHighlightedHoleNumbers();
    updateMusicPlaybackState();
    scheduleUrlStateSync(false);
    drawStatic();
    return;
  }

  // Clamp long frame gaps so a resumed tab or hitch cannot skip ahead visibly.
  var frameDelta = Math.min(event.delta, 0.1);
  animationState.elapsed += frameDelta;

  if (animationState.settle) {
    animationState.settle.remaining = Math.max(0, animationState.settle.remaining - frameDelta);
    if (animationState.settle.remaining <= 0) {
      animationState.settle = null;
    }
  }

  var secondsPerSegment = getAnimationSecondsPerSegment();

  while (animationState.elapsed >= secondsPerSegment && animationActive) {
    animationState.elapsed -= secondsPerSegment;

    var threadIndex = animationState.threadIndex;
    if (threadIndex < 0 || threadIndex >= threads.length) {
      animationActive = false;
      animationState = null;
      animationPlaybackState = 'idle';
      view.onFrame = null;
      syncAnimateButtonLabel();
      clearHighlightedHoleNumbers();
      updateMusicPlaybackState();
      scheduleUrlStateSync(false);
      drawStatic();
      return;
    }

    var segments = animationState.segmentLists[threadIndex] || [];

    if (animationState.step < segments.length) {
      animationState.settle = {
        threadIndex: threadIndex,
        segmentIndex: animationState.step,
        segments: segments,
        duration: STITCH_PULL_SETTLE_SECONDS,
        remaining: STITCH_PULL_SETTLE_SECONDS
      };
      animationState.step++;
    } else {
      animationState.threadIndex++;
      if (animationState.threadIndex >= threads.length) {
        animationActive = false;
        animationState = null;
        animationPlaybackState = 'idle';
        view.onFrame = null;
        syncAnimateButtonLabel();
        clearHighlightedHoleNumbers();
        updateMusicPlaybackState();
        scheduleUrlStateSync(false);
        drawStatic();
        return;
      }
      animationState.step = 0;
    }
  }

  renderAnimationFrame();
}

function startAnimationLoop() {
  view.onFrame = runAnimationFrameTick;
}

function animateStitch() {
  if (currentExperienceId === 'triangula') {
    animateTriangula();
    return;
  }
  if (currentExperienceId === 'squarus') {
    animateSquarus();
    return;
  }
  if (currentExperienceId === 'mashrabiya') {
    animateMashrabiya();
    return;
  }

  // Always treat this as a fresh run, even if a prior animation is active.
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  squarusAnimationState = null;
  mashrabiyaAnimationState = null;
  clearHighlightedHoleNumbers();

  project.activeLayer.removeChildren();
  computePoints();

  animationState = {
    threadIndex: 0,
    step: 0,
    elapsed: 0,
    activeHolePair: null,
    settle: null,
    segmentLists: threads.map(function(thread) {
      return computeSegments(thread);
    })
  };
  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderAnimationFrame();
  startAnimationLoop();
}

function resumeAnimationIfPaused() {
  if (animationActive) return;
  if (!animationState && !triangulaAnimationState && !squarusAnimationState && !mashrabiyaAnimationState) {
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    animateStitch();
    return;
  }
  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  if (triangulaAnimationState) {
    view.onFrame = runTriangulaAnimationFrame;
    return;
  }
  if (squarusAnimationState) {
    view.onFrame = runSquarusAnimationFrame;
    return;
  }
  if (mashrabiyaAnimationState) {
    view.onFrame = runMashrabiyaAnimationFrame;
    return;
  }
  startAnimationLoop();
}

function toggleAnimationPlayback() {
  if (animationPlaybackState === 'playing') {
    pauseAnimationIfActive();
    return;
  }
  if (animationPlaybackState === 'paused') {
    resumeAnimationIfPaused();
    return;
  }
  animateStitch();
}

function stopAnimationIfActive() {
  if (!animationActive && !animationState && !triangulaAnimationState && !squarusAnimationState && !mashrabiyaAnimationState) return;
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  squarusAnimationState = null;
  mashrabiyaAnimationState = null;
  animationPlaybackState = 'idle';
  syncAnimateButtonLabel();
  clearHighlightedHoleNumbers();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
}

