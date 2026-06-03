(function() {
  function createTriangulaExperienceRuntime(deps) {
    deps = deps || {};

    function renderAnimationStateFrame(state) {
      if (!state) return;
      var step = state.steps[state.stepIndex] || null;
      var completedDepth = deps.getTriangulaCompletedDepth(state);
      var scale = deps.getTriangulaTimelineScale(state);
      var base = deps.getTriangulaBaseTriangle(scale);

      deps.clearLayer();
      deps.drawTriangulaDepth(completedDepth, scale);

      if (step && step.depth > completedDepth) {
        var finalizedAtStepDepth = deps.getTriangulaFinalizedCountAtDepth(state, step.depth);
        deps.drawTriangulaFinalizedAtDepth(base, step.depth, finalizedAtStepDepth);
      }

      if (step) {
        var stepDuration = deps.getTriangulaStepDurationSeconds(step);
        var stepProgress = Math.max(0, Math.min(1, state.elapsed / stepDuration));
        deps.drawTriangulaStepOverlay(base, step, stepProgress);
      }
    }

    function drawStatic() {
      deps.clearLayer();
      var endDepth = deps.triangulaCountToDepth(deps.getTriangulaTargetCount());
      deps.drawTriangulaDepth(endDepth, 1);
      deps.clearHighlightedHoleNumbers();
    }

    function runAnimationFrame(event) {
      if (!deps.getAnimationActive()) return;

      var state = deps.getTriangulaAnimationState();
      if (!state) return;

      var delta = Math.min(event.delta || 0, 0.1);
      state.elapsed += delta;

      while (deps.getAnimationActive()) {
        var activeStep = state.steps[state.stepIndex];
        if (!activeStep) break;

        var stepDuration = deps.getTriangulaStepDurationSeconds(activeStep);
        if (state.elapsed < stepDuration) break;

        state.elapsed -= stepDuration;
        state.stepIndex += 1;

        if (state.stepIndex >= state.steps.length) {
          deps.setAnimationActive(false);
          deps.setAnimationPlaybackState('idle');
          deps.setTriangulaAnimationState(null);
          deps.setViewFrameHandler(null);
          deps.syncAnimateButtonLabel();
          deps.updateMusicPlaybackState();
          deps.scheduleUrlStateSync(false);
          drawStatic();
          return;
        }
      }

      renderAnimationStateFrame(state);
    }

    function animate() {
      deps.setAnimationActive(false);
      deps.setViewFrameHandler(null);
      deps.setAnimationState(null);
      deps.setTriangulaAnimationState(null);

      var startDepth = deps.triangulaCountToDepth(deps.getTriangulaStartCount());
      var endDepth = deps.triangulaCountToDepth(deps.getTriangulaTargetCount());
      if (endDepth < startDepth) {
        endDepth = startDepth;
      }

      var timeline = deps.buildTriangulaSteps(startDepth, endDepth);
      if (!timeline.steps.length) {
        deps.setAnimationPlaybackState('idle');
        deps.syncAnimateButtonLabel();
        deps.scheduleUrlStateSync(false);
        drawStatic();
        return;
      }

      deps.setTriangulaAnimationState({
        startDepth: startDepth,
        targetDepth: endDepth,
        steps: timeline.steps,
        depthItemCounts: timeline.depthItemCounts,
        stepIndex: 0,
        elapsed: 0,
        mode: deps.getTriangulaConstructionMode(),
        fractalMode: deps.getTriangulaFractalMode()
      });

      deps.setAnimationActive(true);
      deps.setAnimationPlaybackState('playing');
      deps.syncAnimateButtonLabel();
      deps.updateMusicPlaybackState();
      deps.scheduleUrlStateSync(false);
      renderAnimationStateFrame(deps.getTriangulaAnimationState());
      deps.setViewFrameHandler(runAnimationFrame);
    }

    return {
      renderAnimationStateFrame: renderAnimationStateFrame,
      drawStatic: drawStatic,
      runAnimationFrame: runAnimationFrame,
      animate: animate
    };
  }

  window.createTriangulaExperienceRuntime = createTriangulaExperienceRuntime;
})();
