window.bindShellUiEvents = function bindShellUiEvents(deps) {
  if (!deps) return;

  deps.animateBtn.addEventListener('click', deps.toggleAnimationPlayback);

  deps.gearBtn.addEventListener('click', function() {
    deps.advancedPanel.classList.toggle('open');
    deps.syncAdvancedToggleButton();
  });

  deps.closeAdvancedBtn.addEventListener('click', function() {
    deps.advancedPanel.classList.remove('open');
    deps.syncAdvancedToggleButton();
  });

  deps.advancedTempoInput.addEventListener('change', function() {
    deps.applyTempoValue(deps.advancedTempoInput.value);
  });

  deps.resetTempoBtn.addEventListener('click', deps.applyDefaultTempo);

  deps.kidTempoSlowBtn.addEventListener('click', function() {
    var presets = deps.getKidTempoPresetsForSong(deps.getCurrentSongId());
    deps.applyTempoValue(presets.slow);
  });

  deps.kidTempoNormalBtn.addEventListener('click', function() {
    var presets = deps.getKidTempoPresetsForSong(deps.getCurrentSongId());
    deps.applyTempoValue(presets.normal);
  });

  deps.kidTempoFastBtn.addEventListener('click', function() {
    var presets = deps.getKidTempoPresetsForSong(deps.getCurrentSongId());
    deps.applyTempoValue(presets.fast);
  });

  deps.exportSvgBtn.addEventListener('click', deps.openExportOptionsModal);
  deps.exportConfirmBtn.addEventListener('click', deps.runExportFromModalSelection);
  deps.exportCancelBtn.addEventListener('click', deps.closeExportOptionsModal);

  deps.exportOptionsModal.addEventListener('click', function(event) {
    if (event.target === deps.exportOptionsModal) {
      deps.closeExportOptionsModal();
    }
  });

  deps.kidThreadToggle.addEventListener('click', function() {
    var isOpen = !deps.kidThreadMenu.hasAttribute('hidden');
    if (isOpen) {
      deps.kidThreadMenu.setAttribute('hidden', '');
      deps.kidThreadToggle.setAttribute('aria-expanded', 'false');
    } else {
      deps.kidThreadMenu.removeAttribute('hidden');
      deps.kidThreadToggle.setAttribute('aria-expanded', 'true');
    }
  });

  deps.kidSongToggle.addEventListener('click', function() {
    if (deps.kidSongToggle.disabled) return;
    if (deps.getHasUnseenSongUnlock()) {
      deps.clearUnseenSongUnlock();
    }
    var isOpen = !deps.kidSongMenu.hasAttribute('hidden');
    if (isOpen) {
      deps.kidSongMenu.setAttribute('hidden', '');
      deps.kidSongToggle.setAttribute('aria-expanded', 'false');
      deps.kidSongToggle.classList.remove('is-active');
    } else {
      deps.kidSongMenu.removeAttribute('hidden');
      deps.kidSongToggle.setAttribute('aria-expanded', 'true');
      deps.kidSongToggle.classList.add('is-active');
    }
    deps.syncSongPickerToggleButton();
  });

  deps.kidThreadMenu.addEventListener('click', function(event) {
    var option = event.target.closest('.kid-thread-option');
    if (!option) return;
    var nextIndex = parseInt(option.dataset.index, 10);
    if (!isFinite(nextIndex) || nextIndex < 0 || nextIndex >= deps.threads.length) return;
    deps.setSelectedThreadIndex(nextIndex);
    deps.kidThreadMenu.setAttribute('hidden', '');
    deps.kidThreadToggle.setAttribute('aria-expanded', 'false');
    deps.renderThreadControls();
    deps.syncKidControlsFromSelectedThread();
  });

  deps.kidSongMenu.addEventListener('click', function(event) {
    var option = event.target.closest('.kid-song-option');
    if (!option) return;
    var songId = option.dataset.songId;
    if (!songId) return;
    deps.kidSongMenu.setAttribute('hidden', '');
    deps.kidSongToggle.setAttribute('aria-expanded', 'false');
    deps.kidSongToggle.classList.remove('is-active');
    deps.syncSongPickerToggleButton();
    deps.setCurrentSong(songId);
  });

  document.addEventListener('click', function(event) {
    if (!deps.kidThreadMenu.hasAttribute('hidden') && !deps.kidThreadPicker.contains(event.target)) {
      deps.kidThreadMenu.setAttribute('hidden', '');
      deps.kidThreadToggle.setAttribute('aria-expanded', 'false');
    }
    if (!deps.kidSongMenu.hasAttribute('hidden') && !deps.kidSongPicker.contains(event.target)) {
      deps.kidSongMenu.setAttribute('hidden', '');
      deps.kidSongToggle.setAttribute('aria-expanded', 'false');
      deps.kidSongToggle.classList.remove('is-active');
      deps.syncSongPickerToggleButton();
    }
    if (!deps.experienceInfoPanel.hasAttribute('hidden') && !deps.experienceInfoPanel.contains(event.target) && !deps.experienceInfoToggle.contains(event.target)) {
      deps.syncExperienceInfoPanel(false);
    }
  });

  deps.experienceInfoToggle.addEventListener('click', function() {
    var willOpen = deps.experienceInfoToggle.getAttribute('aria-expanded') !== 'true';
    deps.syncExperienceInfoPanel(willOpen);
    if (willOpen) {
      deps.positionExperienceInfoPanel();
      deps.experienceInfoClose.focus();
    }
  });

  deps.experienceInfoClose.addEventListener('click', function() {
    deps.syncExperienceInfoPanel(false);
    deps.experienceInfoToggle.focus();
  });

  deps.experienceNarrateToggle.addEventListener('click', deps.toggleExperienceNarration);

  deps.holeNumbersToggleBtn.addEventListener('click', function() {
    deps.setShowHoleNumbers(!deps.getShowHoleNumbers());
    deps.syncHoleNumberToggles();
    deps.redrawAnimationInPlace();
  });

  deps.musicToggleBtn.addEventListener('click', function() {
    deps.setMusicMuted(!deps.getMusicMuted());
    deps.syncMusicToggleButton();
    deps.updateMusicPlaybackState();
    deps.scheduleUrlStateSync(false);
  });

  document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return;
    if (deps.exportOptionsModal.classList.contains('open')) {
      deps.closeExportOptionsModal();
      return;
    }
    if (!deps.experienceInfoPanel.hasAttribute('hidden')) {
      deps.syncExperienceInfoPanel(false);
      deps.experienceInfoToggle.focus();
      return;
    }
    if (deps.advancedPanel.classList.contains('open')) {
      deps.advancedPanel.classList.remove('open');
      deps.syncAdvancedToggleButton();
      return;
    }
    if (deps.discoveryPanel.classList.contains('open')) {
      deps.discoveryPanel.classList.remove('open');
      deps.syncDiscoveryToggleButton();
    }
  });
};
