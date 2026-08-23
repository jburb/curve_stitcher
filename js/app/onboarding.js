var onboardingState = {
  quickStartDismissed: false,
  tourCompleted: false
};
var ONBOARDING_HINTS_ENABLED = false;
var onboardingInteractionMarked = false;
var onboardingHintsDismissed = false;
var onboardingHintStepIndex = 0;
var onboardingTourSteps = [];
var onboardingTourIndex = -1;
var onboardingTourTarget = null;
var onboardingGuideContent = null;
var onboardingHintsEnabledByHelp = false;
var onboardingGuidanceMode = 'none';
var onboardingHintNarrationUtterance = null;
var onboardingHintNarrationButton = null;
var onboardingTourNarrationUtterance = null;
var HEAR_THIS_BUTTON_LABEL = '🔊 Hear this';
var STOP_BUTTON_LABEL = '⏹ Stop';
var STOP_NARRATION_BUTTON_LABEL = '⏹ Stop narration';

function getOnboardingTailSteps() {
  return [
    {
      title: 'Save Your Pattern',
      text: 'Tap Save to download a picture, or a ZIP with picture + maker files.',
      selector: '#kid-save-toggle'
    },
    {
      title: 'Discovery Library',
      text: 'Open Discovery to browse unlocked experiences, enter experience passphrases, or return to stitching.',
      selector: '#discovery-toggle'
    },
    {
      title: 'Advanced Controls',
      text: 'Open Advanced controls for deeper settings and export tools.',
      selector: '#gear'
    }
  ];
}

function getOnboardingPlaybackSteps(experienceLabel) {
  return [
    {
      title: 'Play Animation',
      text: 'Press Play to animate this ' + experienceLabel + ' pattern.',
      selector: '#animate'
    },
    {
      title: 'Tempo Controls',
      text: 'Use the turtle, walking, and rabbit buttons to switch between slow, balanced, and fast playback speeds.',
      selector: '.kid-tempo-presets'
    },
    {
      title: 'Song Picker',
      text: 'Choose background music unlocked by discovered shapes.',
      selector: '#kid-song-toggle'
    },
    {
      title: 'Music Toggle',
      text: 'Mute or unmute background music.',
      selector: '#toggle-music'
    }
  ];
}

function getDefaultOnboardingGuideContent() {
  return {
    quickStartTitle: 'Welcome To StitchLab',
    quickStartText: 'Try this: choose a frame shape, drag Holes or Add, then press Play.',
    hints: {
      shape: {
        text: 'Pick a frame shape to begin.',
        selector: '.shape-picker-group'
      },
      control: {
        text: 'Drag Holes to change stitch density.',
        selector: '#holes'
      },
      play: {
        text: 'Press Play to watch your threads stitch.',
        selector: '#animate'
      }
    },
    steps: [
      {
        title: 'Pick A Shape',
        text: 'Start by choosing a shape for the stitching frame.',
        selector: '.shape-picker-group'
      },
      {
        title: 'Toggle Hole Numbers',
        text: 'Show or hide hole numbers around the frame.',
        selector: '#toggle-hole-numbers'
      }
    ].concat(getOnboardingPlaybackSteps('stitching')).concat([
      {
        title: 'Choose Thread Color',
        text: 'Pick a thread color from presets, use rainbow, or tap the dropper for a custom color.',
        selector: '#palette'
      },
      {
        title: 'Add Thread',
        text: 'Add another thread to combine patterns.',
        selector: '#add-magic-thread'
      },
      {
        title: 'Remove Selected Thread',
        text: 'Remove whichever thread is currently selected.',
        selector: '#remove-thread'
      },
      {
        title: 'Choose Active Thread',
        text: 'Pick which thread receives color and control changes.',
        selector: '#kid-thread-toggle'
      },
      {
        title: 'Change Hole Count',
        text: 'Drag Holes higher or lower to change the number of holes in the stitching frame.',
        selector: '#holes'
      },
      {
        title: 'Choose Stitch Math',
        text: 'Choose the type of math to use to calculate the stitch connections.',
        selector: '#kid-stitch-by'
      },
      {
        title: 'Enter Multiply Value',
        text: 'Enter the number by which hole numbers will be multilplied to choose connecting holes.',
        selector: '#multiply'
      },
      {
        title: 'Choose List Type',
        text: 'Choose whether list entries are interpreted as Holes or Steps.',
        selector: '#kid-sequence-mode'
      },
      {
        title: 'Enter List Values',
        text: 'Enter comma-separated values to specify the holes or intervals between them to stitch.',
        selector: '#kid-jump-sequence'
      },
      {
        title: 'Enter Expression',
        text: 'Enter a formula to compute each stitch step, using the built-in variables.',
        selector: '#kid-jump-formula'
      },
      {
        title: 'Enter Add Value',
        text: 'Increase or decrease this value to make the stitch connections longer or shorter.',
        selector: '#jump'
      },
      {
        title: 'Set Thread Size',
        text: 'Drag Thread Size higher or lower to adjust the thickness of the active thread.',
        selector: '#width'
      },
      {
        title: 'Choose Start Hole',
        text: 'Set the first hole where the selected thread begins.',
        selector: '#start-hole'
      }
    ]).concat(getOnboardingTailSteps())
  };
}

