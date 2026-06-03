(function() {
  function createStitchingExperienceRuntime(deps) {
    deps = deps || {};

    function shouldShowHoleNumbersNow() {
      var holeCount = parseInt(deps.getHolesValue(), 10);
      if (!isFinite(holeCount)) return false;
      return deps.getShowHoleNumbers() && holeCount <= deps.getHoleNumberAutoHideThreshold();
    }

    function getOutwardDirectionAtHole(index, ccw) {
      var points = deps.getPoints();
      if (!points.length) return new Point(0, -1);

      var n = points.length;
      var prev = points[(index - 1 + n) % n];
      var curr = points[index];
      var next = points[(index + 1) % n];
      var tangent = next.subtract(prev);

      if (tangent.length <= 0.001) {
        var fromCenter = curr.subtract(view.center);
        if (fromCenter.length <= 0.001) return new Point(0, -1);
        return fromCenter.normalize(1);
      }

      var outwardRotation = ccw ? -90 : 90;
      var outward = tangent.normalize(1).rotate(outwardRotation);
      if (outward.length <= 0.001) {
        var fallback = curr.subtract(view.center);
        if (fallback.length <= 0.001) return new Point(0, -1);
        return fallback.normalize(1);
      }

      if (outward.dot(curr.subtract(view.center)) < 0) {
        outward = outward.multiply(-1);
      }

      return outward.normalize(1);
    }

    function getBoundsExtentAlongDirection(item, direction) {
      var dir = direction.normalize(1);
      var center = item.position;
      var corners = [
        item.bounds.topLeft,
        item.bounds.topRight,
        item.bounds.bottomLeft,
        item.bounds.bottomRight
      ];
      var maxProjection = 0;
      for (var i = 0; i < corners.length; i++) {
        var projection = corners[i].subtract(center).dot(dir);
        if (projection > maxProjection) {
          maxProjection = projection;
        }
      }
      return Math.max(0, maxProjection);
    }

    function getHoleNumberFontSize(holeCount) {
      if (holeCount >= 70) return 8;
      if (holeCount >= 55) return 8.5;
      return 9;
    }

    function getHoleLabelOffsetFromExtent(extent, borderClearance, holeClearance) {
      var borderPad = isFinite(borderClearance) ? borderClearance : deps.getLabelBorderClearance();
      var holePad = isFinite(holeClearance) ? holeClearance : deps.getLabelHoleClearance();
      var minOffset = 3 + holePad + extent;
      var maxOffset = deps.getBorderOuterGap() - (deps.getBorderStrokeWidth() * 0.5 + borderPad + extent);
      var preferredOffset = Math.max(minOffset, deps.getBorderOuterGap() * deps.getLabelOuterBias());
      var clampedOffset;

      if (maxOffset >= minOffset) {
        clampedOffset = Math.max(minOffset, Math.min(preferredOffset, maxOffset));
      } else {
        clampedOffset = Math.max(3.8, maxOffset);
      }

      if (!isFinite(clampedOffset)) {
        clampedOffset = Math.max(4, deps.getBorderOuterGap() * 0.6);
      }

      return {
        offset: clampedOffset,
        minOffset: minOffset,
        maxOffset: maxOffset
      };
    }

    function estimateTextExtentAlongDirection(text, fontSize) {
      var len = String(text || '').length;
      if (len <= 1) return fontSize * 0.28;
      if (len === 2) return fontSize * 0.46;
      return fontSize * (0.56 + Math.min(2, len - 2) * 0.1);
    }

    function drawHoles() {
      var points = deps.getPoints();
      var numbersVisible = shouldShowHoleNumbersNow();
      var holeCount = parseInt(deps.getHolesValue(), 10);
      if (!isFinite(holeCount)) holeCount = deps.getDefaultHoles();
      var fontSize = getHoleNumberFontSize(holeCount);
      var ccw = deps.signedAreaOfClosedPolyline(points) > 0;
      var holeLabelsByIndex = Object.create(null);
      deps.setHighlightedHoleNumbers([]);

      for (var i = 0; i < points.length; i++) {
        new Path.Circle(points[i], 3).fillColor = '#333';

        if (!numbersVisible) continue;

        var outward = getOutwardDirectionAtHole(i, ccw);
        var label = new PointText(points[i]);
        label.justification = 'center';
        label.fillColor = '#555';
        label.fontSize = fontSize;
        label.fontWeight = 'normal';
        label.content = String(i + 1);

        var extent = getBoundsExtentAlongDirection(label, outward);
        var metrics = getHoleLabelOffsetFromExtent(
          extent,
          deps.getLabelBorderClearance(),
          deps.getLabelHoleClearance()
        );
        var minOffset = metrics.minOffset;
        var maxOffset = metrics.maxOffset;

        // If space is tight, reduce label size before final placement.
        if (maxOffset < minOffset) {
          var availableBand = deps.getBorderOuterGap() - (deps.getBorderStrokeWidth() * 0.5 + deps.getLabelBorderClearance()) - (3 + deps.getLabelHoleClearance());
          var targetFont = Math.max(6, Math.min(label.fontSize, availableBand * 1.6));
          if (targetFont < label.fontSize) {
            label.fontSize = targetFont;
            extent = getBoundsExtentAlongDirection(label, outward);
            metrics = getHoleLabelOffsetFromExtent(
              extent,
              deps.getLabelBorderClearance(),
              deps.getLabelHoleClearance()
            );
            minOffset = metrics.minOffset;
            maxOffset = metrics.maxOffset;
          }
        }

        var clampedOffset = metrics.offset;
        if (maxOffset < minOffset) {
          clampedOffset = getHoleLabelOffsetFromExtent(
            extent,
            deps.getLabelBorderClearance(),
            deps.getLabelHoleClearance()
          ).offset;
        }

        label.position = points[i].add(outward.multiply(clampedOffset));
        holeLabelsByIndex[i] = label;
      }

      deps.setHoleNumberLabelsByIndex(holeLabelsByIndex);
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

    function completeAnimationCycle() {
      deps.setAnimationActive(false);
      deps.setViewFrameHandler(null);
      deps.setAnimationState(null);
      deps.setAnimationPlaybackState('idle');
      deps.syncAnimateButtonLabel();
      deps.clearHighlightedHoleNumbers();
      deps.updateMusicPlaybackState();
      deps.scheduleUrlStateSync(false);
      deps.drawStatic();
    }

    function drawStatic() {
      deps.clearLayer();
      deps.computePoints();
      deps.drawShapeBorder();
      drawHoles();

      var threads = deps.getThreads();
      for (var i = 0; i < threads.length; i++) {
        deps.drawThread(threads[i]);
      }

      deps.clearHighlightedHoleNumbers();
      bringHoleNumbersToFront();
    }

    function runAnimationFrameTick(event) {
      if (!deps.getAnimationActive()) return;

      var animationState = deps.getAnimationState();
      if (!animationState || !animationState.segmentLists.length) {
        completeAnimationCycle();
        return;
      }

      var frameDelta = Math.min(event.delta, 0.1);
      animationState.elapsed += frameDelta;

      if (animationState.settle) {
        animationState.settle.remaining = Math.max(0, animationState.settle.remaining - frameDelta);
        if (animationState.settle.remaining <= 0) {
          animationState.settle = null;
        }
      }

      var secondsPerSegment = deps.getAnimationSecondsPerSegment();
      while (animationState.elapsed >= secondsPerSegment && deps.getAnimationActive()) {
        animationState.elapsed -= secondsPerSegment;

        var threadIndex = animationState.threadIndex;
        var threads = deps.getThreads();
        if (threadIndex < 0 || threadIndex >= threads.length) {
          completeAnimationCycle();
          return;
        }

        var segments = animationState.segmentLists[threadIndex] || [];
        if (animationState.step < segments.length) {
          animationState.settle = {
            threadIndex: threadIndex,
            segmentIndex: animationState.step,
            segments: segments,
            duration: deps.getStitchPullSettleSeconds(),
            remaining: deps.getStitchPullSettleSeconds()
          };
          animationState.step++;
        } else {
          animationState.threadIndex++;
          if (animationState.threadIndex >= threads.length) {
            completeAnimationCycle();
            return;
          }
          animationState.step = 0;
        }
      }

      deps.renderAnimationFrame();
    }

    function startAnimationLoop() {
      deps.setViewFrameHandler(runAnimationFrameTick);
    }

    function animate() {
      deps.setAnimationActive(false);
      deps.setViewFrameHandler(null);
      deps.setAnimationState(null);
      deps.setTriangulaAnimationState(null);
      deps.clearHighlightedHoleNumbers();

      deps.clearLayer();
      deps.computePoints();

      var threads = deps.getThreads();
      deps.setAnimationState({
        threadIndex: 0,
        step: 0,
        elapsed: 0,
        activeHolePair: null,
        settle: null,
        segmentLists: threads.map(function(thread) {
          return deps.computeSegments(thread);
        })
      });

      deps.setAnimationActive(true);
      deps.setAnimationPlaybackState('playing');
      deps.syncAnimateButtonLabel();
      deps.updateMusicPlaybackState();
      deps.scheduleUrlStateSync(false);
      deps.renderAnimationFrame();
      startAnimationLoop();
    }

    return {
      shouldShowHoleNumbersNow: shouldShowHoleNumbersNow,
      getOutwardDirectionAtHole: getOutwardDirectionAtHole,
      getBoundsExtentAlongDirection: getBoundsExtentAlongDirection,
      getHoleNumberFontSize: getHoleNumberFontSize,
      getHoleLabelOffsetFromExtent: getHoleLabelOffsetFromExtent,
      estimateTextExtentAlongDirection: estimateTextExtentAlongDirection,
      drawHoles: drawHoles,
      bringHoleNumbersToFront: bringHoleNumbersToFront,
      drawStatic: drawStatic,
      animate: animate,
      runAnimationFrameTick: runAnimationFrameTick,
      startAnimationLoop: startAnimationLoop
    };
  }

  window.createStitchingExperienceRuntime = createStitchingExperienceRuntime;
})();
