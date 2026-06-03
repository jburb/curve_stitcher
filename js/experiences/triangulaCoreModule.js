(function() {
  function createTriangulaCoreModule(deps) {
    deps = deps || {};

    function triangulaCountToDepth(count) {
      var safeCount = Math.max(1, Math.floor(Number(count) || 1));
      var depth = Math.round(Math.log(safeCount) / Math.log(3));
      if (!isFinite(depth) || depth < 0) depth = 0;
      return Math.max(0, Math.min(6, depth));
    }

    function getTriangulaBaseTriangle(scaleFactor) {
      var view = deps.getView();
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
      if (deps.getTriangulaConstructionMode() === 'cut') return 'all';
      return deps.getTriangulaColorMode() || 'band-1';
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
      var bands = deps.getTriangulaBandColors();
      var allColor = normalizeTriangulaFillColor(deps.getThreadZeroColor(), bands.band1);
      if (mode === 'all') return getTriangulaResolvedFillColor(allColor, rainbowSequence, bands.band1);
      if (mode === 'band-1') return slot === 1 ? getTriangulaResolvedFillColor(bands.band1, rainbowSequence, bands.band1) : '#ffffff';
      if (mode === 'band-2') return slot === 2 ? getTriangulaResolvedFillColor(bands.band2, rainbowSequence, bands.band2) : '#ffffff';
      if (mode === 'band-4') return slot === 4 ? getTriangulaResolvedFillColor(bands.band4, rainbowSequence, bands.band4) : '#ffffff';
      return getTriangulaResolvedFillColor(allColor, rainbowSequence, bands.band1);
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

    function getTriangulaItemCountForDepth(base, depth) {
      if (deps.getTriangulaConstructionMode() === 'cut') {
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

        if (deps.getTriangulaFractalMode() === 'parallel') {
          if (deps.getTriangulaConstructionMode() === 'cut') {
            steps.push({ type: 'cut-guides', depth: d, beats: 1.0, itemIndex: -1, itemCount: itemCount });
            steps.push({ type: 'cut-apply', depth: d, beats: 0.85, itemIndex: -1, itemCount: itemCount });
          } else {
            steps.push({ type: 'shrink-paths', depth: d, beats: 0.95, itemIndex: -1, itemCount: itemCount });
            steps.push({ type: 'shrink-materialize', depth: d, beats: 0.8, itemIndex: -1, itemCount: itemCount });
          }
          continue;
        }

        for (var idx = 0; idx < itemCount; idx++) {
          if (deps.getTriangulaConstructionMode() === 'cut') {
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
      var baseSeconds = deps.getAnimationSecondsPerSegment();
      var beats = step && isFinite(step.beats) ? Math.max(0.05, step.beats) : 0.5;
      return Math.max(0.03, baseSeconds * beats);
    }

    function getTriangulaTimelineScale(state) {
      if (deps.getTriangulaFitMode() !== 'dynamic') return 1;
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

    return {
      triangulaCountToDepth: triangulaCountToDepth,
      getTriangulaBaseTriangle: getTriangulaBaseTriangle,
      normalizeTriangulaFillColor: normalizeTriangulaFillColor,
      getTriangulaAlternatingRainbowColor: getTriangulaAlternatingRainbowColor,
      getTriangulaResolvedFillColor: getTriangulaResolvedFillColor,
      getTriangulaEffectiveColorMode: getTriangulaEffectiveColorMode,
      getTriangulaRainbowSequenceIndex: getTriangulaRainbowSequenceIndex,
      getTriangulaFillColorForSlot: getTriangulaFillColorForSlot,
      getTriangulaStrokeColorForSlot: getTriangulaStrokeColorForSlot,
      getTriangulaSplit: getTriangulaSplit,
      collectTrianglesAtDepth: collectTrianglesAtDepth,
      collectCutTrianglesAtDepth: collectCutTrianglesAtDepth,
      collectParentChildTransitionsAtDepth: collectParentChildTransitionsAtDepth,
      drawTriangleStrokeProgress: drawTriangleStrokeProgress,
      drawTrianglePath: drawTrianglePath,
      getTriangulaItemCountForDepth: getTriangulaItemCountForDepth,
      buildTriangulaSteps: buildTriangulaSteps,
      getTriangulaStepDurationSeconds: getTriangulaStepDurationSeconds,
      getTriangulaTimelineScale: getTriangulaTimelineScale,
      getTriangulaFinalizedCountAtDepth: getTriangulaFinalizedCountAtDepth,
      getTriangulaCompletedDepth: getTriangulaCompletedDepth
    };
  }

  window.createTriangulaCoreModule = createTriangulaCoreModule;
})();