function getOnboardingGuideContentForExperience(experienceId) {
  if (experienceId === 'triangula') {
    return {
      quickStartTitle: 'Welcome To Triangula',
      quickStartText: 'Try this: set start and end triangles, then press Play.',
      hints: {
        shape: {
          text: 'Triangula starts with triangle growth.',
          selector: '#triangula-start-count'
        },
        control: {
          text: 'Set your end triangle count.',
          selector: '#triangula-target-count'
        },
        play: {
          text: 'Press Play to animate each triangle layer.',
          selector: '#animate'
        }
      },
      steps: [
        {
          title: 'Frame Shape',
          text: 'Triangula uses a fixed triangle frame.',
          selector: '.shape-picker-group'
        }
      ].concat(getOnboardingPlaybackSteps('triangula')).concat([
        {
          title: 'Choose Palette Color',
          text: 'Pick a color from presets, use rainbow, or tap the dropper for a custom color.',
          selector: '#palette'
        },
        {
          title: 'Choose Construction',
          text: 'Increase triangles either by cutting or shrinking and duplicating.',
          selector: '#triangula-construction-mode'
        },
        {
          title: 'Choose Color Scope',
          text: 'Pick which triangle band receives the active color.',
          selector: '#triangula-color-scope'
        },
        {
          title: 'Set Start Triangles',
          text: 'Choose how many triangles start the pattern.',
          selector: '#triangula-start-count'
        },
        {
          title: 'Set Target Triangles',
          text: 'Choose how many triangles end the pattern.',
          selector: '#triangula-target-count'
        }
      ]).concat(getOnboardingTailSteps())
    };
  }

  if (experienceId === 'squarus') {
    return {
      quickStartTitle: 'Welcome To Squarus',
      quickStartText: 'Try this: choose square order, set layout and pieces, then press Play.',
      hints: {
        shape: {
          text: 'Pick the polyomino family size.',
          selector: '#squarus-order-inline'
        },
        control: {
          text: 'Adjust pieces placed for complexity.',
          selector: '#squarus-piece-count'
        },
        play: {
          text: 'Press Play to watch the square arrangement animate.',
          selector: '#animate'
        }
      },
      steps: [
        {
          title: 'Frame Shape',
          text: 'Squarus uses a fixed square frame.',
          selector: '.shape-picker-group'
        }
      ].concat(getOnboardingPlaybackSteps('squarus')).concat([
        {
          title: 'Choose Polyomino Type',
          text: 'Select a type from 1-square (monomino) through 6-square (hexomino) families.',
          selector: '#squarus-order-inline'
        },
        {
          title: 'Choose Placement Style',
          text: 'Switch between puzzle-style placement and art-style placement.',
          selector: '#squarus-contact-mode-inline'
        },
        {
          title: 'Pick A Layout Formula',
          text: 'Choose how polyominoes are arranged on the canvas.',
          selector: '#squarus-layout-inline'
        },
        {
          title: 'Set # of Pieces Placed',
          text: 'Drag to place more or fewer polyominoes.',
          selector: '#squarus-piece-count'
        },
        {
          title: 'Set Piece Order',
          text: 'Adjust the order of polyominoes placed.',
          selector: '#squarus-sequence-seed'
        },
        {
          title: 'Randomize Piece Order',
          text: 'Generate a random placement order.',
          selector: '#squarus-sequence-randomize'
        }
      ]).concat(getOnboardingTailSteps())
    };
  }

  if (experienceId === 'mashrabiya') {
    return {
      quickStartTitle: 'Welcome To Mashrabiya',
      quickStartText: 'Try this: choose petal fold and colors, then press Play.',
      hints: {
        shape: {
          text: 'Choose a petal fold count.',
          selector: '#mashrabiya-fold'
        },
        control: {
          text: 'Tune motif colors to your taste.',
          selector: '#mashrabiya-star-color'
        },
        play: {
          text: 'Press Play to watch the rosette emerge.',
          selector: '#animate'
        }
      },
      steps: [
        {
          title: 'Frame Shape',
          text: 'Mashrabiya uses a fixed rosette frame.',
          selector: '.shape-picker-group'
        }
      ].concat(getOnboardingPlaybackSteps('mashrabiya')).concat([
        {
          title: 'Choose Petal Fold',
          text: 'Select 6, 8, or 12-fold symmetry.',
          selector: '#mashrabiya-fold'
        },
        {
          title: 'Set Inner Star Color',
          text: 'Pick a color for the central star.',
          selector: '#mashrabiya-star-color'
        },
        {
          title: 'Set Petal Color',
          text: 'Adjust petal tone for contrast.',
          selector: '#mashrabiya-petal-color'
        },
        {
          title: 'Set Star Points Color',
          text: 'Choose color for the outer star points.',
          selector: '#mashrabiya-point-color'
        }
      ]).concat(getOnboardingTailSteps())
    };
  }

  return getDefaultOnboardingGuideContent();
}

