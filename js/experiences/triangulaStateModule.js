(function() {
  function createTriangulaStateModule(deps) {
    deps = deps || {};

    function captureState() {
      var state = deps.captureTriangulaState({
        colorMode: deps.getTriangulaColorMode(),
        constructionMode: deps.getTriangulaConstructionMode(),
        startCount: deps.getTriangulaStartCount(),
        targetCount: deps.getTriangulaTargetCount(),
        fractalMode: deps.getTriangulaFractalMode(),
        fitMode: deps.getTriangulaFitMode(),
        band1: deps.getTriangulaBandColors().band1,
        band2: deps.getTriangulaBandColors().band2,
        band4: deps.getTriangulaBandColors().band4,
        threadZeroColor: deps.getThreadZeroColor()
      }, {
        sanitizeThreadColor: deps.sanitizeThreadColor
      });

      state.bpm = deps.getCurrentAnimationBpm();
      state.songId = deps.getCurrentSongId();
      return state;
    }

    function applyState(snapshot) {
      if (!snapshot) return;

      var nextState = deps.applyTriangulaState(snapshot, {
        colorMode: deps.getTriangulaColorMode(),
        constructionMode: deps.getTriangulaConstructionMode(),
        startCount: deps.getTriangulaStartCount(),
        targetCount: deps.getTriangulaTargetCount(),
        fractalMode: deps.getTriangulaFractalMode(),
        fitMode: deps.getTriangulaFitMode(),
        band1: deps.getTriangulaBandColors().band1,
        band2: deps.getTriangulaBandColors().band2,
        band4: deps.getTriangulaBandColors().band4
      }, {
        sanitizeTriangulaColorMode: deps.sanitizeTriangulaColorMode,
        sanitizeTriangulaConstructionMode: deps.sanitizeTriangulaConstructionMode,
        sanitizeTriangulaCount: deps.sanitizeTriangulaCount,
        sanitizeTriangulaFractalMode: deps.sanitizeTriangulaFractalMode,
        sanitizeTriangulaFitMode: deps.sanitizeTriangulaFitMode,
        sanitizeHexColor: deps.sanitizeHexColor,
        sanitizeThreadColor: deps.sanitizeThreadColor
      });

      deps.setTriangulaColorMode(nextState.colorMode);
      deps.setTriangulaConstructionMode(nextState.constructionMode);
      deps.setTriangulaStartCount(nextState.startCount);
      deps.setTriangulaTargetCount(nextState.targetCount);
      deps.setTriangulaFractalMode(nextState.fractalMode);
      deps.setTriangulaFitMode(nextState.fitMode);
      deps.setTriangulaBandColors(nextState.band1, nextState.band2, nextState.band4);
      deps.setThreadZeroColor(nextState.sourceColor);

      if (snapshot.songId && deps.canApplySongSelection(snapshot.songId)) {
        deps.setCurrentSong(snapshot.songId);
      }
      if (isFinite(Number(snapshot.bpm))) {
        deps.applyTempoValue(deps.sanitizeBpmForCurrentSong(snapshot.bpm, deps.getCurrentAnimationBpm()));
      }
    }

    function syncToAppState() {
      var triangulaUrlState = deps.buildTriangulaUrlState({
        colorMode: deps.getTriangulaColorMode(),
        constructionMode: deps.getTriangulaConstructionMode(),
        startCount: deps.getTriangulaStartCount(),
        targetCount: deps.getTriangulaTargetCount(),
        fractalMode: deps.getTriangulaFractalMode(),
        fitMode: deps.getTriangulaFitMode(),
        sourceColor: deps.getThreadZeroColor(),
        band1: deps.getTriangulaBandColors().band1,
        band2: deps.getTriangulaBandColors().band2,
        band4: deps.getTriangulaBandColors().band4
      }, {
        sanitizeThreadColor: deps.sanitizeThreadColor
      });

      var appState = deps.getAppState();
      appState.triangula.colorMode = triangulaUrlState.colorMode;
      appState.triangula.constructionMode = triangulaUrlState.constructionMode;
      appState.triangula.startCount = triangulaUrlState.startCount;
      appState.triangula.targetCount = triangulaUrlState.targetCount;
      appState.triangula.fractalMode = triangulaUrlState.fractalMode;
      appState.triangula.fitMode = triangulaUrlState.fitMode;
      appState.triangula.sourceColor = triangulaUrlState.sourceColor;
      appState.triangula.band1Color = triangulaUrlState.band1Color;
      appState.triangula.band2Color = triangulaUrlState.band2Color;
      appState.triangula.band4Color = triangulaUrlState.band4Color;
    }

    function appendUrlParams(params) {
      var appState = deps.getAppState();
      deps.setUrlStateParam(params, 'triangulaSourceColor', appState.triangula.sourceColor);
      deps.setUrlStateParam(params, 'triangulaColorMode', appState.triangula.colorMode);
      deps.setUrlStateParam(params, 'triangulaConstructionMode', appState.triangula.constructionMode);
      deps.setUrlStateParam(params, 'triangulaStartCount', String(appState.triangula.startCount));
      deps.setUrlStateParam(params, 'triangulaTargetCount', String(appState.triangula.targetCount));
      deps.setUrlStateParam(params, 'triangulaFractalMode', appState.triangula.fractalMode);
      deps.setUrlStateParam(params, 'triangulaFitMode', appState.triangula.fitMode);
      deps.setUrlStateParam(params, 'triangulaBand1Color', appState.triangula.band1Color);
      deps.setUrlStateParam(params, 'triangulaBand2Color', appState.triangula.band2Color);
      deps.setUrlStateParam(params, 'triangulaBand4Color', appState.triangula.band4Color);
    }

    function hydrateUrlParams(params, requestedExperience) {
      if (requestedExperience !== 'triangula') return;

      var triangulaHydrated = deps.hydrateTriangulaUrlState({
        colorModeParam: deps.getUrlStateParam(params, 'triangulaColorMode'),
        constructionModeParam: deps.getUrlStateParam(params, 'triangulaConstructionMode'),
        startCountParam: deps.getUrlStateParam(params, 'triangulaStartCount'),
        targetCountParam: deps.getUrlStateParam(params, 'triangulaTargetCount'),
        fractalModeParam: deps.getUrlStateParam(params, 'triangulaFractalMode'),
        fitModeParam: deps.getUrlStateParam(params, 'triangulaFitMode'),
        sourceColorParam: deps.getUrlStateParam(params, 'triangulaSourceColor'),
        band1ColorParam: deps.getUrlStateParam(params, 'triangulaBand1Color'),
        band2ColorParam: deps.getUrlStateParam(params, 'triangulaBand2Color'),
        band4ColorParam: deps.getUrlStateParam(params, 'triangulaBand4Color'),
        colorMode: deps.getTriangulaColorMode(),
        constructionMode: deps.getTriangulaConstructionMode(),
        startCount: deps.getTriangulaStartCount(),
        targetCount: deps.getTriangulaTargetCount(),
        fractalMode: deps.getTriangulaFractalMode(),
        fitMode: deps.getTriangulaFitMode(),
        band1: deps.getTriangulaBandColors().band1,
        band2: deps.getTriangulaBandColors().band2,
        band4: deps.getTriangulaBandColors().band4
      }, {
        sanitizeTriangulaColorMode: deps.sanitizeTriangulaColorMode,
        sanitizeTriangulaConstructionMode: deps.sanitizeTriangulaConstructionMode,
        sanitizeTriangulaCount: deps.sanitizeTriangulaCount,
        sanitizeTriangulaFractalMode: deps.sanitizeTriangulaFractalMode,
        sanitizeTriangulaFitMode: deps.sanitizeTriangulaFitMode,
        sanitizeHexColor: deps.sanitizeHexColor,
        sanitizeThreadColor: deps.sanitizeThreadColor
      });

      deps.setTriangulaColorMode(triangulaHydrated.colorMode);
      deps.setTriangulaConstructionMode(triangulaHydrated.constructionMode);
      deps.setTriangulaStartCount(triangulaHydrated.startCount);
      deps.setTriangulaTargetCount(triangulaHydrated.targetCount);
      deps.setTriangulaFractalMode(triangulaHydrated.fractalMode);
      deps.setTriangulaFitMode(triangulaHydrated.fitMode);
      deps.setTriangulaBandColors(triangulaHydrated.band1, triangulaHydrated.band2, triangulaHydrated.band4);
      deps.setThreadZeroColor(triangulaHydrated.sourceColor);

      deps.syncTriangulaControls();
    }

    return {
      captureState: captureState,
      applyState: applyState,
      syncToAppState: syncToAppState,
      appendUrlParams: appendUrlParams,
      hydrateUrlParams: hydrateUrlParams
    };
  }

  window.createTriangulaStateModule = createTriangulaStateModule;
})();
