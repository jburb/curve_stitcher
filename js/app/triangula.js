function triangulaCountToDepth(count) {
  var safeCount = Math.max(1, Math.floor(Number(count) || 1));
  var depth = Math.round(Math.log(safeCount) / Math.log(3));
  if (!isFinite(depth) || depth < 0) depth = 0;
  return Math.max(0, Math.min(6, depth));
}

function getTriangulaBaseTriangle(scaleFactor) {
  var center = view.center;
  var baseSize = Math.max(120, Math.min(view.size.width, view.size.height) - 56);
  var scale = isFinite(scaleFactor) ? Math.max(0.45, Math.min(1, scaleFactor)) : 1;
  var size = baseSize * scale;
  var half = size / 2;
  var height = Math.sqrt(3) * half;
  return [
    new Point(center.x, center.y - (height / 2)),
    new Point(center.x - half, center.y + (height / 2)),
    new Point(center.x + half, center.y + (height / 2))
  ];
}

function normalizeTriangulaFillColor(colorValue, fallback) {
  var fallbackColor = fallback || '#256f7a';
  if (!colorValue) return fallbackColor;
  return colorValue;
}

function getTriangulaAlternatingRainbowColor(sequenceIndex) {
  // Fixed ROYGBIV order for predictable rainbow construction progression.
  var palette = ['#ff0000', '#ff7f00', '#ffff00', '#00aa00', '#0066ff', '#4b0082', '#8f00ff'];
  var index = Math.abs(Math.floor(Number(sequenceIndex) || 0)) % palette.length;
  return palette[index];
}

function getTriangulaResolvedFillColor(colorValue, sequenceIndex, fallback) {
  var normalized = normalizeTriangulaFillColor(colorValue, fallback);
  if (normalized === 'rainbow') {
    return getTriangulaAlternatingRainbowColor(sequenceIndex);
  }
  return normalized;
}

function getTriangulaEffectiveColorMode() {
  if (triangulaConstructionMode === 'cut') return 'all';
  return triangulaColorMode || 'band-1';
}

function getTriangulaRainbowSequenceIndex(slot, sequenceIndex, mode) {
  var sequence = Math.floor(Number(sequenceIndex) || 0);
  if (sequence < 0) sequence = 0;

  if (mode === 'all') return sequence;
  if ((mode === 'band-1' && slot === 1) || (mode === 'band-2' && slot === 2) || (mode === 'band-4' && slot === 4)) {
    return Math.floor(sequence / 3);
  }

  return sequence;
}

function getTriangulaFillColorForSlot(slot, sequenceIndex) {
  var mode = getTriangulaEffectiveColorMode();
  var rainbowSequence = getTriangulaRainbowSequenceIndex(slot, sequenceIndex, mode);
  var allColor = normalizeTriangulaFillColor(triangulaSourceColor, triangulaBandColors.band1);
  if (mode === 'all') return getTriangulaResolvedFillColor(allColor, rainbowSequence, triangulaBandColors.band1);
  if (mode === 'band-1') return slot === 1 ? getTriangulaResolvedFillColor(triangulaBandColors.band1, rainbowSequence, triangulaBandColors.band1) : '#ffffff';
  if (mode === 'band-2') return slot === 2 ? getTriangulaResolvedFillColor(triangulaBandColors.band2, rainbowSequence, triangulaBandColors.band2) : '#ffffff';
  if (mode === 'band-4') return slot === 4 ? getTriangulaResolvedFillColor(triangulaBandColors.band4, rainbowSequence, triangulaBandColors.band4) : '#ffffff';
  return getTriangulaResolvedFillColor(allColor, rainbowSequence, triangulaBandColors.band1);
}

function getTriangulaStrokeColorForSlot(slot, sequenceIndex) {
  var fill = getTriangulaFillColorForSlot(slot, sequenceIndex);
  if (!fill || fill === '#ffffff') return '#8ea4b0';
  return '#234b61';
}

