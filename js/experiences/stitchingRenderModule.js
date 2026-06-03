(function() {
  function createStitchingRenderModule(deps) {
    deps = deps || {};

    function computeSequence(thread) {
      var points = deps.getPoints();
      var n = points.length;

      if (thread.sequence && thread.sequence.type === 'custom') {
        return thread.sequence.list;
      }

      var jumpMode = thread.jumpMode || 'fixed';
      var visited = new Array(n).fill(false);
      var current = 0;
      var prev = 0;
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
          .filter(function(num) { return isFinite(num); })
          .map(function(num) { return Math.round(num); })
          .filter(function(num) { return num !== 0; });
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
      var points = deps.getPoints();
      var n = points.length;
      if (!n || !thread) return [];

      if (thread.jumpMode === 'connect') {
        deps.ensureThreadConnectConfig(thread);
        var segments = [];
        var multiplier = Math.round(Number(thread.connectMultiplier || 2));
        var offset = Math.round(Number(thread.connectOffset || 0));
        for (var i = 0; i < n; i++) {
          var sourceLabel = i + 1;
          var mappedLabel = (multiplier * sourceLabel + offset - 1) % n;
          if (mappedLabel < 0) mappedLabel += n;
          var mapped = mappedLabel;
          segments.push([i, mapped]);
        }
        return segments;
      }

      var seq = computeSequence(thread);
      var chained = [];
      for (var j = 0; j < seq.length; j++) {
        chained.push([seq[j], seq[(j + 1) % seq.length]]);
      }
      return chained;
    }

    function drawThread(thread) {
      var segments = computeSegments(thread);
      var points = deps.getPoints();

      for (var i = 0; i < segments.length; i++) {
        var fromIndex = segments[i][0];
        var toIndex = segments[i][1];
        if (!isFinite(fromIndex) || !isFinite(toIndex)) continue;
        var seg = new Path();
        seg.strokeWidth = thread.width;

        if (thread.color === 'rainbow') {
          seg.strokeColor = deps.rainbowColor(i / Math.max(1, segments.length));
        } else {
          seg.strokeColor = thread.color;
        }

        seg.add(points[fromIndex]);
        seg.add(points[toIndex]);
      }
    }

    function drawShapeBorder() {
      if (!deps.getBorderEnabled()) return;

      var borderGeometry = deps.getBorderGeometryForCurrentShape();
      if (!borderGeometry || !borderGeometry.outerSamples || !borderGeometry.innerSamples) return;

      var polygonVertices = borderGeometry.isPolygon ? borderGeometry.polygonVertices : null;
      var outerSamples = borderGeometry.outerSamples;
      var innerSamples = borderGeometry.innerSamples;

      var outerPath = new Path(outerSamples);
      outerPath.closed = true;
      outerPath.strokeColor = deps.getBorderStrokeColor();
      outerPath.strokeWidth = deps.getBorderStrokeWidth();
      outerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
      outerPath.strokeCap = 'round';
      outerPath.miterLimit = 8;

      var innerPath = new Path(innerSamples);
      innerPath.closed = true;
      innerPath.strokeColor = deps.getBorderStrokeColor();
      innerPath.strokeWidth = deps.getBorderStrokeWidth();
      innerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
      innerPath.strokeCap = 'round';
      innerPath.miterLimit = 8;
    }

    function renderAnimationFrame() {
      var animationState = deps.getAnimationState();
      if (!animationState) {
        deps.drawStatic();
        return;
      }

      deps.clearLayer();
      deps.computePoints();
      drawShapeBorder();
      deps.drawHoles();

      var threads = deps.getThreads();

      for (var i = 0; i < animationState.threadIndex; i++) {
        deps.drawAnimatedSegments(threads[i], animationState.segmentLists[i], (animationState.segmentLists[i] || []).length);
      }

      var activePair = null;
      if (animationState.threadIndex >= 0 && animationState.threadIndex < threads.length) {
        var activeThread = threads[animationState.threadIndex];
        var activeSegments = animationState.segmentLists[animationState.threadIndex] || [];

        deps.drawAnimatedSegments(activeThread, activeSegments, animationState.step);

        if (animationState.step < activeSegments.length) {
          var segmentProgress = animationState.elapsed / deps.getAnimationSecondsPerSegment();
          activePair = deps.drawAnimatedSegmentProgress(activeThread, activeSegments, animationState.step, segmentProgress);
        }
      }

      deps.drawSegmentSettleAccent(animationState.settle);

      animationState.activeHolePair = activePair;
      deps.syncHoleNumberHighlightFromAnimationState();
      deps.bringHoleNumbersToFront();
    }

    return {
      computeSegments: computeSegments,
      drawThread: drawThread,
      drawShapeBorder: drawShapeBorder,
      renderAnimationFrame: renderAnimationFrame
    };
  }

  window.createStitchingRenderModule = createStitchingRenderModule;
})();
