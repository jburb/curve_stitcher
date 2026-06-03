(function() {
  function createUrlStateService(deps) {
    deps = deps || {};

    function buildSearchParamsFromAppState() {
      deps.syncAppStateFromRuntime();
      var params = new URLSearchParams();
      var activeExperienceId = deps.getAppState().experienceId;
      deps.setUrlStateParam(params, 'version', deps.getAppStateUrlVersion());
      deps.setUrlStateParam(params, 'experience', activeExperienceId);
      deps.setUrlStateParam(params, 'shape', deps.getAppState().common.shape);
      deps.setUrlStateParam(params, 'bpm', String(deps.getAppState().common.bpm));
      deps.setUrlStateParam(params, 'musicMuted', deps.getAppState().common.musicMuted ? '1' : '0');
      deps.setUrlStateParam(params, 'songId', deps.getAppState().common.songId);

      var handler = deps.getExperienceUrlHandler(activeExperienceId);
      if (handler && typeof handler.appendParams === 'function') {
        handler.appendParams(params);
      }

      return params;
    }

    function flushUrlStateSync() {
      if (deps.getUrlSyncSuspended()) return;
      var params = buildSearchParamsFromAppState();
      var nextSearch = params.toString();
      var nextUrl = nextSearch ? (window.location.pathname + '?' + nextSearch) : window.location.pathname;
      var currentUrl = window.location.pathname + window.location.search;
      if (nextUrl === currentUrl) return;
      history.replaceState({ appStateVersion: deps.getAppStateUrlVersion() }, '', nextUrl);
    }

    function scheduleUrlStateSync(immediate) {
      if (deps.getUrlSyncSuspended()) return;
      var urlSyncTimer = deps.getUrlSyncTimer();
      if (urlSyncTimer) {
        clearTimeout(urlSyncTimer);
        deps.setUrlSyncTimer(null);
      }
      if (immediate) {
        flushUrlStateSync();
        return;
      }
      deps.setUrlSyncTimer(window.setTimeout(function() {
        deps.setUrlSyncTimer(null);
        flushUrlStateSync();
      }, deps.getUrlSyncDebounceMs()));
    }

    function applyStateFromCurrentUrl(options) {
      options = options || {};
      var params = new URLSearchParams(window.location.search || '');
      var requestedExperience = deps.resolveExperienceId(deps.getUrlStateParam(params, 'experience'));

      if (!requestedExperience) {
        requestedExperience = deps.getCurrentExperienceId();
      }

      try {
        deps.withUrlSyncSuspended(function() {
          if (deps.resolveExperienceId(deps.getUrlStateParam(params, 'experience'))) {
            deps.setCurrentExperience(requestedExperience, { suppressUrlSync: true });
          }

          var profile = deps.getExperienceUiProfile(deps.getCurrentExperienceId());
          var shapeFromUrl = deps.sanitizeShape(deps.getUrlStateParam(params, 'shape'), deps.getCurrentShape());
          if (profile && profile.fixedShape) {
            shapeFromUrl = profile.fixedShape;
          }

          deps.setCurrentShape(shapeFromUrl, false);

          var songIdFromUrl = deps.sanitizeSongId(deps.getUrlStateParam(params, 'songId'), deps.getCurrentSongId());
          if (deps.canApplySongSelection(songIdFromUrl)) {
            deps.setCurrentSong(songIdFromUrl);
          }

          var bpmFromUrl = deps.sanitizeBpmForCurrentSong(deps.getUrlStateParam(params, 'bpm'), deps.getCurrentAnimationBpm());
          deps.applyTempoValue(bpmFromUrl);

          var mutedFromUrl = deps.sanitizeBooleanParam(deps.getUrlStateParam(params, 'musicMuted'), deps.getMusicMuted());
          deps.setMusicMutedState(mutedFromUrl);
          deps.syncMusicToggleButton();

          deps.dispatchRuntimeState({
            type: 'HYDRATE_URL_META',
            payload: {
              experienceId: requestedExperience,
              shape: shapeFromUrl,
              bpm: bpmFromUrl,
              songId: songIdFromUrl,
              musicMuted: mutedFromUrl
            }
          });

          var activeUrlHandler = deps.getExperienceUrlHandler(requestedExperience);
          if (activeUrlHandler && typeof activeUrlHandler.hydrateParams === 'function') {
            activeUrlHandler.hydrateParams(params, requestedExperience);
          }

          deps.redrawForPathChange();
          deps.setAnimationPlaybackState('idle');
          deps.syncAnimateButtonLabel();
          deps.updateMusicPlaybackState();
        });
      } catch (error) {
        console.error('URL state hydration failed:', error);
      }

      if (options.forceUrlSync !== false) {
        scheduleUrlStateSync(true);
      }
    }

    function hasUrlStateParams() {
      var params = new URLSearchParams(window.location.search || '');
      if (!params || !params.toString()) return false;
      if (deps.hasUrlStateKey(params, 'version') || deps.hasUrlStateKey(params, 'experience')) return true;
      return params.toString().length > 0;
    }

    return {
      buildSearchParamsFromAppState: buildSearchParamsFromAppState,
      flushUrlStateSync: flushUrlStateSync,
      scheduleUrlStateSync: scheduleUrlStateSync,
      applyStateFromCurrentUrl: applyStateFromCurrentUrl,
      hasUrlStateParams: hasUrlStateParams
    };
  }

  window.createUrlStateService = createUrlStateService;
})();
