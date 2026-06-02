window.stitchingExperienceAdapter = Object.freeze({
  bindEvents: function(ctx) {
    if (typeof window.bindStitchingEvents === 'function') {
      window.bindStitchingEvents(ctx.stitchingDeps);
    }
    if (typeof window.bindDiscoveryEvents === 'function') {
      window.bindDiscoveryEvents(ctx.discoveryDeps);
    }
  }
});