function sanitizeOnboardingState(rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return {
      quickStartDismissed: false,
      tourCompleted: false
    };
  }
  return {
    quickStartDismissed: !!rawState.quickStartDismissed,
    tourCompleted: !!rawState.tourCompleted
  };
}

function hydrateOnboardingState() {
  var raw = appStateStorage.getItem(ONBOARDING_STATE_KEY);
  if (!raw) return;
  try {
    onboardingState = sanitizeOnboardingState(JSON.parse(raw));
  } catch (error) {
    onboardingState = sanitizeOnboardingState(null);
  }
}

function persistOnboardingState() {
  appStateStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(onboardingState));
}

function setOnboardingStatePatch(patch) {
  onboardingState = Object.assign({}, onboardingState, patch || {});
  persistOnboardingState();
}

function getElementCenterCoordinates(element) {
  if (!element || !element.getBoundingClientRect) return null;
  var rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right
  };
}

function isElementVisibleForOnboarding(element) {
  if (!element || !element.getBoundingClientRect) return false;
  var rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  var style = window.getComputedStyle ? window.getComputedStyle(element) : null;
  if (!style) return true;
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

function resolveOnboardingTarget(selector) {
  if (!selector) return null;
  var element = document.querySelector(selector);
  return isElementVisibleForOnboarding(element) ? element : null;
}

function ensureOnboardingHintStructure(hintElement, textSelector, hearButtonId) {
  if (!hintElement) return null;
  var textElement = hintElement.querySelector(textSelector);
  if (!textElement) {
    textElement = document.createElement('span');
    textElement.className = 'onboarding-hint-text';
    hintElement.insertBefore(textElement, hintElement.firstChild || null);
  }

  var hearButton = document.getElementById(hearButtonId);
  if (!hearButton || !hintElement.contains(hearButton)) {
    hearButton = document.createElement('button');
    hearButton.id = hearButtonId;
    hearButton.className = 'onboarding-hint-hear-btn';
    hearButton.type = 'button';
    hearButton.setAttribute('aria-pressed', 'false');
    hearButton.textContent = HEAR_THIS_BUTTON_LABEL;
    hintElement.appendChild(hearButton);
  }

  var nextHintButton = hintElement.querySelector('.onboarding-hint-next-btn');
  if (!nextHintButton) {
    nextHintButton = document.createElement('button');
    nextHintButton.className = 'onboarding-hint-hear-btn onboarding-hint-next-btn';
    nextHintButton.type = 'button';
    nextHintButton.textContent = 'Next hint';
    hintElement.appendChild(nextHintButton);
  }

  var startTourButton = hintElement.querySelector('.onboarding-hint-start-tour-btn');
  if (!startTourButton) {
    startTourButton = document.createElement('button');
    startTourButton.className = 'onboarding-hint-hear-btn onboarding-hint-start-tour-btn';
    startTourButton.type = 'button';
    startTourButton.textContent = 'Start tour';
    hintElement.appendChild(startTourButton);
  }
  return textElement;
}

function applyOnboardingGuideContentForCurrentExperience() {
  onboardingGuideContent = getOnboardingGuideContentForExperience(currentExperienceId);
  onboardingTourSteps = (onboardingGuideContent && onboardingGuideContent.steps) ? onboardingGuideContent.steps.slice() : [];

  onboardingHintShapeText = ensureOnboardingHintStructure(onboardingHintShape, '.onboarding-hint-text', 'onboarding-hint-shape-hear');
  onboardingHintHolesText = ensureOnboardingHintStructure(onboardingHintHoles, '.onboarding-hint-text', 'onboarding-hint-holes-hear');
  onboardingHintPlayText = ensureOnboardingHintStructure(onboardingHintPlay, '.onboarding-hint-text', 'onboarding-hint-play-hear');
  onboardingHintShapeHearBtn = document.getElementById('onboarding-hint-shape-hear');
  onboardingHintHolesHearBtn = document.getElementById('onboarding-hint-holes-hear');
  onboardingHintPlayHearBtn = document.getElementById('onboarding-hint-play-hear');

  if (onboardingQuickStartTitle) {
    onboardingQuickStartTitle.textContent = onboardingGuideContent.quickStartTitle || 'Welcome To StitchLab';
  }
  if (onboardingQuickStartText) {
    onboardingQuickStartText.textContent = onboardingGuideContent.quickStartText || 'Try this: choose a frame shape, drag Holes or Add, then press Play.';
  }
  if (onboardingHintShapeText && onboardingGuideContent && onboardingGuideContent.hints && onboardingGuideContent.hints.shape) {
    onboardingHintShapeText.textContent = onboardingGuideContent.hints.shape.text;
  }
  if (onboardingHintHolesText && onboardingGuideContent && onboardingGuideContent.hints && onboardingGuideContent.hints.control) {
    onboardingHintHolesText.textContent = onboardingGuideContent.hints.control.text;
  }
  if (onboardingHintPlayText && onboardingGuideContent && onboardingGuideContent.hints && onboardingGuideContent.hints.play) {
    onboardingHintPlayText.textContent = onboardingGuideContent.hints.play.text;
  }
}

function syncOnboardingHintNarrationButtonState(button, isPlaying) {
  if (!button) return;
  button.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  button.textContent = isPlaying ? STOP_BUTTON_LABEL : HEAR_THIS_BUTTON_LABEL;
}

function syncOnboardingHelpButtonState() {
  if (!onboardingHelpBtn) return;
  var isTourOpen = !!(onboardingTour && !onboardingTour.hidden);
  var areHintsVisible = !!((onboardingHintShape && !onboardingHintShape.hidden) ||
    (onboardingHintHoles && !onboardingHintHoles.hidden) ||
    (onboardingHintPlay && !onboardingHintPlay.hidden));
  onboardingHelpBtn.setAttribute('aria-pressed', (isTourOpen || areHintsVisible) ? 'true' : 'false');
}

function areOnboardingHintsEnabled() {
  return !!(ONBOARDING_HINTS_ENABLED || onboardingHintsEnabledByHelp);
}

function getCurrentOnboardingHintConfig() {
  return onboardingGuideContent && onboardingGuideContent.hints ? onboardingGuideContent.hints : getDefaultOnboardingGuideContent().hints;
}

function hasVisibleOnboardingHintTargets() {
  var hints = getCurrentOnboardingHintConfig();
  return !!(
    resolveOnboardingTarget(hints.shape && hints.shape.selector) ||
    resolveOnboardingTarget(hints.control && hints.control.selector) ||
    resolveOnboardingTarget(hints.play && hints.play.selector)
  );
}

function getAvailableOnboardingHintEntries() {
  var hints = getCurrentOnboardingHintConfig();
  var entries = [];
  var shapeTarget = resolveOnboardingTarget(hints.shape && hints.shape.selector);
  var controlTarget = resolveOnboardingTarget(hints.control && hints.control.selector);
  var playTarget = resolveOnboardingTarget(hints.play && hints.play.selector);
  if (shapeTarget && onboardingHintShape) {
    entries.push({ key: 'shape', element: onboardingHintShape, target: shapeTarget });
  }
  if (controlTarget && onboardingHintHoles) {
    entries.push({ key: 'control', element: onboardingHintHoles, target: controlTarget });
  }
  if (playTarget && onboardingHintPlay) {
    entries.push({ key: 'play', element: onboardingHintPlay, target: playTarget });
  }
  return entries;
}

function advanceOnboardingHintStep() {
  var entries = getAvailableOnboardingHintEntries();
  if (!entries.length) return;
  onboardingHintStepIndex = (onboardingHintStepIndex + 1) % entries.length;
  showOnboardingHints();
}

function resetOnboardingHintNarrationButtons() {
  syncOnboardingHintNarrationButtonState(onboardingHintShapeHearBtn, false);
  syncOnboardingHintNarrationButtonState(onboardingHintHolesHearBtn, false);
  syncOnboardingHintNarrationButtonState(onboardingHintPlayHearBtn, false);
}

function syncOnboardingTourNarrationButtonState(isPlaying) {
  if (!onboardingTourHearBtn) return;
  onboardingTourHearBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  onboardingTourHearBtn.textContent = isPlaying ? STOP_BUTTON_LABEL : HEAR_THIS_BUTTON_LABEL;
}

function stopOnboardingHintNarration() {
  if (onboardingHintNarrationUtterance && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  onboardingHintNarrationUtterance = null;
  onboardingHintNarrationButton = null;
  resetOnboardingHintNarrationButtons();
}

function stopOnboardingTourNarration() {
  if (onboardingTourNarrationUtterance && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  onboardingTourNarrationUtterance = null;
  syncOnboardingTourNarrationButtonState(false);
}

function getOnboardingHintNarrationText(hintElement) {
  if (!hintElement) return '';
  var textElement = hintElement.querySelector('.onboarding-hint-text');
  var textValue = textElement ? textElement.textContent : hintElement.textContent;
  return String(textValue || '').replace(/\s+/g, ' ').trim();
}

function toggleOnboardingHintNarration(hintElement, buttonElement) {
  if (!buttonElement) return;
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

  if (onboardingHintNarrationUtterance && onboardingHintNarrationButton === buttonElement) {
    stopOnboardingHintNarration();
    return;
  }

  var narrationText = getOnboardingHintNarrationText(hintElement);
  if (!narrationText) return;

  stopOnboardingHintNarration();
  var utterance = new SpeechSynthesisUtterance(narrationText);
  utterance.rate = 0.97;
  utterance.pitch = 1;
  utterance.onend = function() {
    onboardingHintNarrationUtterance = null;
    onboardingHintNarrationButton = null;
    resetOnboardingHintNarrationButtons();
  };
  utterance.onerror = function() {
    onboardingHintNarrationUtterance = null;
    onboardingHintNarrationButton = null;
    resetOnboardingHintNarrationButtons();
  };

  onboardingHintNarrationUtterance = utterance;
  onboardingHintNarrationButton = buttonElement;
  resetOnboardingHintNarrationButtons();
  syncOnboardingHintNarrationButtonState(buttonElement, true);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function toggleOnboardingTourNarration() {
  if (!onboardingTourHearBtn) return;
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

  if (onboardingTourNarrationUtterance) {
    stopOnboardingTourNarration();
    return;
  }

  var narrationText = String(onboardingTourText && onboardingTourText.textContent ? onboardingTourText.textContent : '').replace(/\s+/g, ' ').trim();
  if (!narrationText) return;

  stopOnboardingHintNarration();
  var utterance = new SpeechSynthesisUtterance(narrationText);
  utterance.rate = 0.97;
  utterance.pitch = 1;
  utterance.onend = function() {
    onboardingTourNarrationUtterance = null;
    syncOnboardingTourNarrationButtonState(false);
  };
  utterance.onerror = function() {
    onboardingTourNarrationUtterance = null;
    syncOnboardingTourNarrationButtonState(false);
  };

  onboardingTourNarrationUtterance = utterance;
  syncOnboardingTourNarrationButtonState(true);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function positionHintBubble(hintElement, targetElement, verticalOffset) {
  if (!hintElement || !targetElement) return;
  var center = getElementCenterCoordinates(targetElement);
  if (!center) return;
  var margin = 12;
  var hintWidth = hintElement.offsetWidth || 0;
  var halfWidth = hintWidth > 0 ? hintWidth / 2 : 0;
  var minCenterX = margin + halfWidth;
  var maxCenterX = window.innerWidth - margin - halfWidth;
  var centerX = center.x;
  if (maxCenterX >= minCenterX) {
    centerX = Math.max(minCenterX, Math.min(centerX, maxCenterX));
  }
  hintElement.style.left = centerX + 'px';
  hintElement.style.top = Math.max(44, center.top - (verticalOffset || 12)) + 'px';
}

function positionOnboardingHints() {
  if (!areOnboardingHintsEnabled()) return;
  if (onboardingHintsDismissed) return;
  var entries = getAvailableOnboardingHintEntries();
  if (!entries.length) return;
  var activeIndex = onboardingHintStepIndex;
  if (activeIndex < 0 || activeIndex >= entries.length) {
    activeIndex = 0;
    onboardingHintStepIndex = 0;
  }
  var activeEntry = entries[activeIndex];
  positionHintBubble(activeEntry.element, activeEntry.target, 14);
}

function showOnboardingHints() {
  if (!areOnboardingHintsEnabled()) {
    hideOnboardingHints();
    return;
  }
  if (onboardingHintsDismissed || !onboardingHintsLayer) return;
  var entries = getAvailableOnboardingHintEntries();
  if (!entries.length) {
    hideOnboardingHints();
    return;
  }
  var activeIndex = onboardingHintStepIndex;
  if (activeIndex < 0 || activeIndex >= entries.length) {
    activeIndex = 0;
    onboardingHintStepIndex = 0;
  }

  if (onboardingHintShape) onboardingHintShape.hidden = true;
  if (onboardingHintHoles) onboardingHintHoles.hidden = true;
  if (onboardingHintPlay) onboardingHintPlay.hidden = true;

  var activeEntry = entries[activeIndex];
  if (activeEntry && activeEntry.element) {
    activeEntry.element.hidden = false;
    var nextHintBtn = activeEntry.element.querySelector('.onboarding-hint-next-btn');
    if (nextHintBtn) {
      nextHintBtn.hidden = entries.length <= 1;
    }
  }
  onboardingGuidanceMode = 'hints';
  syncOnboardingHelpButtonState();
  positionOnboardingHints();
}

function hideOnboardingHints() {
  if (onboardingHintShape) onboardingHintShape.hidden = true;
  if (onboardingHintHoles) onboardingHintHoles.hidden = true;
  if (onboardingHintPlay) onboardingHintPlay.hidden = true;
  stopOnboardingHintNarration();
  if (onboardingGuidanceMode === 'hints') onboardingGuidanceMode = 'none';
  syncOnboardingHelpButtonState();
}

function dismissOnboardingHints() {
  if (onboardingHintsDismissed) return;
  onboardingHintsDismissed = true;
  hideOnboardingHints();
}

function markOnboardingInteraction() {
  if (onboardingInteractionMarked) return;
  onboardingInteractionMarked = true;
  if (onboardingHelpBtn) onboardingHelpBtn.classList.remove('has-onboarding-pulse');
  dismissOnboardingHints();
  if (!onboardingState.quickStartDismissed && onboardingQuickStart) {
    onboardingQuickStart.hidden = true;
    setOnboardingStatePatch({ quickStartDismissed: true });
  }
}

function markOnboardingInteractionFromEvent(event) {
  if (!event || !event.target) {
    markOnboardingInteraction();
    return;
  }
  if (onboardingQuickStart && onboardingQuickStart.contains(event.target)) {
    return;
  }
  if (onboardingHintsLayer && onboardingHintsLayer.contains(event.target)) {
    return;
  }
  if (onboardingTour && onboardingTour.contains(event.target)) {
    return;
  }
  markOnboardingInteraction();
}

function clearOnboardingTourTarget() {
  if (!onboardingTourTarget) return;
  onboardingTourTarget.classList.remove('onboarding-target');
  onboardingTourTarget = null;
}

function hideOnboardingTour() {
  clearOnboardingTourTarget();
  onboardingTourIndex = -1;
  if (onboardingTour) onboardingTour.hidden = true;
  stopOnboardingTourNarration();
  if (onboardingGuidanceMode === 'tour') onboardingGuidanceMode = 'none';
  syncOnboardingHelpButtonState();
}

function dismissOnboardingUiForExperienceChange() {
  if (onboardingQuickStart) onboardingQuickStart.hidden = true;
  hideOnboardingHints();
  hideOnboardingTour();
  onboardingHintsDismissed = true;
}

function positionOnboardingTourForTarget(targetElement) {
  if (!onboardingTour || !targetElement) return;
  var rect = targetElement.getBoundingClientRect();
  var margin = 12;
  var proposedTop = rect.bottom + 10;
  var maxTop = window.innerHeight - onboardingTour.offsetHeight - margin;
  if (proposedTop > maxTop) {
    proposedTop = Math.max(margin, rect.top - onboardingTour.offsetHeight - 10);
  }
  var proposedLeft = rect.left + rect.width / 2 - onboardingTour.offsetWidth / 2;
  proposedLeft = Math.max(margin, Math.min(proposedLeft, window.innerWidth - onboardingTour.offsetWidth - margin));
  onboardingTour.style.top = proposedTop + 'px';
  onboardingTour.style.left = proposedLeft + 'px';
}

function showOnboardingTourStep(index) {
  if (!onboardingTour || index < 0 || index >= onboardingTourSteps.length) return;
  var nextIndex = -1;
  var step = null;
  var target = null;
  for (var i = index; i < onboardingTourSteps.length; i++) {
    step = onboardingTourSteps[i];
    target = resolveOnboardingTarget(step && step.selector);
    if (target) {
      nextIndex = i;
      break;
    }
  }
  if (nextIndex < 0) {
    completeOnboardingTour();
    return;
  }
  clearOnboardingTourTarget();
  onboardingTourTarget = target;
  onboardingTourTarget.classList.add('onboarding-target');
  onboardingTourIndex = nextIndex;
  onboardingTourTitle.textContent = step.title;
  onboardingTourText.textContent = step.text;
  onboardingTourNextBtn.textContent = nextIndex === onboardingTourSteps.length - 1 ? 'Done' : 'Next';
  onboardingTour.hidden = false;
  onboardingGuidanceMode = 'tour';
  stopOnboardingTourNarration();
  syncOnboardingHelpButtonState();
  positionOnboardingTourForTarget(target);
}

function startOnboardingTour() {
  applyOnboardingGuideContentForCurrentExperience();
  if (onboardingHelpBtn) onboardingHelpBtn.classList.remove('has-onboarding-pulse');
  if (onboardingQuickStart) onboardingQuickStart.hidden = true;
  onboardingHintsEnabledByHelp = false;
  hideOnboardingHints();
  showOnboardingTourStep(0);
}

function openOnboardingGuidance() {
  applyOnboardingGuideContentForCurrentExperience();
  if (onboardingHelpBtn) onboardingHelpBtn.classList.remove('has-onboarding-pulse');
  if (onboardingQuickStart) onboardingQuickStart.hidden = true;

  onboardingHintsDismissed = false;
  onboardingHintStepIndex = 0;
  onboardingHintsEnabledByHelp = true;
  hideOnboardingTour();
  showOnboardingHints();
}

function completeOnboardingTour() {
  hideOnboardingTour();
  setOnboardingStatePatch({
    quickStartDismissed: true,
    tourCompleted: true
  });
}

function handleOnboardingTourNext() {
  if (onboardingTourIndex < 0) {
    startOnboardingTour();
    return;
  }
  if (onboardingTourIndex >= onboardingTourSteps.length - 1) {
    completeOnboardingTour();
    return;
  }
  showOnboardingTourStep(onboardingTourIndex + 1);
}

function handleOnboardingTourSkip() {
  hideOnboardingTour();
  setOnboardingStatePatch({
    quickStartDismissed: true
  });
}

function showOnboardingQuickStartIfNeeded() {
  if (!onboardingQuickStart) return;
  if (onboardingState.quickStartDismissed || hasUrlStateParams()) {
    onboardingQuickStart.hidden = true;
    return;
  }
  onboardingQuickStart.hidden = false;
}

function dismissOnboardingQuickStart() {
  if (!onboardingQuickStart) return;
  onboardingQuickStart.hidden = true;
  if (onboardingHelpBtn) onboardingHelpBtn.classList.remove('has-onboarding-pulse');
  setOnboardingStatePatch({ quickStartDismissed: true });
}

function syncOnboardingHelpPulse() {
  if (!onboardingHelpBtn) return;
  var shouldPulse = !onboardingInteractionMarked;
  onboardingHelpBtn.classList.toggle('has-onboarding-pulse', shouldPulse);
}

function refreshOnboardingOverlayPositions() {
  positionOnboardingHints();
  if (!onboardingTour || onboardingTour.hidden || !onboardingTourTarget) return;
  positionOnboardingTourForTarget(onboardingTourTarget);
}

function initializeOnboarding() {
  hydrateOnboardingState();
  onboardingHintsDismissed = false;
  onboardingHintStepIndex = 0;
  onboardingHintsEnabledByHelp = false;
  onboardingGuidanceMode = 'none';
  applyOnboardingGuideContentForCurrentExperience();
  showOnboardingQuickStartIfNeeded();
  showOnboardingHints();
  refreshOnboardingOverlayPositions();
  syncOnboardingHelpPulse();
  syncOnboardingTourNarrationButtonState(false);
  syncOnboardingHelpButtonState();
}

function clearSessionScopedCachesOnLoad() {
  var cacheKeys = [
    STITCHING_STATE_CACHE_KEY,
    TRIANGULA_STATE_CACHE_KEY,
    SQUARUS_STATE_CACHE_KEY,
    MASHRABIYA_STATE_CACHE_KEY,
    EXPERIENCE_PLAYBACK_STATE_KEY
  ];
  for (var i = 0; i < cacheKeys.length; i++) {
    appStateStorage.removeItem(cacheKeys[i]);
  }

  stitchingStateCache = null;
  stitchingStateCacheLoadedFromStorage = false;
  stitchingStateSnapshotAvailable = false;
  triangulaStateCache = null;
  squarusStateCache = null;
  mashrabiyaStateCache = null;
  experiencePlaybackStateCache = null;
}