function getTriangulaSplit(vertices) {
  var m01 = vertices[0].add(vertices[1]).divide(2);
  var m12 = vertices[1].add(vertices[2]).divide(2);
  var m20 = vertices[2].add(vertices[0]).divide(2);
  return {
    central: [m01, m12, m20],
    children: [
      { vertices: [vertices[0], m01, m20], slot: 1 },
      { vertices: [m01, vertices[1], m12], slot: 2 },
      { vertices: [m20, m12, vertices[2]], slot: 4 }
    ]
  };
}

function collectTrianglesAtDepth(vertices, depth, currentDepth, slot, collector) {
  if (currentDepth === depth) {
    collector.push({ vertices: vertices, slot: slot || 1 });
    return;
  }
  if (currentDepth > depth) return;
  var split = getTriangulaSplit(vertices);
  for (var i = 0; i < split.children.length; i++) {
    collectTrianglesAtDepth(split.children[i].vertices, depth, currentDepth + 1, split.children[i].slot, collector);
  }
}

function collectCutTrianglesAtDepth(vertices, depth, currentDepth, collector) {
  if (depth <= 0) return;
  if (currentDepth >= depth) return;
  var split = getTriangulaSplit(vertices);
  if (currentDepth + 1 === depth) {
    collector.push({ vertices: split.central, parent: vertices });
    return;
  }
  for (var i = 0; i < split.children.length; i++) {
    collectCutTrianglesAtDepth(split.children[i].vertices, depth, currentDepth + 1, collector);
  }
}

function collectParentChildTransitionsAtDepth(vertices, depth, currentDepth, collector) {
  if (depth <= 0) return;
  if (currentDepth >= depth) return;
  var split = getTriangulaSplit(vertices);
  if (currentDepth + 1 === depth) {
    var parentCenter = vertices[0].add(vertices[1]).add(vertices[2]).divide(3);
    for (var i = 0; i < split.children.length; i++) {
      var child = split.children[i];
      var childCenter = child.vertices[0].add(child.vertices[1]).add(child.vertices[2]).divide(3);
      collector.push({
        from: parentCenter,
        to: childCenter,
        child: child.vertices,
        parent: vertices,
        slot: child.slot
      });
    }
    return;
  }
  for (var j = 0; j < split.children.length; j++) {
    collectParentChildTransitionsAtDepth(split.children[j].vertices, depth, currentDepth + 1, collector);
  }
}

function drawTriangleStrokeProgress(vertices, options, progress) {
  var p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return;

  var v0 = vertices[0];
  var v1 = vertices[1];
  var v2 = vertices[2];
  var l01 = v0.getDistance(v1);
  var l12 = v1.getDistance(v2);
  var l20 = v2.getDistance(v0);
  var total = l01 + l12 + l20;
  var remaining = total * p;

  var path = new Path();
  path.strokeColor = options.strokeColor || '#2f4368';
  path.strokeWidth = options.strokeWidth || 1.2;
  path.opacity = isFinite(options.opacity) ? options.opacity : 1;
  path.add(v0);

  function addPartial(from, to, segLength) {
    if (remaining <= 0) return;
    if (remaining >= segLength) {
      path.add(to);
      remaining -= segLength;
      return;
    }
    var t = remaining / segLength;
    path.add(from.add(to.subtract(from).multiply(t)));
    remaining = 0;
  }

  addPartial(v0, v1, l01);
  addPartial(v1, v2, l12);
  addPartial(v2, v0, l20);
}

function drawTrianglePath(vertices, options) {
  var triangle = new Path();
  triangle.closed = true;
  triangle.add(vertices[0]);
  triangle.add(vertices[1]);
  triangle.add(vertices[2]);
  if (options && options.strokeColor) {
    triangle.strokeColor = options.strokeColor;
    triangle.strokeWidth = options.strokeWidth || 1.4;
  }
  if (options && options.fillColor) {
    triangle.fillColor = options.fillColor;
  }
  if (options && isFinite(options.opacity)) {
    triangle.opacity = options.opacity;
  }
  return triangle;
}

