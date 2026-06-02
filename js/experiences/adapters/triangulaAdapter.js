window.triangulaExperienceAdapter = Object.freeze({
  bindEvents: function(ctx) {
    if (typeof window.bindTriangulaEvents === 'function') {
      window.bindTriangulaEvents(ctx.triangulaDeps);
    }
  }
});
