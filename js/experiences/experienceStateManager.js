(function() {
  function createFallbackManager(handlers, options) {
    options = options || {};
    var cache = options.cache || null;
    var slots = Object.create(null);

    if (cache && typeof cache.getAllExperienceSnapshots === 'function') {
      var persisted = cache.getAllExperienceSnapshots();
      if (persisted && typeof persisted === 'object') {
        slots = persisted;
      }
    }

    return {
      capture: function(experienceId) {
        var handler = handlers && handlers[experienceId];
        if (!handler || typeof handler.capture !== 'function') return false;
        slots[experienceId] = handler.capture();
        if (cache && typeof cache.setExperienceSnapshot === 'function') {
          cache.setExperienceSnapshot(experienceId, slots[experienceId]);
        }
        return true;
      },
      restore: function(experienceId) {
        var handler = handlers && handlers[experienceId];
        if (!handler || typeof handler.apply !== 'function') return false;

        if (!Object.prototype.hasOwnProperty.call(slots, experienceId) && cache && typeof cache.getExperienceSnapshot === 'function') {
          var persisted = cache.getExperienceSnapshot(experienceId);
          if (typeof persisted !== 'undefined' && persisted !== null) {
            slots[experienceId] = persisted;
          }
        }

        if (!Object.prototype.hasOwnProperty.call(slots, experienceId)) return false;
        handler.apply(slots[experienceId]);
        return true;
      },
      snapshot: function() {
        return Object.assign({}, slots);
      }
    };
  }

  window.createExperienceStateManager = function createExperienceStateManager(handlers, options) {
    return createFallbackManager(handlers || {}, options || {});
  };
})();