function drawTriangulaDepth(depth, scale) {
  var base = getTriangulaBaseTriangle(scale);
  var baseColor = getTriangulaFillColorForSlot(1);
  drawTrianglePath(base, {
    strokeColor: '#234b61',
    strokeWidth: triangulaConstructionMode === 'cut' ? 1.7 : 1.1,
    fillColor: baseColor,
    opacity: 0.95
  });

  var boundedDepth = Math.max(0, Math.min(6, depth));
  if (triangulaConstructionMode === 'cut') {
    for (var level = 1; level <= boundedDepth; level++) {
      var cutTriangles = [];
      collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
      for (var c = 0; c < cutTriangles.length; c++) {
        drawTrianglePath(cutTriangles[c].vertices, {
          fillColor: '#ffffff',
          strokeColor: '#ffffff',
          strokeWidth: 1.08,
          opacity: 0.97
        });
      }
    }
  } else {
    for (var d = 1; d <= boundedDepth; d++) {
      var triangles = [];
      collectTrianglesAtDepth(base, d, 0, 1, triangles);
      for (var t = 0; t < triangles.length; t++) {
        drawTrianglePath(triangles[t].vertices, {
          strokeColor: getTriangulaStrokeColorForSlot(triangles[t].slot, t),
          strokeWidth: Math.max(0.7, 1.3 - (d * 0.1)),
          fillColor: getTriangulaFillColorForSlot(triangles[t].slot, t),
          opacity: Math.max(0.45, 0.92 - (d * 0.08))
        });
      }
    }
  }
}

function getTriangulaItemCountForDepth(base, depth) {
  if (triangulaConstructionMode === 'cut') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, depth, 0, cuts);
    return cuts.length;
  }
  var transitions = [];
  collectParentChildTransitionsAtDepth(base, depth, 0, transitions);
  return transitions.length;
}

function buildTriangulaSteps(startDepth, targetDepth) {
  var steps = [];
  var depthItemCounts = Object.create(null);
  var base = getTriangulaBaseTriangle(1);

  for (var d = startDepth + 1; d <= targetDepth; d++) {
    var itemCount = getTriangulaItemCountForDepth(base, d);
    depthItemCounts[d] = itemCount;
    if (itemCount <= 0) continue;

    if (triangulaFractalMode === 'parallel') {
      if (triangulaConstructionMode === 'cut') {
        steps.push({ type: 'cut-guides', depth: d, beats: 1.0, itemIndex: -1, itemCount: itemCount });
        steps.push({ type: 'cut-apply', depth: d, beats: 0.85, itemIndex: -1, itemCount: itemCount });
      } else {
        steps.push({ type: 'shrink-paths', depth: d, beats: 0.95, itemIndex: -1, itemCount: itemCount });
        steps.push({ type: 'shrink-materialize', depth: d, beats: 0.8, itemIndex: -1, itemCount: itemCount });
      }
      continue;
    }

    for (var idx = 0; idx < itemCount; idx++) {
      if (triangulaConstructionMode === 'cut') {
        steps.push({ type: 'cut-guides', depth: d, beats: 0.5, itemIndex: idx, itemCount: itemCount });
        steps.push({ type: 'cut-apply', depth: d, beats: 0.45, itemIndex: idx, itemCount: itemCount });
      } else {
        steps.push({ type: 'shrink-paths', depth: d, beats: 0.48, itemIndex: idx, itemCount: itemCount });
        steps.push({ type: 'shrink-materialize', depth: d, beats: 0.44, itemIndex: idx, itemCount: itemCount });
      }
    }
  }
  return {
    steps: steps,
    depthItemCounts: depthItemCounts
  };
}

function getTriangulaStepDurationSeconds(step) {
  var baseSeconds = getAnimationSecondsPerSegment();
  var beats = step && isFinite(step.beats) ? Math.max(0.05, step.beats) : 0.5;
  return Math.max(0.03, baseSeconds * beats);
}

function getTriangulaTimelineScale(state) {
  if (triangulaFitMode !== 'dynamic') return 1;
  if (!state || !state.steps || !state.steps.length) return 1;
  var currentStep = state.steps[Math.min(state.stepIndex, state.steps.length - 1)];
  var localProgress = 0;
  if (currentStep) {
    var currentDuration = getTriangulaStepDurationSeconds(currentStep);
    localProgress = Math.max(0, Math.min(1, state.elapsed / currentDuration));
  }
  var phaseProgress = (state.stepIndex + localProgress) / Math.max(1, state.steps.length);
  return Math.max(0.62, 1 - (0.3 * phaseProgress));
}

