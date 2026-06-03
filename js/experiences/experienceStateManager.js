(function() {
  function createFallbackManager(handlers) {
    var slots = Object.create(null);

    return {
      capture: function(experienceId) {
        var handler = handlers && handlers[experienceId];
        if (!handler || typeof handler.capture !== 'function') return;
        slots[experienceId] = handler.capture();
      },
      restore: function(experienceId) {
        var handler = handlers && handlers[experienceId];
        if (!handler || typeof handler.apply !== 'function') return;
        if (!Object.prototype.hasOwnProperty.call(slots, experienceId)) return;
        handler.apply(slots[experienceId]);
      },
      snapshot: function() {
        return Object.assign({}, slots);
      }
    };
  }

  window.createExperienceStateManager = function createExperienceStateManager(handlers) {
    return createFallbackManager(handlers || {});
  };
})();
