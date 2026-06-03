(function() {
  function createStitchingStateModule(deps) {
    deps = deps || {};

    function captureState() {
      return {
        threads: deps.sanitizeThreadList(deps.getThreads()),
        selectedThreadIndex: deps.getSelectedThreadIndex(),
        holes: deps.parseBoundedInt(deps.getHolesValue(), 3, deps.getMaxHoles(), deps.getDefaultHoles()),
        shape: deps.getCurrentShape(),
        bpm: deps.getCurrentAnimationBpm(),
        songId: deps.getCurrentSongId()
      };
    }

    function applyState(snapshot) {
      if (!snapshot) return;

      var nextThreads = deps.ensureThreadList(snapshot.threads);
      deps.replaceThreads(nextThreads);

      var nextIndex = deps.parseBoundedInt(
        snapshot.selectedThreadIndex,
        0,
        Math.max(0, deps.getThreads().length - 1),
        0
      );
      deps.setSelectedThreadIndex(nextIndex);

      var holes = deps.parseBoundedInt(snapshot.holes, 3, deps.getMaxHoles(), deps.getDefaultHoles());
      deps.setHolesValue(String(holes));
      deps.setAdvancedHolesValue(String(holes));

      var nextShape = deps.sanitizeShape(snapshot.shape, deps.getCurrentShape());
      deps.setCurrentShape(nextShape, false);

      if (snapshot.songId && deps.canApplySongSelection(snapshot.songId)) {
        deps.setCurrentSong(snapshot.songId);
      }
      if (isFinite(Number(snapshot.bpm))) {
        deps.applyTempoValue(deps.sanitizeBpmForCurrentSong(snapshot.bpm, deps.getCurrentAnimationBpm()));
      }
    }

    function syncToAppState() {
      var stitchingUrlState = deps.buildStitchingUrlState({
        threads: deps.getThreads(),
        holesValue: deps.getHolesValue(),
        selectedThreadIndex: deps.getSelectedThreadIndex()
      }, {
        parseBoundedInt: deps.parseBoundedInt,
        sanitizeThreadColor: deps.sanitizeThreadColor,
        serializeStitchingThreadState: deps.serializeStitchingThreadState,
        defaultThreadColor: '#1982c4',
        maxHoles: deps.getMaxHoles(),
        defaultHoles: deps.getDefaultHoles()
      });

      var appState = deps.getAppState();
      appState.stitching.holes = stitchingUrlState.holes;
      appState.stitching.selectedThreadIndex = stitchingUrlState.selectedThreadIndex;
      appState.stitching.threadColors = stitchingUrlState.threadColors;
      appState.stitching.threadState = stitchingUrlState.threadState;
      appState.stitching.showHoleNumbers = !!deps.getShowHoleNumbers();
      appState.stitching.borderEnabled = !!deps.getBorderEnabled();
    }

    function appendUrlParams(params) {
      var appState = deps.getAppState();
      deps.setUrlStateParam(params, 'showHoleNumbers', appState.stitching.showHoleNumbers ? '1' : '0');
      deps.setUrlStateParam(params, 'borderEnabled', appState.stitching.borderEnabled ? '1' : '0');
      deps.setUrlStateParam(params, 'stitchingHoles', String(appState.stitching.holes));
      deps.setUrlStateParam(params, 'selectedThreadIndex', String(appState.stitching.selectedThreadIndex));
      deps.setUrlStateParam(params, 'threadState', appState.stitching.threadState);

      if (appState.stitching.threadColors && appState.stitching.threadColors.length) {
        deps.setUrlStateParam(params, 'threadColors', appState.stitching.threadColors.join(','));
      }
    }

    function hydrateUrlParams(params) {
      var showHoleNumbersFromUrl = deps.sanitizeBooleanParam(deps.getUrlStateParam(params, 'showHoleNumbers'), deps.getShowHoleNumbers());
      var borderEnabledFromUrl = deps.sanitizeBooleanParam(deps.getUrlStateParam(params, 'borderEnabled'), deps.getBorderEnabled());
      deps.setShowHoleNumbers(showHoleNumbersFromUrl);
      deps.setBorderEnabled(borderEnabledFromUrl);
      deps.syncHoleNumberToggles();
      deps.syncBorderControls();

      var hydratedStitchingState = deps.hydrateStitchingUrlState({
        threads: deps.getThreads(),
        threadStateParam: deps.getUrlStateParam(params, 'threadState'),
        threadColorsParam: deps.getUrlStateParam(params, 'threadColors'),
        stitchingHolesParam: deps.getUrlStateParam(params, 'stitchingHoles'),
        selectedThreadIndexParam: deps.getUrlStateParam(params, 'selectedThreadIndex'),
        selectedThreadIndex: deps.getSelectedThreadIndex(),
        currentHolesValue: deps.getHolesValue()
      }, {
        parseBoundedInt: deps.parseBoundedInt,
        sanitizeThreadList: deps.sanitizeThreadList,
        parseStitchingThreadState: deps.parseStitchingThreadState,
        sanitizeThreadColorList: deps.sanitizeThreadColorList,
        ensureThreadList: deps.ensureThreadList,
        defaultThreadColor: '#1982c4',
        maxHoles: deps.getMaxHoles(),
        defaultHoles: deps.getDefaultHoles()
      });

      deps.replaceThreads(hydratedStitchingState.threads);
      deps.setHolesValue(String(hydratedStitchingState.holes));
      deps.setAdvancedHolesValue(String(hydratedStitchingState.holes));
      deps.setSelectedThreadIndex(hydratedStitchingState.selectedThreadIndex);

      var appState = deps.getAppState();
      appState.stitching.showHoleNumbers = !!deps.getShowHoleNumbers();
      appState.stitching.borderEnabled = !!deps.getBorderEnabled();

      deps.renderThreadControls();
      deps.syncKidControlsFromSelectedThread();
    }

    return {
      captureState: captureState,
      applyState: applyState,
      syncToAppState: syncToAppState,
      appendUrlParams: appendUrlParams,
      hydrateUrlParams: hydrateUrlParams
    };
  }

  window.createStitchingStateModule = createStitchingStateModule;
})();