function triangulaStepFinalizesDepth(step) {
  return !!step && (step.type === 'cut-apply' || step.type === 'shrink-materialize');
}

function getTriangulaFinalizedCountAtDepth(state, depth) {
  if (!state || !state.steps) return 0;
  var count = 0;
  for (var i = 0; i < state.stepIndex; i++) {
    var step = state.steps[i];
    if (!step || step.depth !== depth || !triangulaStepFinalizesDepth(step)) continue;
    count += step.itemIndex === -1 ? (step.itemCount || 0) : 1;
  }
  var maxCount = state.depthItemCounts && state.depthItemCounts[depth] ? state.depthItemCounts[depth] : 0;
  return Math.min(count, maxCount);
}

function getTriangulaCompletedDepth(state) {
  var depth = state ? state.startDepth : 0;
  if (!state || !state.depthItemCounts) return depth;
  for (var d = state.startDepth + 1; d <= state.targetDepth; d++) {
    var needed = state.depthItemCounts[d] || 0;
    if (!needed) {
      depth = d;
      continue;
    }
    if (getTriangulaFinalizedCountAtDepth(state, d) >= needed) {
      depth = d;
      continue;
    }
    break;
  }
  return depth;
}

function drawTriangulaFinalizedAtDepth(base, depth, finalizedCount) {
  if (finalizedCount <= 0) return;

  if (triangulaConstructionMode === 'cut') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, depth, 0, cuts);
    for (var i = 0; i < Math.min(finalizedCount, cuts.length); i++) {
      drawTrianglePath(cuts[i].vertices, {
        fillColor: '#ffffff',
        strokeColor: '#ffffff',
        strokeWidth: 1.06,
        opacity: 0.97
      });
    }
    return;
  }

  var triangles = [];
  collectTrianglesAtDepth(base, depth, 0, 1, triangles);
  for (var j = 0; j < Math.min(finalizedCount, triangles.length); j++) {
    drawTrianglePath(triangles[j].vertices, {
      strokeColor: getTriangulaStrokeColorForSlot(triangles[j].slot, j),
      strokeWidth: Math.max(0.7, 1.3 - (depth * 0.1)),
      fillColor: getTriangulaFillColorForSlot(triangles[j].slot, j),
      opacity: Math.max(0.45, 0.92 - (depth * 0.08))
    });
  }
}

function stepAppliesToIndex(step, index) {
  if (!step) return false;
  return step.itemIndex === -1 || step.itemIndex === index;
}

function drawTriangulaPulseBorder(vertices, progress) {
  if (!vertices || vertices.length < 3) return;
  var p = Math.max(0, Math.min(1, progress));
  // Single-pass envelope with slight hold so emphasis does not fade too quickly.
  var attackEnd = 0.44;
  var holdEnd = 0.72;
  var pulse;
  if (p < attackEnd) {
    pulse = p / attackEnd;
  } else if (p < holdEnd) {
    pulse = 1;
  } else {
    pulse = 1 - ((p - holdEnd) / (1 - holdEnd));
  }
  pulse = Math.max(0, Math.min(1, pulse));
  var easedPulse = pulse * pulse * (3 - (2 * pulse));
  drawTrianglePath(vertices, {
    strokeColor: toRgbaColor('#173b56', 0.38 + (0.42 * easedPulse)),
    strokeWidth: 1.3 + (2.2 * easedPulse),
    opacity: 0.36 + (0.44 * easedPulse)
  });
  drawTrianglePath(vertices, {
    strokeColor: toRgbaColor('#f8fcff', 0.06 + (0.14 * easedPulse)),
    strokeWidth: 2.0 + (1.0 * easedPulse),
    opacity: 0.06 + (0.16 * easedPulse)
  });
}

