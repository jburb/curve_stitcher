window.bindDiscoveryEvents = function bindDiscoveryEvents(deps) {
  if (!deps) return;

  deps.discoveryToggleBtn.addEventListener('click', function() {
    deps.discoveryPanel.classList.toggle('open');
    if (deps.discoveryPanel.classList.contains('open')) {
      deps.clearUnseenDiscoveries();
    }
    deps.syncDiscoveryToggleButton();
  });

  deps.closeDiscoveryBtn.addEventListener('click', function() {
    deps.discoveryPanel.classList.remove('open');
    deps.syncDiscoveryToggleButton();
  });

  if (deps.discoveryPassphraseForm) {
    deps.discoveryPassphraseForm.addEventListener('submit', function(event) {
      event.preventDefault();
      deps.submitDiscoveryPassphraseEntry();
    });
  }

  if (deps.backToStitchingBtn) {
    deps.backToStitchingBtn.addEventListener('click', function() {
      var startPoint = deps.getElementCenterPoint(deps.backToStitchingBtn);
      var endPoint = deps.getElementCenterPoint(deps.experienceInline) || deps.getElementCenterPoint(deps.canvasStage);
      deps.animateReturnToStitchingTrail(startPoint, endPoint);

      window.setTimeout(function() {
        deps.setCurrentExperience('stitching');
        deps.redrawForPathChange();
        deps.discoveryPanel.classList.remove('open');
        deps.syncDiscoveryToggleButton();
      }, 110);
    });
  }
};
