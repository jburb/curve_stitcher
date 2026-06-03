(function() {
  function createTriangulaRenderModule(deps) {
    deps = deps || {};

    function drawTriangulaDepth(depth, scale) {
      var base = deps.getTriangulaBaseTriangle(scale);
      var baseColor = deps.getTriangulaFillColorForSlot(1);
      deps.drawTrianglePath(base, {
        strokeColor: '#234b61',
        strokeWidth: deps.getTriangulaConstructionMode() === 'cut' ? 1.7 : 1.1,
        fillColor: baseColor,
        opacity: 0.95
      });

      var boundedDepth = Math.max(0, Math.min(6, depth));
      if (deps.getTriangulaConstructionMode() === 'cut') {
        for (var level = 1; level <= boundedDepth; level++) {
          var cutTriangles = [];
          deps.collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
          for (var c = 0; c < cutTriangles.length; c++) {
            deps.drawTrianglePath(cutTriangles[c].vertices, {
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
          deps.collectTrianglesAtDepth(base, d, 0, 1, triangles);
          for (var t = 0; t < triangles.length; t++) {
            deps.drawTrianglePath(triangles[t].vertices, {
              strokeColor: deps.getTriangulaStrokeColorForSlot(triangles[t].slot, t),
              strokeWidth: Math.max(0.7, 1.3 - (d * 0.1)),
              fillColor: deps.getTriangulaFillColorForSlot(triangles[t].slot, t),
              opacity: Math.max(0.45, 0.92 - (d * 0.08))
            });
          }
        }
      }
    }

    function drawTriangulaFinalizedAtDepth(base, depth, finalizedCount) {
      if (finalizedCount <= 0) return;

      if (deps.getTriangulaConstructionMode() === 'cut') {
        var cuts = [];
        deps.collectCutTrianglesAtDepth(base, depth, 0, cuts);
        for (var i = 0; i < Math.min(finalizedCount, cuts.length); i++) {
          deps.drawTrianglePath(cuts[i].vertices, {
            fillColor: '#ffffff',
            strokeColor: '#ffffff',
            strokeWidth: 1.06,
            opacity: 0.97
          });
        }
        return;
      }

      var triangles = [];
      deps.collectTrianglesAtDepth(base, depth, 0, 1, triangles);
      for (var j = 0; j < Math.min(finalizedCount, triangles.length); j++) {
        deps.drawTrianglePath(triangles[j].vertices, {
          strokeColor: deps.getTriangulaStrokeColorForSlot(triangles[j].slot, j),
          strokeWidth: Math.max(0.7, 1.3 - (depth * 0.1)),
          fillColor: deps.getTriangulaFillColorForSlot(triangles[j].slot, j),
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
      deps.drawTrianglePath(vertices, {
        strokeColor: deps.toRgbaColor('#173b56', 0.38 + (0.42 * easedPulse)),
        strokeWidth: 1.3 + (2.2 * easedPulse),
        opacity: 0.36 + (0.44 * easedPulse)
      });
      deps.drawTrianglePath(vertices, {
        strokeColor: deps.toRgbaColor('#f8fcff', 0.06 + (0.14 * easedPulse)),
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
        deps.collectCutTrianglesAtDepth(base, step.depth, 0, cuts);
        for (var i = 0; i < cuts.length; i++) {
          if (!stepAppliesToIndex(step, i)) continue;
          deps.drawTriangleStrokeProgress(cuts[i].vertices, {
            strokeColor: '#2c5a7d',
            strokeWidth: 1.2,
            opacity: 0.55
          }, step.type === 'cut-guides' ? p : 1);

          if (step.type === 'cut-apply') {
            deps.drawTrianglePath(cuts[i].vertices, {
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
        deps.collectParentChildTransitionsAtDepth(base, step.depth, 0, transitions);
        for (var j = 0; j < transitions.length; j++) {
          if (!stepAppliesToIndex(step, j)) continue;
          var link = transitions[j];
          var connector = deps.createPath();
          connector.strokeColor = deps.getTriangulaStrokeColorForSlot(link.slot, j);
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
            deps.drawTrianglePath(child.child, {
              fillColor: deps.getTriangulaFillColorForSlot(child.slot, k),
              strokeColor: deps.getTriangulaStrokeColorForSlot(child.slot, k),
              strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
              opacity: Math.max(0.2, p * (0.95 - (step.depth * 0.08)))
            });
            deps.drawTriangleStrokeProgress(child.child, {
              strokeColor: deps.getTriangulaStrokeColorForSlot(child.slot, k),
              strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
              opacity: Math.max(0.36, 0.85 - (step.depth * 0.08))
            }, p);
          }
        }

        drawTriangulaPulseBordersForShrinkStep(transitions, step, p);
      }
    }

    return {
      drawTriangulaDepth: drawTriangulaDepth,
      drawTriangulaFinalizedAtDepth: drawTriangulaFinalizedAtDepth,
      drawTriangulaStepOverlay: drawTriangulaStepOverlay
    };
  }

  window.createTriangulaRenderModule = createTriangulaRenderModule;
})();