function drawTriangulaPulseBordersForCutStep(cuts, step, progress) {
  if (!cuts || !cuts.length || !step) return;
  if (step.itemIndex === -1) {
    for (var i = 0; i < cuts.length; i++) {
      drawTriangulaPulseBorder(cuts[i].parent, progress);
    }
    return;
  }
  if (step.itemIndex >= 0 && step.itemIndex < cuts.length) {
    drawTriangulaPulseBorder(cuts[step.itemIndex].parent, progress);
  }
}

function drawTriangulaPulseBordersForShrinkStep(transitions, step, progress) {
  if (!transitions || !transitions.length || !step) return;
  if (step.itemIndex === -1) {
    var parallelPhase = step.type === 'shrink-materialize'
      ? (0.5 + (0.5 * progress))
      : (0.5 * progress);
    for (var i = 0; i < transitions.length; i += 3) {
      drawTriangulaPulseBorder(transitions[i].parent, parallelPhase);
    }
    return;
  }

  // A parent set is 3 child transitions, each with 2 sub-steps.
  // Map all of that to one 0..1 phase so highlight appears once per set:
  // rise through child 1, peak by child 2, fade by end of child 3.
  var childIndexWithinSet = step.itemIndex % 3;
  var childSubstepPhase = step.type === 'shrink-materialize'
    ? (0.5 + (0.5 * progress))
    : (0.5 * progress);
  var setPhase = (childIndexWithinSet + childSubstepPhase) / 3;

  var parentGroupIndex = Math.floor(step.itemIndex / 3) * 3;
  if (parentGroupIndex >= 0 && parentGroupIndex < transitions.length) {
    drawTriangulaPulseBorder(transitions[parentGroupIndex].parent, setPhase);
  }
}

function drawTriangulaStepOverlay(base, step, progress) {
  if (!step) return;
  var p = Math.max(0, Math.min(1, progress));

  if (step.type === 'cut-guides' || step.type === 'cut-apply') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, step.depth, 0, cuts);
    for (var i = 0; i < cuts.length; i++) {
      if (!stepAppliesToIndex(step, i)) continue;
      drawTriangleStrokeProgress(cuts[i].vertices, {
        strokeColor: '#2c5a7d',
        strokeWidth: 1.2,
        opacity: 0.55
      }, step.type === 'cut-guides' ? p : 1);

      if (step.type === 'cut-apply') {
        drawTrianglePath(cuts[i].vertices, {
          fillColor: '#ffffff',
          strokeColor: '#ffffff',
          strokeWidth: 1.08,
          opacity: Math.max(0, Math.min(1, p))
        });
      }
    }
    if (step.type === 'cut-guides') {
      drawTriangulaPulseBordersForCutStep(cuts, step, p);
    }
    return;
  }

  if (step.type === 'shrink-paths' || step.type === 'shrink-materialize') {
    var transitions = [];
    collectParentChildTransitionsAtDepth(base, step.depth, 0, transitions);
    for (var j = 0; j < transitions.length; j++) {
      if (!stepAppliesToIndex(step, j)) continue;
      var link = transitions[j];
      var connector = new Path();
      connector.strokeColor = getTriangulaStrokeColorForSlot(link.slot, j);
      connector.strokeWidth = 1.05;
      connector.opacity = 0.42;
      connector.add(link.from);
      var connectorProgress = step.type === 'shrink-paths' ? p : 1;
      connector.add(link.from.add(link.to.subtract(link.from).multiply(connectorProgress)));
    }

    if (step.type === 'shrink-materialize') {
      for (var k = 0; k < transitions.length; k++) {
        if (!stepAppliesToIndex(step, k)) continue;
        var child = transitions[k];
        drawTrianglePath(child.child, {
          fillColor: getTriangulaFillColorForSlot(child.slot, k),
          strokeColor: getTriangulaStrokeColorForSlot(child.slot, k),
          strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
          opacity: Math.max(0.2, p * (0.95 - (step.depth * 0.08)))
        });
        drawTriangleStrokeProgress(child.child, {
          strokeColor: getTriangulaStrokeColorForSlot(child.slot, k),
          strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
          opacity: Math.max(0.36, 0.85 - (step.depth * 0.08))
        }, p);
      }
    }

    drawTriangulaPulseBordersForShrinkStep(transitions, step, p);
  }
}

