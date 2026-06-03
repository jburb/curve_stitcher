(function() {
  window.createStitchingExperienceEngine = function createStitchingExperienceEngine(deps) {
    deps = deps || {};

    return {
      drawStatic: typeof deps.drawStatic === 'function' ? deps.drawStatic : function() {},
      animate: typeof deps.animate === 'function' ? deps.animate : function() {}
    };
  };
})();
