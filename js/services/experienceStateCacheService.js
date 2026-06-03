(function() {
  var DEFAULT_STORAGE_KEY = 'curve_stitcher.experience_state_cache';

  function createMemoryAdapter() {
    var store = Object.create(null);
    return {
      getItem: function(key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem: function(key, value) {
        store[key] = String(value);
      },
      removeItem: function(key) {
        delete store[key];
      }
    };
  }

  function createLocalStorageAdapter() {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      var testKey = '__curve_stitcher_cache_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return {
        getItem: function(key) {
          return window.localStorage.getItem(key);
        },
        setItem: function(key, value) {
          window.localStorage.setItem(key, String(value));
        },
        removeItem: function(key) {
          window.localStorage.removeItem(key);
        }
      };
    } catch (error) {
      return null;
    }
  }

  function safeClone(value) {
    if (typeof value === 'undefined') return undefined;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return value;
    }
  }

  function createEnvelope(schemaVersion) {
    return {
      schemaVersion: schemaVersion,
      updatedAt: new Date().toISOString(),
      common: null,
      experiences: Object.create(null)
    };
  }

  function createExperienceStateCacheService(options) {
    options = options || {};
    var schemaVersion = String(options.schemaVersion || '1');
    var storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    var adapter = options.adapter || createLocalStorageAdapter() || createMemoryAdapter();
    var state = createEnvelope(schemaVersion);

    function writeState() {
      state.updatedAt = new Date().toISOString();
      try {
        adapter.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        // Ignore write failures and keep in-memory state.
      }
    }

    function loadState() {
      var raw = null;
      try {
        raw = adapter.getItem(storageKey);
      } catch (error) {
        raw = null;
      }

      if (!raw) {
        state = createEnvelope(schemaVersion);
        return;
      }

      try {
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
          state = createEnvelope(schemaVersion);
          return;
        }

        if (String(parsed.schemaVersion || '') !== schemaVersion) {
          state = createEnvelope(schemaVersion);
          writeState();
          return;
        }

        state = {
          schemaVersion: schemaVersion,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          common: typeof parsed.common === 'undefined' ? null : safeClone(parsed.common),
          experiences: parsed.experiences && typeof parsed.experiences === 'object'
            ? safeClone(parsed.experiences)
            : Object.create(null)
        };
      } catch (error) {
        state = createEnvelope(schemaVersion);
      }
    }

    function setExperienceSnapshot(experienceId, snapshot) {
      if (!experienceId) return;
      state.experiences[experienceId] = safeClone(snapshot);
      writeState();
    }

    function getExperienceSnapshot(experienceId) {
      if (!experienceId) return null;
      if (!Object.prototype.hasOwnProperty.call(state.experiences, experienceId)) return null;
      return safeClone(state.experiences[experienceId]);
    }

    function getAllExperienceSnapshots() {
      return safeClone(state.experiences) || Object.create(null);
    }

    function clearExperienceSnapshot(experienceId) {
      if (!experienceId) return;
      if (!Object.prototype.hasOwnProperty.call(state.experiences, experienceId)) return;
      delete state.experiences[experienceId];
      writeState();
    }

    function setCommonSnapshot(snapshot) {
      state.common = safeClone(snapshot);
      writeState();
    }

    function getCommonSnapshot() {
      return safeClone(state.common);
    }

    function clearAll() {
      state = createEnvelope(schemaVersion);
      try {
        adapter.removeItem(storageKey);
      } catch (error) {
        writeState();
      }
    }

    loadState();

    return {
      getSchemaVersion: function() {
        return schemaVersion;
      },
      getStorageKey: function() {
        return storageKey;
      },
      setExperienceSnapshot: setExperienceSnapshot,
      getExperienceSnapshot: getExperienceSnapshot,
      getAllExperienceSnapshots: getAllExperienceSnapshots,
      clearExperienceSnapshot: clearExperienceSnapshot,
      setCommonSnapshot: setCommonSnapshot,
      getCommonSnapshot: getCommonSnapshot,
      clearAll: clearAll
    };
  }

  window.createExperienceStateCacheService = createExperienceStateCacheService;
})();