function renderTriangulaAnimationStateFrame(state) {
  if (!state) return;
  var step = state.steps[state.stepIndex] || null;
  var completedDepth = getTriangulaCompletedDepth(state);
  var scale = getTriangulaTimelineScale(state);
  var base = getTriangulaBaseTriangle(scale);

  project.activeLayer.removeChildren();
  drawTriangulaDepth(completedDepth, scale);

  if (step && step.depth > completedDepth) {
    var finalizedAtStepDepth = getTriangulaFinalizedCountAtDepth(state, step.depth);
    drawTriangulaFinalizedAtDepth(base, step.depth, finalizedAtStepDepth);
  }

  if (step) {
    var stepDuration = getTriangulaStepDurationSeconds(step);
    var stepProgress = Math.max(0, Math.min(1, state.elapsed / stepDuration));
    drawTriangulaStepOverlay(base, step, stepProgress);
  }
}

function drawTriangulaStatic() {
  project.activeLayer.removeChildren();
  var endDepth = triangulaCountToDepth(triangulaTargetCount);
  drawTriangulaDepth(endDepth, 1);
  clearHighlightedHoleNumbers();
}

function runTriangulaAnimationFrame(event) {
  if (!animationActive || !triangulaAnimationState) return;
  var delta = Math.min(event.delta || 0, 0.1);
  triangulaAnimationState.elapsed += delta;

  while (animationActive) {
    var activeStep = triangulaAnimationState.steps[triangulaAnimationState.stepIndex];
    if (!activeStep) break;
    var stepDuration = getTriangulaStepDurationSeconds(activeStep);
    if (triangulaAnimationState.elapsed < stepDuration) break;
    triangulaAnimationState.elapsed -= stepDuration;
    triangulaAnimationState.stepIndex += 1;

    if (triangulaAnimationState.stepIndex >= triangulaAnimationState.steps.length) {
      animationActive = false;
      animationPlaybackState = 'idle';
      triangulaAnimationState = null;
      view.onFrame = null;
      syncAnimateButtonLabel();
      updateMusicPlaybackState();
      scheduleUrlStateSync(false);
      drawTriangulaStatic();
      return;
    }
  }

  renderTriangulaAnimationStateFrame(triangulaAnimationState);
}

function animateTriangula() {
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  squarusAnimationState = null;
  triangulaAnimationState = null;
  mashrabiyaAnimationState = null;

  var startDepth = triangulaCountToDepth(triangulaStartCount);
  var endDepth = triangulaCountToDepth(triangulaTargetCount);
  if (endDepth < startDepth) {
    endDepth = startDepth;
  }

  var timeline = buildTriangulaSteps(startDepth, endDepth);
  if (!timeline.steps.length) {
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    scheduleUrlStateSync(false);
    drawTriangulaStatic();
    return;
  }

  triangulaAnimationState = {
    startDepth: startDepth,
    targetDepth: endDepth,
    steps: timeline.steps,
    depthItemCounts: timeline.depthItemCounts,
    stepIndex: 0,
    elapsed: 0,
    mode: triangulaConstructionMode,
    fractalMode: triangulaFractalMode
  };

  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderTriangulaAnimationStateFrame(triangulaAnimationState);
  view.onFrame = runTriangulaAnimationFrame;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(value) {
  var t = clamp01(value);
  if (t < 0.5) return 4 * t * t * t;
  var f = -2 * t + 2;
  return 1 - (f * f * f) / 2;
}

function easeOutBack(value) {
  var t = clamp01(value);
  var c1 = 1.70158;
  var c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function normalizeAngleRadians(angle) {
  var a = Number(angle) || 0;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function interpolateAngleShortest(fromAngle, toAngle, t) {
  var from = normalizeAngleRadians(fromAngle);
  var to = normalizeAngleRadians(toAngle);
  var delta = normalizeAngleRadians(to - from);
  return from + (delta * clamp01(t));
}

