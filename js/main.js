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

var EXPERIENCE_LIBRARY = {
  stitching: {
    id: 'stitching',
    title: 'Stitching',
    titleFontFamily: 'MadeLikesScript',
    titleSvgPath: 'assets/images/experience_title_stitching.svg',
    strokeColor: '#1f4f94',
    infoTitle: 'About Stitching',
    infoText: 'Stitching turns math into thread motion. Pick a shape, set holes, then stitch by adding or multiplying to explore geometric patterns and unlock new worlds.',
    narrationText: '',
    aboutHtmlPath: 'docs/about/stitching.html',
    uiProfile: {
      allowedShapes: ['circle', 'triangle', 'square', 'star', 'heart'],
      fixedShape: null,
      threadsEnabled: true,
      allowMultipleThreads: true,
      paletteMode: 'thread',
      supportsHoleNumbers: true,
      supportsBorder: true,
      basicControls: {
        holes: true,
        stitchBy: true,
        add: true,
        multiply: true,
        width: true
      },
      advancedControls: {
        shape: true,
        border: true,
        holeNumbers: true,
        holesNumber: true,
        threads: true
      }
    }
  },
  triangula: {
    id: 'triangula',
    title: 'TrIAnguLa',
    titleFontFamily: 'EiforyaTypeface',
    titleSvgPath: 'assets/images/experience_title_triangula.svg',
    strokeColor: '#256f7a',
    infoTitle: 'About Triangula',
    infoText: 'Triangula explores recursive triangle patterns inspired by Sierpinski structures. Zoom and iterate to discover repeating self-similarity.',
    narrationText: '',
    aboutHtmlPath: 'docs/about/triangula.html',
    uiProfile: {
      allowedShapes: ['triangle'],
      fixedShape: 'triangle',
      threadsEnabled: false,
      allowMultipleThreads: false,
      paletteMode: 'triangula-banded',
      triangulaColorModes: ['band-1', 'band-2', 'band-4'],
      triangulaConstructionModes: ['shrink-duplicate', 'cut'],
      supportsHoleNumbers: false,
      supportsBorder: false,
      basicControls: {
        holes: false,
        stitchBy: false,
        add: false,
        multiply: false,
        width: false,
        triangulaColorScope: true,
        triangulaConstructionMode: true,
        triangulaStartCount: true,
        triangulaTargetCount: true
      },
      advancedControls: {
        shape: true,
        border: false,
        holeNumbers: false,
        holesNumber: false,
        threads: false,
        triangulaAnimationFitMode: true
      },
      animationBehavior: {
        cut: 'draw-cut-paths-then-remove',
        shrinkDuplicate: 'draw-duplication-paths-then-scale',
        viewportPolicy: 'fit-during-steps'
      }
    }
  },
  squarus: {
    id: 'squarus',
    title: 'Squarus',
    titleFontFamily: 'DigitalNumbers',
    titleSvgPath: '',
    strokeColor: '#5a4bb2',
    infoTitle: 'About Squarus',
    infoText: 'Squarus will focus on polyonimo generation through square counts, with parametric exploration of filling shapes using polyonimoes at different square-count levels.',
    narrationText: '',
    aboutHtmlPath: 'docs/about/squarus.html',
    uiProfile: {
      allowedShapes: ['square'],
      fixedShape: 'square',
      threadsEnabled: false,
      allowMultipleThreads: false,
      paletteMode: 'none',
      supportsHoleNumbers: false,
      supportsBorder: false,
      basicControls: {
        holes: false,
        stitchBy: false,
        add: false,
        multiply: false,
        width: false,
        squarusOrder: true,
        squarusLayout: true,
        squarusPieceCount: true,
        squarusSequence: true
      },
      advancedControls: {
        shape: true,
        border: false,
        holeNumbers: false,
        holesNumber: false,
        threads: false,
        squarusControls: true
      }
    }
  },
  mashrabiya: {
    id: 'mashrabiya',
    title: 'Mashrabiya',
    titleFontFamily: 'Shaumy',
    titleSvgPath: '',
    strokeColor: '#82511f',
    infoTitle: 'About Mashrabiya',
    infoText: 'Mashrabiya will open into Islamic rosette and lattice explorations built from radial symmetry.',
    narrationText: '',
    aboutHtmlPath: 'docs/about/mashrabiya.html',
    uiProfile: {
      allowedShapes: ['star'],
      fixedShape: 'star',
      threadsEnabled: false,
      allowMultipleThreads: false,
      paletteMode: 'none',
      supportsHoleNumbers: false,
      supportsBorder: false,
      basicControls: {
        holes: false,
        stitchBy: false,
        add: false,
        multiply: false,
        width: false,
        mashrabiyaFold: true,
        mashrabiyaFillBorder: true,
        mashrabiyaConstructionLines: true,
        mashrabiyaStarColor: true,
        mashrabiyaPetalColor: true,
        mashrabiyaPointColor: true
      },
      advancedControls: {
        shape: true,
        border: false,
        holeNumbers: false,
        holesNumber: false,
        threads: false,
        mashrabiyaFillBorder: true
      }
    }
  }
};

function getAllowedAboutDocPathSet() {
  var allowed = Object.create(null);
  var experienceIds = Object.keys(EXPERIENCE_LIBRARY || {});
  for (var i = 0; i < experienceIds.length; i++) {
    var experience = EXPERIENCE_LIBRARY[experienceIds[i]];
    if (!experience || typeof experience.aboutHtmlPath !== 'string') continue;
    var rawPath = experience.aboutHtmlPath.trim();
    if (!rawPath) continue;
    allowed[rawPath] = true;
  }
  return allowed;
}

function extractNarrationParagraphsFromDocument(doc) {
  if (!doc) return '';
  var parts = [];
  var seenTexts = Object.create(null);

  function pushText(value) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (seenTexts[text]) return;
    seenTexts[text] = true;
    parts.push(text);
  }

  var paragraphNodes = [];
  try {
    paragraphNodes = doc.querySelectorAll('p');
  } catch (error) {
    paragraphNodes = [];
  }

  for (var i = 0; i < paragraphNodes.length; i++) {
    pushText(paragraphNodes[i].textContent);
  }

  // If no paragraph tags were found, try common readable content blocks.
  if (!parts.length) {
    var blockNodes = [];
    try {
      blockNodes = doc.querySelectorAll('blockquote, h2, h3, li');
    } catch (error) {
      blockNodes = [];
    }
    for (var j = 0; j < blockNodes.length; j++) {
      pushText(blockNodes[j].textContent);
    }
  }

  // Last-resort fallback: flatten visible body text into paragraph-like chunks.
  if (!parts.length) {
    var rawBodyText = '';
    if (doc.body) {
      rawBodyText = String(doc.body.innerText || doc.body.textContent || '');
    } else if (doc.documentElement) {
      rawBodyText = String(doc.documentElement.textContent || '');
    }

    var lines = rawBodyText.replace(/\r/g, '\n').split(/\n+/);
    for (var k = 0; k < lines.length; k++) {
      var line = String(lines[k] || '').replace(/\s+/g, ' ').trim();
      if (!line) continue;
      pushText(line);
    }
  }

  var extracted = parts.join('\n\n').trim();
  narrationDebugLog('log', 'Extracted narration text from document.', {
    documentUrl: doc.location && doc.location.href ? String(doc.location.href) : '',
    documentTitle: doc.title || '',
    readyState: doc.readyState || '',
    paragraphCount: paragraphNodes.length,
    extractedChunkCount: parts.length,
    textLength: extracted.length,
    text: extracted
  });
  return extracted;
}

function loadNarrationTextFromExperienceInfoFrame(pathValue) {
  return new Promise(function(resolve, reject) {
    narrationDebugLog('log', 'Trying narration source: experience info iframe.', { path: pathValue });
    var resolvedPath = normalizeAllowedAboutDocPath(pathValue);
    if (!resolvedPath) {
      narrationDebugLog('warn', 'Experience info iframe source rejected: invalid about path.', { path: pathValue });
      reject(new Error('Invalid about html path'));
      return;
    }
    if (!experienceInfoHtmlFrame) {
      narrationDebugLog('warn', 'Experience info iframe source unavailable: iframe element missing.');
      reject(new Error('Narration info iframe unavailable'));
      return;
    }

    var bridgeCachedText = String(aboutNarrationBridgeCache[resolvedPath] || '').trim();
    if (bridgeCachedText) {
      narrationDebugLog('log', 'Narration source success: about iframe message cache.', {
        path: resolvedPath,
        textLength: bridgeCachedText.length
      });
      resolve(bridgeCachedText);
      return;
    }

    function readFromFrame() {
      var assignedSrc = normalizeAllowedAboutDocPath(experienceInfoHtmlFrame.getAttribute('src') || '');
      if (assignedSrc !== resolvedPath) return '';
      var loadedHref = getFrameHref();
      if (!loadedHref || loadedHref === 'about:blank' || loadedHref.indexOf('about:blank') === 0) return '';
      var loadedPath = normalizeLoadedAboutDocPath(loadedHref);
      if (loadedPath !== resolvedPath) {
        narrationDebugLog('log', 'Experience info iframe contains different loaded document; waiting.', {
          expectedPath: resolvedPath,
          loadedHref: loadedHref,
          loadedPath: loadedPath
        });
        return '';
      }
      var frameDoc = null;
      try {
        frameDoc = experienceInfoHtmlFrame.contentDocument || (experienceInfoHtmlFrame.contentWindow && experienceInfoHtmlFrame.contentWindow.document);
      } catch (error) {
        frameDoc = null;
      }
      if (!frameDoc) return '';
      return extractNarrationParagraphsFromDocument(frameDoc);
    }

    function getFrameHref() {
      try {
        if (experienceInfoHtmlFrame.contentWindow && experienceInfoHtmlFrame.contentWindow.location) {
          return String(experienceInfoHtmlFrame.contentWindow.location.href || '');
        }
      } catch (error) {
        // ignore
      }
      return '';
    }

    var immediateText = readFromFrame();
    if (immediateText) {
      narrationDebugLog('log', 'Narration source success: experience info iframe (immediate read).', {
        path: resolvedPath,
        textLength: immediateText.length,
        text: immediateText
      });
      resolve(immediateText);
      return;
    }

    var settled = false;
    var bridgeRequestInFlight = false;

    function settleOk(textValue) {
      if (settled) return;
      settled = true;
      experienceInfoHtmlFrame.removeEventListener('load', handleLoad);
      narrationDebugLog('log', 'Narration source success: experience info iframe (post-load read).', {
        path: resolvedPath,
        textLength: String(textValue || '').length,
        text: String(textValue || '')
      });
      resolve(String(textValue || ''));
    }

    function settleErr(error) {
      if (settled) return;
      settled = true;
      experienceInfoHtmlFrame.removeEventListener('load', handleLoad);
      narrationDebugLog('warn', 'Narration source failed: experience info iframe.', {
        path: resolvedPath,
        error: String((error && error.message) || error || 'unknown error')
      });
      reject(error || new Error('Narration info iframe load failed'));
    }

    function handleLoad() {
      var loadedText = readFromFrame();
      if (loadedText) {
        settleOk(loadedText);
      } else {
        var cachedFromBridge = String(aboutNarrationBridgeCache[resolvedPath] || '').trim();
        if (cachedFromBridge) {
          settleOk(cachedFromBridge);
          return;
        }

        if (!bridgeRequestInFlight) {
          bridgeRequestInFlight = true;
          requestNarrationTextFromAboutFrame(resolvedPath).then(function(textValue) {
            if (settled) return;
            var normalized = String(textValue || '').trim();
            if (!normalized) {
              bridgeRequestInFlight = false;
              return;
            }
            settleOk(normalized);
          }).catch(function() {
            bridgeRequestInFlight = false;
          });
        }

        var currentHref = getFrameHref();
        var currentPath = normalizeLoadedAboutDocPath(currentHref);
        var waitingForTargetDoc = !currentHref
          || currentHref === 'about:blank'
          || currentHref.indexOf('about:blank') === 0
          || currentPath !== resolvedPath;
        if (waitingForTargetDoc) {
          narrationDebugLog('log', 'Experience info iframe load event before target document; waiting.', {
            expectedPath: resolvedPath,
            currentHref: currentHref,
            currentPath: currentPath
          });
          return;
        }

        if (bridgeRequestInFlight) {
          narrationDebugLog('log', 'Experience info iframe waiting for narration bridge response.', {
            expectedPath: resolvedPath
          });
          return;
        }
        settleErr(new Error('Narration info iframe had no paragraph text'));
      }
    }

    experienceInfoHtmlFrame.addEventListener('load', handleLoad);
    var normalizedAssignedSrc = normalizeAllowedAboutDocPath(experienceInfoHtmlFrame.getAttribute('src') || '');
    var currentHref = getFrameHref();
    var frameIsBlank = currentHref === 'about:blank' || currentHref.indexOf('about:blank') === 0;
    if (normalizedAssignedSrc !== resolvedPath || frameIsBlank) {
      narrationDebugLog('log', 'Experience info iframe src differs; setting src for narration read.', { path: resolvedPath });
      experienceInfoHtmlFrame.setAttribute('src', resolvedPath);
    }

    window.setTimeout(function() {
      if (settled) return;
      settleErr(new Error('Narration info iframe request timed out'));
    }, 5000);
  });
}

function normalizeAllowedAboutDocPath(pathValue) {
  if (typeof pathValue !== 'string') return '';
  var rawPath = pathValue.trim();
  if (!rawPath) return '';

  var cleanedPath = rawPath.split('#')[0].split('?')[0].trim();
  if (!cleanedPath) return '';

  // Block protocol/absolute traversal-like inputs and allow only known about docs.
  if (/^[a-z][a-z0-9+.-]*:/i.test(cleanedPath)) return '';
  if (cleanedPath.indexOf('//') === 0) return '';
  if (cleanedPath.charAt(0) === '/') return '';
  if (cleanedPath.indexOf('..') !== -1) return '';

  var allowedSet = getAllowedAboutDocPathSet();
  if (!allowedSet[cleanedPath]) return '';
  return cleanedPath;
}

function normalizeLoadedAboutDocPath(pathValue) {
  if (typeof pathValue !== 'string') return '';
  var rawPath = pathValue.trim();
  if (!rawPath) return '';

  var candidatePath = rawPath;
  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(candidatePath)) {
      candidatePath = String(new URL(candidatePath, window.location.href).pathname || '');
    }
  } catch (error) {
    // Keep the original value and continue with best-effort normalization.
  }

  var cleanedPath = candidatePath.split('#')[0].split('?')[0].trim().replace(/\\/g, '/');
  if (!cleanedPath) return '';

  var strictMatch = normalizeAllowedAboutDocPath(cleanedPath);
  if (strictMatch) return strictMatch;

  var withoutLeadingSlash = cleanedPath.replace(/^\/+/, '');
  strictMatch = normalizeAllowedAboutDocPath(withoutLeadingSlash);
  if (strictMatch) return strictMatch;

  var allowedSet = getAllowedAboutDocPathSet();
  var allowedPaths = Object.keys(allowedSet);
  for (var i = 0; i < allowedPaths.length; i++) {
    var allowedPath = allowedPaths[i];
    if (withoutLeadingSlash === allowedPath || withoutLeadingSlash.slice(-allowedPath.length - 1) === '/' + allowedPath) {
      return allowedPath;
    }
  }

  return '';
}

var aboutNarrationBridgeCache = Object.create(null);
var aboutNarrationBridgePendingByRequestId = Object.create(null);
var aboutNarrationBridgeRequestCounter = 0;

function cacheAboutNarrationBridgeText(pathValue, textValue) {
  var normalizedPath = normalizeLoadedAboutDocPath(pathValue || '');
  if (!normalizedPath) return '';
  var normalizedText = String(textValue || '').trim();
  if (!normalizedText) return '';
  aboutNarrationBridgeCache[normalizedPath] = normalizedText;
  return normalizedText;
}

function requestNarrationTextFromAboutFrame(pathValue) {
  return new Promise(function(resolve, reject) {
    var resolvedPath = normalizeAllowedAboutDocPath(pathValue);
    if (!resolvedPath) {
      reject(new Error('Invalid about html path for narration request'));
      return;
    }
    if (!experienceInfoHtmlFrame || !experienceInfoHtmlFrame.contentWindow) {
      reject(new Error('Narration request target frame unavailable'));
      return;
    }

    var cached = String(aboutNarrationBridgeCache[resolvedPath] || '').trim();
    if (cached) {
      resolve(cached);
      return;
    }

    var requestId = 'about-narration-' + String(Date.now()) + '-' + String(++aboutNarrationBridgeRequestCounter);
    var timeoutId = window.setTimeout(function() {
      if (!aboutNarrationBridgePendingByRequestId[requestId]) return;
      delete aboutNarrationBridgePendingByRequestId[requestId];
      reject(new Error('Narration bridge request timed out'));
    }, 2200);

    aboutNarrationBridgePendingByRequestId[requestId] = {
      expectedPath: resolvedPath,
      resolve: function(textValue) {
        window.clearTimeout(timeoutId);
        resolve(String(textValue || ''));
      },
      reject: function(error) {
        window.clearTimeout(timeoutId);
        reject(error || new Error('Narration bridge request failed'));
      }
    };

    try {
      experienceInfoHtmlFrame.contentWindow.postMessage({
        type: 'stitchlab-about-narration-request',
        requestId: requestId,
        path: resolvedPath
      }, '*');
    } catch (error) {
      delete aboutNarrationBridgePendingByRequestId[requestId];
      window.clearTimeout(timeoutId);
      reject(error);
    }
  });
}

function enforceExperienceInfoFrameAllowlist() {
  if (!experienceInfoHtmlFrame) return;

  var currentExperience = getExperienceById(currentExperienceId);
  var safePath = normalizeAllowedAboutDocPath(currentExperience.aboutHtmlPath || '');
  if (!safePath) {
    experienceInfoHtmlFrame.removeAttribute('src');
    return;
  }

  var assignedSrc = normalizeAllowedAboutDocPath(experienceInfoHtmlFrame.getAttribute('src') || '');
  if (assignedSrc !== safePath) {
    experienceInfoHtmlFrame.setAttribute('src', safePath);
  }
}

var currentExperienceId = 'stitching';
var experienceNarrationUtterance = null;
var experienceNarrationFetchById = Object.create(null);
var experienceNarrationRequestToken = 0;
var experienceNarrationRequestInFlight = false;
var experienceNarrationLastToggleAtMs = 0;
var NARRATION_DEBUG = true;

function narrationDebugLog(level, message, details) {
  if (!NARRATION_DEBUG || !window.console) return;
  var fn = console[level] || console.log;
  if (typeof details === 'undefined') {
    fn.call(console, '[Narration] ' + message);
  } else {
    fn.call(console, '[Narration] ' + message, details);
  }
}
var triangulaColorMode = 'band-1';
var triangulaConstructionMode = 'shrink-duplicate';
var triangulaStartCount = 1;
var triangulaTargetCount = 27;
var triangulaFractalMode = 'series';
var triangulaFitMode = 'locked';
var triangulaAnimationState = null;
var squarusOrder = 5;
var squarusLayout = 'force-directed';
var squarusAnimationMode = 'sequential';
var squarusContactMode = 'formula-only';
var squarusPieceCount = null;
var squarusSequenceSeed = 1;
var mashrabiyaFold = 12;
var mashrabiyaGeometryMode = 'stitch-vertex';
var mashrabiyaStarColor = '#f4d35e';
var mashrabiyaPetalColor = '#ee964b';
var mashrabiyaPointColor = '#f95738';
var mashrabiyaFillBorderWidth = 2;
var mashrabiyaKeepConstructionLines = false;
var mashrabiyaFillPhaseBeatScale = 1.7;
var mashrabiyaDebugLabelsEnabled = false; // set to false for final release
var mashrabiyaDebugKeepStitchLinesVisible = false; // debug: force true to inspect line topology
var mashrabiyaDebugFillOpacityScale = 1;
var SQUARUS_PIECE_SCALE_FACTOR = 0.75;
var SQUARUS_SCATTER_EDGE_PADDING = 10;
var SQUARUS_SCATTER_WOBBLE_AMPLITUDE = 0;
var SQUARUS_SCATTER_WOBBLE_SPEED = 0;
var SQUARUS_ENTRY_FADE_MS = 220;
var squarusEntryFadeStartMs = 0;
var squarusEntryFadeActive = false;
var squarusEntryFadeRafPending = false;
var squarusPolyominoCache = Object.create(null);
var stitchingFrameShape = 'circle';
var triangulaBandColors = {
  band1: '#8ac926',
  band2: '#6a4c93',
  band4: '#8ac926'
};
var triangulaSourceColor = '#8ac926';

var APP_STATE_URL_VERSION = '2';
var URL_STATE_PARAM_KEYS = Object.freeze({
  version: 'version',
  experienceId: 'experience',
  stitchingShape: 'stitchingShape',
  bpm: 'bpm',
  musicMuted: 'musicMuted',
  songId: 'song',
  stitchingShowHoleNumbers: 'stitchingShowHoleNumbers',
  stitchingBorderEnabled: 'stitchingBorderEnabled',
  stitchingHoles: 'stitchingHoles',
  stitchingNestedFrameEnabled: 'stitchingNestedFrameEnabled',
  stitchingNestedFrameRatio: 'stitchingNestedFrameRatio',
  stitchingSelectedThreadIndex: 'stitchingSelectedThreadIndex',
  stitchingThreadState: 'stitchingThreadState',
  stitchingThreadColors: 'stitchingThreadColors',
  triangulaSourceColor: 'triangulaSourceColor',
  triangulaColorMode: 'triangulaColorMode',
  triangulaConstructionMode: 'triangulaConstructionMode',
  triangulaStartCount: 'triangulaStartCount',
  triangulaTargetCount: 'triangulaTargetCount',
  triangulaFractalMode: 'triangulaFractalMode',
  triangulaFitMode: 'triangulaFitMode',
  triangulaBand1Color: 'triangulaBand1Color',
  triangulaBand2Color: 'triangulaBand2Color',
  triangulaBand4Color: 'triangulaBand4Color',
  squarusOrder: 'squarusOrder',
  squarusLayout: 'squarusLayout',
  squarusAnimationMode: 'squarusAnimationMode',
  squarusContactMode: 'squarusContactMode',
  squarusPieceCount: 'squarusPieceCount',
  squarusSequenceSeed: 'squarusSequenceSeed',
  mashrabiyaFold: 'mashrabiyaFold',
  mashrabiyaGeometryMode: 'mashrabiyaGeometryMode',
  mashrabiyaStarColor: 'mashrabiyaStarColor',
  mashrabiyaPetalColor: 'mashrabiyaPetalColor',
  mashrabiyaPointColor: 'mashrabiyaPointColor',
  mashrabiyaFillBorderWidth: 'mashrabiyaFillBorderWidth',
  mashrabiyaKeepConstructionLines: 'mashrabiyaKeepConstructionLines'
});
var URL_SYNC_DEBOUNCE_MS = 800;
var TRIANGULA_DRAWABLE_COUNTS = [1, 3, 9, 27, 81, 243, 729];
var urlSyncTimer = null;
var urlSyncSuspended = false;
var appState = {
  version: APP_STATE_URL_VERSION,
  experienceId: 'stitching',
  common: {
    shape: 'circle',
    bpm: currentAnimationBpm,
    musicMuted: false,
    songId: 'bach'
  },
  stitching: {
    holes: DEFAULT_HOLES,
    nestedFrameEnabled: false,
    nestedFrameRatio: DEFAULT_NESTED_FRAME_RATIO,
    selectedThreadIndex: 0,
    showHoleNumbers: true,
    borderEnabled: true,
    threadColors: ['#1982c4'],
    threadState: ''
  },
  triangula: {
    colorMode: 'band-1',
    constructionMode: 'shrink-duplicate',
    startCount: 1,
    targetCount: 27,
    fractalMode: 'series',
    fitMode: 'locked',
    sourceColor: '#8ac926',
    band1Color: '#8ac926',
    band2Color: '#6a4c93',
    band4Color: '#8ac926'
  },
  squarus: {
    order: 4,
    layout: 'grid-packing',
    animationMode: 'sequential',
    contactMode: 'formula-only',
    pieceCount: null,
    sequenceSeed: 0
  },
  mashrabiya: {
    fold: 12,
    geometryMode: 'stitch-vertex',
    starColor: '#f4d35e',
    petalColor: '#ee964b',
    pointColor: '#f95738',
    fillBorderWidth: 2,
    keepConstructionLines: false
  }
};

function withUrlSyncSuspended(work) {
  var wasSuspended = urlSyncSuspended;
  urlSyncSuspended = true;
  try {
    work();
  } finally {
    urlSyncSuspended = wasSuspended;
  }
}

function setUrlStateParam(params, logicalKey, value) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  if (!key) return;
  params.set(key, value);
}

function getUrlStateParam(params, logicalKey) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  if (key && params.has(key)) return params.get(key);
  return null;
}

function hasUrlStateKey(params, logicalKey) {
  var key = URL_STATE_PARAM_KEYS[logicalKey];
  return !!(key && params.has(key));
}

function getDiscoveryKeyForExperience(experienceId) {
  var resolved = resolveExperienceId(experienceId);
  if (resolved === 'triangula') return 'triangle';
  if (resolved === 'squarus') return 'square';
  if (resolved === 'mashrabiya') return 'rosette12';
  return null;
}

function normalizeTriangulaDrawableCount(value, role, fallback) {
  var parsed = parseBoundedInt(value, 1, 729, fallback);
  if (!isFinite(parsed)) {
    parsed = parseBoundedInt(fallback, 1, 729, 1);
  }

  if (TRIANGULA_DRAWABLE_COUNTS.indexOf(parsed) !== -1) {
    return parsed;
  }

  if (role === 'target') {
    for (var i = 0; i < TRIANGULA_DRAWABLE_COUNTS.length; i++) {
      if (TRIANGULA_DRAWABLE_COUNTS[i] >= parsed) {
        return TRIANGULA_DRAWABLE_COUNTS[i];
      }
    }
    return TRIANGULA_DRAWABLE_COUNTS[TRIANGULA_DRAWABLE_COUNTS.length - 1];
  }

  // Default/start behavior: snap downward to avoid overshooting requested start density.
  for (var j = TRIANGULA_DRAWABLE_COUNTS.length - 1; j >= 0; j--) {
    if (TRIANGULA_DRAWABLE_COUNTS[j] <= parsed) {
      return TRIANGULA_DRAWABLE_COUNTS[j];
    }
  }

  return TRIANGULA_DRAWABLE_COUNTS[0];
}

function sanitizeTriangulaCount(value, fallback, role) {
  return normalizeTriangulaDrawableCount(value, role, fallback);
}

function getTriangulaCountIndexFromValue(value, role, fallback) {
  var normalized = normalizeTriangulaDrawableCount(value, role, fallback);
  var index = TRIANGULA_DRAWABLE_COUNTS.indexOf(normalized);
  if (index === -1) return 0;
  return index;
}

function getTriangulaCountFromSliderIndex(indexValue, role, fallback) {
  var fallbackIndex = getTriangulaCountIndexFromValue(fallback, role, fallback);
  var index = parseBoundedInt(indexValue, 0, TRIANGULA_DRAWABLE_COUNTS.length - 1, fallbackIndex);
  return TRIANGULA_DRAWABLE_COUNTS[index];
}

function sanitizeTriangulaColorMode(value, fallback) {
  var allowed = ['band-1', 'band-2', 'band-4'];
  if (allowed.indexOf(value) === -1) return fallback;
  return value;
}

function sanitizeTriangulaConstructionMode(value, fallback) {
  if (value !== 'cut' && value !== 'shrink-duplicate') return fallback;
  return value;
}

function sanitizeTriangulaFractalMode(value, fallback) {
  if (value !== 'parallel' && value !== 'series') return fallback;
  return value;
}

function sanitizeTriangulaFitMode(value, fallback) {
  if (value !== 'dynamic' && value !== 'locked') return fallback;
  return value;
}

function sanitizeSquarusLayout(value, fallback) {
  var allowed = [
    'grid-packing',
    'hilbert-curve',
    'symmetry-d4',
    'spiral-packing',
    'circle-packing',
    'radial-tree',
    'force-directed'
  ];
  if (allowed.indexOf(value) === -1) return fallback;
  return value;
}

function sanitizeSquarusAnimationMode(value, fallback) {
  if (value !== 'parallel' && value !== 'sequential') return fallback;
  return value;
}

function sanitizeSquarusContactMode(value, fallback) {
  if (value !== 'connected-touch' && value !== 'formula-only') return fallback;
  return value;
}

function sanitizeMashrabiyaFold(value, fallback) {
  var parsed = parseBoundedInt(value, 8, 12, fallback);
  var allowed = [8, 12];
  if (allowed.indexOf(parsed) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 12;
  }
  return parsed;
}

function sanitizeMashrabiyaGeometryMode(value, fallback) {
  return 'stitch-vertex';
}

function sanitizeMashrabiyaFillBorderWidth(value, fallback) {
  return parseBoundedInt(value, 0, 3, parseBoundedInt(fallback, 0, 3, 0));
}

function getSquarusSequenceDomainSize(orderRef) {
  var order = parseBoundedInt(orderRef, 1, 6, squarusOrder);
  if (order <= 4) {
    var pieceCount = getSquarusTotalPiecesForOrder(order);
    var total = 1;
    for (var i = 2; i <= pieceCount; i++) {
      total *= i;
    }
    return Math.max(1, total);
  }
  return 1000;
}

function getSquarusSequenceMaxIndex(orderRef) {
  return Math.max(0, getSquarusSequenceDomainSize(orderRef) - 1);
}

function normalizeSquarusSequenceSeed(value, fallback, orderRef) {
  var maxIndex = getSquarusSequenceMaxIndex(orderRef);
  return parseBoundedInt(value, 0, maxIndex, parseBoundedInt(fallback, 0, maxIndex, 0));
}

function getSquarusTotalPiecesForOrder(order) {
  return getSquarusPolyominoes(parseBoundedInt(order, 1, 6, squarusOrder)).length;
}

function normalizeSquarusPieceCount(value, fallback, orderRef) {
  var order = parseBoundedInt(orderRef, 1, 6, squarusOrder);
  var total = getSquarusTotalPiecesForOrder(order);
  var defaultValue = isFinite(fallback) ? fallback : total;
  return parseBoundedInt(value, 0, total, defaultValue);
}

function sanitizeShape(value, fallback) {
  var allowed = ['circle', 'triangle', 'square', 'star', 'heart'];
  if (allowed.indexOf(value) === -1) return fallback;
  return value;
}

function sanitizeBooleanParam(value, fallback) {
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return fallback;
}

function sanitizeBooleanValue(value, fallback) {
  if (value === true || value === false) return value;
  return !!sanitizeBooleanParam(value, fallback);
}

function sanitizeSongId(value, fallback) {
  if (value && MUSIC_LIBRARY[value]) return value;
  return fallback;
}

function sanitizeBpmForCurrentSong(value, fallback) {
  var parsed = Math.round(Number(value));
  var allowedTempos = getActiveTempoOptions();
  if (!isFinite(parsed) || allowedTempos.indexOf(parsed) === -1) {
    return fallback;
  }
  return parsed;
}

function sanitizeThreadColor(value, fallback) {
  return sanitizeHexColor(value, fallback);
}

function sanitizeThreadSolidColor(value, fallback) {
  var fallbackColor = sanitizeHexColor(fallback, '#1982c4');
  if (fallbackColor === 'rainbow') {
    fallbackColor = '#1982c4';
  }
  var normalized = sanitizeHexColor(value, fallbackColor);
  if (normalized === 'rainbow') {
    return fallbackColor;
  }
  return normalized;
}

function sanitizeThreadColorList(value, fallbackList) {
  if (typeof value !== 'string' || !value.trim()) return fallbackList.slice();
  var raw = value.split(',');
  var sanitized = [];
  for (var i = 0; i < raw.length; i++) {
    var color = sanitizeThreadColor(raw[i], null);
    if (color) sanitized.push(color);
  }
  if (!sanitized.length) return fallbackList.slice();
  return sanitized;
}

function sanitizeThreadJumpMode(value, fallback) {
  var allowed = ['fixed', 'connect', 'sequence'];
  if (isExpressionStitchModeEnabled()) {
    allowed.push('formula');
  }
  if (allowed.indexOf(value) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 'fixed';
  }
  return value;
}

function sanitizeThreadSequenceMode(value, fallback) {
  var allowed = ['holes', 'steps'];
  if (allowed.indexOf(value) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 'holes';
  }
  return value;
}

function sanitizeNestedFrameRatio(value, fallback) {
  var parsed = Number(value);
  if (!isFinite(parsed) || NESTED_FRAME_RATIO_OPTIONS.indexOf(parsed) === -1) {
    return NESTED_FRAME_RATIO_OPTIONS.indexOf(fallback) !== -1 ? fallback : DEFAULT_NESTED_FRAME_RATIO;
  }
  return parsed;
}

function sanitizeThreadFrameMode(value, fallback) {
  var allowed = ['outer', 'inner', 'bridge', 'bridge-reverse', 'bridge-reverse-project'];
  if (allowed.indexOf(value) === -1) {
    return allowed.indexOf(fallback) !== -1 ? fallback : 'outer';
  }
  return value;
}

function sanitizeThreadDescriptor(raw, fallback) {
  fallback = fallback || {
    jump: DEFAULT_SKIP,
    width: DEFAULT_THREAD_SIZE,
    color: '#1982c4',
    solidColor: '#1982c4',
    startHole: 1,
    jumpMode: 'fixed',
    jumpFormula: 'skip',
    jumpSequence: '',
    jumpSequenceMode: 'holes',
    connectMultiplier: 2,
    connectOffset: 0,
    frameMode: 'outer'
  };

  raw = raw || {};
  var jumpMode = sanitizeThreadJumpMode(raw.m || raw.jumpMode, fallback.jumpMode || 'fixed');
  var thread = {
    jump: parseBoundedInt(raw.j != null ? raw.j : raw.jump, 1, MAX_HOLES - 1, fallback.jump || DEFAULT_SKIP),
    width: parseBoundedInt(raw.w != null ? raw.w : raw.width, 1, 10, fallback.width || DEFAULT_THREAD_SIZE),
    color: sanitizeThreadColor(raw.c != null ? raw.c : raw.color, fallback.color || '#1982c4'),
    startHole: parseBoundedInt(raw.sh != null ? raw.sh : raw.startHole, 1, MAX_HOLES, fallback.startHole || 1),
    sequence: null,
    jumpMode: jumpMode,
    jumpFormula: String(raw.f != null ? raw.f : (raw.jumpFormula != null ? raw.jumpFormula : (fallback.jumpFormula || 'skip'))),
    jumpSequence: String(raw.s != null ? raw.s : (raw.jumpSequence != null ? raw.jumpSequence : (fallback.jumpSequence || ''))),
    jumpSequenceMode: sanitizeThreadSequenceMode(raw.sm != null ? raw.sm : raw.jumpSequenceMode, fallback.jumpSequenceMode || 'holes'),
    connectMultiplier: parseBoundedInt(raw.cm != null ? raw.cm : raw.connectMultiplier, 1, 12, fallback.connectMultiplier || 2),
    connectOffset: parseBoundedInt(raw.co != null ? raw.co : raw.connectOffset, 0, MAX_HOLES, fallback.connectOffset || 0),
    frameMode: sanitizeThreadFrameMode(raw.fm != null ? raw.fm : raw.frameMode, fallback.frameMode || 'outer'),
    solidColor: sanitizeThreadSolidColor(raw.sc != null ? raw.sc : raw.solidColor, fallback.solidColor || fallback.color || '#1982c4')
  };

  if (thread.color !== 'rainbow') {
    thread.solidColor = sanitizeThreadSolidColor(thread.color, thread.solidColor || '#1982c4');
  }

  if (thread.jumpMode !== 'formula') {
    thread.jumpFormula = fallback.jumpFormula || 'skip';
  }
  if (thread.jumpMode !== 'sequence') {
    thread.jumpSequence = '';
  }

  return thread;
}

function serializeStitchingThreadState(threadList) {
  var compact = (threadList || []).map(function(thread) {
    return {
      j: parseBoundedInt(thread.jump, 1, MAX_HOLES - 1, DEFAULT_SKIP),
      w: parseBoundedInt(thread.width, 1, 10, DEFAULT_THREAD_SIZE),
      c: sanitizeThreadColor(thread.color, '#1982c4'),
      sh: parseBoundedInt(thread.startHole, 1, MAX_HOLES, 1),
      m: sanitizeThreadJumpMode(thread.jumpMode, 'fixed'),
      f: String(thread.jumpFormula || 'skip'),
      s: String(thread.jumpSequence || ''),
      sm: sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes'),
      cm: parseBoundedInt(thread.connectMultiplier, 1, 12, 2),
      co: parseBoundedInt(thread.connectOffset, 0, MAX_HOLES, 0),
      fm: sanitizeThreadFrameMode(thread.frameMode, 'outer'),
      sc: sanitizeThreadSolidColor(thread.solidColor, thread.color === 'rainbow' ? '#1982c4' : thread.color)
    };
  });

  if (!compact.length) {
    compact.push({
      j: DEFAULT_SKIP,
      w: DEFAULT_THREAD_SIZE,
      c: '#1982c4',
      sh: 1,
      m: 'fixed',
      f: 'skip',
      s: '',
      sm: 'holes',
      cm: 2,
      co: 0,
      fm: 'outer',
      sc: '#1982c4'
    });
  }

  return encodeURIComponent(JSON.stringify(compact));
}

function parseStitchingThreadState(value, fallbackList) {
  fallbackList = fallbackList || [];
  if (typeof value !== 'string' || !value.trim()) {
    return fallbackList.slice();
  }

  try {
    var decoded = decodeURIComponent(value);
    var parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) {
      return fallbackList.slice();
    }
    var sanitized = parsed.map(function(entry, index) {
      var fallback = fallbackList[index] || fallbackList[0];
      return sanitizeThreadDescriptor(entry, fallback);
    }).filter(function(thread) {
      return !!thread;
    });
    if (!sanitized.length) {
      return fallbackList.slice();
    }
    return sanitized;
  } catch (error) {
    return fallbackList.slice();
  }
}

function buildStitchingStateSnapshotFromRuntime() {
  var defaultThread = sanitizeThreadDescriptor({}, null);
  var sourceThreads = (threads && threads.length) ? threads : [defaultThread];
  var sanitizedThreads = sourceThreads.map(function(thread) {
    return sanitizeThreadDescriptor(thread, defaultThread);
  });
  var maxIndex = Math.max(0, sanitizedThreads.length - 1);
  var snapshotShape = sanitizeShape(stitchingFrameShape, 'circle');
  return {
    shape: snapshotShape,
    holes: parseBoundedInt(holesSlider && holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES),
    nestedFrameEnabled: !!nestedFrameEnabled,
    nestedFrameRatio: sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO),
    selectedThreadIndex: parseBoundedInt(selectedThreadIndex, 0, maxIndex, 0),
    showHoleNumbers: !!showHoleNumbers,
    borderEnabled: !!borderEnabled,
    threadState: serializeStitchingThreadState(sanitizedThreads)
  };
}

function normalizeStitchingStateSnapshot(raw, fallback) {
  var base = fallback || buildStitchingStateSnapshotFromRuntime();
  raw = raw || {};
  var normalizedShape = sanitizeShape(raw.shape, base.shape);
  var normalizedHoles = parseBoundedInt(raw.holes, 3, MAX_HOLES, base.holes);
  var normalizedNestedFrameEnabled = !!sanitizeBooleanParam(raw.nestedFrameEnabled, base.nestedFrameEnabled);
  var normalizedNestedFrameRatio = sanitizeNestedFrameRatio(raw.nestedFrameRatio, base.nestedFrameRatio);
  var normalizedShowHoleNumbers = !!sanitizeBooleanParam(raw.showHoleNumbers, base.showHoleNumbers);
  var normalizedBorderEnabled = !!sanitizeBooleanParam(raw.borderEnabled, base.borderEnabled);
  var parsedThreads = parseStitchingThreadState(raw.threadState, parseStitchingThreadState(base.threadState, [sanitizeThreadDescriptor({}, null)]));
  if (!parsedThreads.length) {
    parsedThreads = [sanitizeThreadDescriptor({}, null)];
  }
  var normalizedSelectedThreadIndex = parseBoundedInt(raw.selectedThreadIndex, 0, parsedThreads.length - 1, base.selectedThreadIndex);
  return {
    shape: normalizedShape,
    holes: normalizedHoles,
    nestedFrameEnabled: normalizedNestedFrameEnabled,
    nestedFrameRatio: normalizedNestedFrameRatio,
    selectedThreadIndex: normalizedSelectedThreadIndex,
    showHoleNumbers: normalizedShowHoleNumbers,
    borderEnabled: normalizedBorderEnabled,
    threadState: serializeStitchingThreadState(parsedThreads)
  };
}

function persistStitchingStateCache(snapshot) {
  var normalized = normalizeStitchingStateSnapshot(snapshot, buildStitchingStateSnapshotFromRuntime());
  stitchingStateCache = normalized;
  stitchingFrameShape = sanitizeShape(normalized.shape, stitchingFrameShape || 'circle');
  stitchingStateSnapshotAvailable = true;
  try {
    appStateStorage.setItem(STITCHING_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; in-memory state still works during session.
  }
}

function hydrateStitchingStateCacheFromStorage() {
  if (stitchingStateCache) return stitchingStateCache;
  var fallback = buildStitchingStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(STITCHING_STATE_CACHE_KEY);
  if (!raw) {
    stitchingStateCacheLoadedFromStorage = false;
    stitchingStateSnapshotAvailable = false;
    stitchingStateCache = fallback;
    return stitchingStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    stitchingStateCache = normalizeStitchingStateSnapshot(parsed, fallback);
    stitchingStateCacheLoadedFromStorage = true;
    stitchingStateSnapshotAvailable = true;
  } catch (error) {
    stitchingStateCacheLoadedFromStorage = false;
    stitchingStateSnapshotAvailable = false;
    stitchingStateCache = fallback;
  }
  return stitchingStateCache;
}

function getPreferredStitchingShapeFromHydration(params, fallbackShape) {
  var cachedState = hydrateStitchingStateCacheFromStorage();
  var cacheShape = sanitizeShape(cachedState && cachedState.shape, fallbackShape || 'circle');
  if (stitchingStateSnapshotAvailable) {
    return cacheShape;
  }
  return sanitizeShape(getUrlStateParam(params, 'stitchingShape'), cacheShape);
}

function buildExperiencePlaybackStateFallback() {
  var stitchingSong = 'bach';
  var triangulaSong = 'triangle';
  var squarusSong = 'square';
  var mashrabiyaSong = 'rosette';
  return {
    stitching: {
      songId: stitchingSong,
      bpm: getKidTempoPresetsForSong(stitchingSong).slow || DEFAULT_ANIMATION_BPM
    },
    triangula: {
      songId: triangulaSong,
      bpm: getKidTempoPresetsForSong(triangulaSong).slow || DEFAULT_ANIMATION_BPM
    },
    squarus: {
      songId: squarusSong,
      bpm: getKidTempoPresetsForSong(squarusSong).slow || DEFAULT_ANIMATION_BPM
    },
    mashrabiya: {
      songId: mashrabiyaSong,
      bpm: getKidTempoPresetsForSong(mashrabiyaSong).slow || DEFAULT_ANIMATION_BPM
    }
  };
}

function normalizePlaybackEntry(rawEntry, fallbackSongId) {
  var songId = sanitizeSongId(rawEntry && rawEntry.songId, fallbackSongId);
  var allowedTempos = getTempoOptionsForSong(songId);
  var fallbackBpm = getKidTempoPresetsForSong(songId).slow || DEFAULT_ANIMATION_BPM;
  var bpm = parseBoundedInt(rawEntry && rawEntry.bpm, 1, 2000, fallbackBpm);
  if (allowedTempos.indexOf(bpm) === -1) {
    bpm = fallbackBpm;
  }
  return {
    songId: songId,
    bpm: bpm
  };
}

function persistExperiencePlaybackStateCache(snapshot) {
  var normalized = snapshot || hydrateExperiencePlaybackStateCacheFromStorage();
  experiencePlaybackStateCache = normalized;
  try {
    appStateStorage.setItem(EXPERIENCE_PLAYBACK_STATE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateExperiencePlaybackStateCacheFromStorage() {
  if (experiencePlaybackStateCache) return experiencePlaybackStateCache;
  var fallback = buildExperiencePlaybackStateFallback();
  var raw = appStateStorage.getItem(EXPERIENCE_PLAYBACK_STATE_KEY);
  if (!raw) {
    experiencePlaybackStateCache = fallback;
    return experiencePlaybackStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    experiencePlaybackStateCache = {
      stitching: normalizePlaybackEntry(parsed.stitching, fallback.stitching.songId),
      triangula: normalizePlaybackEntry(parsed.triangula, fallback.triangula.songId),
      squarus: normalizePlaybackEntry(parsed.squarus, fallback.squarus.songId),
      mashrabiya: normalizePlaybackEntry(parsed.mashrabiya, fallback.mashrabiya.songId)
    };
  } catch (error) {
    experiencePlaybackStateCache = fallback;
  }
  return experiencePlaybackStateCache;
}

function recordCurrentExperiencePlaybackPreference() {
  var experienceId = resolveExperienceId(currentExperienceId);
  if (!experienceId) return;
  var playbackState = hydrateExperiencePlaybackStateCacheFromStorage();
  var fallbackSong = sanitizeSongId(getDefaultSongIdForExperience(experienceId), 'bach');
  playbackState[experienceId] = normalizePlaybackEntry(
    {
      songId: currentSongId,
      bpm: currentAnimationBpm
    },
    fallbackSong
  );
  persistExperiencePlaybackStateCache(playbackState);
}

function getPreferredPlaybackForExperience(experienceId) {
  var resolvedExperienceId = resolveExperienceId(experienceId) || 'stitching';
  var fallbackSong = sanitizeSongId(getDefaultSongIdForExperience(resolvedExperienceId), 'bach');
  var playbackState = hydrateExperiencePlaybackStateCacheFromStorage();
  var preferred = normalizePlaybackEntry(playbackState[resolvedExperienceId], fallbackSong);
  return preferred;
}

function syncStitchingStateCacheFromRuntime() {
  if (currentExperienceId !== 'stitching') return;
  persistStitchingStateCache(buildStitchingStateSnapshotFromRuntime());
}

function restoreStitchingStateFromCache() {
  var snapshot = hydrateStitchingStateCacheFromStorage();
  if (!snapshot) return false;
  var normalized = normalizeStitchingStateSnapshot(snapshot, buildStitchingStateSnapshotFromRuntime());
  var restoredThreads = parseStitchingThreadState(normalized.threadState, [sanitizeThreadDescriptor({}, null)]);
  if (!restoredThreads.length) {
    restoredThreads = [sanitizeThreadDescriptor({}, null)];
  }

  threads = restoredThreads.map(function(thread) {
    return sanitizeThreadDescriptor(thread, thread);
  });
  selectedThreadIndex = parseBoundedInt(normalized.selectedThreadIndex, 0, threads.length - 1, 0);
  showHoleNumbers = !!normalized.showHoleNumbers;
  borderEnabled = !!normalized.borderEnabled;
  nestedFrameEnabled = !!normalized.nestedFrameEnabled;
  nestedFrameRatio = sanitizeNestedFrameRatio(normalized.nestedFrameRatio, nestedFrameRatio);
  holesSlider.value = String(parseBoundedInt(normalized.holes, 3, MAX_HOLES, DEFAULT_HOLES));
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = holesSlider.value;
  }

  stitchingFrameShape = sanitizeShape(normalized.shape, stitchingFrameShape || 'circle');
  setCurrentShape(stitchingFrameShape, false);
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  updateKidControlValues();
  syncNestedFrameControls();
  syncHoleNumberToggles();
  syncBorderControls();

  persistStitchingStateCache(normalized);
  return true;
}

function buildTriangulaStateSnapshotFromRuntime() {
  return {
    colorMode: sanitizeTriangulaColorMode(triangulaColorMode, 'band-1'),
    constructionMode: sanitizeTriangulaConstructionMode(triangulaConstructionMode, 'shrink-duplicate'),
    startCount: sanitizeTriangulaCount(triangulaStartCount, 1, 'start'),
    targetCount: sanitizeTriangulaCount(triangulaTargetCount, 27, 'target'),
    fractalMode: sanitizeTriangulaFractalMode(triangulaFractalMode, 'series'),
    fitMode: sanitizeTriangulaFitMode(triangulaFitMode, 'locked'),
    sourceColor: sanitizeThreadColor(triangulaSourceColor, '#8ac926'),
    band1Color: sanitizeHexColor(triangulaBandColors.band1, '#8ac926'),
    band2Color: sanitizeHexColor(triangulaBandColors.band2, '#6a4c93'),
    band4Color: sanitizeHexColor(triangulaBandColors.band4, '#8ac926')
  };
}

function persistTriangulaStateCache(snapshot) {
  var normalized = snapshot || buildTriangulaStateSnapshotFromRuntime();
  triangulaStateCache = normalized;
  try {
    appStateStorage.setItem(TRIANGULA_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateTriangulaStateCacheFromStorage() {
  if (triangulaStateCache) return triangulaStateCache;
  var fallback = buildTriangulaStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(TRIANGULA_STATE_CACHE_KEY);
  if (!raw) {
    triangulaStateCache = fallback;
    return triangulaStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    triangulaStateCache = {
      colorMode: sanitizeTriangulaColorMode(parsed.colorMode, fallback.colorMode),
      constructionMode: sanitizeTriangulaConstructionMode(parsed.constructionMode, fallback.constructionMode),
      startCount: sanitizeTriangulaCount(parsed.startCount, fallback.startCount, 'start'),
      targetCount: sanitizeTriangulaCount(parsed.targetCount, fallback.targetCount, 'target'),
      fractalMode: sanitizeTriangulaFractalMode(parsed.fractalMode, fallback.fractalMode),
      fitMode: sanitizeTriangulaFitMode(parsed.fitMode, fallback.fitMode),
      sourceColor: sanitizeThreadColor(parsed.sourceColor, fallback.sourceColor),
      band1Color: sanitizeHexColor(parsed.band1Color, fallback.band1Color),
      band2Color: sanitizeHexColor(parsed.band2Color, fallback.band2Color),
      band4Color: sanitizeHexColor(parsed.band4Color, fallback.band4Color)
    };
  } catch (error) {
    triangulaStateCache = fallback;
  }
  if (triangulaStateCache.targetCount < triangulaStateCache.startCount) {
    triangulaStateCache.targetCount = triangulaStateCache.startCount;
  }
  return triangulaStateCache;
}

function restoreTriangulaStateFromCache() {
  var cached = hydrateTriangulaStateCacheFromStorage();
  if (!cached) return;
  triangulaColorMode = cached.colorMode;
  triangulaConstructionMode = cached.constructionMode;
  triangulaStartCount = cached.startCount;
  triangulaTargetCount = Math.max(cached.startCount, cached.targetCount);
  triangulaFractalMode = cached.fractalMode;
  triangulaFitMode = cached.fitMode;
  triangulaSourceColor = cached.sourceColor;
  triangulaBandColors.band1 = cached.band1Color;
  triangulaBandColors.band2 = cached.band2Color;
  triangulaBandColors.band4 = cached.band4Color;
}

function buildSquarusStateSnapshotFromRuntime() {
  return {
    order: parseBoundedInt(squarusOrder, 1, 6, 5),
    layout: sanitizeSquarusLayout(squarusLayout, 'force-directed'),
    animationMode: sanitizeSquarusAnimationMode(squarusAnimationMode, 'sequential'),
    contactMode: sanitizeSquarusContactMode(squarusContactMode, 'formula-only'),
    pieceCount: normalizeSquarusPieceCount(squarusPieceCount, getSquarusTotalPiecesForOrder(squarusOrder), squarusOrder),
    sequenceSeed: normalizeSquarusSequenceSeed(squarusSequenceSeed, 1, squarusOrder)
  };
}

function persistSquarusStateCache(snapshot) {
  var normalized = snapshot || buildSquarusStateSnapshotFromRuntime();
  squarusStateCache = normalized;
  try {
    appStateStorage.setItem(SQUARUS_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateSquarusStateCacheFromStorage() {
  if (squarusStateCache) return squarusStateCache;
  var fallback = buildSquarusStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(SQUARUS_STATE_CACHE_KEY);
  if (!raw) {
    squarusStateCache = fallback;
    return squarusStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    var order = parseBoundedInt(parsed.order, 1, 6, fallback.order);
    squarusStateCache = {
      order: order,
      layout: sanitizeSquarusLayout(parsed.layout, fallback.layout),
      animationMode: sanitizeSquarusAnimationMode(parsed.animationMode, fallback.animationMode),
      contactMode: sanitizeSquarusContactMode(parsed.contactMode, fallback.contactMode),
      pieceCount: normalizeSquarusPieceCount(parsed.pieceCount, fallback.pieceCount, order),
      sequenceSeed: normalizeSquarusSequenceSeed(parsed.sequenceSeed, fallback.sequenceSeed, order)
    };
  } catch (error) {
    squarusStateCache = fallback;
  }
  return squarusStateCache;
}

function restoreSquarusStateFromCache() {
  var cached = hydrateSquarusStateCacheFromStorage();
  if (!cached) return;
  squarusOrder = cached.order;
  squarusLayout = cached.layout;
  squarusAnimationMode = cached.animationMode;
  squarusContactMode = cached.contactMode;
  squarusPieceCount = cached.pieceCount;
  squarusSequenceSeed = cached.sequenceSeed;
}

function buildMashrabiyaStateSnapshotFromRuntime() {
  return {
    fold: sanitizeMashrabiyaFold(mashrabiyaFold, 12),
    geometryMode: sanitizeMashrabiyaGeometryMode(mashrabiyaGeometryMode, 'stitch-vertex'),
    starColor: sanitizeHexColor(mashrabiyaStarColor, '#f4d35e'),
    petalColor: sanitizeHexColor(mashrabiyaPetalColor, '#ee964b'),
    pointColor: sanitizeHexColor(mashrabiyaPointColor, '#f95738'),
    fillBorderWidth: sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0),
    keepConstructionLines: sanitizeBooleanValue(mashrabiyaKeepConstructionLines, false)
  };
}

function persistMashrabiyaStateCache(snapshot) {
  var normalized = snapshot || buildMashrabiyaStateSnapshotFromRuntime();
  mashrabiyaStateCache = normalized;
  try {
    appStateStorage.setItem(MASHRABIYA_STATE_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore persistence failures; runtime cache still works.
  }
}

function hydrateMashrabiyaStateCacheFromStorage() {
  if (mashrabiyaStateCache) return mashrabiyaStateCache;
  var fallback = buildMashrabiyaStateSnapshotFromRuntime();
  var raw = appStateStorage.getItem(MASHRABIYA_STATE_CACHE_KEY);
  if (!raw) {
    mashrabiyaStateCache = fallback;
    return mashrabiyaStateCache;
  }
  try {
    var parsed = JSON.parse(raw);
    mashrabiyaStateCache = {
      fold: sanitizeMashrabiyaFold(parsed.fold, fallback.fold),
      geometryMode: sanitizeMashrabiyaGeometryMode(parsed.geometryMode, fallback.geometryMode),
      starColor: sanitizeHexColor(parsed.starColor, fallback.starColor),
      petalColor: sanitizeHexColor(parsed.petalColor, fallback.petalColor),
      pointColor: sanitizeHexColor(parsed.pointColor, fallback.pointColor),
      fillBorderWidth: sanitizeMashrabiyaFillBorderWidth(parsed.fillBorderWidth, fallback.fillBorderWidth),
      keepConstructionLines: sanitizeBooleanValue(parsed.keepConstructionLines, fallback.keepConstructionLines)
    };
  } catch (error) {
    mashrabiyaStateCache = fallback;
  }
  return mashrabiyaStateCache;
}

function restoreMashrabiyaStateFromCache() {
  var cached = hydrateMashrabiyaStateCacheFromStorage();
  if (!cached) return;
  mashrabiyaFold = cached.fold;
  mashrabiyaGeometryMode = sanitizeMashrabiyaGeometryMode(cached.geometryMode, 'stitch-vertex');
  mashrabiyaStarColor = cached.starColor;
  mashrabiyaPetalColor = cached.petalColor;
  mashrabiyaPointColor = cached.pointColor;
  mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(cached.fillBorderWidth, 0);
  mashrabiyaKeepConstructionLines = sanitizeBooleanValue(cached.keepConstructionLines, false);
}

function syncCurrentExperienceStateCacheFromRuntime() {
  if (currentExperienceId === 'stitching') {
    syncStitchingStateCacheFromRuntime();
    return;
  }
  if (currentExperienceId === 'triangula') {
    persistTriangulaStateCache();
    return;
  }
  if (currentExperienceId === 'squarus') {
    persistSquarusStateCache();
    return;
  }
  if (currentExperienceId === 'mashrabiya') {
    persistMashrabiyaStateCache();
  }
}

function sanitizeHexColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  var trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (trimmed === 'rainbow') return 'rainbow';
  return fallback;
}

function syncAppStateFromRuntime() {
  appState.version = APP_STATE_URL_VERSION;
  appState.experienceId = currentExperienceId;
  var cachedStitchingState = hydrateStitchingStateCacheFromStorage();
  appState.common.shape = (currentExperienceId === 'stitching')
    ? currentShape
    : sanitizeShape(
      stitchingFrameShape,
      sanitizeShape(cachedStitchingState && cachedStitchingState.shape, appState.common.shape || 'circle')
    );
  appState.common.bpm = currentAnimationBpm;
  appState.common.musicMuted = !!isMusicMuted;
  appState.common.songId = currentSongId;

  appState.stitching.holes = parseBoundedInt(holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES);
  appState.stitching.nestedFrameEnabled = !!nestedFrameEnabled;
  appState.stitching.nestedFrameRatio = sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
  appState.stitching.selectedThreadIndex = Math.max(0, Math.min(threads.length - 1, selectedThreadIndex));
  appState.stitching.showHoleNumbers = !!showHoleNumbers;
  appState.stitching.borderEnabled = !!borderEnabled;
  appState.stitching.threadColors = threads.map(function(thread) {
    return sanitizeThreadColor(thread.color, '#1982c4');
  });
  appState.stitching.threadState = serializeStitchingThreadState(threads);

  appState.triangula.colorMode = triangulaColorMode;
  appState.triangula.constructionMode = triangulaConstructionMode;
  appState.triangula.startCount = triangulaStartCount;
  appState.triangula.targetCount = triangulaTargetCount;
  appState.triangula.fractalMode = triangulaFractalMode;
  appState.triangula.fitMode = triangulaFitMode;
  appState.triangula.sourceColor = sanitizeThreadColor(
    triangulaSourceColor,
    appState.triangula.sourceColor || '#1982c4'
  );
  appState.triangula.band1Color = triangulaBandColors.band1;
  appState.triangula.band2Color = triangulaBandColors.band2;
  appState.triangula.band4Color = triangulaBandColors.band4;

  appState.squarus.order = parseBoundedInt(squarusOrder, 1, 6, 4);
  appState.squarus.layout = sanitizeSquarusLayout(squarusLayout, 'grid-packing');
  appState.squarus.animationMode = sanitizeSquarusAnimationMode(squarusAnimationMode, 'sequential');
  appState.squarus.contactMode = sanitizeSquarusContactMode(squarusContactMode, 'formula-only');
  appState.squarus.pieceCount = normalizeSquarusPieceCount(squarusPieceCount, getSquarusTotalPiecesForOrder(squarusOrder), squarusOrder);
  appState.squarus.sequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSeed, 0, squarusOrder);

  appState.mashrabiya.fold = sanitizeMashrabiyaFold(mashrabiyaFold, 12);
  appState.mashrabiya.geometryMode = sanitizeMashrabiyaGeometryMode(mashrabiyaGeometryMode, 'stitch-vertex');
  appState.mashrabiya.starColor = sanitizeHexColor(mashrabiyaStarColor, '#f4d35e');
  appState.mashrabiya.petalColor = sanitizeHexColor(mashrabiyaPetalColor, '#ee964b');
  appState.mashrabiya.pointColor = sanitizeHexColor(mashrabiyaPointColor, '#f95738');
  appState.mashrabiya.fillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);
  appState.mashrabiya.keepConstructionLines = sanitizeBooleanValue(mashrabiyaKeepConstructionLines, false);
}

function buildSearchParamsFromAppState() {
  syncAppStateFromRuntime();
  var params = new URLSearchParams();
  setUrlStateParam(params, 'version', APP_STATE_URL_VERSION);
  setUrlStateParam(params, 'experienceId', appState.experienceId);
  setUrlStateParam(params, 'stitchingShape', sanitizeShape(appState.common.shape, stitchingFrameShape || 'circle'));
  if (appState.experienceId === 'stitching') {
    setUrlStateParam(params, 'stitchingShowHoleNumbers', appState.stitching.showHoleNumbers ? '1' : '0');
    setUrlStateParam(params, 'stitchingBorderEnabled', appState.stitching.borderEnabled ? '1' : '0');
    setUrlStateParam(params, 'stitchingHoles', String(appState.stitching.holes));
    setUrlStateParam(params, 'stitchingNestedFrameEnabled', appState.stitching.nestedFrameEnabled ? '1' : '0');
    setUrlStateParam(params, 'stitchingNestedFrameRatio', String(appState.stitching.nestedFrameRatio));
    setUrlStateParam(params, 'stitchingSelectedThreadIndex', String(appState.stitching.selectedThreadIndex));
    setUrlStateParam(params, 'stitchingThreadState', appState.stitching.threadState);
    if (appState.stitching.threadColors && appState.stitching.threadColors.length) {
      setUrlStateParam(params, 'stitchingThreadColors', appState.stitching.threadColors.join(','));
    }
  }
  setUrlStateParam(params, 'bpm', String(appState.common.bpm));
  setUrlStateParam(params, 'musicMuted', appState.common.musicMuted ? '1' : '0');
  setUrlStateParam(params, 'songId', appState.common.songId);

  if (appState.experienceId === 'triangula') {
    setUrlStateParam(params, 'triangulaSourceColor', appState.triangula.sourceColor);
    setUrlStateParam(params, 'triangulaColorMode', appState.triangula.colorMode);
    setUrlStateParam(params, 'triangulaConstructionMode', appState.triangula.constructionMode);
    setUrlStateParam(params, 'triangulaStartCount', String(appState.triangula.startCount));
    setUrlStateParam(params, 'triangulaTargetCount', String(appState.triangula.targetCount));
    setUrlStateParam(params, 'triangulaFractalMode', appState.triangula.fractalMode);
    setUrlStateParam(params, 'triangulaFitMode', appState.triangula.fitMode);
    setUrlStateParam(params, 'triangulaBand1Color', appState.triangula.band1Color);
    setUrlStateParam(params, 'triangulaBand2Color', appState.triangula.band2Color);
    setUrlStateParam(params, 'triangulaBand4Color', appState.triangula.band4Color);
  } else if (appState.experienceId === 'squarus') {
    setUrlStateParam(params, 'squarusOrder', String(appState.squarus.order));
    setUrlStateParam(params, 'squarusLayout', appState.squarus.layout);
    setUrlStateParam(params, 'squarusAnimationMode', appState.squarus.animationMode);
    setUrlStateParam(params, 'squarusContactMode', appState.squarus.contactMode);
    setUrlStateParam(params, 'squarusPieceCount', String(appState.squarus.pieceCount));
    setUrlStateParam(params, 'squarusSequenceSeed', String(appState.squarus.sequenceSeed));
  } else if (appState.experienceId === 'mashrabiya') {
    setUrlStateParam(params, 'mashrabiyaFold', String(appState.mashrabiya.fold));
    setUrlStateParam(params, 'mashrabiyaGeometryMode', appState.mashrabiya.geometryMode);
    setUrlStateParam(params, 'mashrabiyaStarColor', appState.mashrabiya.starColor);
    setUrlStateParam(params, 'mashrabiyaPetalColor', appState.mashrabiya.petalColor);
    setUrlStateParam(params, 'mashrabiyaPointColor', appState.mashrabiya.pointColor);
    setUrlStateParam(params, 'mashrabiyaFillBorderWidth', String(appState.mashrabiya.fillBorderWidth));
    setUrlStateParam(params, 'mashrabiyaKeepConstructionLines', appState.mashrabiya.keepConstructionLines ? '1' : '0');
  }

  return params;
}

function flushUrlStateSync() {
  if (urlSyncSuspended) return;
  var params = buildSearchParamsFromAppState();
  var nextSearch = params.toString();
  var nextUrl = nextSearch ? (window.location.pathname + '?' + nextSearch) : window.location.pathname;
  var currentUrl = window.location.pathname + window.location.search;
  if (nextUrl === currentUrl) return;
  history.replaceState({ appStateVersion: APP_STATE_URL_VERSION }, '', nextUrl);
}

function scheduleUrlStateSync(immediate) {
  if (urlSyncSuspended) return;
  syncCurrentExperienceStateCacheFromRuntime();
  if (urlSyncTimer) {
    clearTimeout(urlSyncTimer);
    urlSyncTimer = null;
  }
  if (immediate) {
    flushUrlStateSync();
    return;
  }
  urlSyncTimer = window.setTimeout(function() {
    urlSyncTimer = null;
    flushUrlStateSync();
  }, URL_SYNC_DEBOUNCE_MS);
}

function applyStateFromCurrentUrl(options) {
  options = options || {};
  var params = new URLSearchParams(window.location.search || '');
  var requestedExperience = resolveExperienceId(getUrlStateParam(params, 'experienceId'));
  var hasExplicitExperienceParam = !!resolveExperienceId(getUrlStateParam(params, 'experienceId'));
  var allowExperienceUrlDiscoveryUnlock = options.initialLoad === true;

  if (!requestedExperience) {
    requestedExperience = currentExperienceId;
  }

  try {
    withUrlSyncSuspended(function() {
    if (allowExperienceUrlDiscoveryUnlock && hasExplicitExperienceParam) {
      var unlockKey = getDiscoveryKeyForExperience(requestedExperience);
      if (requestedExperience === 'mashrabiya') {
        var requestedMashrabiyaFoldForUnlock = sanitizeMashrabiyaFold(
          getUrlStateParam(params, 'mashrabiyaFold'),
          mashrabiyaFold
        );
        unlockKey = requestedMashrabiyaFoldForUnlock === 8 ? 'rosette8' : 'rosette12';
      }
      if (unlockKey) {
        unlockDiscovery(unlockKey);
      }
    }

    if (hasExplicitExperienceParam) {
      setCurrentExperience(requestedExperience, { suppressUrlSync: true });
      requestedExperience = currentExperienceId;
    }

    var explicitStitchingShape = sanitizeShape(getUrlStateParam(params, 'stitchingShape'), '');
    if (explicitStitchingShape) {
      stitchingFrameShape = explicitStitchingShape;
    } else {
      stitchingFrameShape = sanitizeShape(stitchingFrameShape, 'circle');
    }

    var profile = getExperienceUiProfile(currentExperienceId);
    if (requestedExperience === 'stitching') {
      var requestedStitchingShape = explicitStitchingShape || sanitizeShape(stitchingFrameShape, currentShape || 'circle');
      setCurrentShape(requestedStitchingShape, false);
      stitchingFrameShape = sanitizeShape(requestedStitchingShape, stitchingFrameShape || 'circle');
    } else if (profile && profile.fixedShape) {
      setCurrentShape(profile.fixedShape, false);
    }

    var songIdFromUrl = sanitizeSongId(getUrlStateParam(params, 'songId'), currentSongId);
    if (songIdFromUrl && songIdFromUrl !== currentSongId) {
      setCurrentSong(songIdFromUrl, { suppressUrlSync: true });
    }

    var bpmFromUrl = sanitizeBpmForCurrentSong(getUrlStateParam(params, 'bpm'), currentAnimationBpm);
    applyTempoValue(bpmFromUrl, { suppressUrlSync: true });

    isMusicMuted = sanitizeBooleanParam(getUrlStateParam(params, 'musicMuted'), isMusicMuted);
    syncMusicToggleButton();

    if (requestedExperience === 'stitching') {
      showHoleNumbers = sanitizeBooleanParam(getUrlStateParam(params, 'stitchingShowHoleNumbers'), showHoleNumbers);
      borderEnabled = sanitizeBooleanParam(getUrlStateParam(params, 'stitchingBorderEnabled'), borderEnabled);
      nestedFrameEnabled = !!sanitizeBooleanParam(getUrlStateParam(params, 'stitchingNestedFrameEnabled'), nestedFrameEnabled);
      nestedFrameRatio = sanitizeNestedFrameRatio(getUrlStateParam(params, 'stitchingNestedFrameRatio'), nestedFrameRatio);
      syncNestedFrameControls();
      syncHoleNumberToggles();
      syncBorderControls();

      var fallbackThreads = threads.map(function(thread) {
        return sanitizeThreadDescriptor(thread, thread);
      });
      var requestedThreadState = parseStitchingThreadState(getUrlStateParam(params, 'stitchingThreadState'), fallbackThreads);

      if (requestedThreadState.length) {
        threads = requestedThreadState.map(function(thread) {
          return sanitizeThreadDescriptor(thread, thread);
        });
      }

      var fallbackColors = threads.map(function(thread) {
        return sanitizeThreadColor(thread.color, '#1982c4');
      });
      var requestedThreadColors = sanitizeThreadColorList(getUrlStateParam(params, 'stitchingThreadColors'), fallbackColors);
      for (var i = 0; i < threads.length && i < requestedThreadColors.length; i++) {
        threads[i].color = requestedThreadColors[i];
      }

      if (!threads.length) {
        threads = [sanitizeThreadDescriptor({}, null)];
      }

      var holesFromUrl = parseBoundedInt(getUrlStateParam(params, 'stitchingHoles'), 3, MAX_HOLES, parseBoundedInt(holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES));
      holesSlider.value = String(holesFromUrl);
      if (advancedHolesNumberInput) {
        advancedHolesNumberInput.value = String(holesFromUrl);
      }

      selectedThreadIndex = parseBoundedInt(getUrlStateParam(params, 'stitchingSelectedThreadIndex'), 0, threads.length - 1, selectedThreadIndex);
      renderThreadControls();
      syncKidControlsFromSelectedThread();
    }

    if (requestedExperience === 'triangula') {
      var sourceColor = sanitizeThreadColor(getUrlStateParam(params, 'triangulaSourceColor'), triangulaSourceColor || '#1982c4');
      triangulaSourceColor = sourceColor;
      triangulaColorMode = sanitizeTriangulaColorMode(getUrlStateParam(params, 'triangulaColorMode'), triangulaColorMode);
      triangulaConstructionMode = sanitizeTriangulaConstructionMode(getUrlStateParam(params, 'triangulaConstructionMode'), triangulaConstructionMode);
      triangulaStartCount = sanitizeTriangulaCount(getUrlStateParam(params, 'triangulaStartCount'), triangulaStartCount, 'start');
      triangulaTargetCount = sanitizeTriangulaCount(getUrlStateParam(params, 'triangulaTargetCount'), triangulaTargetCount, 'target');
      if (triangulaTargetCount < triangulaStartCount) {
        triangulaTargetCount = triangulaStartCount;
      }
      triangulaFractalMode = sanitizeTriangulaFractalMode(getUrlStateParam(params, 'triangulaFractalMode'), triangulaFractalMode);
      triangulaFitMode = sanitizeTriangulaFitMode(getUrlStateParam(params, 'triangulaFitMode'), triangulaFitMode);

      triangulaBandColors.band1 = sanitizeHexColor(getUrlStateParam(params, 'triangulaBand1Color'), triangulaBandColors.band1);
      triangulaBandColors.band2 = sanitizeHexColor(getUrlStateParam(params, 'triangulaBand2Color'), triangulaBandColors.band2);
      triangulaBandColors.band4 = sanitizeHexColor(getUrlStateParam(params, 'triangulaBand4Color'), triangulaBandColors.band4);

      syncTriangulaControls();
    } else if (requestedExperience === 'squarus') {
      var orderFromUrl = parseBoundedInt(getUrlStateParam(params, 'squarusOrder'), 1, 6, squarusOrder);
      squarusOrder = orderFromUrl;
      squarusLayout = sanitizeSquarusLayout(getUrlStateParam(params, 'squarusLayout'), squarusLayout);
      squarusAnimationMode = sanitizeSquarusAnimationMode(getUrlStateParam(params, 'squarusAnimationMode'), squarusAnimationMode);
      squarusContactMode = sanitizeSquarusContactMode(getUrlStateParam(params, 'squarusContactMode'), squarusContactMode);
      squarusPieceCount = normalizeSquarusPieceCount(getUrlStateParam(params, 'squarusPieceCount'), squarusPieceCount, squarusOrder);
      squarusSequenceSeed = normalizeSquarusSequenceSeed(getUrlStateParam(params, 'squarusSequenceSeed'), squarusSequenceSeed, squarusOrder);
      syncSquarusControls();
    } else if (requestedExperience === 'mashrabiya') {
      mashrabiyaFold = sanitizeMashrabiyaFold(getUrlStateParam(params, 'mashrabiyaFold'), mashrabiyaFold);
      mashrabiyaGeometryMode = sanitizeMashrabiyaGeometryMode(getUrlStateParam(params, 'mashrabiyaGeometryMode'), mashrabiyaGeometryMode);
      mashrabiyaStarColor = sanitizeHexColor(getUrlStateParam(params, 'mashrabiyaStarColor'), mashrabiyaStarColor);
      mashrabiyaPetalColor = sanitizeHexColor(getUrlStateParam(params, 'mashrabiyaPetalColor'), mashrabiyaPetalColor);
      mashrabiyaPointColor = sanitizeHexColor(getUrlStateParam(params, 'mashrabiyaPointColor'), mashrabiyaPointColor);
      mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(getUrlStateParam(params, 'mashrabiyaFillBorderWidth'), mashrabiyaFillBorderWidth);
      mashrabiyaKeepConstructionLines = sanitizeBooleanValue(getUrlStateParam(params, 'mashrabiyaKeepConstructionLines'), mashrabiyaKeepConstructionLines);
      syncMashrabiyaControls();
    }

    redrawForPathChange();

    // Always start from unstarted playback state on load/popstate.
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();

    updateMusicPlaybackState();
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
  if (hasUrlStateKey(params, 'version') || hasUrlStateKey(params, 'experienceId')) return true;
  // Backward/partial URLs should still be treated as explicit state.
  return params.toString().length > 0;
}

var magicThreadColors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#f15bb5'];
var joyAudio = new Audio(MUSIC_LIBRARY[currentSongId].path);
joyAudio.preload = 'auto';
var acknowledgmentsAudio = new Audio(ACKNOWLEDGMENTS_SONG_PATH);
acknowledgmentsAudio.preload = 'auto';
var isMusicMuted = false;
var hasMusicStartedSinceLoad = false;
var sliderMotionKeys = Object.create(null);
var sliderMotionSettleTimers = Object.create(null);
var sliderMotionKeySeed = 0;

function getSliderMotionKey(slider) {
  if (!slider) return null;
  if (!slider.dataset.motionKey) {
    sliderMotionKeySeed += 1;
    slider.dataset.motionKey = 'slider-' + sliderMotionKeySeed;
  }
  return slider.dataset.motionKey;
}

function hasActiveSliderMotion() {
  for (var key in sliderMotionKeys) {
    if (sliderMotionKeys[key]) return true;
  }
  return false;
}

function shouldMusicBePlaying() {
  return animationActive || hasActiveSliderMotion();
}

function shouldAcknowledgmentsMusicBePlaying() {
  return !!(acknowledgmentsModal && acknowledgmentsModal.classList.contains('open'));
}

function syncMusicToggleButton() {
  musicToggleBtn.textContent = isMusicMuted ? '🔇' : '🔊';
  musicToggleBtn.classList.toggle('is-active', isMusicMuted);
  musicToggleBtn.setAttribute('aria-pressed', isMusicMuted ? 'true' : 'false');
  musicToggleBtn.setAttribute('aria-label', isMusicMuted ? 'Unmute music' : 'Mute music');
  musicToggleBtn.title = isMusicMuted ? 'Unmute music' : 'Mute music';
}

function sanitizeTheme(value, fallback) {
  if (value === 'dark' || value === 'light') return value;
  return fallback || 'light';
}

function syncThemeToggleButton() {
  if (!themeToggleBtn) return;
  var isDark = currentTheme === 'dark';
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  themeToggleBtn.classList.toggle('active', isDark);
  themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggleBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
}

function applyTheme(theme, options) {
  options = options || {};
  var normalizedTheme = sanitizeTheme(theme, 'light');
  currentTheme = normalizedTheme;
  document.documentElement.setAttribute('data-theme', normalizedTheme);
  if (options.persist !== false) {
    appStateStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  }
  syncThemeToggleButton();
  if (options.refreshVisuals !== false) {
    renderExperienceTitleStatic();
    redrawAnimationInPlace();
  }
}

function initializeThemeFromStorage() {
  var storedTheme = sanitizeTheme(appStateStorage.getItem(THEME_STORAGE_KEY), '');
  var attrTheme = sanitizeTheme(document.documentElement.getAttribute('data-theme'), 'light');
  if (!storedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    storedTheme = 'dark';
  }
  applyTheme(storedTheme || attrTheme, { persist: false, refreshVisuals: false });
}

function getThemeBorderStrokeColor() {
  if (forceExportRenderColors) return BORDER_STROKE_COLOR;
  if (currentTheme === 'dark') return BORDER_STROKE_COLOR_DARK;
  return BORDER_STROKE_COLOR;
}

function getThemeHoleFillColor() {
  if (forceExportRenderColors) return HOLE_FILL_COLOR;
  if (currentTheme === 'dark') return HOLE_FILL_COLOR_DARK;
  return HOLE_FILL_COLOR;
}

function getThemeHoleLabelColor() {
  if (forceExportRenderColors) return HOLE_LABEL_COLOR;
  if (currentTheme === 'dark') return HOLE_LABEL_COLOR_DARK;
  return HOLE_LABEL_COLOR;
}

function getThemeHoleLabelHighlightColor() {
  if (forceExportRenderColors) return HOLE_LABEL_HIGHLIGHT_COLOR;
  if (currentTheme === 'dark') return HOLE_LABEL_HIGHLIGHT_COLOR_DARK;
  return HOLE_LABEL_HIGHLIGHT_COLOR;
}

function getThemeExperienceTitleColor(baseColor) {
  if (currentTheme === 'dark') return EXPERIENCE_TITLE_COLOR_DARK;
  return baseColor || '#1f4f94';
}

function isReduceMotionPreferred() {
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getExperienceById(experienceId) {
  return EXPERIENCE_LIBRARY[experienceId] || EXPERIENCE_LIBRARY.stitching;
}

function resolveExperienceId(experienceRef) {
  if (!experienceRef) return null;
  if (EXPERIENCE_LIBRARY[experienceRef]) return experienceRef;

  var normalized = String(experienceRef).trim().toLowerCase();
  if (!normalized) return null;

  var keys = Object.keys(EXPERIENCE_LIBRARY);
  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var entry = EXPERIENCE_LIBRARY[id];
    if (!entry) continue;
    if (id.toLowerCase() === normalized) return id;
    if (entry.title && String(entry.title).trim().toLowerCase() === normalized) return id;
  }
  return null;
}

function isMashrabiyaExperienceUnlocked() {
  return !!(discoveredShapeKeys.rosette8 || discoveredShapeKeys.rosette12);
}

function isExperienceAccessible(experienceId) {
  var resolvedId = resolveExperienceId(experienceId) || 'stitching';
  if (resolvedId === 'mashrabiya') {
    return isMashrabiyaExperienceUnlocked();
  }
  return true;
}

function resolveAccessibleExperienceId(experienceRef, fallback) {
  var fallbackId = resolveExperienceId(fallback) || 'stitching';
  var requestedId = resolveExperienceId(experienceRef) || fallbackId;
  return isExperienceAccessible(requestedId) ? requestedId : fallbackId;
}

function getExperienceUiProfile(experienceId) {
  var experience = getExperienceById(experienceId);
  return experience.uiProfile || EXPERIENCE_LIBRARY.stitching.uiProfile;
}

function getDefaultSongIdForExperience(experienceId) {
  if (experienceId === 'triangula') return 'triangle';
  if (experienceId === 'squarus') return 'square';
  if (experienceId === 'mashrabiya') return 'rosette';
  return 'bach';
}

function isSongUnlockedForCurrentSession(songId) {
  if (!songId || !MUSIC_LIBRARY[songId]) return false;
  if (songId === 'bach') return true;
  return unlockedSongIds.indexOf(songId) !== -1;
}

function setElementDisplay(element, isVisible, displayValue) {
  if (!element) return;
  element.style.display = isVisible ? (displayValue || '') : 'none';
}

function applyShapePolicy(profile) {
  var allowedShapes = (profile && profile.allowedShapes && profile.allowedShapes.length) ? profile.allowedShapes : ['circle', 'triangle', 'square', 'star', 'heart'];
  var fixedShape = profile ? profile.fixedShape : null;

  shapeButtons.forEach(function(btn) {
    var shape = btn.getAttribute('data-shape') || '';
    var allowed = allowedShapes.indexOf(shape) !== -1;
    setElementDisplay(btn, allowed, 'flex');
    btn.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    if (!allowed) {
      btn.classList.remove('active');
      btn.tabIndex = -1;
    } else {
      btn.removeAttribute('tabindex');
    }
  });

  if (advancedShapeSelect) {
    var hasAllowedOption = false;
    Array.prototype.forEach.call(advancedShapeSelect.options, function(option) {
      var allowed = allowedShapes.indexOf(option.value) !== -1;
      option.hidden = !allowed;
      option.disabled = !allowed;
      if (allowed) hasAllowedOption = true;
    });
    advancedShapeSelect.disabled = !!fixedShape || !hasAllowedOption;
  }

  if (fixedShape) {
    setCurrentShape(fixedShape);
    return;
  }

  if (allowedShapes.indexOf(currentShape) === -1 && allowedShapes.length) {
    setCurrentShape(allowedShapes[0]);
  }
}

function applyThreadPolicy(profile) {
  var threadsEnabled = !profile || profile.threadsEnabled !== false;
  var allowMultipleThreads = !profile || profile.allowMultipleThreads !== false;

  if (!threadsEnabled) {
    setElementDisplay(addMagicThreadBtn, false, '');
    setElementDisplay(removeLastThreadBtn, false, '');
    setElementDisplay(kidThreadPicker, false, '');
    setElementDisplay(addThreadBtn, false, '');
    setElementDisplay(advancedThreadsTitle, false, '');
    setElementDisplay(threadControlsContainer, false, '');
    return;
  }

  if (!threads.length) {
    threads = [sanitizeThreadDescriptor({}, null)];
  }
  if (selectedThreadIndex < 0 || selectedThreadIndex >= threads.length) {
    selectedThreadIndex = 0;
  }

  setElementDisplay(addMagicThreadBtn, threadsEnabled && allowMultipleThreads, '');
  setElementDisplay(removeLastThreadBtn, threadsEnabled && allowMultipleThreads && threads.length > 1, '');
  setElementDisplay(kidThreadPicker, threadsEnabled && allowMultipleThreads && threads.length > 1, 'inline-flex');
  setElementDisplay(addThreadBtn, threadsEnabled && allowMultipleThreads, '');
  setElementDisplay(advancedThreadsTitle, threadsEnabled, '');
  setElementDisplay(threadControlsContainer, threadsEnabled, '');

  renderThreadControls();
}

function applyBasicControlPolicy(profile) {
  var controls = profile && profile.basicControls ? profile.basicControls : null;
  if (!controls) return;
  setElementDisplay(holesSliderBlock, controls.holes !== false, '');
  setElementDisplay(stitchBySliderBlock, controls.stitchBy !== false, '');
  setElementDisplay(startHoleBlock, controls.stitchBy !== false && currentExperienceId === 'stitching', '');
  setElementDisplay(jumpSliderBlock, controls.add !== false, '');
  setElementDisplay(multiplyMathSliderBlock, controls.multiply !== false, '');
  setElementDisplay(widthSliderBlock, controls.width !== false, '');
  setElementDisplay(
    triangulaColorScopeBlock,
    controls.triangulaColorScope === true && currentExperienceId === 'triangula' && triangulaConstructionMode === 'shrink-duplicate',
    ''
  );
  setElementDisplay(triangulaModeBlock, controls.triangulaConstructionMode === true, '');
  setElementDisplay(triangulaStartBlock, controls.triangulaStartCount === true, '');
  setElementDisplay(triangulaTargetBlock, controls.triangulaTargetCount === true, '');
  setElementDisplay(squarusOrderBlock, controls.squarusOrder === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusLayoutBlock, controls.squarusLayout === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusContactBlock, controls.squarusLayout === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusPieceCountBlock, controls.squarusPieceCount === true && currentExperienceId === 'squarus', '');
  setElementDisplay(squarusSequenceBlock, controls.squarusSequence === true && currentExperienceId === 'squarus', '');
  setElementDisplay(mashrabiyaFoldBlock, controls.mashrabiyaFold === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaFillBorderBlock, controls.mashrabiyaFillBorder === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaLinesVisibilityBlock, controls.mashrabiyaConstructionLines === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaStarColorBlock, controls.mashrabiyaStarColor === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaPointColorBlock, controls.mashrabiyaPointColor === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(mashrabiyaPetalColorBlock, controls.mashrabiyaPetalColor === true && currentExperienceId === 'mashrabiya', '');
}

function applyAdvancedControlPolicy(profile) {
  var controls = profile && profile.advancedControls ? profile.advancedControls : null;
  if (!controls) return;
  if (advancedStitchingFrameSubsection) {
    setElementDisplay(advancedStitchingFrameSubsection, currentExperienceId === 'stitching', '');
  }
  setElementDisplay(nestedFrameBlock, currentExperienceId === 'stitching', '');
  if (advancedShapeSelect) {
    setElementDisplay(advancedShapeSelect.parentElement, controls.shape !== false, '');
  }
  if (advancedBorderEnabledInput) {
    setElementDisplay(advancedBorderEnabledInput.parentElement, controls.border !== false, '');
  }
  if (advancedHoleNumbersToggle) {
    setElementDisplay(advancedHoleNumbersToggle.parentElement, controls.holeNumbers !== false, '');
  }
  if (advancedHolesNumberInput) {
    setElementDisplay(advancedHolesNumberInput.parentElement, controls.holesNumber !== false, '');
  }
  if (controls.threads === false) {
    setElementDisplay(advancedThreadsTitle, false, '');
    setElementDisplay(addThreadBtn, false, '');
    setElementDisplay(threadControlsContainer, false, '');
  }
  setElementDisplay(mashrabiyaAdvancedSubsection, controls.mashrabiyaFillBorder === true && currentExperienceId === 'mashrabiya', '');
  setElementDisplay(triangulaAdvancedSubsection, controls.triangulaAnimationFitMode === true, '');
  setElementDisplay(squarusAdvancedSubsection, controls.squarusControls === true, '');
}

function syncDiscoveryReturnRowVisibility() {
  if (!discoveryReturnRow) return;
  var showReturn = currentExperienceId !== 'stitching';
  if (showReturn) {
    discoveryReturnRow.removeAttribute('hidden');
  } else {
    discoveryReturnRow.setAttribute('hidden', '');
  }
}

function applyTopBarPolicy(profile) {
  var supportsHoleNumbers = !profile || profile.supportsHoleNumbers !== false;
  setElementDisplay(holeNumbersToggleBtn, supportsHoleNumbers, 'flex');
  syncDiscoveryReturnRowVisibility();
}

function applyExperienceUiPolicy() {
  var profile = getExperienceUiProfile(currentExperienceId);
  applyShapePolicy(profile);
  applyThreadPolicy(profile);
  applyBasicControlPolicy(profile);
  applyAdvancedControlPolicy(profile);
  applyTopBarPolicy(profile);
  if (paletteContainer) {
    var paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
    paletteContainer.dataset.paletteMode = paletteMode;
    setElementDisplay(paletteContainer, paletteMode !== 'none', '');
  }
  if (currentExperienceId === 'triangula') {
    var allowedTriangulaModes = (profile && profile.triangulaColorModes && profile.triangulaColorModes.length)
      ? profile.triangulaColorModes
      : ['band-1'];
    if (allowedTriangulaModes.indexOf(triangulaColorMode) === -1) {
      triangulaColorMode = allowedTriangulaModes[0];
    }
  }
  if (triangulaColorScopeSelect) {
    triangulaColorScopeSelect.value = triangulaColorMode;
  }
  if (triangulaConstructionModeSelect) {
    triangulaConstructionModeSelect.value = triangulaConstructionMode;
  }
  syncSquarusControls();
  syncTriangulaControls();
  syncMashrabiyaControls();
}

function syncMashrabiyaControls() {
  mashrabiyaFold = sanitizeMashrabiyaFold(mashrabiyaFold, 12);
  mashrabiyaGeometryMode = sanitizeMashrabiyaGeometryMode(mashrabiyaGeometryMode, 'stitch-vertex');
  mashrabiyaStarColor = sanitizeHexColor(mashrabiyaStarColor, '#f4d35e');
  mashrabiyaPetalColor = sanitizeHexColor(mashrabiyaPetalColor, '#ee964b');
  mashrabiyaPointColor = sanitizeHexColor(mashrabiyaPointColor, '#f95738');
  mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);
  mashrabiyaKeepConstructionLines = sanitizeBooleanValue(mashrabiyaKeepConstructionLines, false);

  if (mashrabiyaFoldSelect) {
    mashrabiyaFoldSelect.value = String(mashrabiyaFold);
  }
  if (mashrabiyaFillBorderSlider) {
    mashrabiyaFillBorderSlider.value = String(mashrabiyaFillBorderWidth);
  }
  if (mashrabiyaFillBorderValue) {
    mashrabiyaFillBorderValue.textContent = String(mashrabiyaFillBorderWidth);
  }
  if (advancedMashrabiyaFillBorderInput) {
    advancedMashrabiyaFillBorderInput.value = String(mashrabiyaFillBorderWidth);
  }
  if (mashrabiyaStarColorInput) {
    mashrabiyaStarColorInput.value = mashrabiyaStarColor;
  }
  if (mashrabiyaPetalColorInput) {
    mashrabiyaPetalColorInput.value = mashrabiyaPetalColor;
  }
  if (mashrabiyaPointColorInput) {
    mashrabiyaPointColorInput.value = mashrabiyaPointColor;
  }
  if (mashrabiyaKeepConstructionLinesInput) {
    mashrabiyaKeepConstructionLinesInput.checked = !!mashrabiyaKeepConstructionLines;
  }

  if (currentExperienceId === 'mashrabiya') {
    persistMashrabiyaStateCache();
  }
}

function syncSquarusControls() {
  var totalPieces = getSquarusTotalPiecesForOrder(squarusOrder);
  squarusPieceCount = normalizeSquarusPieceCount(squarusPieceCount, totalPieces, squarusOrder);

  if (squarusOrderInlineSelect) {
    squarusOrderInlineSelect.value = String(squarusOrder);
  }
  if (squarusLayoutInlineSelect) {
    squarusLayoutInlineSelect.value = squarusLayout;
  }
  if (squarusContactModeInlineSelect) {
    squarusContactModeInlineSelect.value = squarusContactMode;
  }
  if (squarusOrderSelect) {
    squarusOrderSelect.value = String(squarusOrder);
  }
  if (squarusLayoutSelect) {
    squarusLayoutSelect.value = squarusLayout;
  }
  if (squarusAnimationModeSelect) {
    squarusAnimationModeSelect.value = squarusAnimationMode;
  }
  if (squarusContactModeSelect) {
    squarusContactModeSelect.value = squarusContactMode;
  }
  if (squarusPieceCountSlider) {
    squarusPieceCountSlider.max = String(totalPieces);
    squarusPieceCountSlider.value = String(squarusPieceCount);
  }
  if (squarusPieceCountValue) {
    squarusPieceCountValue.textContent = String(squarusPieceCount);
  }
  var sequenceMaxIndex = getSquarusSequenceMaxIndex(squarusOrder);
  squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSeed, 0, squarusOrder);
  if (squarusSequenceSlider) {
    squarusSequenceSlider.max = String(sequenceMaxIndex);
    squarusSequenceSlider.value = String(squarusSequenceSeed);
  }
  if (squarusSequenceValue) {
    squarusSequenceValue.textContent = String(squarusSequenceSeed);
  }
  if (squarusSequenceNumberInput) {
    squarusSequenceNumberInput.max = String(sequenceMaxIndex);
    squarusSequenceNumberInput.value = String(squarusSequenceSeed);
  }

  if (currentExperienceId === 'squarus') {
    persistSquarusStateCache();
  }
}

function syncTriangulaControls() {
  triangulaStartCount = normalizeTriangulaDrawableCount(triangulaStartCount, 'start', 1);
  triangulaTargetCount = normalizeTriangulaDrawableCount(triangulaTargetCount, 'target', triangulaStartCount);

  if (triangulaTargetCount < triangulaStartCount) {
    triangulaTargetCount = triangulaStartCount;
  }

  if (triangulaStartSlider) {
    triangulaStartSlider.min = '0';
    triangulaStartSlider.max = String(TRIANGULA_DRAWABLE_COUNTS.length - 1);
    triangulaStartSlider.step = '1';
    triangulaStartSlider.value = String(getTriangulaCountIndexFromValue(triangulaStartCount, 'start', 1));
  }
  if (triangulaTargetSlider) {
    triangulaTargetSlider.min = '0';
    triangulaTargetSlider.max = String(TRIANGULA_DRAWABLE_COUNTS.length - 1);
    triangulaTargetSlider.step = '1';
    triangulaTargetSlider.value = String(getTriangulaCountIndexFromValue(triangulaTargetCount, 'target', triangulaStartCount));
  }
  if (triangulaStartValue) {
    triangulaStartValue.textContent = String(triangulaStartCount);
  }
  if (triangulaTargetValue) {
    triangulaTargetValue.textContent = String(triangulaTargetCount);
  }
  if (triangulaColorScopeSelect) {
    triangulaColorScopeSelect.value = triangulaColorMode;
  }
  if (triangulaConstructionModeSelect) {
    triangulaConstructionModeSelect.value = triangulaConstructionMode;
  }
  if (triangulaFractalModeSelect) {
    triangulaFractalModeSelect.value = triangulaFractalMode;
  }
  if (triangulaFitModeSelect) {
    triangulaFitModeSelect.value = triangulaFitMode;
  }
  var profile = getExperienceUiProfile(currentExperienceId);
  var controls = profile && profile.basicControls ? profile.basicControls : null;
  setElementDisplay(
    triangulaColorScopeBlock,
    !!(controls && controls.triangulaColorScope === true && currentExperienceId === 'triangula' && triangulaConstructionMode === 'shrink-duplicate'),
    ''
  );
}

function applyTriangulaCountUpdate(nextStart, nextTarget, shouldRedraw) {
  triangulaStartCount = normalizeTriangulaDrawableCount(nextStart, 'start', triangulaStartCount || 1);
  triangulaTargetCount = normalizeTriangulaDrawableCount(nextTarget, 'target', triangulaTargetCount || triangulaStartCount || 1);
  if (triangulaTargetCount < triangulaStartCount) {
    triangulaTargetCount = triangulaStartCount;
  }
  syncTriangulaControls();
  if (shouldRedraw) {
    redrawForPathChange();
  }
}

function applyExperienceOverlayPosition(positionClass) {
  if (!experienceInline) return;
  var allPositionClasses = ['pos-top-center', 'pos-bottom-center', 'pos-top-left', 'pos-top-right'];
  for (var i = 0; i < allPositionClasses.length; i++) {
    experienceInline.classList.remove(allPositionClasses[i]);
  }
  experienceInline.classList.add(positionClass || 'pos-top-center');
}

function positionExperienceInfoPanel() {
  if (!experienceInfoPanel || !experienceInfoToggle || experienceInfoPanel.hasAttribute('hidden')) return;

  var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportWidth <= 0 || viewportHeight <= 0) return;

  var anchorRect = experienceInfoToggle.getBoundingClientRect();
  var canvasRect = (canvasStage && typeof canvasStage.getBoundingClientRect === 'function')
    ? canvasStage.getBoundingClientRect()
    : null;
  var panelRect = experienceInfoPanel.getBoundingClientRect();
  var margin = 10;
  var gap = 8;

  var preferredCenterX = anchorRect.left + (anchorRect.width / 2);
  if (canvasRect && isFinite(canvasRect.left) && isFinite(canvasRect.width) && canvasRect.width > 0) {
    preferredCenterX = canvasRect.left + (canvasRect.width / 2);
  }

  var left = preferredCenterX - (panelRect.width / 2);
  left = Math.max(margin, Math.min(left, viewportWidth - panelRect.width - margin));

  var belowTop = anchorRect.bottom + gap;
  var aboveTop = anchorRect.top - panelRect.height - gap;
  var top = belowTop;
  if (belowTop + panelRect.height > viewportHeight - margin && aboveTop >= margin) {
    top = aboveTop;
  }
  if (top + panelRect.height > viewportHeight - margin) {
    top = viewportHeight - panelRect.height - margin;
  }
  top = Math.max(margin, top);

  experienceInfoPanel.style.left = Math.round(left) + 'px';
  experienceInfoPanel.style.top = Math.round(top) + 'px';
}

function syncExperienceInfoPanel(isOpen) {
  var open = !!isOpen;
  experienceInfoToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    experienceInfoPanel.removeAttribute('hidden');
    positionExperienceInfoPanel();
  } else {
    experienceInfoPanel.setAttribute('hidden', '');
    stopExperienceNarration();
  }
}

function syncExperienceNarrationState(isPlaying, statusText) {
  var playing = !!isPlaying;
  experienceNarrateToggle.classList.toggle('is-active', playing);
  experienceNarrateToggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
  experienceNarrateToggle.textContent = playing ? STOP_NARRATION_BUTTON_LABEL : HEAR_THIS_BUTTON_LABEL;
  experienceNarrationStatus.textContent = statusText || '';
}

function stopExperienceNarration() {
  experienceNarrationRequestToken += 1;
  experienceNarrationRequestInFlight = false;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  experienceNarrationUtterance = null;
  syncExperienceNarrationState(false, '');
}

function toggleExperienceNarration() {
  var nowMs = (typeof performance !== 'undefined' && performance && typeof performance.now === 'function')
    ? performance.now()
    : Date.now();
  if (nowMs - experienceNarrationLastToggleAtMs < 120) {
    narrationDebugLog('log', 'Ignoring duplicate narration toggle call.', {
      deltaMs: nowMs - experienceNarrationLastToggleAtMs
    });
    return;
  }
  experienceNarrationLastToggleAtMs = nowMs;

  var experience = getExperienceById(currentExperienceId);
  narrationDebugLog('log', 'Narration toggle invoked.', {
    experienceId: currentExperienceId,
    hasActiveUtterance: !!experienceNarrationUtterance,
    aboutHtmlPath: experience.aboutHtmlPath || ''
  });
  if (experienceNarrationUtterance) {
    stopExperienceNarration();
    return;
  }
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    syncExperienceNarrationState(false, 'Narration is unavailable in this browser.');
    return;
  }
  if (experienceNarrationRequestInFlight) {
    narrationDebugLog('log', 'Narration request already in flight; ignoring duplicate toggle.');
    return;
  }

  var experienceId = currentExperienceId;
  var requestToken = ++experienceNarrationRequestToken;
  experienceNarrationRequestInFlight = true;
  syncExperienceNarrationState(false, 'Loading narration...');
  getExperienceNarrationScript(experienceId).then(function(script) {
    if (requestToken !== experienceNarrationRequestToken) {
      experienceNarrationRequestInFlight = false;
      return;
    }
    narrationDebugLog('log', 'Narration script resolved.', {
      experienceId: experienceId,
      textLength: String(script || '').length,
      text: String(script || '')
    });
    if (currentExperienceId !== experienceId) {
      experienceNarrationRequestInFlight = false;
      syncExperienceNarrationState(false, '');
      return;
    }

    speakExperienceNarration(script);
  }).catch(function() {
    experienceNarrationRequestInFlight = false;
    narrationDebugLog('error', 'Narration script failed to load.');
    syncExperienceNarrationState(false, 'Narration could not load.');
  });

  function speakExperienceNarration(textScript) {
    var utterance = new SpeechSynthesisUtterance(textScript);
    utterance.rate = 0.97;
    utterance.pitch = 1;
    utterance.onend = function() {
      experienceNarrationUtterance = null;
      experienceNarrationRequestInFlight = false;
      syncExperienceNarrationState(false, 'Narration complete.');
    };
    utterance.onerror = function() {
      experienceNarrationUtterance = null;
      experienceNarrationRequestInFlight = false;
      syncExperienceNarrationState(false, 'Narration could not play.');
    };

    experienceNarrationUtterance = utterance;
    syncExperienceNarrationState(true, 'Narrating...');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

function getExperienceNarrationScript(experienceId) {
  var resolvedExperienceId = resolveExperienceId(experienceId) || currentExperienceId;
  var experience = getExperienceById(resolvedExperienceId);
  narrationDebugLog('log', 'Resolving narration script.', {
    requestedExperienceId: experienceId,
    resolvedExperienceId: resolvedExperienceId,
    aboutHtmlPath: experience.aboutHtmlPath || ''
  });

  var aboutHtmlPath = normalizeAllowedAboutDocPath(experience.aboutHtmlPath || '');
  if (!aboutHtmlPath) {
    return Promise.reject(new Error('No valid about html path for narration'));
  }

  var requestKey = resolvedExperienceId;
  if (experienceNarrationFetchById[requestKey]) {
    narrationDebugLog('log', 'Narration request already in flight; reusing promise.', {
      experienceId: resolvedExperienceId
    });
    return experienceNarrationFetchById[requestKey];
  }

  experienceNarrationFetchById[requestKey] = loadNarrationTextFromExperienceInfoFrame(aboutHtmlPath)
    .then(function(text) {
      var normalized = String(text || '').trim();
      if (!normalized) {
        throw new Error('Narration extraction returned empty text');
      }
      narrationDebugLog('log', 'Narration extraction succeeded.', {
        experienceId: resolvedExperienceId,
        textLength: normalized.length,
        text: normalized
      });
      return normalized;
    })
    .finally(function() {
      delete experienceNarrationFetchById[requestKey];
    });

  return experienceNarrationFetchById[requestKey];
}

function renderExperienceTitleStatic() {
  if (!experienceTitleLabel) return;
  var experience = getExperienceById(currentExperienceId);
  var title = experience.title || 'Stitching';
  var color = getThemeExperienceTitleColor(experience.strokeColor || '#1f4f94');
  var fontFamily = experience.titleFontFamily || 'Nunito';

  if (experienceSrTitle) {
    experienceSrTitle.textContent = title;
  }

  experienceTitleLabel.textContent = title;
  experienceTitleLabel.style.color = color;
  experienceTitleLabel.style.fontFamily = '"' + fontFamily + '", "Nunito", sans-serif';
}

function applyCurrentExperienceInfo() {
  var experience = getExperienceById(currentExperienceId);
  experienceInfoTitle.textContent = experience.infoTitle || ('About ' + (experience.title || 'Experience'));
  var aboutHtmlPath = normalizeAllowedAboutDocPath(experience.aboutHtmlPath || '');
  var hasHtmlAbout = !!aboutHtmlPath;
  experienceInfoText.hidden = hasHtmlAbout;
  experienceInfoText.textContent = experience.infoText || '';
  if (experienceInfoHtmlFrame) {
    experienceInfoHtmlFrame.hidden = !hasHtmlAbout;
    if (hasHtmlAbout) {
      if (experienceInfoHtmlFrame.getAttribute('src') !== aboutHtmlPath) {
        experienceInfoHtmlFrame.setAttribute('src', aboutHtmlPath);
      } else {
        enforceExperienceInfoFrameAllowlist();
      }
    } else {
      experienceInfoHtmlFrame.removeAttribute('src');
    }
  }
  syncExperienceNarrationState(false, '');
}

function setCurrentExperience(experienceId, options) {
  options = options || {};
  var accessibleExperienceId = resolveAccessibleExperienceId(experienceId, 'stitching');
  var experience = getExperienceById(accessibleExperienceId);
  var previousExperienceId = currentExperienceId;

  if (previousExperienceId === 'stitching') {
    syncStitchingStateCacheFromRuntime();
  } else if (previousExperienceId === 'triangula') {
    persistTriangulaStateCache();
  } else if (previousExperienceId === 'squarus') {
    persistSquarusStateCache();
  } else if (previousExperienceId === 'mashrabiya') {
    persistMashrabiyaStateCache();
  }

  // keep options arg for API compatibility
  currentExperienceId = experience.id;
  if (previousExperienceId !== currentExperienceId) {
    dismissOnboardingUiForExperienceChange();
  }

  if (currentExperienceId === 'squarus') {
    if (previousExperienceId !== 'squarus') {
      squarusEntryFadeStartMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      squarusEntryFadeActive = true;
    }
  } else {
    squarusEntryFadeActive = false;
  }

  if (currentExperienceId === 'stitching') {
    restoreStitchingStateFromCache();
  } else if (currentExperienceId === 'triangula') {
    restoreTriangulaStateFromCache();
  } else if (currentExperienceId === 'squarus') {
    restoreSquarusStateFromCache();
  } else if (currentExperienceId === 'mashrabiya') {
    restoreMashrabiyaStateFromCache();
  }

  if (!options.preserveSongOnExperienceChange) {
    var preferredPlayback = getPreferredPlaybackForExperience(currentExperienceId);
    if (currentExperienceId === 'mashrabiya' && isSongUnlockedForCurrentSession('rosette')) {
      preferredPlayback.songId = 'rosette';
    }
    setCurrentSong(preferredPlayback.songId, { suppressUrlSync: true });
    applyTempoValue(preferredPlayback.bpm, { suppressUrlSync: true, suppressRedraw: true });
  }

  applyExperienceUiPolicy();
  if (currentExperienceId === 'stitching') {
    setCurrentShape(sanitizeShape(stitchingFrameShape, 'circle'), false);
  }
  // Re-apply mode-specific slider visibility after base UI policy toggles.
  syncKidControlsFromSelectedThread();
  applyCurrentExperienceInfo();
  syncExportUiCopy();
  renderExperienceTitleStatic();
  applyOnboardingGuideContentForCurrentExperience();
  refreshOnboardingOverlayPositions();

  if (currentExperienceId === 'stitching') {
    scheduleDiscoveryEvaluation();
  }

  if (!options.suppressUrlSync) {
    scheduleUrlStateSync(false);
  }
}

function refreshExperienceInfoPanelPlacement() {
  if (!experienceInfoPanel || experienceInfoPanel.hasAttribute('hidden')) return;
  positionExperienceInfoPanel();
}

function playMusicFromCurrentState() {
  if (!hasMusicStartedSinceLoad) {
    joyAudio.currentTime = 0;
    hasMusicStartedSinceLoad = true;
  }
  var playRequest = joyAudio.play();
  if (playRequest && typeof playRequest.catch === 'function') {
    playRequest.catch(function() {
      // Ignore autoplay-policy rejections; the next user gesture will retry.
    });
  }
}

function updateMusicPlaybackState() {
  if (shouldAcknowledgmentsMusicBePlaying()) {
    if (!joyAudio.paused) {
      joyAudio.pause();
    }
    if (isMusicMuted) {
      if (!acknowledgmentsAudio.paused) {
        acknowledgmentsAudio.pause();
      }
      return;
    }
    var ackPlay = acknowledgmentsAudio.play();
    if (ackPlay && typeof ackPlay.catch === 'function') {
      ackPlay.catch(function() {
        // Ignore autoplay-policy rejections; the next user gesture will retry.
      });
    }
    return;
  }

  if (!acknowledgmentsAudio.paused) {
    acknowledgmentsAudio.pause();
    acknowledgmentsAudio.currentTime = 0;
  }

  if (isMusicMuted) {
    if (!joyAudio.paused) {
      joyAudio.pause();
    }
    return;
  }
  if (shouldMusicBePlaying()) {
    playMusicFromCurrentState();
    return;
  }
  if (!joyAudio.paused) {
    joyAudio.pause();
  }
}

function syncDiscoveryToggleButton() {
  if (!discoveryToggleBtn) return;
  var isOpen = discoveryPanel.classList.contains('open');
  discoveryToggleBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
  discoveryToggleBtn.title = isOpen ? 'Close discovery library' : 'Open discovery library';
  discoveryToggleBtn.classList.toggle('active', isOpen);
  discoveryToggleBtn.classList.toggle('has-unseen', hasUnseenDiscoveries && !isOpen);
}

function syncKidSaveToggleButton() {
  if (!kidSaveToggleBtn || !kidSaveModal) return;
  var isOpen = kidSaveModal.classList.contains('open');
  kidSaveToggleBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
  kidSaveToggleBtn.classList.toggle('active', isOpen);
}

function syncAdvancedToggleButton() {
  if (!gearBtn) return;
  var isOpen = advancedPanel.classList.contains('open');
  gearBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
  gearBtn.title = isOpen ? 'Close advanced controls' : 'Open advanced controls';
  gearBtn.classList.toggle('active', isOpen);
}

function syncSongPickerToggleButton() {
  if (!kidSongToggle) return;
  var isOpen = kidSongToggle.getAttribute('aria-expanded') === 'true';
  kidSongToggle.classList.toggle('has-unseen', hasUnseenSongUnlock && !isOpen && !kidSongToggle.disabled);
}

function showDiscoveryToast(message) {
  if (!discoveryToast) return;
  if (discoveryToastTimer) {
    clearTimeout(discoveryToastTimer);
    discoveryToastTimer = null;
  }

  discoveryToast.textContent = message;
  discoveryToast.classList.add('show');

  discoveryToastTimer = window.setTimeout(function() {
    discoveryToast.classList.remove('show');
    discoveryToastTimer = null;
  }, 2500);
}

function getElementCenterPoint(element) {
  if (!element || typeof element.getBoundingClientRect !== 'function') return null;
  var rect = element.getBoundingClientRect();
  if (!isFinite(rect.left) || !isFinite(rect.top)) return null;
  return {
    x: rect.left + (rect.width / 2),
    y: rect.top + (rect.height / 2)
  };
}

function animateFloatingDiscoveryIcon(iconText, startPoint, endPoint, delayMs) {
  if (!iconText || !startPoint || !endPoint || !document.body) return;

  var token = document.createElement('div');
  token.className = 'discovery-float-icon';
  token.textContent = iconText;
  token.style.left = String(startPoint.x) + 'px';
  token.style.top = String(startPoint.y) + 'px';
  document.body.appendChild(token);

  var dx = endPoint.x - startPoint.x;
  var dy = endPoint.y - startPoint.y;
  var durationMs = DISCOVERY_FLOAT_DURATION_MS;
  var delay = Math.max(0, delayMs || 0);

  if (typeof token.animate === 'function') {
    var animation = token.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.86)', opacity: 0, offset: 0 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.14 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1)', opacity: 1, offset: 0.86 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(0.95)', opacity: 0, offset: 1 }
      ],
      {
        duration: durationMs,
        delay: delay,
        easing: 'cubic-bezier(0.16, 0.84, 0.24, 1)',
        fill: 'forwards'
      }
    );
    animation.onfinish = function() {
      token.remove();
    };
    animation.oncancel = function() {
      token.remove();
    };
    return;
  }

  window.setTimeout(function() {
    token.remove();
  }, durationMs + delay + 120);
}

function animateReturnToStitchingTrail(startPoint, endPoint) {
  if (!startPoint || !endPoint || !document.body) return;

  var dx = endPoint.x - startPoint.x;
  var dy = endPoint.y - startPoint.y;
  var distance = Math.sqrt(dx * dx + dy * dy);
  if (!isFinite(distance) || distance < 8) return;

  var angle = Math.atan2(dy, dx);
  var trailColor = getActiveTrailColor();
  var trailColorStrong = toRgbaColor(trailColor, 0.85);
  var lineThickness = 2;
  var lineHalfThickness = lineThickness / 2;
  var headSize = 7;
  var headHalfSize = headSize / 2;

  var line = document.createElement('div');
  line.className = 'return-thread-trail-line';
  line.style.left = startPoint.x + 'px';
  line.style.top = (startPoint.y - lineHalfThickness) + 'px';
  line.style.width = distance + 'px';
  line.style.transform = 'rotate(' + angle + 'rad) scaleX(0.08)';
  line.style.background = trailColorStrong;

  var head = document.createElement('div');
  head.className = 'return-thread-trail-head';
  head.style.left = (startPoint.x - headHalfSize) + 'px';
  head.style.top = (startPoint.y - headHalfSize) + 'px';
  head.style.background = trailColor;
  head.style.boxShadow = '0 0 0 3px ' + toRgbaColor(trailColor, 0.22);

  document.body.appendChild(line);
  document.body.appendChild(head);

  if (typeof line.animate === 'function' && typeof head.animate === 'function') {
    var durationMs = RETURN_TO_STITCHING_TRAIL_DURATION_MS;
    var destinationHoldMs = Math.max(120, Math.round(durationMs * 0.22));
    var retractDurationMs = Math.max(260, Math.round(durationMs * 0.74));
    var rotateScaleStart = 'rotate(' + angle + 'rad) scaleX(0.08)';
    var rotateScaleFull = 'rotate(' + angle + 'rad) scaleX(1)';
    function buildDestinationAnchoredRetractTransform(scale) {
      var clampedScale = Math.max(0, Math.min(1, scale));
      var translateX = distance * (1 - clampedScale);
      return 'rotate(' + angle + 'rad) translateX(' + translateX + 'px) scaleX(' + clampedScale + ')';
    }
    var lineAnim = line.animate(
      [
        { transform: rotateScaleStart, opacity: 0 },
        { transform: rotateScaleFull, opacity: 1, offset: 0.22 },
        { transform: rotateScaleFull, opacity: 1, offset: 1 }
      ],
      {
        duration: durationMs,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );
    lineAnim.onfinish = function() {
      window.setTimeout(function() {
        var retractAnim = line.animate(
          [
            { transform: buildDestinationAnchoredRetractTransform(1), opacity: 1 },
            { transform: buildDestinationAnchoredRetractTransform(0), opacity: 1 }
          ],
          {
            duration: retractDurationMs,
            easing: 'cubic-bezier(0.22, 0.55, 0.35, 1)',
            fill: 'forwards'
          }
        );
        retractAnim.onfinish = function() {
          line.remove();
        };
        retractAnim.oncancel = function() {
          line.remove();
        };
      }, destinationHoldMs);
    };
    lineAnim.oncancel = function() {
      line.remove();
    };

    var headAnim = head.animate(
      [
        { transform: 'translate(0, 0) scale(0.8)', opacity: 0 },
        { transform: 'translate(' + (dx * 0.22) + 'px, ' + (dy * 0.22) + 'px) scale(1)', opacity: 1, offset: 0.18 },
        { transform: 'translate(' + (dx * 0.88) + 'px, ' + (dy * 0.88) + 'px) scale(1)', opacity: 1, offset: 0.8 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.94)', opacity: 1, offset: 1 }
      ],
      {
        duration: durationMs,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );
    headAnim.onfinish = function() {
      window.setTimeout(function() {
        head.remove();
      }, destinationHoldMs);
    };
    headAnim.oncancel = function() {
      head.remove();
    };
    return;
  }

  window.setTimeout(function() {
    line.remove();
    head.remove();
  }, RETURN_TO_STITCHING_TRAIL_DURATION_MS + Math.max(120, Math.round(RETURN_TO_STITCHING_TRAIL_DURATION_MS * 0.22)) + Math.max(260, Math.round(RETURN_TO_STITCHING_TRAIL_DURATION_MS * 0.74)) + 40);
}

function getActiveTrailColor() {
  var fallbackColor = '#1982c4';
  var cachedStitchingThreadColor = getCachedActiveStitchingThreadColor();
  if (cachedStitchingThreadColor) return cachedStitchingThreadColor;

  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex >= 0 && threads[targetIndex]) {
    var chosen = threads[targetIndex].color;
    if (chosen && chosen !== 'rainbow') return chosen;
  }

  return fallbackColor;
}

function getCachedActiveStitchingThreadColor() {
  var snapshot = hydrateStitchingStateCacheFromStorage();
  if (!snapshot || !stitchingStateSnapshotAvailable) return null;

  var cachedThreads = parseStitchingThreadState(snapshot.threadState, [sanitizeThreadDescriptor({}, null)]);
  if (!cachedThreads.length) return null;

  var cachedIndex = parseBoundedInt(snapshot.selectedThreadIndex, 0, cachedThreads.length - 1, 0);
  var cachedThread = cachedThreads[cachedIndex];
  if (!cachedThread) return null;

  var cachedColor = sanitizeThreadColor(cachedThread.color, null);
  if (cachedColor && cachedColor !== 'rainbow') return cachedColor;

  var cachedSolidColor = sanitizeThreadSolidColor(cachedThread.solidColor, '#1982c4');
  if (cachedSolidColor && cachedSolidColor !== 'rainbow') return cachedSolidColor;

  return null;
}

function toRgbaColor(colorValue, alpha) {
  var fallback = 'rgba(25, 130, 196, ' + String(alpha) + ')';
  var color = String(colorValue || '').trim();
  if (!color) return fallback;

  var shortHex = /^#([0-9a-f]{3})$/i.exec(color);
  if (shortHex) {
    var sh = shortHex[1];
    var sr = parseInt(sh.charAt(0) + sh.charAt(0), 16);
    var sg = parseInt(sh.charAt(1) + sh.charAt(1), 16);
    var sb = parseInt(sh.charAt(2) + sh.charAt(2), 16);
    return 'rgba(' + sr + ', ' + sg + ', ' + sb + ', ' + String(alpha) + ')';
  }

  var fullHex = /^#([0-9a-f]{6})$/i.exec(color);
  if (fullHex) {
    var fh = fullHex[1];
    var fr = parseInt(fh.slice(0, 2), 16);
    var fg = parseInt(fh.slice(2, 4), 16);
    var fb = parseInt(fh.slice(4, 6), 16);
    return 'rgba(' + fr + ', ' + fg + ', ' + fb + ', ' + String(alpha) + ')';
  }

  var rgb = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(color);
  if (rgb) {
    return 'rgba(' + rgb[1] + ', ' + rgb[2] + ', ' + rgb[3] + ', ' + String(alpha) + ')';
  }

  return fallback;
}

function pulseDiscoveryTarget(element, delayMs) {
  if (!element || typeof element.animate !== 'function') return;
  var delay = Math.max(0, delayMs || 0);

  window.setTimeout(function() {
    element.animate(
      [
        { boxShadow: '0 0 0 0 rgba(47, 95, 179, 0)', filter: 'brightness(1)' },
        { boxShadow: '0 0 0 6px rgba(47, 95, 179, 0.28)', filter: 'brightness(1.06)', offset: 0.42 },
        { boxShadow: '0 0 0 0 rgba(47, 95, 179, 0)', filter: 'brightness(1)' }
      ],
      {
        duration: 430,
        easing: 'cubic-bezier(0.22, 0.78, 0.2, 1)',
        fill: 'none'
      }
    );
  }, delay);
}

function animateDiscoveryUnlock(shapeKey) {
  if (!shapeKey || !DISCOVERY_LIBRARY[shapeKey]) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var toastCenter = getElementCenterPoint(discoveryToast);
  var libraryCenter = getElementCenterPoint(discoveryToggleBtn);
  if (!toastCenter || !libraryCenter) return;

  var shapeIcon = DISCOVERY_LIBRARY[shapeKey].icon || '✨';
  var shapeDelay = 20;
  var shapeStart = { x: toastCenter.x - 18, y: toastCenter.y + 2 };
  animateFloatingDiscoveryIcon(shapeIcon, shapeStart, libraryCenter, shapeDelay);
  pulseDiscoveryTarget(discoveryToggleBtn, shapeDelay + DISCOVERY_FLOAT_DURATION_MS - 140);

  var songPickerCenter = getElementCenterPoint(kidSongIcon || kidSongToggle);
  if (songPickerCenter) {
    var noteDelay = 140;
    var noteStart = { x: toastCenter.x + 18, y: toastCenter.y + 4 };
    animateFloatingDiscoveryIcon('♪', noteStart, songPickerCenter, noteDelay);
    pulseDiscoveryTarget(kidSongToggle, noteDelay + DISCOVERY_FLOAT_DURATION_MS - 140);
  }
}

function getTempoOptionsForSong(songId) {
  var list = SONG_TEMPO_OPTIONS[songId];
  if (!list || !list.length) {
    return DEFAULT_TEMPO_OPTIONS.slice();
  }
  return list.slice();
}

function getActiveTempoOptions() {
  return getTempoOptionsForSong(currentSongId);
}

function getKidTempoPresetsForSong(songId) {
  var options = getTempoOptionsForSong(songId);
  var slow = options[0];
  var normal = options[Math.min(1, options.length - 1)];
  var fast = options[Math.min(2, options.length - 1)];
  return {
    slow: slow,
    normal: normal,
    fast: fast
  };
}

function renderAdvancedTempoOptions() {
  if (!advancedTempoInput) return;
  var options = getActiveTempoOptions();
  advancedTempoInput.innerHTML = '';
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement('option');
    option.value = String(options[i]);
    option.textContent = String(options[i]);
    advancedTempoInput.appendChild(option);
  }
}

function setCurrentSong(songId, options) {
  options = options || {};
  if (!MUSIC_LIBRARY[songId]) return;
  if (!options.allowLockedSong && !isSongUnlockedForCurrentSession(songId)) return;
  if (currentSongId === songId) return;

  var shouldResume = shouldMusicBePlaying() && !isMusicMuted;
  currentSongId = songId;
  renderAdvancedTempoOptions();
  var allowedTempos = getActiveTempoOptions();
  if (allowedTempos.indexOf(currentAnimationBpm) === -1) {
    currentAnimationBpm = getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM;
  }
  syncAdvancedTempoControls();
  syncKidTempoPresetControls();
  joyAudio.pause();
  joyAudio.src = MUSIC_LIBRARY[currentSongId].path;
  joyAudio.load();
  hasMusicStartedSinceLoad = false;

  if (shouldResume) {
    playMusicFromCurrentState();
  }
  renderSongPicker();
  recordCurrentExperiencePlaybackPreference();
  if (!options.suppressUrlSync) {
    scheduleUrlStateSync(false);
  }
}

function getSongPickerOptions() {
  var options = ['bach'];
  if (currentSongId && MUSIC_LIBRARY[currentSongId] && options.indexOf(currentSongId) === -1) {
    options.push(currentSongId);
  }
  for (var i = 0; i < unlockedSongIds.length; i++) {
    if (options.indexOf(unlockedSongIds[i]) === -1) {
      options.push(unlockedSongIds[i]);
    }
  }
  return options;
}

function getSongFilenameLabel(songId) {
  var entry = MUSIC_LIBRARY[songId];
  if (!entry) return songId;

  var source = entry.path || entry.title || songId;
  var baseName = String(source).split('/').pop();
  return baseName.replace(/\.[a-z0-9]+$/i, '');
}

function getSongMenuLabel(songId) {
  var label = getSongFilenameLabel(songId);
  var shapeKey = getSongShapeKey(songId);
  var shapeIcon = '◯';

  if (shapeKey === 'triangle') {
    shapeIcon = '△';
  } else if (shapeKey === 'square') {
    shapeIcon = '□';
  } else if (shapeKey === 'rosette') {
    shapeIcon = '✺';
  }

  return shapeIcon + ' ' + truncateSongLabel(label, 40);
}

function truncateSongLabel(label, maxChars) {
  if (!label) return '';
  if (label.length <= maxChars) return label;
  return label.slice(0, Math.max(1, maxChars - 1)) + '…';
}

function getSongShapeKey(songId) {
  if (songId === 'triangle') return 'triangle';
  if (songId === 'square') return 'square';
  if (songId === 'rosette') return 'rosette';
  return 'circle';
}

function getPolygonRadiusFactor(angle, sides) {
  var sector = (2 * Math.PI) / sides;
  var normalized = ((angle % sector) + sector) % sector;
  var local = normalized - (sector / 2);
  return Math.cos(Math.PI / sides) / Math.cos(local);
}

function mix(a, b, t) {
  return a + ((b - a) * t);
}

function getSongShapeProfile(shapeKey) {
  if (shapeKey === 'triangle') {
    return {
      innerFactor: 0.09,
      outerFactor: 0.44,
      startOffset: '0%',
      charWidthFactor: 0.62
    };
  }
  if (shapeKey === 'square') {
    return {
      innerFactor: 0.09,
      outerFactor: 0.44,
      startOffset: '0%',
      charWidthFactor: 0.62
    };
  }
  if (shapeKey === 'rosette') {
    return {
      innerFactor: 0.08,
      outerFactor: 0.43,
      startOffset: '0%',
      charWidthFactor: 0.62
    };
  }
  return {
    innerFactor: 0.09,
    outerFactor: 0.43,
    startOffset: '0%',
    charWidthFactor: 0.62
  };
}

function getShapeRadiusFactor(shapeKey, angle) {
  if (shapeKey === 'triangle') {
    return getPolygonRadiusFactor(angle - (Math.PI / 2), 3);
  }
  if (shapeKey === 'square') {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    return 1 / Math.max(Math.abs(c), Math.abs(s));
  }
  if (shapeKey === 'rosette') {
    return 0.86 + (0.14 * Math.cos(angle * 6));
  }
  return 1;
}

function estimateMonospaceTextLength(label, fontSize, charWidthFactor, letterSpacingEm) {
  var text = String(label || '');
  if (!text) return 0;
  var spacing = isFinite(letterSpacingEm) ? (fontSize * letterSpacingEm) : 0;
  return text.length * (fontSize * charWidthFactor + spacing);
}

function getMinimumWrapPitch(fontSize) {
  // Keep wrap spacing above glyph-height footprint to avoid cross-wrap overlap.
  return Math.max(2.1, fontSize * 1.25);
}

function polylineLength(pointsList) {
  if (!pointsList || pointsList.length < 2) return 0;
  var total = 0;
  for (var i = 1; i < pointsList.length; i++) {
    var dx = pointsList[i].x - pointsList[i - 1].x;
    var dy = pointsList[i].y - pointsList[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function getPolygonVertex(cx, cy, radius, angleOffset, sides, sideIndex) {
  var angle = angleOffset + ((2 * Math.PI * sideIndex) / sides);
  return {
    x: Math.round((cx + Math.cos(angle) * radius) * 1000) / 1000,
    y: Math.round((cy + Math.sin(angle) * radius) * 1000) / 1000
  };
}

function buildPolygonSpiralPoints(cx, cy, outer, inner, sides, angleOffset, wraps) {
  var pointsList = [];
  wraps = Math.max(1, wraps);

  for (var wrap = 0; wrap <= wraps; wrap++) {
    var t = wrap / wraps;
    var radius = outer - ((outer - inner) * t);
    // Alternate direction per ring so transitions between rings are inward/radial,
    // avoiding diagonal jumps that can create acute corner artifacts.
    if (wrap % 2 === 0) {
      for (var side = 0; side < sides; side++) {
        pointsList.push(getPolygonVertex(cx, cy, radius, angleOffset, sides, side));
      }
    } else {
      for (var reverseSide = sides - 1; reverseSide >= 0; reverseSide--) {
        pointsList.push(getPolygonVertex(cx, cy, radius, angleOffset, sides, reverseSide));
      }
    }
  }

  return pointsList;
}

function buildPolygonSpiralPath(shapeKey, width, height, targetLength, fontSize) {
  var cx = width * 0.5;
  var cy = height * 0.5;
  var minDimension = Math.min(width, height);
  var profile = getSongShapeProfile(shapeKey);
  var outer = minDimension * profile.outerFactor;
  var inner = minDimension * profile.innerFactor;
  var sides = shapeKey === 'triangle' ? 3 : 4;
  var angleOffset = shapeKey === 'triangle' ? -Math.PI / 2 : -Math.PI / 4;
  var radialSpan = Math.max(0.001, outer - inner);
  var minPitch = getMinimumWrapPitch(fontSize);
  var maxWraps = Math.max(2, Math.floor(radialSpan / minPitch));
  var minWraps = Math.min(3, maxWraps);

  var bestPoints = buildPolygonSpiralPoints(cx, cy, outer, inner, sides, angleOffset, minWraps);
  var fit = false;
  for (var wraps = minWraps; wraps <= maxWraps; wraps++) {
    var candidate = buildPolygonSpiralPoints(cx, cy, outer, inner, sides, angleOffset, wraps);
    var len = polylineLength(candidate);
    bestPoints = candidate;
    if (len >= targetLength) {
      fit = true;
      break;
    }
  }

  return {
    path: pointsToSvgPath(bestPoints),
    length: polylineLength(bestPoints),
    startOffset: profile.startOffset,
    fit: fit
  };
}

function buildCurvedSpiralPath(shapeKey, width, height, targetLength, fontSize) {
  var profile = getSongShapeProfile(shapeKey);
  var cx = width * 0.5;
  var cy = height * 0.5;
  var minDimension = Math.min(width, height);
  var inner = minDimension * profile.innerFactor;
  var outer = minDimension * profile.outerFactor;
  var radialSpan = Math.max(0.001, outer - inner);
  var minPitch = getMinimumWrapPitch(fontSize);
  var maxTurnsByPitch = Math.max(1.7, radialSpan / minPitch);

  var bestPoints = [];
  var bestLength = 0;
  var bestTurns = Math.min(2.2, maxTurnsByPitch);
  var samples = 260;
  var fit = false;

  for (var turns = 1.8; turns <= maxTurnsByPitch; turns += 0.12) {
    var pointsList = [];
    for (var i = 0; i <= samples; i++) {
      var u = i / samples;
      var angle = (-Math.PI / 2) + (u * turns * Math.PI * 2);
      var spiralRadius = outer - ((outer - inner) * u);
      var baseShape = getShapeRadiusFactor(shapeKey, angle);
      var shapeBlend = mix(1, baseShape, Math.pow(1 - u, 0.97));
      pointsList.push({
        x: Math.round((cx + Math.cos(angle) * spiralRadius * shapeBlend) * 1000) / 1000,
        y: Math.round((cy + Math.sin(angle) * spiralRadius * shapeBlend) * 1000) / 1000
      });
    }

    var candidateLength = polylineLength(pointsList);
    bestPoints = pointsList;
    bestLength = candidateLength;
    bestTurns = turns;
    if (candidateLength >= targetLength) {
      fit = true;
      break;
    }
  }

  return {
    path: pointsToSvgPath(bestPoints),
    length: bestLength,
    startOffset: profile.startOffset,
    turns: bestTurns,
    fit: fit
  };
}

function pointsToSvgPath(pointsList) {
  if (!pointsList || !pointsList.length) return '';
  var path = 'M ' + pointsList[0].x + ' ' + pointsList[0].y;
  for (var i = 1; i < pointsList.length; i++) {
    path += ' L ' + pointsList[i].x + ' ' + pointsList[i].y;
  }
  return path;
}

function buildSongSpiralPath(shapeKey, width, height) {
  var label = arguments.length > 3 ? arguments[3] : '';
  var profile = getSongShapeProfile(shapeKey);
  var best = null;
  var letterSpacingSteps = [0.03, 0.02, 0.01, 0, -0.01];

  for (var s = 0; s < letterSpacingSteps.length; s++) {
    var letterSpacingEm = letterSpacingSteps[s];

    for (var fontSize = 10.6; fontSize >= 7.2; fontSize -= 0.4) {
      var targetLength = Math.max(
        78,
        estimateMonospaceTextLength(label, fontSize, profile.charWidthFactor, letterSpacingEm) * 1.06
      );

      var result;
      if (shapeKey === 'triangle' || shapeKey === 'square') {
        result = buildPolygonSpiralPath(shapeKey, width, height, targetLength, fontSize);
      } else {
        result = buildCurvedSpiralPath(shapeKey, width, height, targetLength, fontSize);
      }

      result.fontSize = Math.round(fontSize * 10) / 10;
      result.letterSpacingEm = letterSpacingEm;
      best = result;
      if (result.fit) {
        return result;
      }
    }
  }

  return best || {
    path: '',
    length: 0,
    startOffset: profile.startOffset,
    fontSize: 7.2,
    letterSpacingEm: 0,
    fit: false
  };
}

function repeatSongLabel(label) {
  var clean = String(label || '').trim();
  if (!clean) return '';
  return clean.toUpperCase();
}

function getDiscoveryPassphrasePreview(config) {
  if (!config || typeof config !== 'object') return 'Passphrase hint: ...';
  var explicitStep = String(config.passphrasePreviewStep || '').replace(/\s+/g, ' ').trim();
  if (explicitStep) {
    return 'Passphrase hint: ' + explicitStep.replace(/[,:;.!?]+$/g, '') + '...';
  }

  var text = String(config.passphrase || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'Passphrase hint: ...';

  var clauses = text.split(/[;:.!?]/).map(function(part) {
    return part.trim();
  }).filter(function(part) {
    return !!part;
  });

  var candidate = clauses.length ? clauses[0] : text;
  var words = candidate.split(' ').filter(function(word) {
    return !!word;
  });

  if (words.length > 10) {
    candidate = words.slice(0, 10).join(' ');
  }

  candidate = candidate.replace(/[,:;.!?]+$/g, '').trim();
  if (!candidate) {
    candidate = 'Pattern details';
  }

  return 'Passphrase hint: ' + candidate + '...';
}

function getDiscoveryIconPath(discoveryKey, isUnlocked) {
  var iconName = null;
  if (discoveryKey === 'triangle') {
    iconName = 'triangle';
  } else if (discoveryKey === 'square') {
    iconName = 'square';
  } else if (discoveryKey === 'rosette12') {
    iconName = 'rosette_12fold';
  } else if (discoveryKey === 'rosette8') {
    iconName = 'rosette_8fold';
  }

  if (!iconName) return '';
  var suffix = isUnlocked ? 'color' : 'bw';
  return 'assets/images/icons/stitchlab-stitching-stitchlab_' + iconName + '_' + suffix + '.svg';
}

function renderSongPicker() {
  if (!kidSongToggle || !kidSongMenu) return;

  var hasUnlocked = unlockedSongIds.length > 0;
  var optionIds = getSongPickerOptions();
  kidSongMenu.innerHTML = '';

  if (optionIds.indexOf(currentSongId) === -1) {
    currentSongId = 'bach';
  }

  var selectedLabel = getSongFilenameLabel(currentSongId);

  if (!hasUnlocked) {
    kidSongToggle.disabled = true;
    kidSongToggle.setAttribute('aria-expanded', 'false');
    kidSongToggle.classList.remove('is-active');
    kidSongToggle.title = 'Discover a shape to unlock more songs';
    kidSongToggle.setAttribute('aria-label', 'Song picker disabled until shape discovery');
    kidSongMenu.setAttribute('hidden', '');
    syncSongPickerToggleButton();
    return;
  }

  kidSongToggle.disabled = false;
  kidSongToggle.title = 'Choose song (current: ' + selectedLabel + ')';
  kidSongToggle.setAttribute('aria-label', 'Choose song. Current song is ' + selectedLabel);
  syncSongPickerToggleButton();

  for (var i = 0; i < optionIds.length; i++) {
    var songId = optionIds[i];
    var fullLabel = getSongFilenameLabel(songId);
    var option = document.createElement('button');
    option.type = 'button';
    option.className = 'kid-song-option' + (songId === currentSongId ? ' active' : '');
    option.dataset.songId = songId;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', songId === currentSongId ? 'true' : 'false');
    option.setAttribute('aria-label', fullLabel);
    option.title = fullLabel;
    option.textContent = getSongMenuLabel(songId);
    kidSongMenu.appendChild(option);
  }
}

function renderDiscoveryLibrary() {
  discoveryCards.innerHTML = '';

  var keys = Object.keys(DISCOVERY_LIBRARY);
  var unlockedKeys = [];
  var lockedKeys = [];

  for (var index = 0; index < keys.length; index++) {
    if (discoveredShapeKeys[keys[index]]) {
      unlockedKeys.push(keys[index]);
    } else {
      lockedKeys.push(keys[index]);
    }
  }

  var orderedKeys = unlockedKeys.concat(lockedKeys);

  for (var i = 0; i < orderedKeys.length; i++) {
    var key = orderedKeys[i];
    var isUnlocked = !!discoveredShapeKeys[key];

    var config = DISCOVERY_LIBRARY[key];
    var card = document.createElement('div');
    card.className = 'discovery-card' + (isUnlocked ? '' : ' is-preview');

    var title = document.createElement('h4');
    var iconPath = getDiscoveryIconPath(key, isUnlocked);
    if (iconPath) {
      var iconChip = document.createElement('span');
      iconChip.className = 'discovery-card-icon-chip' + (isUnlocked ? ' is-unlocked' : ' is-preview');
      iconChip.setAttribute('aria-hidden', 'true');

      var iconImage = document.createElement('img');
      iconImage.className = 'discovery-card-icon' + (isUnlocked ? ' is-unlocked' : ' is-preview');
      iconImage.src = iconPath;
      iconImage.alt = '';
      iconImage.setAttribute('aria-hidden', 'true');
      iconChip.appendChild(iconImage);
      title.appendChild(iconChip);
    }

    var titleLabel = document.createElement('span');
    titleLabel.textContent = config.title;
    title.appendChild(titleLabel);
    card.appendChild(title);

    var text = document.createElement('p');
    var previewShapeName = String(config.previewShapeName || config.title || 'shape');
    var previewExperienceName = String(config.experienceName || 'experience');
    var previewShapeForArticle = previewShapeName.replace(/^[^A-Za-z]+/, '');
    var previewArticle = (/^[AEIOUaeiou]/.test(previewShapeForArticle)) ? 'an' : 'a';
    text.textContent = isUnlocked
      ? config.description
      : ('Stitch ' + previewArticle + ' ' + previewShapeName + ' to unlock travel to ' + previewExperienceName + '.');
    card.appendChild(text);

    if (config.passphrase) {
      var passphrase = document.createElement('p');
      passphrase.className = 'discovery-passphrase';
      passphrase.textContent = isUnlocked
        ? ('Passphrase: ' + config.passphrase)
        : getDiscoveryPassphrasePreview(config);
      card.appendChild(passphrase);
    }

    var action = document.createElement('button');
    action.type = 'button';
    action.className = 'advanced-reset-btn';
    action.textContent = isUnlocked
      ? ('Travel to ' + config.experienceName)
      : ('Locked: ' + config.experienceName);
    action.disabled = !isUnlocked;
    action.setAttribute('aria-disabled', isUnlocked ? 'false' : 'true');
    action.addEventListener('click', function(experienceName, songId, discoveryKey) {
      return function() {
        var experienceId = resolveExperienceId(experienceName);
        if (!experienceId) {
          alert(experienceName + ' experience is not available yet, but this travel path is now reserved in the discovery library.');
          return;
        }

        if (!isExperienceAccessible(experienceId)) {
          alert(experienceName + ' is currently gated while nested-frame rosette support is under development.');
          return;
        }

        if ((discoveryKey === 'rosette8' || discoveryKey === 'rosette12') && experienceId === 'mashrabiya') {
          mashrabiyaFold = (discoveryKey === 'rosette8') ? 8 : 12;
          persistMashrabiyaStateCache();
        }

        setCurrentExperience(experienceId);
        redrawForPathChange();
        discoveryPanel.classList.remove('open');
        syncDiscoveryToggleButton();
      };
    }(config.experienceName, config.songId, key));
    card.appendChild(action);

    discoveryCards.appendChild(card);
  }

  renderSongPicker();
  syncDiscoveryToggleButton();
}

function normalizeDiscoveryPassphrase(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getDiscoveryKeyForPassphrase(passphraseText) {
  var normalizedInput = normalizeDiscoveryPassphrase(passphraseText);
  if (!normalizedInput) return null;

  var keys = Object.keys(DISCOVERY_LIBRARY);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var config = DISCOVERY_LIBRARY[key];
    if (!config || !config.passphrase || !config.passphraseInputEnabled) continue;
    if (normalizeDiscoveryPassphrase(config.passphrase) === normalizedInput) {
      return key;
    }
  }

  return null;
}

function setDiscoveryPassphraseFeedback(message, status) {
  if (!discoveryPassphraseFeedback) return;
  discoveryPassphraseFeedback.textContent = message || '';
  discoveryPassphraseFeedback.classList.remove('is-success');
  discoveryPassphraseFeedback.classList.remove('is-error');
  if (status === 'success') {
    discoveryPassphraseFeedback.classList.add('is-success');
  } else if (status === 'error') {
    discoveryPassphraseFeedback.classList.add('is-error');
  }
}

function submitDiscoveryPassphraseEntry() {
  if (!discoveryPassphraseInput) return;

  var attemptedPassphrase = discoveryPassphraseInput.value || '';
  if (!normalizeDiscoveryPassphrase(attemptedPassphrase)) {
    setDiscoveryPassphraseFeedback('Type a passphrase first.', 'error');
    return;
  }

  var shapeKey = getDiscoveryKeyForPassphrase(attemptedPassphrase);
  if (!shapeKey) {
    setDiscoveryPassphraseFeedback('That passphrase does not match a discovery yet.', 'error');
    return;
  }

  var alreadyDiscovered = !!discoveredShapeKeys[shapeKey];
  unlockDiscovery(shapeKey);

  if (alreadyDiscovered) {
    setDiscoveryPassphraseFeedback(DISCOVERY_LIBRARY[shapeKey].title + ' was already discovered.', 'success');
  } else {
    setDiscoveryPassphraseFeedback('Passphrase accepted: ' + DISCOVERY_LIBRARY[shapeKey].title + ' unlocked.', 'success');
  }

  discoveryPassphraseInput.value = '';
}

function unlockSong(songId) {
  if (!songId || !MUSIC_LIBRARY[songId]) return;
  if (unlockedSongIds.indexOf(songId) !== -1) return;
  unlockedSongIds.push(songId);
  hasUnseenSongUnlock = true;
}

function unlockDiscovery(shapeKey) {
  if (!shapeKey || !DISCOVERY_LIBRARY[shapeKey]) return;
  if (discoveredShapeKeys[shapeKey]) return;

  var config = DISCOVERY_LIBRARY[shapeKey];
  discoveredShapeKeys[shapeKey] = true;
  unlockSong(config.songId);

  var unlockedExperienceId = resolveExperienceId(config.experienceName);
  if (unlockedExperienceId === 'mashrabiya' && config.songId === 'rosette') {
    var playbackState = hydrateExperiencePlaybackStateCacheFromStorage();
    playbackState.mashrabiya = normalizePlaybackEntry(
      {
        songId: 'rosette',
        bpm: getKidTempoPresetsForSong('rosette').slow || DEFAULT_ANIMATION_BPM
      },
      'rosette'
    );
    persistExperiencePlaybackStateCache(playbackState);
  }

  if (unlockedExperienceId && unlockedExperienceId === currentExperienceId && config.songId && currentSongId !== config.songId) {
    setCurrentSong(config.songId, { suppressUrlSync: true });
  }

  hasUnseenDiscoveries = true;
  renderDiscoveryLibrary();
  showDiscoveryToast('New discovery unlocked: ' + config.title);
  animateDiscoveryUnlock(shapeKey);
}

function getDiscoveryCandidateThreads() {
  if (selectedThreadIndex >= 0 && selectedThreadIndex < threads.length) {
    return [threads[selectedThreadIndex]];
  }
  return threads.slice();
}

function buildUndirectedGraphFromSegments(segments, pointCount) {
  var adjacency = [];
  var neighbors = [];
  for (var i = 0; i < pointCount; i++) {
    adjacency.push(Object.create(null));
    neighbors.push([]);
  }

  if (!segments || !segments.length) {
    return {
      adjacency: adjacency,
      neighbors: neighbors
    };
  }

  for (var s = 0; s < segments.length; s++) {
    var fromIndex = segments[s][0];
    var toIndex = segments[s][1];

    if (!isFinite(fromIndex) || !isFinite(toIndex)) continue;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= pointCount || toIndex >= pointCount) continue;
    if (fromIndex === toIndex) continue;
    if (adjacency[fromIndex][toIndex]) continue;

    adjacency[fromIndex][toIndex] = true;
    adjacency[toIndex][fromIndex] = true;
    neighbors[fromIndex].push(toIndex);
    neighbors[toIndex].push(fromIndex);
  }

  return {
    adjacency: adjacency,
    neighbors: neighbors
  };
}

function isApproxEquilateralTriangleByIndices(a, b, c) {
  var pa = points[a];
  var pb = points[b];
  var pc = points[c];
  if (!pa || !pb || !pc) return false;

  var sideAB = pa.getDistance(pb);
  var sideBC = pb.getDistance(pc);
  var sideCA = pc.getDistance(pa);

  var minSide = Math.min(sideAB, sideBC, sideCA);
  var maxSide = Math.max(sideAB, sideBC, sideCA);
  if (!isFinite(minSide) || !isFinite(maxSide) || minSide <= 1e-4) return false;

  var areaTwice = Math.abs(pb.subtract(pa).cross(pc.subtract(pa)));
  if (areaTwice <= (minSide * minSide * 0.08)) return false;

  // Tight tolerance keeps Triangula strictly tied to equilateral stitching.
  return (maxSide / minSide) <= 1.015;
}

function threadHasEquilateralTriangleDiscovery(thread) {
  if (!thread || points.length < 3) return false;

  var graph = buildUndirectedGraphFromSegments(computeSegments(thread), points.length);
  var adjacency = graph.adjacency;
  var neighbors = graph.neighbors;

  for (var a = 0; a < neighbors.length; a++) {
    for (var i = 0; i < neighbors[a].length; i++) {
      var b = neighbors[a][i];
      if (b <= a) continue;

      for (var j = 0; j < neighbors[b].length; j++) {
        var c = neighbors[b][j];
        if (c <= b || c === a) continue;
        if (!adjacency[a][c]) continue;

        if (isApproxEquilateralTriangleByIndices(a, b, c)) {
          return true;
        }
      }
    }
  }

  return false;
}

function isApproxSquareCycleByIndices(a, b, c, d) {
  var p0 = points[a];
  var p1 = points[b];
  var p2 = points[c];
  var p3 = points[d];
  if (!p0 || !p1 || !p2 || !p3) return false;

  var v01 = p1.subtract(p0);
  var v12 = p2.subtract(p1);
  var v23 = p3.subtract(p2);
  var v30 = p0.subtract(p3);

  var l01 = v01.length;
  var l12 = v12.length;
  var l23 = v23.length;
  var l30 = v30.length;
  var minSide = Math.min(l01, l12, l23, l30);
  var maxSide = Math.max(l01, l12, l23, l30);

  if (!isFinite(minSide) || !isFinite(maxSide) || minSide <= 1e-4) return false;
  if ((maxSide / minSide) > 1.03) return false;

  var areaTwice = Math.abs(v01.cross(p3.subtract(p0))) + Math.abs(v12.cross(p0.subtract(p1)));
  if (areaTwice <= (minSide * minSide * 0.12)) return false;

  function isNearlyRightAngle(vA, vB) {
    if (vA.length <= 1e-4 || vB.length <= 1e-4) return false;
    var cosineAbs = Math.abs(vA.dot(vB) / (vA.length * vB.length));
    return cosineAbs <= 0.2;
  }

  if (!isNearlyRightAngle(v01, v12)) return false;
  if (!isNearlyRightAngle(v12, v23)) return false;
  if (!isNearlyRightAngle(v23, v30)) return false;
  if (!isNearlyRightAngle(v30, v01)) return false;

  var d02 = p0.getDistance(p2);
  var d13 = p1.getDistance(p3);
  var minDiag = Math.min(d02, d13);
  var maxDiag = Math.max(d02, d13);
  if (!isFinite(minDiag) || minDiag <= 1e-4) return false;
  if ((maxDiag / minDiag) > 1.03) return false;

  return true;
}

function threadHasSquareDiscovery(thread) {
  if (!thread || points.length < 4) return false;

  var graph = buildUndirectedGraphFromSegments(computeSegments(thread), points.length);
  var adjacency = graph.adjacency;
  var neighbors = graph.neighbors;

  for (var a = 0; a < neighbors.length; a++) {
    for (var i = 0; i < neighbors[a].length; i++) {
      var b = neighbors[a][i];
      if (b === a) continue;

      for (var j = 0; j < neighbors[b].length; j++) {
        var c = neighbors[b][j];
        if (c === b || c === a) continue;

        for (var k = 0; k < neighbors[c].length; k++) {
          var d = neighbors[c][k];
          if (d === c || d === b || d === a) continue;
          if (!adjacency[d][a]) continue;

          if (isApproxSquareCycleByIndices(a, b, c, d)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function isPerfectSquareInteger(value) {
  var n = parseInt(value, 10);
  if (!isFinite(n) || n < 1) return false;
  var root = Math.round(Math.sqrt(n));
  return root * root === n;
}

function threadHasSquareFramePerfectSquareDiscovery(thread, activeShape, holeCount) {
  if (activeShape !== 'square') return false;
  if (!thread) return false;
  if (!isPerfectSquareInteger(holeCount)) return false;

  var jumpMode = sanitizeThreadJumpMode(thread.jumpMode, 'fixed');
  if (jumpMode !== 'fixed') return false;

  var jump = parseInt(thread.jump, 10);
  if (!isFinite(jump)) return false;
  return jump === 1;
}

function normalizeRosetteThreadSignature(thread, holeCount, options) {
  options = options || {};
  if (!thread || !isFinite(holeCount) || holeCount < 3) return null;
  if (thread.jumpMode && thread.jumpMode !== 'fixed') return null;

  var frameMode = sanitizeThreadFrameMode(thread.frameMode, 'outer');
  var innerHoleCountDefault = parseBoundedInt(options.innerHoleCount, 3, MAX_HOLES, getCurrentInnerStitchHoleCount());
  var sourceHoleCount = parseBoundedInt(thread.sourceHoleCount, 3, MAX_HOLES, holeCount);
  if (!thread.sourceHoleCount) {
    if (frameMode === 'inner' || frameMode === 'bridge-reverse' || frameMode === 'bridge-reverse-project') {
      sourceHoleCount = innerHoleCountDefault;
    } else {
      sourceHoleCount = holeCount;
    }
  }

  var rawJump = parseInt(thread.jump, 10);
  if (!isFinite(rawJump)) return null;
  var jump = ((rawJump % sourceHoleCount) + sourceHoleCount) % sourceHoleCount;
  if (jump === 0) return null;

  var rawStartHole = parseInt(thread.startHole, 10);
  if (!isFinite(rawStartHole)) {
    rawStartHole = 1;
  }
  var startHole = ((rawStartHole - 1) % sourceHoleCount + sourceHoleCount) % sourceHoleCount + 1;
  var jumpGcd = getRosetteGreatestCommonDivisor(jump, sourceHoleCount);
  var startHoleOrbitSize = Math.max(1, jumpGcd);
  var canonicalStartHole = ((startHole - 1) % startHoleOrbitSize + startHoleOrbitSize) % startHoleOrbitSize + 1;

  return {
    jump: jump,
    startHole: startHole,
    canonicalStartHole: canonicalStartHole,
    startHoleOrbitSize: startHoleOrbitSize,
    frameMode: frameMode,
    sourceHoleCount: sourceHoleCount
  };
}

function getRosetteGreatestCommonDivisor(a, b) {
  var x = Math.abs(Math.round(Number(a) || 0));
  var y = Math.abs(Math.round(Number(b) || 0));
  if (!x && !y) return 1;
  if (!x) return Math.max(1, y);
  if (!y) return Math.max(1, x);
  while (y !== 0) {
    var remainder = x % y;
    x = y;
    y = remainder;
  }
  return Math.max(1, x);
}

function buildRosetteSignatureKey(signature) {
  var orbitSize = Math.max(1, parseBoundedInt(signature.startHoleOrbitSize, 1, MAX_HOLES, 1));
  var canonicalStartHole = parseBoundedInt(signature.canonicalStartHole, 1, orbitSize, parseBoundedInt(signature.startHole, 1, MAX_HOLES, 1));
  return String(signature.jump) + '|' + String(canonicalStartHole) + '|' + String(signature.frameMode || 'outer') + '|' + String(signature.sourceHoleCount || 0);
}

function areRosetteSignatureMultisetsEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false;

  var leftKeys = [];
  var rightKeys = [];
  for (var i = 0; i < left.length; i++) {
    leftKeys.push(buildRosetteSignatureKey(left[i]));
    rightKeys.push(buildRosetteSignatureKey(right[i]));
  }
  leftKeys.sort();
  rightKeys.sort();

  for (var k = 0; k < leftKeys.length; k++) {
    if (leftKeys[k] !== rightKeys[k]) {
      return false;
    }
  }

  return true;
}

function rotateRosetteSignature(signature, delta, holeCount) {
  var sourceCount = parseBoundedInt(signature.sourceHoleCount, 3, MAX_HOLES, holeCount);
  var startHole = ((signature.startHole - 1 + delta) % sourceCount + sourceCount) % sourceCount + 1;
  var orbitSize = Math.max(1, getRosetteGreatestCommonDivisor(signature.jump, sourceCount));
  return {
    jump: signature.jump,
    startHole: startHole,
    canonicalStartHole: ((startHole - 1) % orbitSize + orbitSize) % orbitSize + 1,
    startHoleOrbitSize: orbitSize,
    frameMode: signature.frameMode,
    sourceHoleCount: sourceCount
  };
}

function doesRosetteSubsetMatchRecipe(candidateSubset, recipeSignatures, holeCount, allowRotation) {
  if (!allowRotation) {
    return areRosetteSignatureMultisetsEqual(candidateSubset, recipeSignatures);
  }

  for (var delta = 0; delta < holeCount; delta++) {
    var rotatedRecipe = [];
    for (var i = 0; i < recipeSignatures.length; i++) {
      rotatedRecipe.push(rotateRosetteSignature(recipeSignatures[i], delta, holeCount));
    }
    if (areRosetteSignatureMultisetsEqual(candidateSubset, rotatedRecipe)) {
      return true;
    }
  }

  return false;
}

function findRosetteSubsetMatch(candidateSignatures, recipeSignatures, holeCount, allowRotation) {
  if (!candidateSignatures || !recipeSignatures) return false;
  var targetSize = recipeSignatures.length;
  if (targetSize < 1 || candidateSignatures.length < targetSize) return false;

  var subset = [];

  function search(startIndex) {
    if (subset.length === targetSize) {
      return doesRosetteSubsetMatchRecipe(subset, recipeSignatures, holeCount, allowRotation);
    }

    var needed = targetSize - subset.length;
    for (var i = startIndex; i <= candidateSignatures.length - needed; i++) {
      subset.push(candidateSignatures[i]);
      if (search(i + 1)) {
        return true;
      }
      subset.pop();
    }

    return false;
  }

  return search(0);
}

function findMatchingRosetteDiscoveryRecipe() {
  var holeCount = parseInt(holesSlider.value, 10);
  if (!isFinite(holeCount) || holeCount < 3) return null;

  var candidateSignatures = [];
  for (var i = 0; i < threads.length; i++) {
    var signature = normalizeRosetteThreadSignature(threads[i], holeCount, {
      innerHoleCount: getCurrentInnerStitchHoleCount()
    });
    if (signature) {
      candidateSignatures.push(signature);
    }
  }

  for (var r = 0; r < ROSETTE_DISCOVERY_RECIPES.length; r++) {
    var recipe = ROSETTE_DISCOVERY_RECIPES[r];
    if (!recipe) continue;
    if (parseInt(recipe.holeCount, 10) !== holeCount) continue;
    if (!recipe.threads || !recipe.threads.length) continue;
    if (recipe.requireNestedFrameEnabled && !nestedFrameEnabled) continue;
    if (isFinite(recipe.requiredNestedFrameRatio)) {
      var requiredRatio = sanitizeNestedFrameRatio(recipe.requiredNestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
      var activeRatio = sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
      if (Math.abs(requiredRatio - activeRatio) > 1e-8) continue;
    }
    if (isFinite(recipe.requiredInnerHoleCount)) {
      if (getCurrentInnerStitchHoleCount() !== parseBoundedInt(recipe.requiredInnerHoleCount, 3, MAX_HOLES, getCurrentInnerStitchHoleCount())) {
        continue;
      }
    }

    var recipeSignatures = [];
    var recipeIsValid = true;
    var recipeInnerCount = parseBoundedInt(recipe.requiredInnerHoleCount, 3, MAX_HOLES, Math.round(holeCount * sanitizeNestedFrameRatio(recipe.requiredNestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)));
    for (var t = 0; t < recipe.threads.length; t++) {
      var recipeSignature = normalizeRosetteThreadSignature(recipe.threads[t], holeCount, {
        innerHoleCount: recipeInnerCount
      });
      if (!recipeSignature) {
        recipeIsValid = false;
        break;
      }
      recipeSignatures.push(recipeSignature);
    }
    if (!recipeIsValid) continue;

    if (findRosetteSubsetMatch(candidateSignatures, recipeSignatures, holeCount, recipe.allowRotation !== false)) {
      return recipe;
    }
  }

  return null;
}

function evaluateDiscoveryCandidates() {
  if (currentExperienceId !== 'stitching') return;

  var activeShape = currentShape;
  var activeHoleCount = parseInt(holesSlider.value, 10);
  if (activeShape !== 'circle') {
    // Keep discovery criteria consistent across stitching frames.
    currentShape = 'circle';
  }
  computePoints();

  var candidates = getDiscoveryCandidateThreads();
  var foundTriangle = false;
  var foundSquare = false;

  for (var i = 0; i < candidates.length; i++) {
    if (!foundTriangle && threadHasEquilateralTriangleDiscovery(candidates[i])) {
      foundTriangle = true;
    }
    if (!foundSquare && (threadHasSquareDiscovery(candidates[i]) || threadHasSquareFramePerfectSquareDiscovery(candidates[i], activeShape, activeHoleCount))) {
      foundSquare = true;
    }
    if (foundTriangle && foundSquare) break;
  }

  if (foundTriangle) {
    unlockDiscovery('triangle');
  }
  if (foundSquare) {
    unlockDiscovery('square');
  }
  var matchingRosetteRecipe = findMatchingRosetteDiscoveryRecipe();
  if (matchingRosetteRecipe) {
    unlockDiscovery(matchingRosetteRecipe.discoveryKey || 'rosette12');
  }

  if (activeShape !== currentShape) {
    currentShape = activeShape;
    computePoints();
  }
}

function scheduleDiscoveryEvaluation() {
  if (discoveryTimer) {
    clearTimeout(discoveryTimer);
  }
  discoveryTimer = window.setTimeout(function() {
    discoveryTimer = null;
    if (hasActiveSliderMotion()) {
      scheduleDiscoveryEvaluation();
      return;
    }
    evaluateDiscoveryCandidates();
  }, DISCOVERY_STABILIZE_MS);
}

function markSliderAsMoving(slider) {
  var key = getSliderMotionKey(slider);
  if (!key) return;
  sliderMotionKeys[key] = true;
  if (sliderMotionSettleTimers[key]) {
    clearTimeout(sliderMotionSettleTimers[key]);
    delete sliderMotionSettleTimers[key];
  }
}

function settleSliderMotionByKey(key) {
  if (!key) return;
  if (sliderMotionSettleTimers[key]) {
    clearTimeout(sliderMotionSettleTimers[key]);
  }
  sliderMotionSettleTimers[key] = window.setTimeout(function() {
    delete sliderMotionKeys[key];
    delete sliderMotionSettleTimers[key];
    updateMusicPlaybackState();
  }, SLIDER_MOTION_SETTLE_MS);
}

function settleSliderMotion(slider) {
  var key = getSliderMotionKey(slider);
  settleSliderMotionByKey(key);
}

function settleAllSliderMotion() {
  for (var key in sliderMotionKeys) {
    settleSliderMotionByKey(key);
  }
  scheduleUrlStateSync(true);
}

function setHoleNumberHighlight(index, isHighlighted) {
  var label = holeNumberLabelsByIndex[index];
  if (!label) return;
  label.fontWeight = isHighlighted ? 'bold' : 'normal';
  label.fillColor = isHighlighted ? getThemeHoleLabelHighlightColor() : getThemeHoleLabelColor();
}

function clearHighlightedHoleNumbers() {
  for (var i = 0; i < highlightedHoleNumbers.length; i++) {
    setHoleNumberHighlight(highlightedHoleNumbers[i], false);
  }
  highlightedHoleNumbers = [];
}

function highlightHoleNumberPair(firstIndex, secondIndex) {
  clearHighlightedHoleNumbers();

  if (!isFinite(firstIndex) || !isFinite(secondIndex)) return;

  setHoleNumberHighlight(firstIndex, true);
  highlightedHoleNumbers.push(firstIndex);

  if (secondIndex !== firstIndex) {
    setHoleNumberHighlight(secondIndex, true);
    highlightedHoleNumbers.push(secondIndex);
  }
}

function syncHoleNumberHighlightFromAnimationState() {
  if (!animationState || !animationState.activeHolePair) {
    clearHighlightedHoleNumbers();
    return;
  }
  highlightHoleNumberPair(animationState.activeHolePair[0], animationState.activeHolePair[1]);
}

function updateKidControlValues() {
  holesValue.textContent = holesSlider.value;
  jumpValue.textContent = jumpSlider.value;
  multiplyValue.textContent = multiplySlider.value;
  widthValue.textContent = widthSlider.value;
  if (nestedFrameRatioValue) {
    if (!nestedFrameEnabled) {
      nestedFrameRatioValue.textContent = 'off';
    } else if (nestedFrameRatio === 0.75) {
      nestedFrameRatioValue.textContent = '3/4';
    } else {
      nestedFrameRatioValue.textContent = '1/2';
    }
  }
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = holesSlider.value;
  }
}

function syncNestedFrameControls() {
  if (nestedFrameEnabledInput) {
    nestedFrameEnabledInput.checked = !!nestedFrameEnabled;
  }
  if (nestedFrameRatioSelect) {
    nestedFrameRatioSelect.value = String(sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO));
    nestedFrameRatioSelect.disabled = !nestedFrameEnabled;
  }
  updateKidControlValues();
}

function getCurrentStitchHoleCount() {
  return parseBoundedInt(holesSlider && holesSlider.value, 3, MAX_HOLES, DEFAULT_HOLES);
}

function getCurrentInnerStitchHoleCount() {
  if (!nestedFrameEnabled) return 0;
  var outerCount = getCurrentStitchHoleCount();
  var ratio = sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
  var scaledInnerCount = Math.round(outerCount * ratio);
  return parseBoundedInt(scaledInnerCount, 3, MAX_HOLES, Math.max(3, Math.round(outerCount * DEFAULT_NESTED_FRAME_RATIO)));
}

function getCurrentTotalStitchHoleCount() {
  return getCurrentStitchHoleCount() + getCurrentInnerStitchHoleCount();
}

function getThreadSourceRing(thread) {
  var mode = sanitizeThreadFrameMode(thread && thread.frameMode, 'outer');
  if (mode === 'inner' || mode === 'bridge-reverse' || mode === 'bridge-reverse-project') {
    return 'inner';
  }
  return 'outer';
}

function getThreadSourceHoleCount(thread) {
  var outerCount = getCurrentStitchHoleCount();
  var innerCount = getCurrentInnerStitchHoleCount();
  var sourceRing = getThreadSourceRing(thread);
  if (sourceRing === 'inner' && nestedFrameEnabled && innerCount > 0) {
    return innerCount;
  }
  return outerCount;
}

function getCurrentJumpLimit() {
  return Math.max(1, getCurrentStitchHoleCount() - 1);
}

function normalizeThreadHoleDependentValues(thread, holeCount) {
  if (!thread) return;
  var safeHoleCount = parseBoundedInt(holeCount, 3, MAX_HOLES, getCurrentStitchHoleCount());
  thread.jump = parseBoundedInt(thread.jump, 1, Math.max(1, safeHoleCount - 1), DEFAULT_SKIP);
  thread.startHole = parseBoundedInt(thread.startHole, 1, safeHoleCount, 1);
}

function syncJumpBoundsFromHoleCount() {
  var holeCount = getCurrentStitchHoleCount();
  var jumpLimit = Math.max(1, holeCount - 1);

  if (jumpSlider) {
    jumpSlider.max = String(jumpLimit);
  }
  if (startHoleInput) {
    startHoleInput.max = String(holeCount);
  }

  for (var i = 0; i < threads.length; i++) {
    normalizeThreadHoleDependentValues(threads[i], getThreadSourceHoleCount(threads[i]));
  }

  var selected = getKidTargetThreadIndex();
  if (selected >= 0 && threads[selected] && jumpSlider) {
    var selectedJumpLimit = Math.max(1, getThreadSourceHoleCount(threads[selected]) - 1);
    jumpSlider.max = String(selectedJumpLimit);
    threads[selected].jump = parseBoundedInt(threads[selected].jump, 1, selectedJumpLimit, threads[selected].jump || 1);
    jumpSlider.value = String(threads[selected].jump);
  }
  if (selected >= 0 && threads[selected] && startHoleInput) {
    var selectedHoleCount = getThreadSourceHoleCount(threads[selected]);
    startHoleInput.max = String(selectedHoleCount);
    threads[selected].startHole = parseBoundedInt(threads[selected].startHole, 1, selectedHoleCount, threads[selected].startHole || 1);
    startHoleInput.value = String(threads[selected].startHole);
  }
}

function syncBorderControls() {
  advancedBorderEnabledInput.checked = borderEnabled;
}

function createThread(config) {
  var initialSolidColor = sanitizeThreadSolidColor(config.solidColor, config.color || '#1982c4');
  var initialColor = sanitizeThreadColor(config.color, initialSolidColor);
  if (initialColor !== 'rainbow') {
    initialSolidColor = sanitizeThreadSolidColor(initialColor, initialSolidColor);
  }

  return {
    jump: config.jump,
    width: config.width,
    color: initialColor,
    solidColor: initialSolidColor,
    startHole: parseBoundedInt(config.startHole, 1, MAX_HOLES, 1),
    sequence: null,
    jumpMode: 'fixed',
    jumpFormula: 'skip',
    jumpSequence: '',
    jumpSequenceMode: sanitizeThreadSequenceMode(config.jumpSequenceMode, 'holes'),
    connectMultiplier: 2,
    connectOffset: 0,
    frameMode: sanitizeThreadFrameMode(config.frameMode, 'outer')
  };
}

function ensureThreadConnectConfig(thread) {
  if (!thread) return;
  if (!isFinite(thread.connectMultiplier)) {
    thread.connectMultiplier = 2;
  }
  if (!isFinite(thread.connectOffset)) {
    thread.connectOffset = 0;
  }
}

function getKidStitchByForThread(thread) {
  if (!thread) {
    return 'add';
  }
  if (thread.jumpMode === 'connect') return 'multiply';
  if (thread.jumpMode === 'sequence') return 'sequence';
  if (thread.jumpMode === 'formula') {
    return isExpressionStitchModeEnabled() ? 'formula' : 'add';
  }
  return 'add';
}

function isThreadHoleListMode(thread) {
  return !!thread &&
    thread.jumpMode === 'sequence' &&
    sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes') === 'holes';
}

function syncKidStitchByControl() {
  var index = getKidTargetThreadIndex();
  if (index < 0 || !threads[index]) {
    kidStitchBySelect.value = 'add';
    return;
  }
  kidStitchBySelect.value = getKidStitchByForThread(threads[index]);
}

function syncBasicMathSliderVisibility() {
  if (currentExperienceId !== 'stitching') {
    addSliderBlock.style.display = 'none';
    multiplySliderBlock.style.display = 'none';
    if (startHoleBlock) startHoleBlock.style.display = 'none';
    if (sequenceInputBlock) sequenceInputBlock.style.display = 'none';
    if (formulaInputBlock) formulaInputBlock.style.display = 'none';
    jumpSlider.disabled = true;
    multiplySlider.disabled = true;
    if (startHoleInput) startHoleInput.disabled = true;
    if (kidJumpSequenceInput) kidJumpSequenceInput.disabled = true;
    if (kidSequenceModeSelect) kidSequenceModeSelect.disabled = true;
    if (kidJumpFormulaInput) kidJumpFormulaInput.disabled = true;
    return;
  }

  var index = getKidTargetThreadIndex();
  var mode = 'fixed';

  if (index >= 0 && threads[index]) {
    mode = threads[index].jumpMode || 'fixed';
  }

  var isMultiplyMode = mode === 'connect';
  var isSequenceMode = mode === 'sequence';
  var isFormulaMode = isExpressionStitchModeEnabled() && mode === 'formula';
  var isFixedMode = !isMultiplyMode && !isSequenceMode && !isFormulaMode;
  var hideStartHole = index >= 0 && threads[index] && isThreadHoleListMode(threads[index]);

  addSliderBlock.style.display = isFixedMode ? '' : 'none';
  multiplySliderBlock.style.display = isMultiplyMode ? '' : 'none';
  if (startHoleBlock) startHoleBlock.style.display = hideStartHole ? 'none' : '';
  if (sequenceInputBlock) sequenceInputBlock.style.display = isSequenceMode ? '' : 'none';
  if (formulaInputBlock) formulaInputBlock.style.display = isFormulaMode ? '' : 'none';

  jumpSlider.disabled = !isFixedMode;
  multiplySlider.disabled = !isMultiplyMode;
  if (startHoleInput) startHoleInput.disabled = hideStartHole;
  if (kidJumpSequenceInput) kidJumpSequenceInput.disabled = !isSequenceMode;
  if (kidSequenceModeSelect) kidSequenceModeSelect.disabled = !isSequenceMode;
  if (kidJumpFormulaInput) kidJumpFormulaInput.disabled = !isFormulaMode;
}

function buildMagicThread() {
  var baseIndex = threads.length ? Math.max(0, selectedThreadIndex) : 0;
  var base = threads[baseIndex] || createThread({ jump: 22, width: 2, color: '#1982c4' });
  var jumpShift = (Math.floor(Math.random() * 7) + 2);
  var nextJump = base.jump + jumpShift;
  var jumpLimit = getCurrentJumpLimit();
  if (nextJump > jumpLimit) nextJump = ((nextJump - 1) % jumpLimit) + 1;

  var colorPick = magicThreadColors[Math.floor(Math.random() * magicThreadColors.length)];
  if (threads.length && threads[threads.length - 1].color === colorPick) {
    colorPick = magicThreadColors[(magicThreadColors.indexOf(colorPick) + 1) % magicThreadColors.length];
  }

  return createThread({
    jump: nextJump,
    width: DEFAULT_THREAD_SIZE,
    color: colorPick,
    startHole: parseBoundedInt(base.startHole, 1, getCurrentStitchHoleCount(), 1),
    frameMode: sanitizeThreadFrameMode(base.frameMode, 'outer')
  });
}

function applyThreadSwatchStyle(element, color) {
  if (!element) return;
  if (color === 'rainbow') {
    element.style.background = 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)';
  } else {
    element.style.background = color || '#1982c4';
  }
}

function applyExperiencePaletteColorChoice(colorValue) {
  if (!threads.length) return;

  var profile = getExperienceUiProfile(currentExperienceId);
  var paletteMode = profile && profile.paletteMode ? profile.paletteMode : 'thread';
  var color = colorValue || '#1982c4';

  if (paletteMode === 'global') {
    threads.forEach(function(thread) {
      thread.color = color;
      if (color !== 'rainbow') {
        thread.solidColor = sanitizeThreadSolidColor(color, thread.solidColor || '#1982c4');
      }
    });
    return;
  }

  if (paletteMode === 'triangula-banded') {
    var safeColor = normalizeTriangulaFillColor(color, triangulaBandColors.band1);
    // Keep the most recently picked palette color available across band mode switches.
    triangulaSourceColor = safeColor;
    if (triangulaConstructionMode === 'cut') {
      triangulaBandColors.band1 = safeColor;
      triangulaBandColors.band2 = safeColor;
      triangulaBandColors.band4 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'all') {
      triangulaBandColors.band1 = safeColor;
      triangulaBandColors.band2 = safeColor;
      triangulaBandColors.band4 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'band-1') {
      triangulaBandColors.band1 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'band-2') {
      triangulaBandColors.band2 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    if (triangulaColorMode === 'band-4') {
      triangulaBandColors.band4 = safeColor;
      persistTriangulaStateCache();
      return;
    }
    persistTriangulaStateCache();
    return;
  }

  var targetIndex = selectedThreadIndex;
  if (targetIndex < 0 || targetIndex >= threads.length) {
    targetIndex = 0;
  }
  threads[targetIndex].color = color;
  if (color !== 'rainbow') {
    threads[targetIndex].solidColor = sanitizeThreadSolidColor(color, threads[targetIndex].solidColor || '#1982c4');
  }
}

function syncHoleNumberToggles() {
  advancedHoleNumbersToggle.checked = showHoleNumbers;
  holeNumbersToggleBtn.classList.toggle('active', showHoleNumbers);
  holeNumbersToggleBtn.setAttribute('aria-pressed', showHoleNumbers ? 'true' : 'false');
  holeNumbersToggleBtn.title = showHoleNumbers ? 'Hole numbers on' : 'Hole numbers off';
}

function setCurrentShape(shape, shouldDraw) {
  var nextShape = shape || 'circle';
  currentShape = nextShape;
  if (currentExperienceId === 'stitching') {
    stitchingFrameShape = sanitizeShape(nextShape, stitchingFrameShape || 'circle');
  }
  document.querySelectorAll('.shape-btn').forEach((b) => b.classList.remove('active'));
  var activeShapeBtn = document.querySelector('.shape-btn[data-shape="' + nextShape + '"]');
  if (activeShapeBtn) {
    activeShapeBtn.classList.add('active');
  }
  if (advancedShapeSelect.value !== nextShape) {
    advancedShapeSelect.value = nextShape;
  }
  if (shouldDraw !== false) {
    redrawForPathChange();
  }
}

function refreshKidThreadPicker() {
  kidThreadPicker.style.display = threads.length > 1 ? 'inline-flex' : 'none';
  removeLastThreadBtn.style.display = threads.length > 1 ? '' : 'none';
  kidThreadMenu.innerHTML = '';
  removeLastThreadBtn.disabled = threads.length <= 1;

  if (!threads.length) {
    kidThreadToggle.disabled = true;
    kidThreadActiveLabel.textContent = 'No threads';
    applyThreadSwatchStyle(kidThreadActiveSwatch, '#cccccc');
    return;
  }

  kidThreadToggle.disabled = false;

  function getFrameModeBadge(thread) {
    if (!nestedFrameEnabled || !thread) return '';
    var mode = sanitizeThreadFrameMode(thread.frameMode, 'outer');
    if (mode === 'inner') return ' I';
    if (mode === 'bridge') return ' O->I';
    if (mode === 'bridge-reverse') return ' I->O';
    if (mode === 'bridge-reverse-project') return ' I->R';
    return ' O';
  }

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var option = document.createElement('button');
    option.type = 'button';
    option.className = 'kid-thread-option' + (i === selectedThreadIndex ? ' active' : '');
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', i === selectedThreadIndex ? 'true' : 'false');
    option.dataset.index = String(i);

    var swatch = document.createElement('span');
    swatch.className = 'thread-swatch';
    applyThreadSwatchStyle(swatch, thread.color);

    var label = document.createElement('span');
    label.textContent = 'Thread ' + (i + 1) + getFrameModeBadge(thread);

    option.appendChild(swatch);
    option.appendChild(label);
    kidThreadMenu.appendChild(option);
  }

  var selectedIndex = getKidTargetThreadIndex();
  var selectedThread = threads[selectedIndex];
  if (selectedThread) {
    kidThreadActiveLabel.textContent = 'Thread ' + (selectedIndex + 1) + getFrameModeBadge(selectedThread);
    applyThreadSwatchStyle(kidThreadActiveSwatch, selectedThread.color);
  }
}

function getKidTargetThreadIndex() {
  if (!threads.length) return -1;
  if (selectedThreadIndex >= 0 && selectedThreadIndex < threads.length) {
    return selectedThreadIndex;
  }
  return 0;
}

function syncKidControlsFromSelectedThread() {
  if (currentExperienceId !== 'stitching') {
    setElementDisplay(addMagicThreadBtn, false, '');
    setElementDisplay(removeLastThreadBtn, false, '');
    setElementDisplay(kidThreadPicker, false, '');
    setElementDisplay(addThreadBtn, false, '');
    setElementDisplay(advancedThreadsTitle, false, '');
    setElementDisplay(threadControlsContainer, false, '');
    syncBasicMathSliderVisibility();
    syncNestedFrameControls();
    return;
  }

  var index = getKidTargetThreadIndex();
  syncJumpBoundsFromHoleCount();
  refreshKidThreadPicker();
  if (index < 0) return;
  ensureThreadConnectConfig(threads[index]);
  var sourceHoleCount = getThreadSourceHoleCount(threads[index]);
  var sourceJumpLimit = Math.max(1, sourceHoleCount - 1);
  normalizeThreadHoleDependentValues(threads[index], sourceHoleCount);
  if (startHoleInput) {
    startHoleInput.max = String(sourceHoleCount);
    startHoleInput.value = String(threads[index].startHole);
  }
  if (jumpSlider) {
    jumpSlider.max = String(sourceJumpLimit);
  }
  jumpSlider.value = threads[index].jump;
  multiplySlider.value = threads[index].connectMultiplier;
  if (kidJumpSequenceInput) {
    kidJumpSequenceInput.value = String(threads[index].jumpSequence || '');
    kidJumpSequenceInput.placeholder = sanitizeThreadSequenceMode(threads[index].jumpSequenceMode, 'holes') === 'steps'
      ? 'e.g. 2,3,5,8'
      : 'e.g. 1,1,2,3,5,8';
  }
  if (kidSequenceModeSelect) {
    kidSequenceModeSelect.value = sanitizeThreadSequenceMode(threads[index].jumpSequenceMode, 'holes');
  }
  if (kidJumpFormulaInput) {
    kidJumpFormulaInput.value = String(threads[index].jumpFormula || 'skip');
  }
  widthSlider.value = threads[index].width;
  syncKidStitchByControl();
  syncBasicMathSliderVisibility();
  syncNestedFrameControls();
  updateKidControlValues();
}

function applyDefaultHoles() {
  holesSlider.value = String(DEFAULT_HOLES);
  if (advancedHolesNumberInput) {
    advancedHolesNumberInput.value = String(DEFAULT_HOLES);
  }
  syncJumpBoundsFromHoleCount();
  updateKidControlValues();
}

function applyDefaultSkipAndSize() {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex >= 0 && threads[targetIndex]) {
    threads[targetIndex].jump = DEFAULT_SKIP;
    threads[targetIndex].width = DEFAULT_THREAD_SIZE;
  }
  jumpSlider.value = String(DEFAULT_SKIP);
  widthSlider.value = String(DEFAULT_THREAD_SIZE);
  updateKidControlValues();
}

function syncAdvancedTempoControls() {
  var allowedTempos = getActiveTempoOptions();
  if (allowedTempos.indexOf(currentAnimationBpm) === -1) {
    currentAnimationBpm = getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM;
  }
  advancedTempoInput.value = String(currentAnimationBpm);
  advancedTempoValue.textContent = String(currentAnimationBpm);
}

function syncKidTempoPresetControls() {
  if (!kidTempoSlowBtn || !kidTempoNormalBtn || !kidTempoFastBtn) return;
  var presets = getKidTempoPresetsForSong(currentSongId);
  var activePreset = null;
  if (currentAnimationBpm === presets.slow) activePreset = 'slow';
  if (currentAnimationBpm === presets.normal) activePreset = 'normal';
  if (currentAnimationBpm === presets.fast) activePreset = 'fast';

  kidTempoSlowBtn.classList.toggle('is-active', activePreset === 'slow');
  kidTempoNormalBtn.classList.toggle('is-active', activePreset === 'normal');
  kidTempoFastBtn.classList.toggle('is-active', activePreset === 'fast');

  kidTempoSlowBtn.setAttribute('aria-pressed', activePreset === 'slow' ? 'true' : 'false');
  kidTempoNormalBtn.setAttribute('aria-pressed', activePreset === 'normal' ? 'true' : 'false');
  kidTempoFastBtn.setAttribute('aria-pressed', activePreset === 'fast' ? 'true' : 'false');
}

function applyTempoValue(bpm, options) {
  options = options || {};
  var parsed = Math.round(Number(bpm));
  var allowedTempos = getActiveTempoOptions();
  if (!isFinite(parsed) || allowedTempos.indexOf(parsed) === -1) {
    parsed = getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM;
  }
  currentAnimationBpm = parsed;
  syncAdvancedTempoControls();
  syncKidTempoPresetControls();
  recordCurrentExperiencePlaybackPreference();
  if (!options.suppressRedraw) {
    // Tempo change updates playback speed without resetting progress.
    redrawAnimationInPlace();
  }
  if (!options.suppressUrlSync) {
    scheduleUrlStateSync(false);
  }
}

function syncAnimateButtonLabel() {
  if (!animateBtn) return;
  if (animationPlaybackState === 'playing') {
    animateBtn.innerHTML = '<span class="pause-bars" aria-hidden="true">||</span> Pause';
    animateBtn.classList.add('is-playing');
    animateBtn.setAttribute('aria-pressed', 'true');
    animateBtn.setAttribute('aria-label', 'Pause stitch animation');
    animateBtn.title = 'Pause stitch animation';
    return;
  }
  if (animationPlaybackState === 'paused') {
    animateBtn.textContent = '▶ Resume';
    animateBtn.classList.remove('is-playing');
    animateBtn.setAttribute('aria-pressed', 'false');
    animateBtn.setAttribute('aria-label', 'Resume stitch animation');
    animateBtn.title = 'Resume stitch animation';
    return;
  }
  animateBtn.textContent = '▶ Play';
  animateBtn.classList.remove('is-playing');
  animateBtn.setAttribute('aria-pressed', 'false');
  animateBtn.setAttribute('aria-label', 'Start stitch animation');
  animateBtn.title = 'Start stitch animation';
}

function applyDefaultTempo() {
  applyTempoValue(getKidTempoPresetsForSong(currentSongId).slow || DEFAULT_ANIMATION_BPM);
}

function stopAnimationIfActive() {
  if (!animationActive && !animationState && !triangulaAnimationState && !squarusAnimationState && !mashrabiyaAnimationState) return;
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  squarusAnimationState = null;
  mashrabiyaAnimationState = null;
  animationPlaybackState = 'idle';
  syncAnimateButtonLabel();
  clearHighlightedHoleNumbers();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
}

function pauseAnimationIfActive() {
  if (!animationActive || (!animationState && !triangulaAnimationState && !squarusAnimationState && !mashrabiyaAnimationState)) return;
  animationActive = false;
  view.onFrame = null;
  animationPlaybackState = 'paused';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
}

function redrawForPathChange() {
  // Path/topology changes invalidate the current stitch progression.
  stopAnimationIfActive();
  drawStatic();
  scheduleDiscoveryEvaluation();
  scheduleUrlStateSync(false);
}

function drawAnimatedSegments(thread, segments, segmentCount) {
  if (!segments || !segments.length || segmentCount <= 0) return;
  var maxSegments = Math.min(segmentCount, segments.length);
  for (var i = 0; i < maxSegments; i++) {
    var parts = getThreadSegmentDrawParts(thread, segments[i]);
    for (var p = 0; p < parts.length; p++) {
      var seg = new Path();
      seg.strokeWidth = thread.width;
      if (thread.color === 'rainbow') {
        seg.strokeColor = rainbowColor(i / Math.max(1, segments.length));
      } else {
        seg.strokeColor = thread.color;
      }
      seg.add(parts[p].fromPoint);
      seg.add(parts[p].toPoint);
    }
  }
}

function getAnimationSecondsPerSegment() {
  var secondsPerSegment = (60 / currentAnimationBpm) * BEATS_PER_STITCH_SEGMENT;
  if (!isFinite(secondsPerSegment) || secondsPerSegment <= 0) {
    secondsPerSegment = (60 / DEFAULT_ANIMATION_BPM) * BEATS_PER_STITCH_SEGMENT;
  }
  return secondsPerSegment;
}

function drawAnimatedSegmentProgress(thread, segments, segmentIndex, progress) {
  if (!segments || !segments.length || segmentIndex < 0 || segmentIndex >= segments.length) return null;

  var endpoint = getThreadSegmentEndpoints(thread, segments[segmentIndex]);
  if (!endpoint) return null;
  var startPoint = endpoint.fromPoint;
  var endPoint = endpoint.toPoint;

  var p = Math.max(0, Math.min(1, progress));
  // A slight ease-out makes the pull feel more organic without changing tempo.
  var eased = 1 - Math.pow(1 - p, 2);
  var currentPoint = startPoint.add(endPoint.subtract(startPoint).multiply(eased));

  var seg = new Path();
  seg.strokeWidth = thread.width;

  if (thread.color === 'rainbow') {
    seg.strokeColor = rainbowColor(segmentIndex / Math.max(1, segments.length));
  } else {
    seg.strokeColor = thread.color;
  }

  seg.add(startPoint);
  seg.add(currentPoint);

  if (p < 1) {
    var pullHead = new Path.Circle(currentPoint, Math.max(1.8, thread.width * 0.7));
    pullHead.fillColor = seg.strokeColor;
    pullHead.opacity = 0.88;
  }

  return endpoint.highlightPair;
}

function drawSegmentSettleAccent(settle) {
  if (!settle || settle.remaining <= 0 || settle.duration <= 0) return;
  if (settle.threadIndex < 0 || settle.threadIndex >= threads.length) return;

  var segments = settle.segments;
  if (!segments || !segments.length || settle.segmentIndex < 0 || settle.segmentIndex >= segments.length) return;

  var thread = threads[settle.threadIndex];
  var endpoint = getThreadSegmentEndpoints(thread, segments[settle.segmentIndex]);
  if (!endpoint) return;
  var startPoint = endpoint.fromPoint;
  var endPoint = endpoint.toPoint;

  var ratio = Math.max(0, Math.min(1, settle.remaining / settle.duration));
  var settleStrength = ratio * ratio;
  var distance = startPoint.getDistance(endPoint);
  var overshootAmount = Math.min(8, distance * STITCH_PULL_SETTLE_OVERSHOOT * settleStrength);
  if (overshootAmount <= 0.01) return;

  // Blend incoming and outgoing directions so the overshoot follows local flow.
  var incoming = endPoint.subtract(startPoint);
  if (incoming.length <= 0) return;

  var nextSegment = segments[(settle.segmentIndex + 1) % segments.length];
  var nextEndpoint = nextSegment ? getThreadSegmentEndpoints(thread, nextSegment) : null;
  var nextPoint = nextEndpoint ? nextEndpoint.toPoint : null;
  var outgoing = nextPoint ? nextPoint.subtract(endPoint) : null;

  var tangent = incoming.normalize(1);
  if (outgoing && outgoing.length > 0) {
    tangent = incoming.normalize(0.7).add(outgoing.normalize(0.3));
    if (tangent.length <= 0) {
      tangent = incoming.normalize(1);
    }
  }

  var overshootPoint = endPoint.add(tangent.normalize(overshootAmount));

  var color = thread.color === 'rainbow'
    ? rainbowColor(settle.segmentIndex / Math.max(1, segments.length))
    : thread.color;

  var settleLine = new Path();
  settleLine.strokeColor = color;
  settleLine.strokeWidth = Math.max(1, thread.width * (0.75 + 0.35 * ratio));
  settleLine.opacity = 0.65 * ratio;
  settleLine.add(endPoint);
  settleLine.add(overshootPoint);

  var settleHead = new Path.Circle(overshootPoint, Math.max(1.4, thread.width * 0.55));
  settleHead.fillColor = color;
  settleHead.opacity = 0.7 * ratio;
}

function renderAnimationFrame() {
  if (!animationState) {
    drawStatic();
    return;
  }

  project.activeLayer.removeChildren();
  computePoints();
  drawShapeBorder();
  drawHoles();

  for (var i = 0; i < animationState.threadIndex; i++) {
    drawAnimatedSegments(threads[i], animationState.segmentLists[i], (animationState.segmentLists[i] || []).length);
  }

  var activePair = null;
  if (animationState.threadIndex >= 0 && animationState.threadIndex < threads.length) {
    var activeThread = threads[animationState.threadIndex];
    var activeSegments = animationState.segmentLists[animationState.threadIndex] || [];

    drawAnimatedSegments(activeThread, activeSegments, animationState.step);

    if (animationState.step < activeSegments.length) {
      var segmentProgress = animationState.elapsed / getAnimationSecondsPerSegment();
      activePair = drawAnimatedSegmentProgress(activeThread, activeSegments, animationState.step, segmentProgress);
    }
  }

  drawSegmentSettleAccent(animationState.settle);

  animationState.activeHolePair = activePair;
  syncHoleNumberHighlightFromAnimationState();
  bringHoleNumbersToFront();
}

function redrawAnimationInPlace() {
  // Style-only updates should preserve current animation progress.
  if (squarusAnimationState) {
    renderSquarusAnimationStateFrame(squarusAnimationState);
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  if (triangulaAnimationState) {
    renderTriangulaAnimationStateFrame(triangulaAnimationState);
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  if (mashrabiyaAnimationState) {
    renderMashrabiyaAnimationStateFrame(mashrabiyaAnimationState);
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  if (!animationState) {
    drawStatic();
    scheduleDiscoveryEvaluation();
    scheduleUrlStateSync(false);
    return;
  }

  renderAnimationFrame();
  scheduleDiscoveryEvaluation();
  scheduleUrlStateSync(false);
}

function scheduleFitCanvasToStage() {
  if (pendingCanvasFit) return;
  pendingCanvasFit = true;
  requestAnimationFrame(function() {
    pendingCanvasFit = false;
    fitCanvasToStage();
  });
}

function fitCanvasToStage() {
  var stageHost = canvasStage.parentElement || canvasContainer;
  var containerRect = stageHost.getBoundingClientRect();

  var maxWidth = parseFloat(getComputedStyle(canvasStage).maxWidth);
  if (!isFinite(maxWidth) || maxWidth <= 0) {
    maxWidth = Infinity;
  }

  var viewportCap = Infinity;
  if (window.visualViewport) {
    viewportCap = Math.min(window.visualViewport.width, window.visualViewport.height);
  }

  var size = Math.floor(Math.min(containerRect.width, containerRect.height, maxWidth, viewportCap));

  if ((!isFinite(size) || size <= 0) && canvasContainer) {
    var fallbackWidth = canvasContainer.clientWidth || 0;
    var fallbackHeight = canvasContainer.clientHeight || 0;
    size = Math.floor(Math.min(fallbackWidth, fallbackHeight, maxWidth));
  }

  if (!isFinite(size) || size <= 0) return;

  // Keep the stage physically square so canvas rendering never stretches.
  var pixelSize = size + 'px';
  if (canvasStage.style.width !== pixelSize) {
    canvasStage.style.width = pixelSize;
  }
  if (canvasStage.style.height !== pixelSize) {
    canvasStage.style.height = pixelSize;
  }

  if (view.viewSize.width === size && view.viewSize.height === size) {
    if (!project.activeLayer.children.length) {
      drawStatic();
    }
    return;
  }

  view.viewSize = new Size(size, size);

  // Viewport changes (zoom/orientation) can invalidate frame timing/state.
  // Always normalize playback state so controls never get stuck in paused/resume limbo.
  if (animationActive || animationPlaybackState === 'paused') {
    stopAnimationIfActive();
  }

  drawStatic();
}

/* ------------------------------
   RAINBOW HELPER
------------------------------ */
function rainbowColor(t) {
  return new Color({ hue: t * 360, saturation: 1, brightness: 1 });
}

/* ------------------------------
   SHAPE GENERATION
------------------------------ */
var currentShape = "circle";

function getShapeGeometry() {
  var radius = Math.min(view.size.width, view.size.height) * 0.35;
  var center = view.center.clone();
  var sampleCount = 360;
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;

  // Auto-center by the shape's own bounding box so all frame types stay centered
  // without maintaining hand-tuned per-shape offsets.
  for (var i = 0; i < sampleCount; i++) {
    var t = (2 * Math.PI * i) / sampleCount;
    var p = shapePointAtAngle(t, new Point(0, 0), radius);
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  var shapeBoundsCenter = new Point((minX + maxX) * 0.5, (minY + maxY) * 0.5);
  center = center.subtract(shapeBoundsCenter);

  return {
    center: center,
    radius: radius
  };
}

function polygonPoint(theta, sides, radius, center) {
  var sector = (2 * Math.PI) / sides;
  var a = ((theta % sector) + sector) % sector - sector / 2;
  var r = radius * Math.cos(Math.PI / sides) / Math.cos(a);
  return new Point(
    center.x + r * Math.cos(theta),
    center.y + r * Math.sin(theta)
  );
}

function shapePointAtAngle(t, center, radius) {

  if (currentShape === 'triangle') {
    var trianglePoint = polygonPoint(t, 3, radius, center);
    return trianglePoint.rotate(-90, center);
  }

  if (currentShape === 'square') {
    var c = Math.cos(t);
    var s = Math.sin(t);
    var m = Math.max(Math.abs(c), Math.abs(s));
    return new Point(
      center.x + (radius * c) / m,
      center.y + (radius * s) / m
    );
  }

  if (currentShape === 'star') {
    var starRadius = radius * (0.62 + 0.38 * Math.cos(5 * t));
    return new Point(
      center.x + starRadius * Math.cos(t - Math.PI / 2),
      center.y + starRadius * Math.sin(t - Math.PI / 2)
    );
  }

  if (currentShape === 'heart') {
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    var scale = radius / 18;
    return new Point(
      center.x + x * scale,
      center.y - y * scale
    );
  }

  return new Point(
    center.x + radius * Math.cos(t),
    center.y + radius * Math.sin(t)
  );
}

function buildShapeBoundarySamples(sampleCount, center, radius) {
  var samples = [];
  var angleOffset = currentShape === 'square' ? -Math.PI / 2 : 0;
  for (var i = 0; i < sampleCount; i++) {
    var t = angleOffset + ((2 * Math.PI * i) / sampleCount);
    samples.push(shapePointAtAngle(t, center, radius));
  }
  return samples;
}

function sampleEvenlyAlongClosedPolyline(vertices, count) {
  if (!vertices || !vertices.length || count <= 0) return [];

  var edgeLengths = [];
  var totalLength = 0;

  for (var i = 0; i < vertices.length; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % vertices.length];
    var edgeLength = start.getDistance(end);
    edgeLengths.push(edgeLength);
    totalLength += edgeLength;
  }

  if (!isFinite(totalLength) || totalLength <= 0) {
    return [vertices[0]];
  }

  var result = [];
  var stepLength = totalLength / count;
  var edgeIndex = 0;
  var traversed = 0;

  for (var targetIndex = 0; targetIndex < count; targetIndex++) {
    var targetDistance = targetIndex * stepLength;

    while (
      edgeIndex < edgeLengths.length - 1 &&
      traversed + edgeLengths[edgeIndex] < targetDistance
    ) {
      traversed += edgeLengths[edgeIndex];
      edgeIndex++;
    }

    var edgeStart = vertices[edgeIndex];
    var edgeEnd = vertices[(edgeIndex + 1) % vertices.length];
    var edgeLen = edgeLengths[edgeIndex];
    var localDistance = targetDistance - traversed;
    var ratio = edgeLen > 0 ? localDistance / edgeLen : 0;

    result.push(edgeStart.add(edgeEnd.subtract(edgeStart).multiply(ratio)));
  }

  return result;
}

function computePoints() {
  var outerCount = getCurrentStitchHoleCount();
  var innerCount = getCurrentInnerStitchHoleCount();
  var geometry = getShapeGeometry();
  var center = geometry.center;
  var radius = geometry.radius;

  points = [];
  outerFramePoints = [];
  innerFramePoints = [];
  if (!isFinite(outerCount) || outerCount < 3) return;

  // Circle already has exact uniform spacing with equal-angle sampling.
  if (currentShape === 'circle') {
    for (var i = 0; i < outerCount; i++) {
      var t = (-Math.PI / 2) + ((2 * Math.PI * i) / outerCount);
      outerFramePoints.push(shapePointAtAngle(t, center, radius));
    }

    if (nestedFrameEnabled && innerCount > 0) {
      var innerRadiusCircle = radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
      for (var ci = 0; ci < innerCount; ci++) {
        var tc = (-Math.PI / 2) + ((2 * Math.PI * ci) / innerCount);
        innerFramePoints.push(shapePointAtAngle(tc, center, innerRadiusCircle));
      }
    }
    points = nestedFrameEnabled ? outerFramePoints.concat(innerFramePoints) : outerFramePoints.slice();
    return;
  }

  // Non-circular shapes need perimeter-based resampling for visual uniformity.
  var sampleCount = Math.max(360, outerCount * 12);
  var boundarySamples = buildShapeBoundarySamples(sampleCount, center, radius);
  outerFramePoints = sampleEvenlyAlongClosedPolyline(boundarySamples, outerCount);

  if (nestedFrameEnabled && innerCount > 0) {
    var innerRadius = radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO);
    var innerBoundarySamples = buildShapeBoundarySamples(sampleCount, center, innerRadius);
    innerFramePoints = sampleEvenlyAlongClosedPolyline(innerBoundarySamples, innerCount);
  }

  points = nestedFrameEnabled ? outerFramePoints.concat(innerFramePoints) : outerFramePoints.slice();
}

function signedAreaOfClosedPolyline(vertices) {
  if (!vertices || vertices.length < 3) return 0;
  var twiceArea = 0;
  for (var i = 0; i < vertices.length; i++) {
    var current = vertices[i];
    var next = vertices[(i + 1) % vertices.length];
    twiceArea += (current.x * next.y) - (next.x * current.y);
  }
  return twiceArea / 2;
}

function offsetClosedPolyline(vertices, distance) {
  if (!vertices || vertices.length < 3 || !isFinite(distance) || distance === 0) {
    return vertices ? vertices.slice() : [];
  }

  var ccw = signedAreaOfClosedPolyline(vertices) > 0;
  var outwardRotation = ccw ? -90 : 90;
  var result = [];

  for (var i = 0; i < vertices.length; i++) {
    var prev = vertices[(i - 1 + vertices.length) % vertices.length];
    var curr = vertices[i];
    var next = vertices[(i + 1) % vertices.length];

    var incoming = curr.subtract(prev);
    var outgoing = next.subtract(curr);

    var n1 = incoming.length > 0 ? incoming.normalize(1).rotate(outwardRotation) : null;
    var n2 = outgoing.length > 0 ? outgoing.normalize(1).rotate(outwardRotation) : null;

    var normal = null;
    if (n1 && n2) {
      normal = n1.add(n2);
      if (normal.length <= 1e-6) {
        normal = n1;
      }
    } else {
      normal = n1 || n2;
    }

    if (!normal || normal.length <= 1e-6) {
      var tangent = next.subtract(prev);
      normal = tangent.length > 0 ? tangent.normalize(1).rotate(outwardRotation) : new Point(0, -1);
    }

    result.push(curr.add(normal.normalize(distance)));
  }

  return result;
}

function lineIntersection(a1, a2, b1, b2) {
  var r = a2.subtract(a1);
  var s = b2.subtract(b1);
  var rxs = r.cross(s);
  if (Math.abs(rxs) <= 1e-8) {
    return null;
  }
  var t = b1.subtract(a1).cross(s) / rxs;
  return a1.add(r.multiply(t));
}

function lineSegmentIntersection(lineStart, lineEnd, segmentStart, segmentEnd) {
  var lineDir = lineEnd.subtract(lineStart);
  var segDir = segmentEnd.subtract(segmentStart);
  var cross = lineDir.cross(segDir);
  if (Math.abs(cross) <= 1e-8) {
    return null;
  }

  var delta = segmentStart.subtract(lineStart);
  var t = delta.cross(segDir) / cross;
  var u = delta.cross(lineDir) / cross;
  if (u < -1e-7 || u > 1 + 1e-7) {
    return null;
  }

  return lineStart.add(lineDir.multiply(t));
}

function getOuterBoundaryVerticesForProjection() {
  var geometry = getShapeGeometry();
  var polygonVertices = getPolygonCornerVerticesForGeometry(geometry);
  if (polygonVertices && polygonVertices.length >= 3) {
    return polygonVertices;
  }
  return buildShapeBoundarySamples(960, geometry.center, geometry.radius);
}

function getOuterIntersectionsForInfiniteLine(lineStart, lineEnd) {
  var vertices = getOuterBoundaryVerticesForProjection();
  if (!vertices || vertices.length < 2) return [];

  var hits = [];
  for (var i = 0; i < vertices.length; i++) {
    var segmentStart = vertices[i];
    var segmentEnd = vertices[(i + 1) % vertices.length];
    var hit = lineSegmentIntersection(lineStart, lineEnd, segmentStart, segmentEnd);
    if (!hit) continue;

    var duplicate = false;
    for (var h = 0; h < hits.length; h++) {
      if (hits[h].getDistance(hit) <= 0.5) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) {
      hits.push(hit);
    }
  }

  return hits;
}

function getPolygonCornerVertices() {
  var geometry = getShapeGeometry();
  return getPolygonCornerVerticesForGeometry(geometry);
}

function getPolygonCornerVerticesForGeometry(geometry) {
  var vertices = [];
  if (!geometry) return null;

  if (currentShape === 'triangle') {
    for (var i = 0; i < 3; i++) {
      var tTri = i * 2 * Math.PI / 3;
      vertices.push(shapePointAtAngle(tTri, geometry.center, geometry.radius));
    }
    return vertices;
  }

  if (currentShape === 'square') {
    for (var j = 0; j < 4; j++) {
      var tSq = (Math.PI / 4) + (j * Math.PI / 2);
      vertices.push(shapePointAtAngle(tSq, geometry.center, geometry.radius));
    }
    return vertices;
  }

  return null;
}

function offsetConvexPolygon(vertices, distance) {
  if (!vertices || vertices.length < 3 || !isFinite(distance) || distance === 0) {
    return vertices ? vertices.slice() : [];
  }

  var n = vertices.length;
  var ccw = signedAreaOfClosedPolyline(vertices) > 0;
  var outwardRotation = ccw ? -90 : 90;
  var offsetLines = [];

  for (var i = 0; i < n; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % n];
    var edge = end.subtract(start);
    if (edge.length <= 1e-8) continue;

    var outward = edge.normalize(1).rotate(outwardRotation).normalize(distance);
    offsetLines.push({
      p1: start.add(outward),
      p2: end.add(outward)
    });
  }

  if (offsetLines.length < 3) {
    return vertices.slice();
  }

  var result = [];
  for (var k = 0; k < offsetLines.length; k++) {
    var prevLine = offsetLines[(k - 1 + offsetLines.length) % offsetLines.length];
    var thisLine = offsetLines[k];
    var corner = lineIntersection(prevLine.p1, prevLine.p2, thisLine.p1, thisLine.p2);
    if (!corner) {
      corner = thisLine.p1;
    }
    result.push(corner);
  }

  return result;
}

function drawShapeBorder() {
  if (!borderEnabled) return;
  var borderStrokeColor = getThemeBorderStrokeColor();

  function drawBorderPair(borderGeometry) {
    if (!borderGeometry || !borderGeometry.outerSamples || !borderGeometry.innerSamples) return;

    var polygonVertices = borderGeometry.isPolygon ? borderGeometry.polygonVertices : null;

    var outerPath = new Path(borderGeometry.outerSamples);
    outerPath.closed = true;
    outerPath.strokeColor = borderStrokeColor;
    outerPath.strokeWidth = BORDER_STROKE_WIDTH;
    outerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
    outerPath.strokeCap = 'round';
    outerPath.miterLimit = 8;

    var innerPath = new Path(borderGeometry.innerSamples);
    innerPath.closed = true;
    innerPath.strokeColor = borderStrokeColor;
    innerPath.strokeWidth = BORDER_STROKE_WIDTH;
    innerPath.strokeJoin = polygonVertices ? 'miter' : 'round';
    innerPath.strokeCap = 'round';
    innerPath.miterLimit = 8;
  }

  drawBorderPair(getBorderGeometryForCurrentShape());

  if (!nestedFrameEnabled) return;
  var geometry = getShapeGeometry();
  var nestedGeometry = {
    center: geometry.center,
    radius: geometry.radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)
  };
  drawBorderPair(getBorderGeometryForGeometry(nestedGeometry));
}

function getBorderGeometryForCurrentShape() {
  return getBorderGeometryForGeometry(getShapeGeometry());
}

function getBorderGeometryForGeometry(geometry) {
  if (!geometry) return null;

  var polygonVertices = getPolygonCornerVerticesForGeometry(geometry);
  var outerSamples;
  var innerSamples;

  if (polygonVertices && polygonVertices.length >= 3) {
    // For polygons, offset exact edges and intersect them for crisp, stable corners.
    outerSamples = offsetConvexPolygon(polygonVertices, BORDER_OUTER_GAP);
    innerSamples = offsetConvexPolygon(polygonVertices, -BORDER_INNER_GAP);
  } else {
    // Curved/organic shapes continue to use dense polyline offsets.
    var boundarySamples = buildShapeBoundarySamples(480, geometry.center, geometry.radius);
    if (!boundarySamples.length) return;
    outerSamples = offsetClosedPolyline(boundarySamples, BORDER_OUTER_GAP);
    innerSamples = offsetClosedPolyline(boundarySamples, -BORDER_INNER_GAP);
  }

  return {
    outerSamples: outerSamples,
    innerSamples: innerSamples,
    isPolygon: !!(polygonVertices && polygonVertices.length >= 3),
    polygonVertices: polygonVertices
  };
}

/* ------------------------------
   DRAWING THREADS
------------------------------ */
function computeSequence(thread, holeCount) {
  var n = parseBoundedInt(holeCount, 3, MAX_HOLES, getCurrentStitchHoleCount());
  if (!n) return [];

  if (thread.sequence && thread.sequence.type === 'custom') {
    return thread.sequence.list;
  }

  var jumpMode = thread.jumpMode || 'fixed';
  if (!isExpressionStitchModeEnabled() && jumpMode === 'formula') {
    jumpMode = 'fixed';
  }
  var visited = new Array(n).fill(false);
  var startIndex = parseBoundedInt(thread.startHole, 1, n, 1) - 1;
  var current = startIndex;
  var prev = startIndex;
  var seq = [];
  var maxSteps = n * 4;

  function normalizeJump(value) {
    var k = Math.round(Number(value));
    if (!isFinite(k)) return 1;
    k = k % n;
    if (k === 0) return 1;
    return k;
  }

  function parseJumpSequence(text) {
    if (!text) return [];
    return text
      .split(/[\s,]+/)
      .map(Number)
      .filter((num) => isFinite(num))
      .map((num) => Math.round(num))
      .filter((num) => num !== 0);
  }

  function parseHoleSequence(text) {
    if (!text) return [];
    var values = text
      .split(/[\s,]+/)
      .map(Number)
      .filter((num) => isFinite(num))
      .map((num) => Math.round(num));

    var parsed = [];
    for (var idx = 0; idx < values.length; idx++) {
      var label = values[idx];
      if (label > n) {
        break;
      }
      if (label < 1) {
        continue;
      }
      parsed.push(label - 1);
    }
    return parsed;
  }

  function normalizeFormulaExpression(expression) {
    if (!expression) return 'skip';
    return String(expression)
      .trim()
      .replace(/[×·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/\bmod\b/gi, '%');
  }

  var jumpResolver;
  if (jumpMode === 'sequence') {
    var sequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    if (sequenceMode === 'holes') {
      return parseHoleSequence(thread.jumpSequence);
    }
    var stepList = parseJumpSequence(thread.jumpSequence);
    jumpResolver = function(i) {
      if (!stepList.length) return normalizeJump(thread.jump);
      return normalizeJump(stepList[i % stepList.length]);
    };
  } else if (jumpMode === 'formula') {
    var formula = normalizeFormulaExpression(thread.jumpFormula || 'skip');
    jumpResolver = function(i, currentIndex, previousIndex) {
      try {
        var evaluate = new Function(
          'i', 'n', 'current', 'prev', 'skip', 'jump',
          'abs', 'floor', 'ceil', 'round', 'sqrt', 'pow', 'min', 'max', 'sin', 'cos', 'tan', 'pi',
          'return (' + formula + ');'
        );
        return normalizeJump(
          evaluate(
            i, n, currentIndex, previousIndex, thread.jump, thread.jump,
            Math.abs, Math.floor, Math.ceil, Math.round, Math.sqrt, Math.pow,
            Math.min, Math.max, Math.sin, Math.cos, Math.tan, Math.PI
          )
        );
      } catch (err) {
        return normalizeJump(thread.jump);
      }
    };
  } else {
    jumpResolver = function() {
      return normalizeJump(thread.sequence ? thread.sequence.k : thread.jump);
    };
  }

  for (var i = 0; i < maxSteps; i++) {
    if (visited[current]) break;
    visited[current] = true;
    seq.push(current);
    var step = jumpResolver(i, current, prev);
    prev = current;
    current = (current + step) % n;
    if (current < 0) current += n;
  }
  return seq;
}

function computeSegments(thread) {
  var nOuter = getCurrentStitchHoleCount();
  var nInner = nestedFrameEnabled ? getCurrentInnerStitchHoleCount() : 0;
  if (!nOuter || !thread) return [];

  function resolveFrameMode() {
    if (!nestedFrameEnabled) return 'outer';
    return sanitizeThreadFrameMode(thread.frameMode, 'outer');
  }

  function countForRing(ring) {
    if (ring === 'inner') {
      return nInner > 0 ? nInner : nOuter;
    }
    return nOuter;
  }

  function toGlobalIndex(localIndex, ring) {
    var ringCount = countForRing(ring);
    var idx = ((localIndex % ringCount) + ringCount) % ringCount;
    if (ring === 'inner' && nestedFrameEnabled && nInner > 0) {
      return nOuter + idx;
    }
    return idx;
  }

  function remapLocalIndex(localIndex, fromCount, toCount) {
    if (!isFinite(fromCount) || fromCount <= 0 || !isFinite(toCount) || toCount <= 0) return 0;
    var normalized = ((localIndex % fromCount) + fromCount) % fromCount;
    // Use nearest angular neighbor when mapping between rings.
    var projected = Math.round((normalized * toCount) / fromCount);
    return ((projected % toCount) + toCount) % toCount;
  }

  function remapInnerToOuterBridge(localInnerIndex) {
    if (!isFinite(localInnerIndex) || nInner <= 0 || nOuter <= 0) {
      return 0;
    }
    var normalized = ((localInnerIndex % nInner) + nInner) % nInner;
    // Deterministic index-proportional mapping from inner ring to outer ring.
    var projected = Math.floor((normalized * nOuter) / nInner);
    return ((projected % nOuter) + nOuter) % nOuter;
  }

  function mapPair(sourceLocal, mappedLocal) {
    var frameMode = resolveFrameMode();
    var sourceRing = 'outer';
    var targetRing = 'outer';
    if (frameMode === 'inner') {
      sourceRing = 'inner';
      targetRing = 'inner';
    } else if (frameMode === 'bridge') {
      sourceRing = 'outer';
      targetRing = 'inner';
    } else if (frameMode === 'bridge-reverse') {
      sourceRing = 'inner';
      targetRing = 'outer';
    } else if (frameMode === 'bridge-reverse-project') {
      sourceRing = 'inner';
      targetRing = 'inner';
    }

    var sourceCount = countForRing(sourceRing);
    var targetCount = countForRing(targetRing);
    var sourceResolved = ((sourceLocal % sourceCount) + sourceCount) % sourceCount;
    var targetResolved = remapLocalIndex(mappedLocal, sourceCount, targetCount);

    if (frameMode === 'bridge-reverse') {
      // Inner-gated bridge: each outward bridge passes through a relay inner hole.
      var relayInner = ((mappedLocal % sourceCount) + sourceCount) % sourceCount;
      var mappedOuter = remapInnerToOuterBridge(relayInner);
      var bridgeSegments = [];
      if (sourceResolved !== relayInner) {
        bridgeSegments.push([
          toGlobalIndex(sourceResolved, 'inner'),
          toGlobalIndex(relayInner, 'inner')
        ]);
      }
      bridgeSegments.push([
        toGlobalIndex(relayInner, 'inner'),
        toGlobalIndex(mappedOuter, 'outer')
      ]);
      return bridgeSegments;
    }

    return [[toGlobalIndex(sourceResolved, sourceRing), toGlobalIndex(targetResolved, targetRing)]];
  }

  var sourceHoleCount = getThreadSourceHoleCount(thread);
  if (!isFinite(sourceHoleCount) || sourceHoleCount < 1) return [];

  if (thread.jumpMode === 'connect') {
    ensureThreadConnectConfig(thread);
    var segments = [];
    var multiplier = Math.round(Number(thread.connectMultiplier || 2));
    var startOffset = parseBoundedInt(thread.startHole, 1, sourceHoleCount, 1) - 1;
    for (var i = 0; i < sourceHoleCount; i++) {
      // Multiplication mode honors startHole as ring phase origin.
      var sourceIndex = (startOffset + i) % sourceHoleCount;
      // i is 0-based within the phased ring; convert to 1-based for the multiplication rule.
      var phaseLabel = i + 1;
      var mapped = (startOffset + (multiplier * phaseLabel - 1)) % sourceHoleCount;
      if (mapped < 0) mapped += sourceHoleCount;
      var mappedSegments = mapPair(sourceIndex, mapped);
      for (var m = 0; m < mappedSegments.length; m++) {
        segments.push(mappedSegments[m]);
      }
    }
    return segments;
  }

  if (thread.jumpMode === 'sequence' && sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes') === 'holes') {
    var holeSequence = computeSequence(thread, sourceHoleCount);
    var holeSegments = [];
    for (var h = 0; h < holeSequence.length - 1; h++) {
      var mappedHoleSegments = mapPair(holeSequence[h], holeSequence[h + 1]);
      for (var hs = 0; hs < mappedHoleSegments.length; hs++) {
        holeSegments.push(mappedHoleSegments[hs]);
      }
    }
    return holeSegments;
  }

  var seq = computeSequence(thread, sourceHoleCount);
  var chained = [];
  for (var j = 0; j < seq.length; j++) {
    var mappedChainSegments = mapPair(seq[j], seq[(j + 1) % seq.length]);
    for (var cs = 0; cs < mappedChainSegments.length; cs++) {
      chained.push(mappedChainSegments[cs]);
    }
  }
  return chained;
}

function isThreadRadialProjectionMode(thread) {
  if (!nestedFrameEnabled) return false;
  return sanitizeThreadFrameMode(thread && thread.frameMode, 'outer') === 'bridge-reverse-project';
}

function getThreadSegmentEndpoints(thread, segment) {
  if (!segment || !segment.length) return null;
  var fromIndex = segment[0];
  var toIndex = segment[1];
  if (!isFinite(fromIndex) || !isFinite(toIndex)) return null;

  var fromPoint = points[fromIndex];
  var toPoint = points[toIndex];
  if (!fromPoint || !toPoint) return null;

  return {
    fromIndex: fromIndex,
    toIndex: toIndex,
    fromPoint: fromPoint,
    toPoint: toPoint,
    highlightPair: [fromIndex, toIndex]
  };
}

function getOuterProjectionPairForSegment(fromPoint, toPoint) {
  if (!fromPoint || !toPoint) return { fromHit: null, toHit: null };

  var segmentDirection = toPoint.subtract(fromPoint);
  var segmentLength = segmentDirection.length;
  if (segmentLength <= 0.001) return { fromHit: null, toHit: null };

  var unit = segmentDirection.normalize(1);
  var hits = getOuterIntersectionsForInfiniteLine(fromPoint, toPoint);
  if (!hits || !hits.length) return { fromHit: null, toHit: null };

  var fromHit = null;
  var toHit = null;
  var bestBefore = -Infinity;
  var bestAfter = Infinity;
  var minT = Infinity;
  var maxT = -Infinity;
  var minPoint = null;
  var maxPoint = null;

  for (var i = 0; i < hits.length; i++) {
    var t = hits[i].subtract(fromPoint).dot(unit);

    if (t < minT) {
      minT = t;
      minPoint = hits[i];
    }
    if (t > maxT) {
      maxT = t;
      maxPoint = hits[i];
    }

    if (t < -1e-4 && t > bestBefore) {
      bestBefore = t;
      fromHit = hits[i];
    }
    if (t > segmentLength + 1e-4 && t < bestAfter) {
      bestAfter = t;
      toHit = hits[i];
    }
  }

  // Fallback for edge/tangent degeneracies: use extremal hits along the segment axis.
  if (!fromHit) {
    fromHit = minPoint;
  }
  if (!toHit) {
    toHit = maxPoint;
  }

  return {
    fromHit: fromHit,
    toHit: toHit
  };
}

function getThreadSegmentDrawParts(thread, segment) {
  var endpoint = getThreadSegmentEndpoints(thread, segment);
  if (!endpoint) return [];

  if (!isThreadRadialProjectionMode(thread)) {
    return [
      {
        fromPoint: endpoint.fromPoint,
        toPoint: endpoint.toPoint
      }
    ];
  }

  var projection = getOuterProjectionPairForSegment(endpoint.fromPoint, endpoint.toPoint);
  var projectedFrom = projection.fromHit;
  var projectedTo = projection.toHit;
  var parts = [];

  if (projectedFrom && projectedFrom.getDistance(endpoint.fromPoint) > 0.001) {
    parts.push({ fromPoint: projectedFrom, toPoint: endpoint.fromPoint });
  }

  parts.push({ fromPoint: endpoint.fromPoint, toPoint: endpoint.toPoint });

  if (projectedTo && projectedTo.getDistance(endpoint.toPoint) > 0.001) {
    parts.push({ fromPoint: endpoint.toPoint, toPoint: projectedTo });
  }

  return parts;
}

function drawThread(thread) {
  var segments = computeSegments(thread);

  for (var i = 0; i < segments.length; i++) {
    var parts = getThreadSegmentDrawParts(thread, segments[i]);
    for (var p = 0; p < parts.length; p++) {
      var seg = new Path();
      seg.strokeWidth = thread.width;

      if (thread.color === 'rainbow') {
        seg.strokeColor = rainbowColor(i / Math.max(1, segments.length));
      } else {
        seg.strokeColor = thread.color;
      }

      seg.add(parts[p].fromPoint);
      seg.add(parts[p].toPoint);
    }
  }
}

function triangulaCountToDepth(count) {
  var safeCount = Math.max(1, Math.floor(Number(count) || 1));
  var depth = Math.round(Math.log(safeCount) / Math.log(3));
  if (!isFinite(depth) || depth < 0) depth = 0;
  return Math.max(0, Math.min(6, depth));
}

function getTriangulaBaseTriangle(scaleFactor) {
  var center = view.center;
  var baseSize = Math.max(120, Math.min(view.size.width, view.size.height) - 56);
  var scale = isFinite(scaleFactor) ? Math.max(0.45, Math.min(1, scaleFactor)) : 1;
  var size = baseSize * scale;
  var half = size / 2;
  var height = Math.sqrt(3) * half;
  return [
    new Point(center.x, center.y - (height / 2)),
    new Point(center.x - half, center.y + (height / 2)),
    new Point(center.x + half, center.y + (height / 2))
  ];
}

function normalizeTriangulaFillColor(colorValue, fallback) {
  var fallbackColor = fallback || '#256f7a';
  if (!colorValue) return fallbackColor;
  return colorValue;
}

function getTriangulaAlternatingRainbowColor(sequenceIndex) {
  // Fixed ROYGBIV order for predictable rainbow construction progression.
  var palette = ['#ff0000', '#ff7f00', '#ffff00', '#00aa00', '#0066ff', '#4b0082', '#8f00ff'];
  var index = Math.abs(Math.floor(Number(sequenceIndex) || 0)) % palette.length;
  return palette[index];
}

function getTriangulaResolvedFillColor(colorValue, sequenceIndex, fallback) {
  var normalized = normalizeTriangulaFillColor(colorValue, fallback);
  if (normalized === 'rainbow') {
    return getTriangulaAlternatingRainbowColor(sequenceIndex);
  }
  return normalized;
}

function getTriangulaEffectiveColorMode() {
  if (triangulaConstructionMode === 'cut') return 'all';
  return triangulaColorMode || 'band-1';
}

function getTriangulaRainbowSequenceIndex(slot, sequenceIndex, mode) {
  var sequence = Math.floor(Number(sequenceIndex) || 0);
  if (sequence < 0) sequence = 0;

  if (mode === 'all') return sequence;
  if ((mode === 'band-1' && slot === 1) || (mode === 'band-2' && slot === 2) || (mode === 'band-4' && slot === 4)) {
    return Math.floor(sequence / 3);
  }

  return sequence;
}

function getTriangulaFillColorForSlot(slot, sequenceIndex) {
  var mode = getTriangulaEffectiveColorMode();
  var rainbowSequence = getTriangulaRainbowSequenceIndex(slot, sequenceIndex, mode);
  var allColor = normalizeTriangulaFillColor(triangulaSourceColor, triangulaBandColors.band1);
  if (mode === 'all') return getTriangulaResolvedFillColor(allColor, rainbowSequence, triangulaBandColors.band1);
  if (mode === 'band-1') return slot === 1 ? getTriangulaResolvedFillColor(triangulaBandColors.band1, rainbowSequence, triangulaBandColors.band1) : '#ffffff';
  if (mode === 'band-2') return slot === 2 ? getTriangulaResolvedFillColor(triangulaBandColors.band2, rainbowSequence, triangulaBandColors.band2) : '#ffffff';
  if (mode === 'band-4') return slot === 4 ? getTriangulaResolvedFillColor(triangulaBandColors.band4, rainbowSequence, triangulaBandColors.band4) : '#ffffff';
  return getTriangulaResolvedFillColor(allColor, rainbowSequence, triangulaBandColors.band1);
}

function getTriangulaStrokeColorForSlot(slot, sequenceIndex) {
  var fill = getTriangulaFillColorForSlot(slot, sequenceIndex);
  if (!fill || fill === '#ffffff') return '#8ea4b0';
  return '#234b61';
}

function getTriangulaSplit(vertices) {
  var m01 = vertices[0].add(vertices[1]).divide(2);
  var m12 = vertices[1].add(vertices[2]).divide(2);
  var m20 = vertices[2].add(vertices[0]).divide(2);
  return {
    central: [m01, m12, m20],
    children: [
      { vertices: [vertices[0], m01, m20], slot: 1 },
      { vertices: [m01, vertices[1], m12], slot: 2 },
      { vertices: [m20, m12, vertices[2]], slot: 4 }
    ]
  };
}

function collectTrianglesAtDepth(vertices, depth, currentDepth, slot, collector) {
  if (currentDepth === depth) {
    collector.push({ vertices: vertices, slot: slot || 1 });
    return;
  }
  if (currentDepth > depth) return;
  var split = getTriangulaSplit(vertices);
  for (var i = 0; i < split.children.length; i++) {
    collectTrianglesAtDepth(split.children[i].vertices, depth, currentDepth + 1, split.children[i].slot, collector);
  }
}

function collectCutTrianglesAtDepth(vertices, depth, currentDepth, collector) {
  if (depth <= 0) return;
  if (currentDepth >= depth) return;
  var split = getTriangulaSplit(vertices);
  if (currentDepth + 1 === depth) {
    collector.push({ vertices: split.central, parent: vertices });
    return;
  }
  for (var i = 0; i < split.children.length; i++) {
    collectCutTrianglesAtDepth(split.children[i].vertices, depth, currentDepth + 1, collector);
  }
}

function collectParentChildTransitionsAtDepth(vertices, depth, currentDepth, collector) {
  if (depth <= 0) return;
  if (currentDepth >= depth) return;
  var split = getTriangulaSplit(vertices);
  if (currentDepth + 1 === depth) {
    var parentCenter = vertices[0].add(vertices[1]).add(vertices[2]).divide(3);
    for (var i = 0; i < split.children.length; i++) {
      var child = split.children[i];
      var childCenter = child.vertices[0].add(child.vertices[1]).add(child.vertices[2]).divide(3);
      collector.push({
        from: parentCenter,
        to: childCenter,
        child: child.vertices,
        parent: vertices,
        slot: child.slot
      });
    }
    return;
  }
  for (var j = 0; j < split.children.length; j++) {
    collectParentChildTransitionsAtDepth(split.children[j].vertices, depth, currentDepth + 1, collector);
  }
}

function drawTriangleStrokeProgress(vertices, options, progress) {
  var p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return;

  var v0 = vertices[0];
  var v1 = vertices[1];
  var v2 = vertices[2];
  var l01 = v0.getDistance(v1);
  var l12 = v1.getDistance(v2);
  var l20 = v2.getDistance(v0);
  var total = l01 + l12 + l20;
  var remaining = total * p;

  var path = new Path();
  path.strokeColor = options.strokeColor || '#2f4368';
  path.strokeWidth = options.strokeWidth || 1.2;
  path.opacity = isFinite(options.opacity) ? options.opacity : 1;
  path.add(v0);

  function addPartial(from, to, segLength) {
    if (remaining <= 0) return;
    if (remaining >= segLength) {
      path.add(to);
      remaining -= segLength;
      return;
    }
    var t = remaining / segLength;
    path.add(from.add(to.subtract(from).multiply(t)));
    remaining = 0;
  }

  addPartial(v0, v1, l01);
  addPartial(v1, v2, l12);
  addPartial(v2, v0, l20);
}

function drawTrianglePath(vertices, options) {
  var triangle = new Path();
  triangle.closed = true;
  triangle.add(vertices[0]);
  triangle.add(vertices[1]);
  triangle.add(vertices[2]);
  if (options && options.strokeColor) {
    triangle.strokeColor = options.strokeColor;
    triangle.strokeWidth = options.strokeWidth || 1.4;
  }
  if (options && options.fillColor) {
    triangle.fillColor = options.fillColor;
  }
  if (options && isFinite(options.opacity)) {
    triangle.opacity = options.opacity;
  }
  return triangle;
}

function drawTriangulaDepth(depth, scale) {
  var base = getTriangulaBaseTriangle(scale);
  var baseColor = getTriangulaFillColorForSlot(1);
  drawTrianglePath(base, {
    strokeColor: '#234b61',
    strokeWidth: triangulaConstructionMode === 'cut' ? 1.7 : 1.1,
    fillColor: baseColor,
    opacity: 0.95
  });

  var boundedDepth = Math.max(0, Math.min(6, depth));
  if (triangulaConstructionMode === 'cut') {
    for (var level = 1; level <= boundedDepth; level++) {
      var cutTriangles = [];
      collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
      for (var c = 0; c < cutTriangles.length; c++) {
        drawTrianglePath(cutTriangles[c].vertices, {
          fillColor: '#ffffff',
          strokeColor: '#ffffff',
          strokeWidth: 1.08,
          opacity: 0.97
        });
      }
    }
  } else {
    for (var d = 1; d <= boundedDepth; d++) {
      var triangles = [];
      collectTrianglesAtDepth(base, d, 0, 1, triangles);
      for (var t = 0; t < triangles.length; t++) {
        drawTrianglePath(triangles[t].vertices, {
          strokeColor: getTriangulaStrokeColorForSlot(triangles[t].slot, t),
          strokeWidth: Math.max(0.7, 1.3 - (d * 0.1)),
          fillColor: getTriangulaFillColorForSlot(triangles[t].slot, t),
          opacity: Math.max(0.45, 0.92 - (d * 0.08))
        });
      }
    }
  }
}

function getTriangulaItemCountForDepth(base, depth) {
  if (triangulaConstructionMode === 'cut') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, depth, 0, cuts);
    return cuts.length;
  }
  var transitions = [];
  collectParentChildTransitionsAtDepth(base, depth, 0, transitions);
  return transitions.length;
}

function buildTriangulaSteps(startDepth, targetDepth) {
  var steps = [];
  var depthItemCounts = Object.create(null);
  var base = getTriangulaBaseTriangle(1);

  for (var d = startDepth + 1; d <= targetDepth; d++) {
    var itemCount = getTriangulaItemCountForDepth(base, d);
    depthItemCounts[d] = itemCount;
    if (itemCount <= 0) continue;

    if (triangulaFractalMode === 'parallel') {
      if (triangulaConstructionMode === 'cut') {
        steps.push({ type: 'cut-guides', depth: d, beats: 1.0, itemIndex: -1, itemCount: itemCount });
        steps.push({ type: 'cut-apply', depth: d, beats: 0.85, itemIndex: -1, itemCount: itemCount });
      } else {
        steps.push({ type: 'shrink-paths', depth: d, beats: 0.95, itemIndex: -1, itemCount: itemCount });
        steps.push({ type: 'shrink-materialize', depth: d, beats: 0.8, itemIndex: -1, itemCount: itemCount });
      }
      continue;
    }

    for (var idx = 0; idx < itemCount; idx++) {
      if (triangulaConstructionMode === 'cut') {
        steps.push({ type: 'cut-guides', depth: d, beats: 0.5, itemIndex: idx, itemCount: itemCount });
        steps.push({ type: 'cut-apply', depth: d, beats: 0.45, itemIndex: idx, itemCount: itemCount });
      } else {
        steps.push({ type: 'shrink-paths', depth: d, beats: 0.48, itemIndex: idx, itemCount: itemCount });
        steps.push({ type: 'shrink-materialize', depth: d, beats: 0.44, itemIndex: idx, itemCount: itemCount });
      }
    }
  }
  return {
    steps: steps,
    depthItemCounts: depthItemCounts
  };
}

function getTriangulaStepDurationSeconds(step) {
  var baseSeconds = getAnimationSecondsPerSegment();
  var beats = step && isFinite(step.beats) ? Math.max(0.05, step.beats) : 0.5;
  return Math.max(0.03, baseSeconds * beats);
}

function getTriangulaTimelineScale(state) {
  if (triangulaFitMode !== 'dynamic') return 1;
  if (!state || !state.steps || !state.steps.length) return 1;
  var currentStep = state.steps[Math.min(state.stepIndex, state.steps.length - 1)];
  var localProgress = 0;
  if (currentStep) {
    var currentDuration = getTriangulaStepDurationSeconds(currentStep);
    localProgress = Math.max(0, Math.min(1, state.elapsed / currentDuration));
  }
  var phaseProgress = (state.stepIndex + localProgress) / Math.max(1, state.steps.length);
  return Math.max(0.62, 1 - (0.3 * phaseProgress));
}

function triangulaStepFinalizesDepth(step) {
  return !!step && (step.type === 'cut-apply' || step.type === 'shrink-materialize');
}

function getTriangulaFinalizedCountAtDepth(state, depth) {
  if (!state || !state.steps) return 0;
  var count = 0;
  for (var i = 0; i < state.stepIndex; i++) {
    var step = state.steps[i];
    if (!step || step.depth !== depth || !triangulaStepFinalizesDepth(step)) continue;
    count += step.itemIndex === -1 ? (step.itemCount || 0) : 1;
  }
  var maxCount = state.depthItemCounts && state.depthItemCounts[depth] ? state.depthItemCounts[depth] : 0;
  return Math.min(count, maxCount);
}

function getTriangulaCompletedDepth(state) {
  var depth = state ? state.startDepth : 0;
  if (!state || !state.depthItemCounts) return depth;
  for (var d = state.startDepth + 1; d <= state.targetDepth; d++) {
    var needed = state.depthItemCounts[d] || 0;
    if (!needed) {
      depth = d;
      continue;
    }
    if (getTriangulaFinalizedCountAtDepth(state, d) >= needed) {
      depth = d;
      continue;
    }
    break;
  }
  return depth;
}

function drawTriangulaFinalizedAtDepth(base, depth, finalizedCount) {
  if (finalizedCount <= 0) return;

  if (triangulaConstructionMode === 'cut') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, depth, 0, cuts);
    for (var i = 0; i < Math.min(finalizedCount, cuts.length); i++) {
      drawTrianglePath(cuts[i].vertices, {
        fillColor: '#ffffff',
        strokeColor: '#ffffff',
        strokeWidth: 1.06,
        opacity: 0.97
      });
    }
    return;
  }

  var triangles = [];
  collectTrianglesAtDepth(base, depth, 0, 1, triangles);
  for (var j = 0; j < Math.min(finalizedCount, triangles.length); j++) {
    drawTrianglePath(triangles[j].vertices, {
      strokeColor: getTriangulaStrokeColorForSlot(triangles[j].slot, j),
      strokeWidth: Math.max(0.7, 1.3 - (depth * 0.1)),
      fillColor: getTriangulaFillColorForSlot(triangles[j].slot, j),
      opacity: Math.max(0.45, 0.92 - (depth * 0.08))
    });
  }
}

function stepAppliesToIndex(step, index) {
  if (!step) return false;
  return step.itemIndex === -1 || step.itemIndex === index;
}

function drawTriangulaPulseBorder(vertices, progress) {
  if (!vertices || vertices.length < 3) return;
  var p = Math.max(0, Math.min(1, progress));
  // Single-pass envelope with slight hold so emphasis does not fade too quickly.
  var attackEnd = 0.44;
  var holdEnd = 0.72;
  var pulse;
  if (p < attackEnd) {
    pulse = p / attackEnd;
  } else if (p < holdEnd) {
    pulse = 1;
  } else {
    pulse = 1 - ((p - holdEnd) / (1 - holdEnd));
  }
  pulse = Math.max(0, Math.min(1, pulse));
  var easedPulse = pulse * pulse * (3 - (2 * pulse));
  drawTrianglePath(vertices, {
    strokeColor: toRgbaColor('#173b56', 0.38 + (0.42 * easedPulse)),
    strokeWidth: 1.3 + (2.2 * easedPulse),
    opacity: 0.36 + (0.44 * easedPulse)
  });
  drawTrianglePath(vertices, {
    strokeColor: toRgbaColor('#f8fcff', 0.06 + (0.14 * easedPulse)),
    strokeWidth: 2.0 + (1.0 * easedPulse),
    opacity: 0.06 + (0.16 * easedPulse)
  });
}

function drawTriangulaPulseBordersForCutStep(cuts, step, progress) {
  if (!cuts || !cuts.length || !step) return;
  if (step.itemIndex === -1) {
    for (var i = 0; i < cuts.length; i++) {
      drawTriangulaPulseBorder(cuts[i].parent, progress);
    }
    return;
  }
  if (step.itemIndex >= 0 && step.itemIndex < cuts.length) {
    drawTriangulaPulseBorder(cuts[step.itemIndex].parent, progress);
  }
}

function drawTriangulaPulseBordersForShrinkStep(transitions, step, progress) {
  if (!transitions || !transitions.length || !step) return;
  if (step.itemIndex === -1) {
    var parallelPhase = step.type === 'shrink-materialize'
      ? (0.5 + (0.5 * progress))
      : (0.5 * progress);
    for (var i = 0; i < transitions.length; i += 3) {
      drawTriangulaPulseBorder(transitions[i].parent, parallelPhase);
    }
    return;
  }

  // A parent set is 3 child transitions, each with 2 sub-steps.
  // Map all of that to one 0..1 phase so highlight appears once per set:
  // rise through child 1, peak by child 2, fade by end of child 3.
  var childIndexWithinSet = step.itemIndex % 3;
  var childSubstepPhase = step.type === 'shrink-materialize'
    ? (0.5 + (0.5 * progress))
    : (0.5 * progress);
  var setPhase = (childIndexWithinSet + childSubstepPhase) / 3;

  var parentGroupIndex = Math.floor(step.itemIndex / 3) * 3;
  if (parentGroupIndex >= 0 && parentGroupIndex < transitions.length) {
    drawTriangulaPulseBorder(transitions[parentGroupIndex].parent, setPhase);
  }
}

function drawTriangulaStepOverlay(base, step, progress) {
  if (!step) return;
  var p = Math.max(0, Math.min(1, progress));

  if (step.type === 'cut-guides' || step.type === 'cut-apply') {
    var cuts = [];
    collectCutTrianglesAtDepth(base, step.depth, 0, cuts);
    for (var i = 0; i < cuts.length; i++) {
      if (!stepAppliesToIndex(step, i)) continue;
      drawTriangleStrokeProgress(cuts[i].vertices, {
        strokeColor: '#2c5a7d',
        strokeWidth: 1.2,
        opacity: 0.55
      }, step.type === 'cut-guides' ? p : 1);

      if (step.type === 'cut-apply') {
        drawTrianglePath(cuts[i].vertices, {
          fillColor: '#ffffff',
          strokeColor: '#ffffff',
          strokeWidth: 1.08,
          opacity: Math.max(0, Math.min(1, p))
        });
      }
    }
    if (step.type === 'cut-guides') {
      drawTriangulaPulseBordersForCutStep(cuts, step, p);
    }
    return;
  }

  if (step.type === 'shrink-paths' || step.type === 'shrink-materialize') {
    var transitions = [];
    collectParentChildTransitionsAtDepth(base, step.depth, 0, transitions);
    for (var j = 0; j < transitions.length; j++) {
      if (!stepAppliesToIndex(step, j)) continue;
      var link = transitions[j];
      var connector = new Path();
      connector.strokeColor = getTriangulaStrokeColorForSlot(link.slot, j);
      connector.strokeWidth = 1.05;
      connector.opacity = 0.42;
      connector.add(link.from);
      var connectorProgress = step.type === 'shrink-paths' ? p : 1;
      connector.add(link.from.add(link.to.subtract(link.from).multiply(connectorProgress)));
    }

    if (step.type === 'shrink-materialize') {
      for (var k = 0; k < transitions.length; k++) {
        if (!stepAppliesToIndex(step, k)) continue;
        var child = transitions[k];
        drawTrianglePath(child.child, {
          fillColor: getTriangulaFillColorForSlot(child.slot, k),
          strokeColor: getTriangulaStrokeColorForSlot(child.slot, k),
          strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
          opacity: Math.max(0.2, p * (0.95 - (step.depth * 0.08)))
        });
        drawTriangleStrokeProgress(child.child, {
          strokeColor: getTriangulaStrokeColorForSlot(child.slot, k),
          strokeWidth: Math.max(0.7, 1.3 - (step.depth * 0.1)),
          opacity: Math.max(0.36, 0.85 - (step.depth * 0.08))
        }, p);
      }
    }

    drawTriangulaPulseBordersForShrinkStep(transitions, step, p);
  }
}

function renderTriangulaAnimationStateFrame(state) {
  if (!state) return;
  var step = state.steps[state.stepIndex] || null;
  var completedDepth = getTriangulaCompletedDepth(state);
  var scale = getTriangulaTimelineScale(state);
  var base = getTriangulaBaseTriangle(scale);

  project.activeLayer.removeChildren();
  drawTriangulaDepth(completedDepth, scale);

  if (step && step.depth > completedDepth) {
    var finalizedAtStepDepth = getTriangulaFinalizedCountAtDepth(state, step.depth);
    drawTriangulaFinalizedAtDepth(base, step.depth, finalizedAtStepDepth);
  }

  if (step) {
    var stepDuration = getTriangulaStepDurationSeconds(step);
    var stepProgress = Math.max(0, Math.min(1, state.elapsed / stepDuration));
    drawTriangulaStepOverlay(base, step, stepProgress);
  }
}

function drawTriangulaStatic() {
  project.activeLayer.removeChildren();
  var endDepth = triangulaCountToDepth(triangulaTargetCount);
  drawTriangulaDepth(endDepth, 1);
  clearHighlightedHoleNumbers();
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(value) {
  var t = clamp01(value);
  if (t < 0.5) return 4 * t * t * t;
  var f = -2 * t + 2;
  return 1 - (f * f * f) / 2;
}

function easeOutBack(value) {
  var t = clamp01(value);
  var c1 = 1.70158;
  var c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function normalizeAngleRadians(angle) {
  var a = Number(angle) || 0;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function interpolateAngleShortest(fromAngle, toAngle, t) {
  var from = normalizeAngleRadians(fromAngle);
  var to = normalizeAngleRadians(toAngle);
  var delta = normalizeAngleRadians(to - from);
  return from + (delta * clamp01(t));
}

function squarusCellKey(x, y) {
  return String(x) + ',' + String(y);
}

function squarusNormalizeCells(cells) {
  var minX = Infinity;
  var minY = Infinity;
  for (var i = 0; i < cells.length; i++) {
    minX = Math.min(minX, cells[i][0]);
    minY = Math.min(minY, cells[i][1]);
  }
  var normalized = [];
  for (var j = 0; j < cells.length; j++) {
    normalized.push([cells[j][0] - minX, cells[j][1] - minY]);
  }
  normalized.sort(function(a, b) {
    if (a[1] === b[1]) return a[0] - b[0];
    return a[1] - b[1];
  });
  return normalized;
}

function squarusCellsSignature(cells) {
  var parts = [];
  for (var i = 0; i < cells.length; i++) {
    parts.push(String(cells[i][0]) + ',' + String(cells[i][1]));
  }
  return parts.join(';');
}

function squarusTransformCells(cells, transformIndex) {
  var transformed = [];
  for (var i = 0; i < cells.length; i++) {
    var x = cells[i][0];
    var y = cells[i][1];
    var tx = x;
    var ty = y;
    if (transformIndex === 0) { tx = x; ty = y; }
    if (transformIndex === 1) { tx = -y; ty = x; }
    if (transformIndex === 2) { tx = -x; ty = -y; }
    if (transformIndex === 3) { tx = y; ty = -x; }
    if (transformIndex === 4) { tx = -x; ty = y; }
    if (transformIndex === 5) { tx = y; ty = x; }
    if (transformIndex === 6) { tx = x; ty = -y; }
    if (transformIndex === 7) { tx = -y; ty = -x; }
    transformed.push([tx, ty]);
  }
  return squarusNormalizeCells(transformed);
}

function squarusCanonicalizeCells(cells) {
  var bestSig = null;
  var bestCells = null;
  for (var i = 0; i < 8; i++) {
    var transformed = squarusTransformCells(cells, i);
    var sig = squarusCellsSignature(transformed);
    if (bestSig === null || sig < bestSig) {
      bestSig = sig;
      bestCells = transformed;
    }
  }
  return { signature: bestSig, cells: bestCells };
}

function squarusHasHole(cells) {
  var occupied = Object.create(null);
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;

  for (var i = 0; i < cells.length; i++) {
    var x = cells[i][0];
    var y = cells[i][1];
    occupied[squarusCellKey(x, y)] = true;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  var startX = minX - 1;
  var startY = minY - 1;
  var endX = maxX + 1;
  var endY = maxY + 1;
  var queue = [[startX, startY]];
  var seen = Object.create(null);
  seen[squarusCellKey(startX, startY)] = true;
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    var point = queue.shift();
    for (var d = 0; d < dirs.length; d++) {
      var nx = point[0] + dirs[d][0];
      var ny = point[1] + dirs[d][1];
      if (nx < startX || nx > endX || ny < startY || ny > endY) continue;
      var key = squarusCellKey(nx, ny);
      if (seen[key] || occupied[key]) continue;
      seen[key] = true;
      queue.push([nx, ny]);
    }
  }

  for (var y = minY; y <= maxY; y++) {
    for (var x = minX; x <= maxX; x++) {
      var k = squarusCellKey(x, y);
      if (!occupied[k] && !seen[k]) {
        return true;
      }
    }
  }
  return false;
}

function squarusComputePieceMeta(cells, signature) {
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var cx = 0;
  var cy = 0;
  var occupied = Object.create(null);

  for (var i = 0; i < cells.length; i++) {
    var x = cells[i][0];
    var y = cells[i][1];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    cx += x + 0.5;
    cy += y + 0.5;
    occupied[squarusCellKey(x, y)] = true;
  }

  var perimeter = 0;
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (var j = 0; j < cells.length; j++) {
    for (var d = 0; d < dirs.length; d++) {
      var nx = cells[j][0] + dirs[d][0];
      var ny = cells[j][1] + dirs[d][1];
      if (!occupied[squarusCellKey(nx, ny)]) {
        perimeter += 1;
      }
    }
  }

  return {
    signature: signature,
    cells: cells,
    area: cells.length,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    bboxArea: (maxX - minX + 1) * (maxY - minY + 1),
    perimeter: perimeter,
    centroidX: cx / cells.length,
    centroidY: cy / cells.length,
    longAxis: (maxX - minX + 1) >= (maxY - minY + 1) ? 0 : (Math.PI / 2)
  };
}

function getSquarusPolyominoes(order) {
  var safeOrder = parseBoundedInt(order, 1, 6, 4);
  if (squarusPolyominoCache[safeOrder]) {
    return squarusPolyominoCache[safeOrder];
  }

  squarusPolyominoCache[1] = [squarusComputePieceMeta([[0, 0]], '0,0')];

  for (var n = 2; n <= safeOrder; n++) {
    if (squarusPolyominoCache[n]) continue;
    var map = Object.create(null);
    var prev = squarusPolyominoCache[n - 1] || [];
    for (var i = 0; i < prev.length; i++) {
      var piece = prev[i];
      var occupied = Object.create(null);
      for (var c = 0; c < piece.cells.length; c++) {
        occupied[squarusCellKey(piece.cells[c][0], piece.cells[c][1])] = true;
      }

      for (var j = 0; j < piece.cells.length; j++) {
        var x = piece.cells[j][0];
        var y = piece.cells[j][1];
        var neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (var k = 0; k < neighbors.length; k++) {
          var nx = neighbors[k][0];
          var ny = neighbors[k][1];
          if (occupied[squarusCellKey(nx, ny)]) continue;
          var candidate = piece.cells.slice();
          candidate.push([nx, ny]);
          if (squarusHasHole(candidate)) continue;
          var canonical = squarusCanonicalizeCells(candidate);
          if (!map[canonical.signature]) {
            map[canonical.signature] = squarusComputePieceMeta(canonical.cells, canonical.signature);
          }
        }
      }
    }

    var list = Object.keys(map).map(function(sig) { return map[sig]; });
    list.sort(function(a, b) {
      if (a.perimeter === b.perimeter) {
        return a.signature < b.signature ? -1 : 1;
      }
      return a.perimeter - b.perimeter;
    });
    squarusPolyominoCache[n] = list;
  }

  return squarusPolyominoCache[safeOrder] || [];
}

function createSquarusSeededRandom(seed) {
  var state = (seed >>> 0) || 1;
  return function() {
    state = (state + 0x6D2B79F5) >>> 0;
    var t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSquarusPermutationByIndex(baseList, index) {
  var pool = baseList.slice();
  var result = [];
  var remaining = Math.max(0, Math.floor(index));

  for (var n = pool.length; n > 0; n--) {
    var blockSize = 1;
    for (var i = 2; i < n; i++) {
      blockSize *= i;
    }
    var pick = blockSize > 0 ? Math.floor(remaining / blockSize) : 0;
    if (pick < 0) pick = 0;
    if (pick >= pool.length) pick = pool.length - 1;
    result.push(pool.splice(pick, 1)[0]);
    remaining = blockSize > 0 ? (remaining % blockSize) : 0;
  }

  return result;
}

function getSquarusSequencedPieces(order, sequenceSeed) {
  var safeOrder = parseBoundedInt(order, 1, 6, squarusOrder);
  var base = getSquarusPolyominoes(safeOrder);
  var list = base.slice();
  var seed = normalizeSquarusSequenceSeed(sequenceSeed, 0, safeOrder);
  if (list.length <= 1) return list;

  if (safeOrder <= 4) {
    return buildSquarusPermutationByIndex(list, seed);
  }

  if (seed <= 0 || list.length <= 1) return list;

  var rng = createSquarusSeededRandom(seed);
  for (var i = list.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

function squarusHilbertD2XY(side, index) {
  var t = index;
  var x = 0;
  var y = 0;
  for (var s = 1; s < side; s *= 2) {
    var rx = 1 & Math.floor(t / 2);
    var ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      var temp = x;
      x = y;
      y = temp;
    }
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return { x: x, y: y };
}

function squarusHexToRgb(color) {
  var value = String(color || '').trim();
  var match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return { r: 90, g: 75, b: 178 };
  var hex = match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function squarusRgbToHex(r, g, b) {
  function channelHex(value) {
    var safe = Math.max(0, Math.min(255, Math.round(value)));
    var hex = safe.toString(16);
    return hex.length === 1 ? ('0' + hex) : hex;
  }
  return '#' + channelHex(r) + channelHex(g) + channelHex(b);
}

function squarusBlendHexColor(colorA, colorB, t) {
  var a = squarusHexToRgb(colorA);
  var b = squarusHexToRgb(colorB);
  var blend = Math.max(0, Math.min(1, Number(t) || 0));
  return squarusRgbToHex(
    a.r + ((b.r - a.r) * blend),
    a.g + ((b.g - a.g) * blend),
    a.b + ((b.b - a.b) * blend)
  );
}

function squarusGreatestCommonDivisor(a, b) {
  var x = Math.abs(Math.floor(a));
  var y = Math.abs(Math.floor(b));
  while (y !== 0) {
    var temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function squarusReorderColorsForContrast(colors) {
  var count = colors.length;
  if (count <= 2) return colors.slice();

  // Walk the same set of generated colors with a large coprime step so
  // consecutive pieces are assigned farther-apart gradient positions.
  var step = Math.floor(count / 2) + 1;
  while (squarusGreatestCommonDivisor(step, count) !== 1) {
    step += 1;
  }

  var reordered = [];
  var index = 0;
  for (var i = 0; i < count; i++) {
    reordered.push(colors[index]);
    index = (index + step) % count;
  }
  return reordered;
}

function squarusApplyShade(color, shadeAmount) {
  var amount = Math.max(-1, Math.min(1, Number(shadeAmount) || 0));
  if (amount > 0) {
    return squarusBlendHexColor(color, '#ffffff', amount);
  }
  if (amount < 0) {
    return squarusBlendHexColor(color, '#000000', Math.abs(amount));
  }
  return color;
}

function getSquarusPieceColorSequence(total) {
  var count = Math.max(0, Math.floor(total || 0));
  var basePalette = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
  if (!count) return [];

  if (count <= basePalette.length) {
    return basePalette.slice(0, count);
  }

  var sequence = [];
  var segmentCount = basePalette.length - 1;
  for (var i = 0; i < count; i++) {
    var t = count <= 1 ? 0 : (i / (count - 1));
    var pos = t * segmentCount;
    var lower = Math.floor(pos);
    var upper = Math.min(basePalette.length - 1, lower + 1);
    var local = pos - lower;
    var color = squarusBlendHexColor(basePalette[lower], basePalette[upper], local);

    if (i > 0 && String(color).toLowerCase() === String(sequence[i - 1]).toLowerCase()) {
      if (upper < basePalette.length - 1) {
        color = squarusBlendHexColor(basePalette[upper], basePalette[upper + 1], 0.16);
      } else {
        color = squarusBlendHexColor(basePalette[Math.max(0, lower - 1)], basePalette[lower], 0.84);
      }
    }

    sequence.push(color);
  }

  return squarusReorderColorsForContrast(sequence);
}

function getSquarusPieceColor(index, total) {
  var sequence = getSquarusPieceColorSequence(total);
  if (!sequence.length) return '#5a4bb2';
  return sequence[Math.abs(Math.floor(index)) % sequence.length];
}

function getSquarusPieceRenderRadius(piece, scale) {
  var farthest = 0;
  var halfDiag = (scale * Math.SQRT2) * 0.5;
  for (var i = 0; i < piece.cells.length; i++) {
    var dx = (piece.cells[i][0] + 0.5) - piece.centroidX;
    var dy = (piece.cells[i][1] + 0.5) - piece.centroidY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > farthest) farthest = dist;
  }
  return farthest * scale + halfDiag;
}

function getSquarusQuarterTurnRotation(turns) {
  var normalized = ((turns % 4) + 4) % 4;
  return normalized * (Math.PI / 2);
}

function getSquarusCellsCentroid(cells) {
  var cx = 0;
  var cy = 0;
  for (var i = 0; i < cells.length; i++) {
    cx += cells[i][0] + 0.5;
    cy += cells[i][1] + 0.5;
  }
  return {
    x: cx / Math.max(1, cells.length),
    y: cy / Math.max(1, cells.length)
  };
}

function buildSquarusPlacedCells(cells, offsetX, offsetY) {
  var placed = [];
  for (var i = 0; i < cells.length; i++) {
    placed.push({ x: cells[i][0] + offsetX, y: cells[i][1] + offsetY });
  }
  return placed;
}

function areSquarusCellsTouching(cellsA, cellsBLookup) {
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (var i = 0; i < cellsA.length; i++) {
    for (var d = 0; d < dirs.length; d++) {
      var neighborKey = squarusCellKey(cellsA[i].x + dirs[d][0], cellsA[i].y + dirs[d][1]);
      if (cellsBLookup[neighborKey]) return true;
    }
  }
  return false;
}

function anySquarusOverlap(cells, occupiedLookup) {
  for (var i = 0; i < cells.length; i++) {
    if (occupiedLookup[squarusCellKey(cells[i].x, cells[i].y)]) return true;
  }
  return false;
}

function applySquarusConnectedTouchConstraint(pieces, targets) {
  if (!pieces || !targets || pieces.length !== targets.length || !pieces.length) return;

  var count = pieces.length;
  var stagedTargets = targets.map(function(target) {
    return {
      x: target.x,
      y: target.y,
      rotation: target.rotation
    };
  });
  var center = view.center;
  var unit = Math.max(1, Number(targets[0] && targets[0].scale) || 1);
  var occupied = Object.create(null);
  var placedPieces = new Array(count);

  function desiredGridForIndex(index) {
    return {
      x: (targets[index].x - center.x) / unit,
      y: (targets[index].y - center.y) / unit
    };
  }

  function rotationPenalty(targetRotation, candidateRotation) {
    var diff = targetRotation - candidateRotation;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) * 0.08;
  }

  for (var index = 0; index < count; index++) {
    var desired = desiredGridForIndex(index);
    var best = null;

    for (var turns = 0; turns < 4; turns++) {
      var rotated = squarusTransformCells(pieces[index].cells, turns);
      var centroid = getSquarusCellsCentroid(rotated);
      var rotation = getSquarusQuarterTurnRotation(turns);

      if (index === 0) {
        var baseOffsetX = Math.round(desired.x - centroid.x);
        var baseOffsetY = Math.round(desired.y - centroid.y);
        var baseCells = buildSquarusPlacedCells(rotated, baseOffsetX, baseOffsetY);
        if (anySquarusOverlap(baseCells, occupied)) continue;
        var baseCx = centroid.x + baseOffsetX;
        var baseCy = centroid.y + baseOffsetY;
        var baseScore = Math.pow(baseCx - desired.x, 2) + Math.pow(baseCy - desired.y, 2) + rotationPenalty(stagedTargets[index].rotation, rotation);
        if (!best || baseScore < best.score) {
          best = {
            score: baseScore,
            cells: baseCells,
            centroidX: baseCx,
            centroidY: baseCy,
            rotation: rotation
          };
        }
        continue;
      }

      var prevLookup = placedPieces[index - 1].lookup;
      var prevCells = placedPieces[index - 1].cells;
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      var seenOffsets = Object.create(null);

      for (var p = 0; p < prevCells.length; p++) {
        for (var d = 0; d < dirs.length; d++) {
          var touchX = prevCells[p].x + dirs[d][0];
          var touchY = prevCells[p].y + dirs[d][1];
          for (var c = 0; c < rotated.length; c++) {
            var offX = touchX - rotated[c][0];
            var offY = touchY - rotated[c][1];
            var offsetKey = String(offX) + ',' + String(offY);
            if (seenOffsets[offsetKey]) continue;
            seenOffsets[offsetKey] = true;

            var candidateCells = buildSquarusPlacedCells(rotated, offX, offY);
            if (anySquarusOverlap(candidateCells, occupied)) continue;
            if (!areSquarusCellsTouching(candidateCells, prevLookup)) continue;

            var candidateCx = centroid.x + offX;
            var candidateCy = centroid.y + offY;
            var score = Math.pow(candidateCx - desired.x, 2) + Math.pow(candidateCy - desired.y, 2) + rotationPenalty(stagedTargets[index].rotation, rotation);
            if (!best || score < best.score) {
              best = {
                score: score,
                cells: candidateCells,
                centroidX: candidateCx,
                centroidY: candidateCy,
                rotation: rotation
              };
            }
          }
        }
      }
    }

    if (!best) {
      return;
    }

    var lookup = Object.create(null);
    for (var add = 0; add < best.cells.length; add++) {
      var key = squarusCellKey(best.cells[add].x, best.cells[add].y);
      occupied[key] = true;
      lookup[key] = true;
    }

    placedPieces[index] = {
      cells: best.cells,
      lookup: lookup,
      rotation: best.rotation,
      centroidX: best.centroidX,
      centroidY: best.centroidY
    };

    stagedTargets[index].x = center.x + best.centroidX * unit;
    stagedTargets[index].y = center.y + best.centroidY * unit;
    stagedTargets[index].rotation = best.rotation;
  }

  for (var applyIndex = 0; applyIndex < count; applyIndex++) {
    targets[applyIndex].x = stagedTargets[applyIndex].x;
    targets[applyIndex].y = stagedTargets[applyIndex].y;
    targets[applyIndex].rotation = stagedTargets[applyIndex].rotation;
  }
}

function getMaxRadiusAlongAngleFromCenter(angle) {
  var center = view.center;
  var width = view.size.width;
  var height = view.size.height;
  var dx = Math.cos(angle);
  var dy = Math.sin(angle);
  var maxRadius = Infinity;

  if (Math.abs(dx) > 1e-6) {
    var limitX = dx > 0 ? (width - center.x) / dx : (0 - center.x) / dx;
    if (limitX >= 0) maxRadius = Math.min(maxRadius, limitX);
  }

  if (Math.abs(dy) > 1e-6) {
    var limitY = dy > 0 ? (height - center.y) / dy : (0 - center.y) / dy;
    if (limitY >= 0) maxRadius = Math.min(maxRadius, limitY);
  }

  if (!isFinite(maxRadius)) {
    maxRadius = Math.min(width, height) * 0.5;
  }
  return Math.max(0, maxRadius);
}

function applySquarusTargetsFitToCanvas(pieces, targets) {
  if (!pieces || !targets || pieces.length !== targets.length || !targets.length) return;

  var canvasEl = document.getElementById('myCanvas');
  var titleBottomOnCanvas = 0;
  if (canvasEl && experienceInline && typeof canvasEl.getBoundingClientRect === 'function' && typeof experienceInline.getBoundingClientRect === 'function') {
    var canvasRect = canvasEl.getBoundingClientRect();
    var titleRect = experienceInline.getBoundingClientRect();
    titleBottomOnCanvas = Math.max(0, titleRect.bottom - canvasRect.top);
  }

  var center = view.center;
  var padding = 10;
  var safeLeft = padding;
  var safeRight = view.size.width - padding;
  var safeTop = Math.max(padding, titleBottomOnCanvas + 6);
  var safeBottom = view.size.height - padding;
  if (safeBottom <= safeTop + 1) {
    safeTop = padding;
  }

  var fitScale = 1;
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;

  for (var i = 0; i < targets.length; i++) {
    var dx = targets[i].x - center.x;
    var dy = targets[i].y - center.y;
    var radius = getSquarusPieceRenderRadius(pieces[i], targets[i].scale);
    minX = Math.min(minX, targets[i].x - radius);
    maxX = Math.max(maxX, targets[i].x + radius);
    minY = Math.min(minY, targets[i].y - radius);
    maxY = Math.max(maxY, targets[i].y + radius);

    var needX = Math.abs(dx) + radius;
    var needY = Math.abs(dy) + radius;
    if (needX > 1e-6) fitScale = Math.min(fitScale, (view.size.width * 0.5 - padding) / needX);
    if (needY > 1e-6) fitScale = Math.min(fitScale, (view.size.height * 0.5 - padding) / needY);
  }

  var spanX = Math.max(1e-6, maxX - minX);
  var spanY = Math.max(1e-6, maxY - minY);
  fitScale = Math.min(fitScale, Math.max(0.08, (safeRight - safeLeft) / spanX));
  fitScale = Math.min(fitScale, Math.max(0.08, (safeBottom - safeTop) / spanY));

  if (!isFinite(fitScale) || fitScale >= 1) return;
  fitScale = Math.max(0.08, fitScale);

  for (var t = 0; t < targets.length; t++) {
    targets[t].x = center.x + ((targets[t].x - center.x) * fitScale);
    targets[t].y = center.y + ((targets[t].y - center.y) * fitScale);
    targets[t].scale = targets[t].scale * fitScale;
  }

  var postMinY = Infinity;
  var postMaxY = -Infinity;
  for (var p = 0; p < targets.length; p++) {
    var postRadius = getSquarusPieceRenderRadius(pieces[p], targets[p].scale);
    postMinY = Math.min(postMinY, targets[p].y - postRadius);
    postMaxY = Math.max(postMaxY, targets[p].y + postRadius);
  }

  var shiftY = 0;
  if (postMinY < safeTop) shiftY = safeTop - postMinY;
  if ((postMaxY + shiftY) > safeBottom) shiftY = Math.min(shiftY, safeBottom - postMaxY);
  if (Math.abs(shiftY) > 1e-6) {
    for (var s = 0; s < targets.length; s++) {
      targets[s].y += shiftY;
    }
  }
}

function buildSquarusTargets(pieces, layoutKey) {
  var count = pieces.length;
  var center = view.center;
  var minDim = Math.min(view.size.width, view.size.height);
  var points = [];
  var rotations = [];
  var scales = [];
  var defaultScale = minDim / (Math.ceil(Math.sqrt(Math.max(1, count))) + 2.4);

  function finalizeWithSpacing(spacing) {
    var unit = Math.max(7, spacing * 0.62);
    for (var i = 0; i < count; i++) {
      scales[i] = unit;
    }
  }

  if (layoutKey === 'grid-packing') {
    var k = Math.ceil(Math.sqrt(Math.max(1, count)));
    var spacing = minDim / (k + 2.5);
    for (var gi = 0; gi < count; gi++) {
      var row = Math.floor(gi / k);
      var col = gi % k;
      points.push({
        x: center.x + (col - ((k - 1) / 2)) * spacing,
        y: center.y + (row - ((k - 1) / 2)) * spacing
      });
    }
    finalizeWithSpacing(spacing);
  } else if (layoutKey === 'hilbert-curve') {
    var side = 1;
    while (side * side < count) side *= 2;
    var spacingHilbert = minDim / (side + 2.5);
    for (var hi = 0; hi < count; hi++) {
      var hp = squarusHilbertD2XY(side, hi);
      points.push({
        x: center.x + (hp.x - ((side - 1) / 2)) * spacingHilbert,
        y: center.y + (hp.y - ((side - 1) / 2)) * spacingHilbert
      });
    }
    for (var hr = 0; hr < count; hr++) {
      var prev = points[Math.max(0, hr - 1)];
      var next = points[Math.min(count - 1, hr + 1)];
      rotations[hr] = Math.atan2(next.y - prev.y, next.x - prev.x);
    }
    finalizeWithSpacing(spacingHilbert);
  } else if (layoutKey === 'symmetry-d4') {
    var ringSpacing = minDim * 0.12;
    for (var di = 0; di < count; di++) {
      var ring = Math.floor(di / 8);
      var slot = di % 8;
      var radius = ringSpacing * (ring + 1);
      var angle = (Math.PI / 4) * slot;
      points.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      });
      rotations[di] = (slot % 4) * (Math.PI / 2);
    }
    finalizeWithSpacing(ringSpacing * 0.9);
  } else if (layoutKey === 'spiral-packing') {
    var spiralStep = minDim * 0.05;
    for (var sp = 0; sp < count; sp++) {
      var theta = sp * 0.68;
      var radiusSpiral = spiralStep * Math.sqrt(sp + 1);
      points.push({
        x: center.x + Math.cos(theta) * radiusSpiral,
        y: center.y + Math.sin(theta) * radiusSpiral
      });
      rotations[sp] = theta + (Math.PI / 2);
    }
    finalizeWithSpacing(spiralStep * 2.1);
  } else if (layoutKey === 'circle-packing') {
    var packed = [];
    for (var cp = 0; cp < count; cp++) {
      var rad = 0.7 + (Math.sqrt(pieces[cp].width * pieces[cp].width + pieces[cp].height * pieces[cp].height) * 0.28);
      var best = null;
      for (var ringTry = 0; ringTry < 28 && !best; ringTry++) {
        var ringRadius = ringTry * 0.95;
        for (var a = 0; a < 36; a++) {
          var ang = (Math.PI * 2 * a) / 36;
          var px = Math.cos(ang) * ringRadius;
          var py = Math.sin(ang) * ringRadius;
          var ok = true;
          for (var o = 0; o < packed.length; o++) {
            var dx = px - packed[o].x;
            var dy = py - packed[o].y;
            var minDist = rad + packed[o].r + 0.25;
            if ((dx * dx + dy * dy) < (minDist * minDist)) {
              ok = false;
              break;
            }
          }
          if (ok) {
            best = { x: px, y: py, r: rad, angle: ang };
            break;
          }
        }
      }
      if (!best) best = { x: cp * 0.8, y: 0, r: rad, angle: 0 };
      packed.push(best);
      points.push({ x: center.x + best.x * defaultScale * 0.9, y: center.y + best.y * defaultScale * 0.9 });
    }
    for (var cr = 0; cr < count; cr++) {
      rotations[cr] = 0;
      scales[cr] = Math.max(7, defaultScale * 0.58);
    }
  } else if (layoutKey === 'radial-tree') {
    var clusters = Object.create(null);
    for (var rt = 0; rt < count; rt++) {
      var clusterKey = String(pieces[rt].width) + 'x' + String(pieces[rt].height);
      if (!clusters[clusterKey]) clusters[clusterKey] = [];
      clusters[clusterKey].push(rt);
    }
    var keys = Object.keys(clusters).sort();
    var clusterRadius = minDim * 0.16;
    for (var ck = 0; ck < keys.length; ck++) {
      var indices = clusters[keys[ck]];
      var baseAngle = (Math.PI * 2 * ck) / keys.length;
      var cx = center.x + Math.cos(baseAngle) * clusterRadius;
      var cy = center.y + Math.sin(baseAngle) * clusterRadius;
      for (var ci = 0; ci < indices.length; ci++) {
        var leafAngle = baseAngle + ((ci - ((indices.length - 1) / 2)) * 0.38);
        var leafRadius = minDim * 0.06 * (1 + Math.floor(ci / 4));
        points[indices[ci]] = {
          x: cx + Math.cos(leafAngle) * leafRadius,
          y: cy + Math.sin(leafAngle) * leafRadius
        };
        rotations[indices[ci]] = leafAngle;
      }
    }
    finalizeWithSpacing(minDim * 0.09);
  } else {
    var forcePoints = [];
    for (var f = 0; f < count; f++) {
      var ang0 = (Math.PI * 2 * f) / Math.max(1, count);
      forcePoints.push({ x: Math.cos(ang0), y: Math.sin(ang0), vx: 0, vy: 0 });
    }
    for (var iter = 0; iter < 110; iter++) {
      for (var a1 = 0; a1 < count; a1++) {
        var fx = -forcePoints[a1].x * 0.02;
        var fy = -forcePoints[a1].y * 0.02;
        for (var b1 = 0; b1 < count; b1++) {
          if (a1 === b1) continue;
          var dx1 = forcePoints[a1].x - forcePoints[b1].x;
          var dy1 = forcePoints[a1].y - forcePoints[b1].y;
          var dist2 = Math.max(0.0025, dx1 * dx1 + dy1 * dy1);
          var rep = 0.004 / dist2;
          fx += (dx1 / Math.sqrt(dist2)) * rep;
          fy += (dy1 / Math.sqrt(dist2)) * rep;
        }
        forcePoints[a1].vx = (forcePoints[a1].vx + fx) * 0.92;
        forcePoints[a1].vy = (forcePoints[a1].vy + fy) * 0.92;
      }
      for (var u = 0; u < count; u++) {
        forcePoints[u].x += forcePoints[u].vx;
        forcePoints[u].y += forcePoints[u].vy;
      }
    }
    var maxAbs = 0.001;
    for (var fm = 0; fm < count; fm++) {
      maxAbs = Math.max(maxAbs, Math.abs(forcePoints[fm].x), Math.abs(forcePoints[fm].y));
    }
    var forceScale = (minDim * 0.36) / maxAbs;
    for (var fi = 0; fi < count; fi++) {
      points.push({
        x: center.x + forcePoints[fi].x * forceScale,
        y: center.y + forcePoints[fi].y * forceScale
      });
      rotations[fi] = 0;
      scales[fi] = Math.max(7, defaultScale * 0.58);
    }
  }

  var colorSequence = getSquarusPieceColorSequence(count);
  var targets = [];
  for (var t = 0; t < count; t++) {
    var baseScale = Math.max(7, scales[t] || (defaultScale * 0.58));
    targets.push({
      x: points[t].x,
      y: points[t].y,
      rotation: isFinite(rotations[t]) ? rotations[t] : pieces[t].longAxis,
      scale: Math.max(6, baseScale * SQUARUS_PIECE_SCALE_FACTOR),
      color: colorSequence[t] || getSquarusPieceColor(t, count)
    });
  }

  if (squarusContactMode === 'connected-touch') {
    applySquarusConnectedTouchConstraint(pieces, targets);
  }

  applySquarusTargetsFitToCanvas(pieces, targets);

  return targets;
}

function drawSquarusGuide(layoutKey, targets, opacity) {
  var o = clamp01(opacity);
  if (o <= 0 || !targets || !targets.length) return;

  if (layoutKey === 'grid-packing' || layoutKey === 'hilbert-curve') {
    for (var i = 1; i < targets.length; i++) {
      var path = new Path();
      path.strokeColor = toRgbaColor('#8ea4b0', 0.12 * o);
      path.strokeWidth = 1;
      path.add(new Point(targets[i - 1].x, targets[i - 1].y));
      path.add(new Point(targets[i].x, targets[i].y));
    }
    return;
  }

  var center = view.center;
  for (var j = 0; j < targets.length; j++) {
    var spoke = new Path();
    spoke.strokeColor = toRgbaColor('#8ea4b0', 0.12 * o);
    spoke.strokeWidth = 1;
    spoke.add(center);
    spoke.add(new Point(targets[j].x, targets[j].y));
  }
}

function drawSquarusPiece(piece, x, y, scale, rotation, color, opacity, sharedEdgeMap, pieceIndex) {
  var cosR = Math.cos(rotation);
  var sinR = Math.sin(rotation);
  var edgeMap = Object.create(null);
  var outerStrokeWidth = Math.max(0.9, scale * 0.06);
  var innerStrokeWidth = Math.max(0.45, outerStrokeWidth * 0.58);

  function edgeKey(x1, y1, x2, y2) {
    if (x1 > x2 || (x1 === x2 && y1 > y2)) {
      var tx = x1;
      var ty = y1;
      x1 = x2;
      y1 = y2;
      x2 = tx;
      y2 = ty;
    }
    return String(x1) + ',' + String(y1) + '|' + String(x2) + ',' + String(y2);
  }

  function addEdge(x1, y1, x2, y2) {
    var key = edgeKey(x1, y1, x2, y2);
    if (!edgeMap[key]) {
      edgeMap[key] = { x1: x1, y1: y1, x2: x2, y2: y2, count: 0 };
    }
    edgeMap[key].count += 1;
  }

  function toWorldPoint(gridX, gridY) {
    var localX = (gridX - piece.centroidX) * scale;
    var localY = (gridY - piece.centroidY) * scale;
    return new Point(
      x + (localX * cosR - localY * sinR),
      y + (localX * sinR + localY * cosR)
    );
  }

  function worldEdgeKey(p1, p2) {
    var a = { x: p1.x, y: p1.y };
    var b = { x: p2.x, y: p2.y };
    if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
      var temp = a;
      a = b;
      b = temp;
    }
    return a.x.toFixed(4) + ',' + a.y.toFixed(4) + '|' + b.x.toFixed(4) + ',' + b.y.toFixed(4);
  }

  for (var i = 0; i < piece.cells.length; i++) {
    var cellX = piece.cells[i][0];
    var cellY = piece.cells[i][1];
    var corners = [
      { x: cellX, y: cellY },
      { x: cellX + 1, y: cellY },
      { x: cellX + 1, y: cellY + 1 },
      { x: cellX, y: cellY + 1 }
    ];

    var rect = new Path();
    rect.closed = true;
    for (var c = 0; c < corners.length; c++) {
      rect.add(toWorldPoint(corners[c].x, corners[c].y));
    }

    rect.fillColor = color;
    rect.opacity = opacity;

    addEdge(cellX, cellY, cellX + 1, cellY);
    addEdge(cellX + 1, cellY, cellX + 1, cellY + 1);
    addEdge(cellX + 1, cellY + 1, cellX, cellY + 1);
    addEdge(cellX, cellY + 1, cellX, cellY);
  }

  var edgeKeys = Object.keys(edgeMap);
  for (var e = 0; e < edgeKeys.length; e++) {
    var edge = edgeMap[edgeKeys[e]];
    var p1 = toWorldPoint(edge.x1, edge.y1);
    var p2 = toWorldPoint(edge.x2, edge.y2);
    var width = edge.count > 1 ? innerStrokeWidth : outerStrokeWidth;

    if (sharedEdgeMap) {
      var sharedKey = worldEdgeKey(p1, p2);
      if (!sharedEdgeMap[sharedKey]) {
        sharedEdgeMap[sharedKey] = {
          p1: p1,
          p2: p2,
          count: 0,
          owners: Object.create(null),
          innerStrokeWidth: innerStrokeWidth,
          outerStrokeWidth: outerStrokeWidth,
          opacity: opacity
        };
      }
      sharedEdgeMap[sharedKey].count += edge.count;
      if (isFinite(pieceIndex)) {
        sharedEdgeMap[sharedKey].owners[pieceIndex] = true;
      }
      sharedEdgeMap[sharedKey].innerStrokeWidth = Math.max(sharedEdgeMap[sharedKey].innerStrokeWidth, innerStrokeWidth);
      sharedEdgeMap[sharedKey].outerStrokeWidth = Math.max(sharedEdgeMap[sharedKey].outerStrokeWidth, outerStrokeWidth);
      sharedEdgeMap[sharedKey].opacity = Math.max(sharedEdgeMap[sharedKey].opacity, opacity);
      continue;
    }

    var line = new Path();
    line.add(p1);
    line.add(p2);
    line.strokeColor = '#000000';
    line.strokeWidth = width;
    line.strokeCap = 'butt';
    line.opacity = opacity;
  }
}

function drawSquarusSharedEdges(sharedEdgeMap) {
  if (!sharedEdgeMap) return;
  var keys = Object.keys(sharedEdgeMap);
  for (var i = 0; i < keys.length; i++) {
    var edge = sharedEdgeMap[keys[i]];
    var ownerCount = 0;
    for (var owner in edge.owners) {
      if (edge.owners[owner]) ownerCount += 1;
    }

    var isInterPieceSharedEdge = ownerCount > 1;
    var isInternalCellEdge = ownerCount <= 1 && edge.count > 1;
    var strokeWidth = isInternalCellEdge ? edge.innerStrokeWidth : edge.outerStrokeWidth;
    if (isInterPieceSharedEdge) {
      strokeWidth = edge.outerStrokeWidth * 1.08;
    }

    var line = new Path();
    line.add(edge.p1);
    line.add(edge.p2);
    line.strokeColor = '#000000';
    line.strokeWidth = strokeWidth;
    line.strokeCap = 'butt';
    line.opacity = edge.opacity;
  }
}

function getSquarusAnimationDurations() {
  var base = {
    scatter: 0.7,
    reveal: 0.0,
    travel: 2.0,
    snap: 0.5,
    fade: 0.5
  };

  var defaultSeconds = (60 / DEFAULT_ANIMATION_BPM) * BEATS_PER_STITCH_SEGMENT;
  var currentSeconds = getAnimationSecondsPerSegment();
  var scale = currentSeconds / Math.max(0.001, defaultSeconds);

  return {
    scatter: base.scatter * scale,
    reveal: base.reveal * scale,
    travel: base.travel * scale,
    snap: base.snap * scale,
    fade: base.fade * scale
  };
}

function getSquarusVisiblePieceCount(totalCount) {
  return normalizeSquarusPieceCount(squarusPieceCount, totalCount, squarusOrder);
}

function buildSquarusAnimationState() {
  var allPieces = getSquarusSequencedPieces(squarusOrder, squarusSequenceSeed);
  var allTargets = buildSquarusTargets(allPieces, squarusLayout);
  var placedCount = getSquarusVisiblePieceCount(allPieces.length);
  var minDim = Math.min(view.size.width, view.size.height);
  var center = view.center;
  var items = [];

  for (var i = 0; i < allPieces.length; i++) {
    var seedAngle = i * (Math.PI * (3 - Math.sqrt(5)));
    var desiredScatterRadius = minDim * (0.52 + ((i % 5) * 0.035));
    var pieceRadius = getSquarusPieceRenderRadius(allPieces[i], allTargets[i].scale);
    var orbitAllowance = (SQUARUS_SCATTER_WOBBLE_AMPLITUDE * allTargets[i].scale) + 2;
    var edgeAllowance = pieceRadius + orbitAllowance + SQUARUS_SCATTER_EDGE_PADDING;
    var maxRadius = getMaxRadiusAlongAngleFromCenter(seedAngle) - edgeAllowance;
    var scatterRadius = Math.max(0, Math.min(desiredScatterRadius, maxRadius));
    items.push({
      piece: allPieces[i],
      target: allTargets[i],
      scatterX: center.x + Math.cos(seedAngle) * scatterRadius,
      scatterY: center.y + Math.sin(seedAngle) * scatterRadius,
      scatterRotation: seedAngle + (Math.PI * 0.5)
    });
  }

  return {
    order: squarusOrder,
    layout: squarusLayout,
    mode: squarusAnimationMode,
    placedCount: placedCount,
    elapsed: 0,
    durations: getSquarusAnimationDurations(),
    items: items,
    targets: allTargets
  };
}

function getSquarusEntryFadeOpacity() {
  if (!squarusEntryFadeActive) return 1;
  var nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var elapsedMs = Math.max(0, nowMs - squarusEntryFadeStartMs);
  var t = clamp01(elapsedMs / Math.max(1, SQUARUS_ENTRY_FADE_MS));
  var eased = t * t * (3 - (2 * t));
  if (t >= 1) {
    squarusEntryFadeActive = false;
    return 1;
  }
  return eased;
}

function scheduleSquarusEntryFadeRedraw() {
  if (squarusEntryFadeRafPending || !squarusEntryFadeActive) return;
  squarusEntryFadeRafPending = true;
  requestAnimationFrame(function() {
    squarusEntryFadeRafPending = false;
    if (!squarusEntryFadeActive || currentExperienceId !== 'squarus') {
      squarusEntryFadeActive = false;
      return;
    }
    if (animationActive && squarusAnimationState) {
      return;
    }
    drawSquarusStatic();
  });
}

function renderSquarusAnimationStateFrame(state, opacityScale) {
  if (!state) return;
  var sceneOpacityScale = clamp01(isFinite(opacityScale) ? opacityScale : 1);
  var d = getSquarusAnimationDurations();
  state.durations = d;
  var t = state.elapsed;
  var pieceMotionDuration = d.scatter + d.reveal + d.travel + d.snap;
  var isSequential = state.mode === 'sequential';
  var timelineCoreEnd = state.placedCount > 0
    ? (isSequential ? (pieceMotionDuration * state.placedCount) : pieceMotionDuration)
    : 0;
  var tEnd = timelineCoreEnd + d.fade;

  project.activeLayer.removeChildren();

  var guideOpacity = 0;
  if (t >= d.scatter && t < (d.scatter + d.reveal)) {
    guideOpacity = (t - d.scatter) / d.reveal;
  } else if (t >= (d.scatter + d.reveal) && t < timelineCoreEnd) {
    guideOpacity = 1;
  } else if (t >= timelineCoreEnd) {
    guideOpacity = 1 - clamp01((t - timelineCoreEnd) / d.fade);
  }
  drawSquarusGuide(state.layout, state.targets.slice(0, state.placedCount), guideOpacity * sceneOpacityScale);
  var sharedEdgeMap = Object.create(null);

  for (var i = 0; i < state.items.length; i++) {
    var item = state.items[i];
    var isPlacedPiece = i < state.placedCount;
    var localT = isSequential ? (t - (i * pieceMotionDuration)) : t;
    var x = item.scatterX;
    var y = item.scatterY;
    var rotation = item.scatterRotation;
    var scale = item.target.scale;
    var opacity = 0.94 * sceneOpacityScale;

    if (!isPlacedPiece) {
      drawSquarusPiece(item.piece, x, y, scale, rotation, item.target.color, opacity, sharedEdgeMap, i);
      continue;
    }

    if (localT <= 0) {
      drawSquarusPiece(item.piece, x, y, scale, rotation, item.target.color, opacity, sharedEdgeMap, i);
      continue;
    }

    if (localT < d.scatter) {
      x = item.scatterX;
      y = item.scatterY;
    } else if (localT < (d.scatter + d.reveal + d.travel)) {
      var travelP = easeInOutCubic(clamp01((localT - d.scatter - d.reveal) / d.travel));
      x = item.scatterX + (item.target.x - item.scatterX) * travelP;
      y = item.scatterY + (item.target.y - item.scatterY) * travelP;
      rotation = interpolateAngleShortest(item.scatterRotation, item.target.rotation, travelP);
    } else if (localT < pieceMotionDuration) {
      x = item.target.x;
      y = item.target.y;
      rotation = item.target.rotation;
    } else {
      x = item.target.x;
      y = item.target.y;
      rotation = item.target.rotation;
    }

    drawSquarusPiece(item.piece, x, y, scale, rotation, item.target.color, opacity, sharedEdgeMap, i);
  }

  drawSquarusSharedEdges(sharedEdgeMap);

  if (t >= tEnd) {
    drawSquarusGuide(state.layout, state.targets.slice(0, state.placedCount), 0);
  }
}

function drawSquarusStatic() {
  var state = buildSquarusAnimationState();
  if (!state) {
    clearHighlightedHoleNumbers();
    return;
  }
  var d = getSquarusAnimationDurations();
  state.durations = d;
  var pieceMotionDuration = d.scatter + d.reveal + d.travel + d.snap;
  if (state.placedCount > 0) {
    state.elapsed = (state.mode === 'sequential' ? (pieceMotionDuration * state.placedCount) : pieceMotionDuration) + d.fade + 0.01;
  } else {
    state.elapsed = d.scatter + 0.01;
  }
  var entryOpacity = getSquarusEntryFadeOpacity();
  renderSquarusAnimationStateFrame(state, entryOpacity);
  if (entryOpacity < 1) {
    scheduleSquarusEntryFadeRedraw();
  }
  clearHighlightedHoleNumbers();
}

function runSquarusAnimationFrame(event) {
  if (!animationActive || !squarusAnimationState) return;
  squarusAnimationState.elapsed += Math.min(event.delta || 0, 0.1);
  renderSquarusAnimationStateFrame(squarusAnimationState);

  var d = getSquarusAnimationDurations();
  squarusAnimationState.durations = d;
  var pieceMotionDuration = d.scatter + d.reveal + d.travel + d.snap;
  var total = squarusAnimationState.placedCount > 0
    ? ((squarusAnimationState.mode === 'sequential')
      ? (pieceMotionDuration * squarusAnimationState.placedCount + d.fade)
      : (pieceMotionDuration + d.fade))
    : d.scatter;
  if (squarusAnimationState.elapsed < total) return;

  animationActive = false;
  animationPlaybackState = 'idle';
  view.onFrame = null;
  squarusAnimationState = null;
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  drawSquarusStatic();
}

function animateSquarus() {
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  mashrabiyaAnimationState = null;
  squarusAnimationState = buildSquarusAnimationState();
  if (!squarusAnimationState || !squarusAnimationState.items.length || squarusAnimationState.placedCount <= 0) {
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    scheduleUrlStateSync(false);
    drawSquarusStatic();
    return;
  }

  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderSquarusAnimationStateFrame(squarusAnimationState);
  view.onFrame = runSquarusAnimationFrame;
}

function runTriangulaAnimationFrame(event) {
  if (!animationActive || !triangulaAnimationState) return;
  var delta = Math.min(event.delta || 0, 0.1);
  triangulaAnimationState.elapsed += delta;

  while (animationActive) {
    var activeStep = triangulaAnimationState.steps[triangulaAnimationState.stepIndex];
    if (!activeStep) break;
    var stepDuration = getTriangulaStepDurationSeconds(activeStep);
    if (triangulaAnimationState.elapsed < stepDuration) break;
    triangulaAnimationState.elapsed -= stepDuration;
    triangulaAnimationState.stepIndex += 1;

    if (triangulaAnimationState.stepIndex >= triangulaAnimationState.steps.length) {
      animationActive = false;
      animationPlaybackState = 'idle';
      triangulaAnimationState = null;
      view.onFrame = null;
      syncAnimateButtonLabel();
      updateMusicPlaybackState();
      scheduleUrlStateSync(false);
      drawTriangulaStatic();
      return;
    }
  }

  renderTriangulaAnimationStateFrame(triangulaAnimationState);
}

function animateTriangula() {
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  squarusAnimationState = null;
  triangulaAnimationState = null;
  mashrabiyaAnimationState = null;

  var startDepth = triangulaCountToDepth(triangulaStartCount);
  var endDepth = triangulaCountToDepth(triangulaTargetCount);
  if (endDepth < startDepth) {
    endDepth = startDepth;
  }

  var timeline = buildTriangulaSteps(startDepth, endDepth);
  if (!timeline.steps.length) {
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    scheduleUrlStateSync(false);
    drawTriangulaStatic();
    return;
  }

  triangulaAnimationState = {
    startDepth: startDepth,
    targetDepth: endDepth,
    steps: timeline.steps,
    depthItemCounts: timeline.depthItemCounts,
    stepIndex: 0,
    elapsed: 0,
    mode: triangulaConstructionMode,
    fractalMode: triangulaFractalMode
  };

  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderTriangulaAnimationStateFrame(triangulaAnimationState);
  view.onFrame = runTriangulaAnimationFrame;
}

function getMashrabiyaStarJump(fold) {
  var safeFold = sanitizeMashrabiyaFold(fold, 12);
  if (safeFold === 8) return 3;
  if (safeFold === 6) return 5;
  return 5;
}

function buildMashrabiyaStepSequence(pointCount, startIndex, jumpValue) {
  var n = parseBoundedInt(pointCount, 3, MAX_HOLES, 12);
  var start = ((parseInt(startIndex, 10) % n) + n) % n;
  var jump = ((parseInt(jumpValue, 10) % n) + n) % n;
  if (!jump) jump = 1;

  var sequence = [];
  var visited = new Array(n).fill(false);
  var current = start;
  var safety = n * 4;

  for (var i = 0; i < safety; i++) {
    if (visited[current]) break;
    visited[current] = true;
    sequence.push(current);
    current = (current + jump) % n;
  }

  return sequence;
}

function buildMashrabiyaRosetteGeometry(fold, geometryMode) {
  var safeFold = sanitizeMashrabiyaFold(fold, 12);
  var safeGeometryMode = sanitizeMashrabiyaGeometryMode(geometryMode, mashrabiyaGeometryMode);
  var center = view.center;
  var radius = Math.max(120, Math.min(view.size.width, view.size.height) * 0.42);
  var angleStep = (Math.PI * 2) / safeFold;
  var petalRadius = radius * 0.93;
  var bridgeRadius = radius * 0.67;

  function pointAt(theta, r) {
    return new Point(
      center.x + r * Math.cos(theta),
      center.y + r * Math.sin(theta)
    );
  }

  var petalTips = [];
  var scaffoldPoints = [];
  var bridgePoints = [];
  var guideCircleVertices = [];
  var innerGuideCircleVertices = [];

  var circleSampleCount = 180;
  for (var sample = 0; sample < circleSampleCount; sample++) {
    var circleAngle = -Math.PI / 2 + ((Math.PI * 2 * sample) / circleSampleCount);
    guideCircleVertices.push(pointAt(circleAngle, petalRadius));
  }

  for (var i = 0; i < safeFold; i++) {
    var baseAngle = -Math.PI / 2 + i * angleStep;
    var halfAngle = baseAngle + (angleStep / 2);
    petalTips.push(pointAt(baseAngle, petalRadius));
    bridgePoints.push(pointAt(halfAngle, bridgeRadius));
  }

  // Dense lifted stitch-vertex construction for rosette folds.
  // 6-fold uses 96 points to preserve the intended hexagon + projected-thread geometry.
  var scaffoldCount = (safeFold === 6) ? 96 : (safeFold * 8);
  var scaffoldAngleStep = (Math.PI * 2) / scaffoldCount;
  var scaffoldRadius = petalRadius;
  var scaffoldPhase = -Math.PI / 2;

  for (var si = 0; si < scaffoldCount; si++) {
    scaffoldPoints.push(pointAt(scaffoldPhase + si * scaffoldAngleStep, scaffoldRadius));
  }

  // Keep the rendered circle guide on the same vertex set as stitched sequences,
  // so thread endpoints visually sit on the circle instead of appearing outside.
  guideCircleVertices = scaffoldPoints.slice();

  var circleSequence = buildMashrabiyaStepSequence(scaffoldCount, 0, 1);
  var firstPolygonSequence = buildMashrabiyaStepSequence(scaffoldCount, 0, 16);
  var offsetPolygonSequence = buildMashrabiyaStepSequence(scaffoldCount, 8, 16);
  var starJump = Math.max(1, Math.round(scaffoldCount / 2) - 4);
  var starSequence = buildMashrabiyaStepSequence(scaffoldCount, 2, starJump);
  var starThreadSegments = buildTaggedSegmentsFromSequence(scaffoldPoints, starSequence, 'thread3');

  function getCircleIntersectionsForInfiniteLine(lineStart, lineEnd, circleCenter, circleRadius) {
    var direction = lineEnd.subtract(lineStart);
    var a = direction.dot(direction);
    if (a <= 1e-8) return [];
    var f = lineStart.subtract(circleCenter);
    var b = 2 * f.dot(direction);
    var c = f.dot(f) - (circleRadius * circleRadius);
    var discriminant = (b * b) - (4 * a * c);
    if (discriminant < 0) return [];

    var sqrtDisc = Math.sqrt(Math.max(0, discriminant));
    var t1 = (-b - sqrtDisc) / (2 * a);
    var t2 = (-b + sqrtDisc) / (2 * a);
    var hits = [lineStart.add(direction.multiply(t1))];
    if (Math.abs(t2 - t1) > 1e-8) {
      hits.push(lineStart.add(direction.multiply(t2)));
    }
    return hits;
  }

  function getOuterProjectionPairForRosetteSegment(fromPoint, toPoint) {
    var direction = toPoint.subtract(fromPoint);
    var segmentLength = direction.length;
    if (segmentLength <= 0.001) {
      return { fromHit: null, toHit: null };
    }
    var unit = direction.normalize(1);
    var hits = getCircleIntersectionsForInfiniteLine(fromPoint, toPoint, center, scaffoldRadius);
    if (!hits.length) {
      return { fromHit: null, toHit: null };
    }

    var fromHit = null;
    var toHit = null;
    var bestBefore = -Infinity;
    var bestAfter = Infinity;
    var minT = Infinity;
    var maxT = -Infinity;
    var minPoint = null;
    var maxPoint = null;

    for (var i = 0; i < hits.length; i++) {
      var t = hits[i].subtract(fromPoint).dot(unit);
      if (t < minT) {
        minT = t;
        minPoint = hits[i];
      }
      if (t > maxT) {
        maxT = t;
        maxPoint = hits[i];
      }
      if (t < -1e-4 && t > bestBefore) {
        bestBefore = t;
        fromHit = hits[i];
      }
      if (t > segmentLength + 1e-4 && t < bestAfter) {
        bestAfter = t;
        toHit = hits[i];
      }
    }

    if (!fromHit) fromHit = minPoint;
    if (!toHit) toHit = maxPoint;

    return {
      fromHit: fromHit,
      toHit: toHit
    };
  }

  function buildProjectedSegmentsFromInnerSequence(innerPoints, innerSequence) {
    var segments = [];
    for (var i = 0; i < innerSequence.length; i++) {
      var fromInner = innerPoints[innerSequence[i]];
      var toInner = innerPoints[innerSequence[(i + 1) % innerSequence.length]];
      if (!fromInner || !toInner || fromInner.getDistance(toInner) <= 1e-6) continue;

      var projection = getOuterProjectionPairForRosetteSegment(fromInner, toInner);
      if (projection.fromHit && projection.fromHit.getDistance(fromInner) > 1e-6) {
        segments.push({ from: projection.fromHit, to: fromInner, tag: 'thread3', edgeIndex: segments.length });
      }
      segments.push({ from: fromInner, to: toInner, tag: 'thread3', edgeIndex: segments.length });
      if (projection.toHit && projection.toHit.getDistance(toInner) > 1e-6) {
        segments.push({ from: toInner, to: projection.toHit, tag: 'thread3', edgeIndex: segments.length });
      }
    }
    return segments;
  }

  function buildInnerScaffoldRing(innerCount, innerRatio) {
    var points = [];
    var count = Math.max(3, parseBoundedInt(innerCount, 3, MAX_HOLES, Math.round(scaffoldCount * 0.5)));
    var ratio = Math.max(0.1, Math.min(0.95, isFinite(innerRatio) ? innerRatio : 0.5));
    var innerRadius = scaffoldRadius * ratio;
    for (var i = 0; i < count; i++) {
      points.push(pointAt(scaffoldPhase + i * ((Math.PI * 2) / count), innerRadius));
    }
    return points;
  }

  if (safeFold === 12 && scaffoldCount === 96) {
    var rosetteInnerRatio = 0.5;
    var rosetteInnerCount = 48;
    var rosetteInnerRadius = scaffoldRadius * rosetteInnerRatio;
    var innerScaffoldPoints = [];
    for (var ip = 0; ip < rosetteInnerCount; ip++) {
      innerScaffoldPoints.push(pointAt(scaffoldPhase + ip * ((Math.PI * 2) / rosetteInnerCount), rosetteInnerRadius));
    }
    innerGuideCircleVertices = innerScaffoldPoints.slice();

    var thread3InnerSequence = buildMashrabiyaStepSequence(rosetteInnerCount, 2, 20);
    starSequence = thread3InnerSequence.slice();
    starJump = 20;
    starThreadSegments = buildProjectedSegmentsFromInnerSequence(innerScaffoldPoints, thread3InnerSequence);
  } else if (safeFold === 8 && scaffoldCount === 64) {
    var rosette8InnerPoints = buildInnerScaffoldRing(32, 0.5);
    innerGuideCircleVertices = rosette8InnerPoints.slice();
    var thread3InnerSequence8 = buildMashrabiyaStepSequence(rosette8InnerPoints.length, 2, 20);
    starSequence = thread3InnerSequence8.slice();
    starJump = 20;
    starThreadSegments = buildProjectedSegmentsFromInnerSequence(rosette8InnerPoints, thread3InnerSequence8);
  } else if (safeFold === 6 && scaffoldCount === 96) {
    // 6-fold uses one outer hexagon (start 1, step 16), then three projected inner threads.
    firstPolygonSequence = buildMashrabiyaStepSequence(scaffoldCount, 0, 16);
    offsetPolygonSequence = [];

    var rosette6InnerPoints = buildInnerScaffoldRing(48, 0.5);
    innerGuideCircleVertices = rosette6InnerPoints.slice();
    var rosette6Starts = [3, 5, 7]; // start holes 4, 6, 8 in 1-based indexing
    starThreadSegments = [];

    for (var rs = 0; rs < rosette6Starts.length; rs++) {
      var sequence6 = buildMashrabiyaStepSequence(rosette6InnerPoints.length, rosette6Starts[rs], 18);
      if (!starSequence || !starSequence.length) {
        starSequence = sequence6.slice();
      }
      var projected = buildProjectedSegmentsFromInnerSequence(rosette6InnerPoints, sequence6);
      for (var ps = 0; ps < projected.length; ps++) {
        projected[ps].edgeIndex = starThreadSegments.length;
        starThreadSegments.push(projected[ps]);
      }
    }

    starJump = 18;
  }

  function buildLegacyFillGeometry(starVertices) {
    var legacyPetals = [];
    var legacyPointRegions = [];
    for (var k = 0; k < safeFold; k++) {
      var kPrev = (k - 1 + safeFold) % safeFold;
      legacyPetals.push([petalTips[k], bridgePoints[k], bridgePoints[kPrev]]);
      var starVertex = starVertices[k % starVertices.length];
      legacyPointRegions.push([bridgePoints[kPrev], bridgePoints[k], starVertex]);
    }
    return {
      petals: legacyPetals,
      pointRegions: legacyPointRegions
    };
  }

  function buildSegmentsFromSequence(pointsList, sequence) {
    var segments = [];
    for (var idx = 0; idx < sequence.length; idx++) {
      var aIndex = sequence[idx];
      var bIndex = sequence[(idx + 1) % sequence.length];
      var aPoint = pointsList[aIndex];
      var bPoint = pointsList[bIndex];
      if (!aPoint || !bPoint || aPoint.getDistance(bPoint) <= 1e-6) continue;
      segments.push({
        from: aPoint,
        to: bPoint,
        edgeIndex: idx
      });
    }
    return segments;
  }

  function buildSegmentsFromClosedVertices(vertices, tag) {
    var segments = [];
    for (var idx = 0; idx < vertices.length; idx++) {
      var aPoint = vertices[idx];
      var bPoint = vertices[(idx + 1) % vertices.length];
      if (!aPoint || !bPoint || aPoint.getDistance(bPoint) <= 1e-6) continue;
      segments.push({
        from: aPoint,
        to: bPoint,
        tag: tag || 'line',
        edgeIndex: idx
      });
    }
    return segments;
  }

  function buildTaggedSegmentsFromSequence(pointsList, sequence, tag) {
    var raw = buildSegmentsFromSequence(pointsList, sequence);
    for (var idx = 0; idx < raw.length; idx++) {
      raw[idx].tag = tag || 'line';
    }
    return raw;
  }

  function segmentIntersection(segA, segB) {
    var p = segA.from;
    var p2 = segA.to;
    var q = segB.from;
    var q2 = segB.to;
    var r = p2.subtract(p);
    var s = q2.subtract(q);
    var denom = r.cross(s);
    if (Math.abs(denom) <= 1e-6) return null;

    var qp = q.subtract(p);
    var t = qp.cross(s) / denom;
    var u = qp.cross(r) / denom;
    var epsilon = 1e-6;
    if (t < -epsilon || t > (1 + epsilon) || u < -epsilon || u > (1 + epsilon)) {
      return null;
    }

    return {
      point: p.add(r.multiply(t)),
      t: t,
      u: u
    };
  }

  function dedupePointsByDistance(pointsList, threshold) {
    var deduped = [];
    var minDistance = Math.max(0.25, threshold || 0.75);
    for (var di = 0; di < pointsList.length; di++) {
      var candidate = pointsList[di];
      var exists = false;
      for (var dj = 0; dj < deduped.length; dj++) {
        if (candidate.getDistance(deduped[dj]) <= minDistance) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        deduped.push(candidate);
      }
    }
    return deduped;
  }

  function buildStarInnerVertices(pointsList, starSequence) {
    var segments = buildSegmentsFromSequence(pointsList, starSequence);
    var intersections = [];

    for (var a = 0; a < segments.length; a++) {
      for (var b = a + 1; b < segments.length; b++) {
        if (Math.abs(segments[a].edgeIndex - segments[b].edgeIndex) <= 1) continue;
        if ((segments[a].edgeIndex === 0 && segments[b].edgeIndex === segments.length - 1) ||
            (segments[b].edgeIndex === 0 && segments[a].edgeIndex === segments.length - 1)) {
          continue;
        }
        var hit = segmentIntersection(segments[a], segments[b]);
        if (hit && hit.point) {
          intersections.push(hit.point);
        }
      }
    }

    intersections = dedupePointsByDistance(intersections, radius * 0.008);
    if (!intersections.length) return [];

    intersections.sort(function(left, right) {
      return left.getDistance(center) - right.getDistance(center);
    });

    var innerVertices = intersections.slice(0, safeFold);
    innerVertices.sort(function(left, right) {
      var leftAngle = Math.atan2(left.y - center.y, left.x - center.x);
      var rightAngle = Math.atan2(right.y - center.y, right.x - center.x);
      return leftAngle - rightAngle;
    });

    return innerVertices;
  }

  function normalizeParam(value) {
    return Math.max(0, Math.min(1, value));
  }

  function addSplitValue(values, candidate, epsilon) {
    var eps = isFinite(epsilon) ? epsilon : 1e-5;
    var normalized = normalizeParam(candidate);
    for (var i = 0; i < values.length; i++) {
      if (Math.abs(values[i] - normalized) <= eps) return;
    }
    values.push(normalized);
  }

  function sortNumeric(values) {
    values.sort(function(a, b) {
      return a - b;
    });
    return values;
  }

  function getPointOnSegment(segment, t) {
    var ratio = normalizeParam(t);
    return segment.from.add(segment.to.subtract(segment.from).multiply(ratio));
  }

  function polygonSignedArea(vertices) {
    if (!vertices || vertices.length < 3) return 0;
    var sum = 0;
    for (var i = 0; i < vertices.length; i++) {
      var a = vertices[i];
      var b = vertices[(i + 1) % vertices.length];
      sum += (a.x * b.y) - (b.x * a.y);
    }
    return sum * 0.5;
  }

  function polygonCentroid(vertices) {
    if (!vertices || !vertices.length) return center;
    var areaFactor = 0;
    var cx = 0;
    var cy = 0;

    for (var i = 0; i < vertices.length; i++) {
      var a = vertices[i];
      var b = vertices[(i + 1) % vertices.length];
      var cross = (a.x * b.y) - (b.x * a.y);
      areaFactor += cross;
      cx += (a.x + b.x) * cross;
      cy += (a.y + b.y) * cross;
    }

    if (Math.abs(areaFactor) <= 1e-8) {
      var avgX = 0;
      var avgY = 0;
      for (var j = 0; j < vertices.length; j++) {
        avgX += vertices[j].x;
        avgY += vertices[j].y;
      }
      return new Point(avgX / vertices.length, avgY / vertices.length);
    }

    var scale = 1 / (3 * areaFactor);
    return new Point(cx * scale, cy * scale);
  }

  function vertexKey(point) {
    return String(Math.round(point.x * 1000)) + '|' + String(Math.round(point.y * 1000));
  }

  function extractFacesFromSegments(baseSegments) {
    if (!baseSegments || !baseSegments.length) return [];

    var splitParams = [];
    for (var i = 0; i < baseSegments.length; i++) {
      splitParams.push([0, 1]);
    }

    for (var a = 0; a < baseSegments.length; a++) {
      for (var b = a + 1; b < baseSegments.length; b++) {
        var hit = segmentIntersection(baseSegments[a], baseSegments[b]);
        if (!hit) continue;
        addSplitValue(splitParams[a], hit.t, 1e-5);
        addSplitValue(splitParams[b], hit.u, 1e-5);
      }
    }

    var undirectedEdges = [];
    for (var s = 0; s < baseSegments.length; s++) {
      var params = sortNumeric(splitParams[s]);
      for (var p = 0; p < params.length - 1; p++) {
        var t0 = params[p];
        var t1 = params[p + 1];
        if ((t1 - t0) <= 1e-5) continue;
        var from = getPointOnSegment(baseSegments[s], t0);
        var to = getPointOnSegment(baseSegments[s], t1);
        if (from.getDistance(to) <= 1e-4) continue;
        undirectedEdges.push({
          from: from,
          to: to,
          tag: baseSegments[s].tag || 'line'
        });
      }
    }

    var vertices = [];
    var vertexLookup = Object.create(null);
    function ensureVertex(point) {
      var key = vertexKey(point);
      var existing = vertexLookup[key];
      if (isFinite(existing)) return existing;
      var index = vertices.length;
      vertices.push(point);
      vertexLookup[key] = index;
      return index;
    }

    var directedEdges = [];
    var outgoingByVertex = [];
    for (var v = 0; v < undirectedEdges.length; v++) {
      var fromIndex = ensureVertex(undirectedEdges[v].from);
      var toIndex = ensureVertex(undirectedEdges[v].to);
      if (fromIndex === toIndex) continue;

      var forwardIndex = directedEdges.length;
      var backwardIndex = forwardIndex + 1;

      directedEdges.push({
        from: fromIndex,
        to: toIndex,
        twin: backwardIndex,
        next: -1,
        used: false,
        tag: undirectedEdges[v].tag,
        angle: Math.atan2(vertices[toIndex].y - vertices[fromIndex].y, vertices[toIndex].x - vertices[fromIndex].x)
      });
      directedEdges.push({
        from: toIndex,
        to: fromIndex,
        twin: forwardIndex,
        next: -1,
        used: false,
        tag: undirectedEdges[v].tag,
        angle: Math.atan2(vertices[fromIndex].y - vertices[toIndex].y, vertices[fromIndex].x - vertices[toIndex].x)
      });

      if (!outgoingByVertex[fromIndex]) outgoingByVertex[fromIndex] = [];
      if (!outgoingByVertex[toIndex]) outgoingByVertex[toIndex] = [];
      outgoingByVertex[fromIndex].push(forwardIndex);
      outgoingByVertex[toIndex].push(backwardIndex);
    }

    for (var ov = 0; ov < outgoingByVertex.length; ov++) {
      var edgeIds = outgoingByVertex[ov];
      if (!edgeIds || edgeIds.length < 1) continue;
      edgeIds.sort(function(leftId, rightId) {
        return directedEdges[leftId].angle - directedEdges[rightId].angle;
      });
    }

    for (var e = 0; e < directedEdges.length; e++) {
      var edge = directedEdges[e];
      var outgoing = outgoingByVertex[edge.to];
      if (!outgoing || !outgoing.length) continue;
      var twinIndex = edge.twin;
      var twinPosition = outgoing.indexOf(twinIndex);
      if (twinPosition === -1) continue;
      var nextPosition = (twinPosition - 1 + outgoing.length) % outgoing.length;
      edge.next = outgoing[nextPosition];
    }

    var faces = [];
    var minFaceArea = radius * radius * 0.00003;
    for (var startEdge = 0; startEdge < directedEdges.length; startEdge++) {
      if (directedEdges[startEdge].used) continue;
      var loopVertices = [];
      var tagSet = Object.create(null);
      var tagCounts = Object.create(null);
      var cursor = startEdge;
      var guard = 0;

      while (cursor >= 0 && !directedEdges[cursor].used && guard < 12000) {
        var current = directedEdges[cursor];
        current.used = true;
        loopVertices.push(vertices[current.from]);
        tagSet[current.tag] = true;
        tagCounts[current.tag] = (tagCounts[current.tag] || 0) + 1;
        cursor = current.next;
        guard += 1;
        if (cursor === startEdge) break;
      }

      if (cursor !== startEdge || loopVertices.length < 3) {
        continue;
      }

      var area = polygonSignedArea(loopVertices);
      if (Math.abs(area) < minFaceArea) continue;

      faces.push({
        id: faces.length,
        vertices: loopVertices,
        area: area,
        areaAbs: Math.abs(area),
        centroid: polygonCentroid(loopVertices),
        hasCircleEdge: !!tagSet.circle,
        starEdgeCount: tagCounts.star || 0
      });
    }

    if (faces.length > 1) {
      var outerIndex = 0;
      for (var f = 1; f < faces.length; f++) {
        if (faces[f].areaAbs > faces[outerIndex].areaAbs) {
          outerIndex = f;
        }
      }
      faces.splice(outerIndex, 1);
    }

    return faces;
  }

  var stitchedSegments = [];
  stitchedSegments = stitchedSegments.concat(buildTaggedSegmentsFromSequence(scaffoldPoints, firstPolygonSequence, 'thread1'));
  stitchedSegments = stitchedSegments.concat(buildTaggedSegmentsFromSequence(scaffoldPoints, offsetPolygonSequence, 'thread2'));
  stitchedSegments = stitchedSegments.concat(starThreadSegments);

  var extractedFaces = extractFacesFromSegments(stitchedSegments);
  var starPathVertices = buildStarInnerVertices(scaffoldPoints, starSequence);
  var petals = [];
  var pointRegions = [];
  var faceDiagnostics = {
    summary: {
      fold: safeFold,
      geometryMode: safeGeometryMode,
      extractedFaceCount: extractedFaces ? extractedFaces.length : 0
    },
    faces: []
  };

  function normalizeAnglePositive(theta) {
    var twoPi = Math.PI * 2;
    var value = theta % twoPi;
    if (value < 0) value += twoPi;
    return value;
  }

  function angleDistance(a, b) {
    var diff = Math.abs(normalizeAnglePositive(a) - normalizeAnglePositive(b));
    return Math.min(diff, Math.PI * 2 - diff);
  }

  function pointToSegmentDistance(point, segA, segB) {
    var segment = segB.subtract(segA);
    var denom = segment.dot(segment);
    if (denom <= 1e-10) return point.getDistance(segA);
    var t = point.subtract(segA).dot(segment) / denom;
    var clamped = Math.max(0, Math.min(1, t));
    var projection = segA.add(segment.multiply(clamped));
    return point.getDistance(projection);
  }

  function pointOnPolygonBoundary(point, polygon) {
    if (!polygon || polygon.length < 2) return false;
    var tolerance = Math.max(0.55, radius * 0.0024);
    for (var i = 0; i < polygon.length; i++) {
      var a = polygon[i];
      var b = polygon[(i + 1) % polygon.length];
      if (pointToSegmentDistance(point, a, b) <= tolerance) return true;
    }
    return false;
  }

  function getFaceBinByAngle(faceAngle) {
    var normalized = normalizeAnglePositive(faceAngle + (angleStep / 2));
    return Math.floor(normalized / angleStep) % safeFold;
  }

  function getFaceBin(face) {
    var c = face.centroid;
    var a = Math.atan2(c.y - center.y, c.x - center.x);
    return getFaceBinByAngle(a);
  }

  function selectOnePerBin(faceList, preferOuter) {
    var selectedByBin = new Array(safeFold);
    var metricByBin = new Array(safeFold);
    for (var i = 0; i < faceList.length; i++) {
      var face = faceList[i];
      var bin = getFaceBin(face);
      var metric = face.centroid.getDistance(center);
      if (!selectedByBin[bin]) {
        selectedByBin[bin] = face;
        metricByBin[bin] = metric;
        continue;
      }
      var better = preferOuter ? (metric > metricByBin[bin]) : (metric < metricByBin[bin]);
      if (better) {
        selectedByBin[bin] = face;
        metricByBin[bin] = metric;
      }
    }
    var selected = [];
    for (var b = 0; b < selectedByBin.length; b++) {
      if (selectedByBin[b]) selected.push(selectedByBin[b]);
    }
    selected.sort(function(left, right) {
      return getFaceBin(left) - getFaceBin(right);
    });
    return selected;
  }

  var thread1Cycle = buildMashrabiyaStepSequence(scaffoldCount, 0, 16);
  var thread2Cycle = buildMashrabiyaStepSequence(scaffoldCount, 8, 16);
  var scaffoldVertexIndices = [];
  var seenScaffoldIndex = Object.create(null);
  function pushUniqueScaffoldIndex(index) {
    var key = String(index);
    if (seenScaffoldIndex[key]) return;
    seenScaffoldIndex[key] = true;
    scaffoldVertexIndices.push(index);
  }
  for (var t1 = 0; t1 < thread1Cycle.length; t1++) pushUniqueScaffoldIndex(thread1Cycle[t1]);
  for (var t2 = 0; t2 < thread2Cycle.length; t2++) pushUniqueScaffoldIndex(thread2Cycle[t2]);

  function faceContainsScaffoldVertex(face) {
    for (var i = 0; i < scaffoldVertexIndices.length; i++) {
      var vertexPoint = scaffoldPoints[scaffoldVertexIndices[i]];
      if (pointOnPolygonBoundary(vertexPoint, face.vertices)) {
        return true;
      }
    }
    return false;
  }

  var starThreadVertices = [];
  var seenStarThreadVertex = Object.create(null);
  for (var st = 0; st < starThreadSegments.length; st++) {
    var stFrom = starThreadSegments[st] && starThreadSegments[st].from;
    var stTo = starThreadSegments[st] && starThreadSegments[st].to;
    if (stFrom) {
      var stFromKey = vertexKey(stFrom);
      if (!seenStarThreadVertex[stFromKey]) {
        seenStarThreadVertex[stFromKey] = true;
        starThreadVertices.push(stFrom);
      }
    }
    if (stTo) {
      var stToKey = vertexKey(stTo);
      if (!seenStarThreadVertex[stToKey]) {
        seenStarThreadVertex[stToKey] = true;
        starThreadVertices.push(stTo);
      }
    }
  }

  function faceContainsStarThreadVertex(face) {
    for (var i = 0; i < starThreadVertices.length; i++) {
      if (pointOnPolygonBoundary(starThreadVertices[i], face.vertices)) {
        return true;
      }
    }
    return false;
  }

  function edgeKeyForPoints(a, b) {
    var aKey = vertexKey(a);
    var bKey = vertexKey(b);
    return aKey < bKey ? (aKey + '::' + bKey) : (bKey + '::' + aKey);
  }

  function buildFaceAdjacencyBySharedEdge(faces) {
    var edgeOwners = Object.create(null);
    var adjacency = Object.create(null);
    for (var i = 0; i < faces.length; i++) {
      adjacency[String(faces[i].id)] = Object.create(null);
      for (var e = 0; e < faces[i].vertices.length; e++) {
        var a = faces[i].vertices[e];
        var b = faces[i].vertices[(e + 1) % faces[i].vertices.length];
        var key = edgeKeyForPoints(a, b);
        if (!edgeOwners[key]) edgeOwners[key] = [];
        edgeOwners[key].push(faces[i].id);
      }
    }

    var keys = Object.keys(edgeOwners);
    for (var k = 0; k < keys.length; k++) {
      var owners = edgeOwners[keys[k]];
      for (var aIdx = 0; aIdx < owners.length; aIdx++) {
        for (var bIdx = aIdx + 1; bIdx < owners.length; bIdx++) {
          adjacency[String(owners[aIdx])][String(owners[bIdx])] = true;
          adjacency[String(owners[bIdx])][String(owners[aIdx])] = true;
        }
      }
    }
    return adjacency;
  }

  function buildPathFromVertices(vertices) {
    if (!vertices || vertices.length < 3) return null;
    var path = new Path();
    for (var i = 0; i < vertices.length; i++) {
      path.add(vertices[i]);
    }
    path.closed = true;
    return path;
  }

  function mergeFacesToPolygon(faceList) {
    if (!faceList || !faceList.length) return [];
    if (faceList.length === 1) return faceList[0].vertices.slice();

    var merged = null;
    for (var i = 0; i < faceList.length; i++) {
      var facePath = buildPathFromVertices(faceList[i].vertices);
      if (!facePath) continue;

      if (!merged) {
        merged = facePath;
        continue;
      }

      var united = merged.unite(facePath);
      merged.remove();
      facePath.remove();
      merged = united;
    }

    if (!merged) return faceList[0].vertices.slice();

    var points = [];
    var bestSegments = null;
    if (merged.children && merged.children.length) {
      var bestArea = -1;
      for (var c = 0; c < merged.children.length; c++) {
        var child = merged.children[c];
        var childArea = Math.abs(child.area || 0);
        if (childArea > bestArea) {
          bestArea = childArea;
          bestSegments = child.segments;
        }
      }
    } else {
      bestSegments = merged.segments;
    }

    if (bestSegments && bestSegments.length >= 3) {
      for (var s = 0; s < bestSegments.length; s++) {
        points.push(bestSegments[s].point.clone());
      }
    }

    merged.remove();
    return points.length >= 3 ? points : faceList[0].vertices.slice();
  }

  function buildConnectedComponentsByBin(candidates, adjacency) {
    var byBin = new Array(safeFold);
    for (var i = 0; i < candidates.length; i++) {
      var info = candidates[i];
      var bin = getFaceBinByAngle(info.angle);
      if (!byBin[bin]) byBin[bin] = [];
      byBin[bin].push(info);
    }

    var componentsByBin = new Array(safeFold);
    for (var b = 0; b < safeFold; b++) {
      var bucket = byBin[b] || [];
      if (!bucket.length) {
        componentsByBin[b] = [];
        continue;
      }

      var bucketById = Object.create(null);
      for (var bi = 0; bi < bucket.length; bi++) {
        bucketById[String(bucket[bi].face.id)] = bucket[bi];
      }

      var visited = Object.create(null);
      var components = [];
      for (var k = 0; k < bucket.length; k++) {
        var seedId = String(bucket[k].face.id);
        if (visited[seedId]) continue;

        var queue = [seedId];
        visited[seedId] = true;
        var infos = [];

        while (queue.length) {
          var currentId = queue.shift();
          var currentInfo = bucketById[currentId];
          if (!currentInfo) continue;
          infos.push(currentInfo);

          var neighbors = adjacency[currentId] || {};
          var neighborIds = Object.keys(neighbors);
          for (var ni = 0; ni < neighborIds.length; ni++) {
            var nextId = neighborIds[ni];
            if (visited[nextId]) continue;
            if (!bucketById[nextId]) continue;
            visited[nextId] = true;
            queue.push(nextId);
          }
        }

        if (!infos.length) continue;

        var radiusSum = 0;
        var angleSumX = 0;
        var angleSumY = 0;
        var faces = [];
        for (var ci = 0; ci < infos.length; ci++) {
          radiusSum += infos[ci].radius;
          angleSumX += Math.cos(infos[ci].angle);
          angleSumY += Math.sin(infos[ci].angle);
          faces.push(infos[ci].face);
        }

        components.push({
          bin: b,
          infos: infos,
          faces: faces,
          faceIds: infos.map(function(info) { return info.face.id; }),
          radius: radiusSum / infos.length,
          angle: Math.atan2(angleSumY, angleSumX)
        });
      }

      componentsByBin[b] = components;
    }

    return componentsByBin;
  }

  function computeComponentStats(component) {
    var infos = component && component.infos ? component.infos : [];
    if (!infos.length) {
      component.radius = 0;
      component.angle = 0;
      component.faceIds = [];
      return;
    }
    var radiusSum = 0;
    var angleX = 0;
    var angleY = 0;
    var ids = [];
    for (var i = 0; i < infos.length; i++) {
      radiusSum += infos[i].radius;
      angleX += Math.cos(infos[i].angle);
      angleY += Math.sin(infos[i].angle);
      ids.push(infos[i].face.id);
    }
    component.radius = radiusSum / infos.length;
    component.angle = Math.atan2(angleY, angleX);
    component.faceIds = ids;
    component.faces = infos.map(function(info) { return info.face; });
  }

  function expandComponent(component, adjacency, infoById, options) {
    if (!component || !component.infos || !component.infos.length) return;
    options = options || {};
    var steps = Math.max(0, options.steps || 0);
    if (!steps) return;
    var maxAngleDrift = isFinite(options.maxAngleDrift) ? options.maxAngleDrift : (angleStep * 0.85);
    var baseAngle = component.angle;
    var seen = Object.create(null);
    for (var i = 0; i < component.infos.length; i++) {
      seen[String(component.infos[i].face.id)] = true;
    }

    for (var step = 0; step < steps; step++) {
      computeComponentStats(component);
      var currentRadius = component.radius;
      var toAdd = [];
      for (var ci = 0; ci < component.infos.length; ci++) {
        var faceId = String(component.infos[ci].face.id);
        var neighbors = adjacency[faceId] || {};
        var neighborIds = Object.keys(neighbors);
        for (var ni = 0; ni < neighborIds.length; ni++) {
          var neighborId = neighborIds[ni];
          if (seen[neighborId]) continue;
          var info = infoById[neighborId];
          if (!info) continue;
          if (angleDistance(info.angle, baseAngle) > maxAngleDrift) continue;
          if (options.filter && !options.filter(info, currentRadius, component)) continue;
          seen[neighborId] = true;
          toAdd.push(info);
        }
      }
      if (!toAdd.length) break;
      Array.prototype.push.apply(component.infos, toAdd);
    }
    computeComponentStats(component);
  }

  var starRegions = [];
  var debugRegions = [];

  if (extractedFaces && extractedFaces.length) {
    var starRadiusMean = 0;
    for (var sv = 0; sv < starPathVertices.length; sv++) {
      starRadiusMean += starPathVertices[sv].getDistance(center);
    }
    starRadiusMean = starPathVertices.length ? (starRadiusMean / starPathVertices.length) : (petalRadius * 0.33);

    var faceInfo = [];
    for (var fi = 0; fi < extractedFaces.length; fi++) {
      var face = extractedFaces[fi];
      var centroid = face.centroid;
      var radiusFromCenter = centroid.getDistance(center);
      var angle = Math.atan2(centroid.y - center.y, centroid.x - center.x);
      var hasScaffold = faceContainsScaffoldVertex(face);
      var hasStarThread = faceContainsStarThreadVertex(face);
      faceInfo.push({
        face: face,
        radius: radiusFromCenter,
        angle: angle,
        hasScaffold: hasScaffold,
        hasStarThread: hasStarThread
      });
    }

    faceInfo.sort(function(left, right) {
      return left.radius - right.radius;
    });

    var adjacency = buildFaceAdjacencyBySharedEdge(extractedFaces);
    var infoById = Object.create(null);
    for (var ii = 0; ii < faceInfo.length; ii++) {
      infoById[String(faceInfo[ii].face.id)] = faceInfo[ii];
    }

    var selectedPetalFaceIds = Object.create(null);
    var selectedPointFaceIds = Object.create(null);

    function getMashrabiyaFaceProfilesForFold(fold) {
      if (fold === 12) {
        return {
          petal: [
            {
              vertexCount: 5,
              requiresScaffold: true,
              requiresStarThread: false,
              radiusRange: [0.88, 0.95],
              areaRange: [0.02, 0.032],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.91674143,
              targetAreaNorm: 0.02500639
            },
            {
              vertexCount: 5,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.57, 0.66],
              areaRange: [0.1, 0.15],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.61423034,
              targetAreaNorm: 0.12815022
            }
          ],
          point: [
            {
              vertexCount: 4,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.27, 0.36],
              areaRange: [0.015, 0.03],
              pickMode: 'all',
              targetRadiusNorm: 0.31100423,
              targetAreaNorm: 0.02123412
            }
          ]
        };
      }

      if (fold === 8) {
        return {
          petal: [
            {
              vertexCount: 5,
              requiresScaffold: true,
              requiresStarThread: false,
              radiusRange: [0.78, 0.85],
              areaRange: [0.06, 0.09],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.81345281,
              targetAreaNorm: 0.07547373
            },
            {
              vertexCount: 5,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.5, 0.56],
              areaRange: [0.11, 0.14],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.53221215,
              targetAreaNorm: 0.13043301
            }
          ],
          point: [
            {
              vertexCount: 4,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.3, 0.34],
              areaRange: [0.028, 0.033],
              pickMode: 'all',
              targetRadiusNorm: 0.31903559,
              targetAreaNorm: 0.03033009
            }
          ]
        };
      }

      return {
        petal: [],
        point: []
      };
    }

    function matchFaceProfile(info, profile, outerRadiusValue) {
      if (!info || !profile || !info.face || !info.face.vertices) return false;
      if (!isFinite(outerRadiusValue) || outerRadiusValue <= 1e-6) return false;

      if (isFinite(profile.vertexCount) && info.face.vertices.length !== profile.vertexCount) return false;
      if (typeof profile.requiresScaffold === 'boolean' && !!info.hasScaffold !== profile.requiresScaffold) return false;
      if (typeof profile.requiresStarThread === 'boolean' && !!info.hasStarThread !== profile.requiresStarThread) return false;

      var radiusNorm = info.radius / outerRadiusValue;
      var areaNorm = Math.abs(info.face.areaAbs || 0) / (outerRadiusValue * outerRadiusValue);
      if (!isFinite(radiusNorm) || !isFinite(areaNorm)) return false;

      if (profile.radiusRange && profile.radiusRange.length === 2) {
        if (radiusNorm < profile.radiusRange[0] || radiusNorm > profile.radiusRange[1]) return false;
      }
      if (profile.areaRange && profile.areaRange.length === 2) {
        if (areaNorm < profile.areaRange[0] || areaNorm > profile.areaRange[1]) return false;
      }

      return true;
    }

    function pickFacesByProfile(faceList, profile, outerRadiusValue) {
      var matches = faceList.filter(function(info) {
        return matchFaceProfile(info, profile, outerRadiusValue);
      });
      if (!matches.length) return [];

      if (profile.pickMode !== 'per-bin-best') {
        return matches;
      }

      var bestByBin = new Array(safeFold);
      var scoreByBin = new Array(safeFold);
      var targetRadius = isFinite(profile.targetRadiusNorm) ? profile.targetRadiusNorm : 0;
      var targetArea = isFinite(profile.targetAreaNorm) ? profile.targetAreaNorm : 0;

      for (var i = 0; i < matches.length; i++) {
        var info = matches[i];
        var bin = getFaceBin(info.face);
        if (bin < 0 || bin >= safeFold) continue;
        var radiusNorm = info.radius / outerRadiusValue;
        var areaNorm = Math.abs(info.face.areaAbs || 0) / (outerRadiusValue * outerRadiusValue);
        var score = Math.abs(radiusNorm - targetRadius) + (0.55 * Math.abs(areaNorm - targetArea));
        if (!bestByBin[bin] || score < scoreByBin[bin]) {
          bestByBin[bin] = info;
          scoreByBin[bin] = score;
        }
      }

      var chosen = [];
      for (var b = 0; b < bestByBin.length; b++) {
        if (bestByBin[b]) chosen.push(bestByBin[b]);
      }
      return chosen;
    }

    function markFacesFromProfiles(faceList, profiles, outerRadiusValue) {
      var result = Object.create(null);
      var profileList = Array.isArray(profiles) ? profiles : [];
      for (var p = 0; p < profileList.length; p++) {
        var picked = pickFacesByProfile(faceList, profileList[p], outerRadiusValue);
        for (var i = 0; i < picked.length; i++) {
          result[String(picked[i].face.id)] = true;
        }
      }
      return result;
    }

    var faceProfiles = getMashrabiyaFaceProfilesForFold(safeFold);
    var forcedPetalFaceIds = markFacesFromProfiles(faceInfo, faceProfiles.petal, petalRadius);
    var forcedPetalFaceIdList = Object.keys(forcedPetalFaceIds);
    for (var fp = 0; fp < forcedPetalFaceIdList.length; fp++) {
      selectedPetalFaceIds[forcedPetalFaceIdList[fp]] = true;
    }

    var forcedPointFaceIds = markFacesFromProfiles(faceInfo, faceProfiles.point, petalRadius);
    var forcedPointFaceIdList = Object.keys(forcedPointFaceIds);
    for (var fpt = 0; fpt < forcedPointFaceIdList.length; fpt++) {
      selectedPointFaceIds[forcedPointFaceIdList[fpt]] = true;
    }

    // 1) pickStarFaces: connected inner components (can merge multiple atomic faces).
    var starCandidates = faceInfo.filter(function(info) {
      if (forcedPetalFaceIds[String(info.face.id)]) return false;
      if (forcedPointFaceIds[String(info.face.id)]) return false;
      return !info.hasScaffold && (info.hasStarThread || info.radius <= (starRadiusMean * 1.35));
    });
    if (!starCandidates.length) {
      starCandidates = faceInfo.filter(function(info) {
        if (forcedPetalFaceIds[String(info.face.id)]) return false;
        if (forcedPointFaceIds[String(info.face.id)]) return false;
        return !info.hasScaffold;
      });
    }

    var starComponentsByBin = buildConnectedComponentsByBin(starCandidates, adjacency);
    var selectedStarComponents = [];
    var usedStarFaceIds = Object.create(null);
    var selectedStarFaceIds = Object.create(null);

    for (var sb = 0; sb < safeFold; sb++) {
      var starBucket = starComponentsByBin[sb] || [];
      if (!starBucket.length) continue;
      starBucket.sort(function(left, right) {
        return left.radius - right.radius;
      });
      var chosenStar = starBucket[0];
      expandComponent(chosenStar, adjacency, infoById, {
        steps: 2,
        maxAngleDrift: angleStep * 0.72,
        filter: function(info, currentRadius) {
          if (forcedPetalFaceIds[String(info.face.id)]) return false;
          if (forcedPointFaceIds[String(info.face.id)]) return false;
          return !info.hasScaffold && info.radius >= (currentRadius * 0.9);
        }
      });
      selectedStarComponents.push(chosenStar);
      for (var sfi = 0; sfi < chosenStar.faces.length; sfi++) {
        usedStarFaceIds[String(chosenStar.faces[sfi].id)] = true;
        selectedStarFaceIds[String(chosenStar.faces[sfi].id)] = true;
      }
      var mergedStar = mergeFacesToPolygon(chosenStar.faces);
      if (mergedStar.length >= 3) {
        starRegions.push(mergedStar);
        debugRegions.push({
          label: 'S ' + sb + ' (' + chosenStar.faces.length + ')',
          centroid: polygonCentroid(mergedStar),
          color: '#9c6f1d'
        });
      }
    }

    if (selectedStarComponents.length) {
      var starCenters = [];
      for (var sc = 0; sc < selectedStarComponents.length; sc++) {
        var regionCentroid = polygonCentroid(mergeFacesToPolygon(selectedStarComponents[sc].faces));
        starCenters.push(regionCentroid);
      }
      starCenters.sort(function(left, right) {
        var leftAngle = Math.atan2(left.y - center.y, left.x - center.x);
        var rightAngle = Math.atan2(right.y - center.y, right.x - center.x);
        return leftAngle - rightAngle;
      });
      starPathVertices = starCenters.slice(0, safeFold);
      starRadiusMean = 0;
      for (var ss = 0; ss < starPathVertices.length; ss++) {
        starRadiusMean += starPathVertices[ss].getDistance(center);
      }
      starRadiusMean = starRadiusMean / Math.max(1, starPathVertices.length);
    }

    var useForcedPetalProfiles = forcedPetalFaceIdList.length > 0;

    // 2) pickPetalFaces: connected outer scaffold components, one per sector.
    if (!useForcedPetalProfiles) {
      var petalInfoCandidates = faceInfo.filter(function(info) {
        if (forcedPetalFaceIds[String(info.face.id)]) return false;
        return info.hasScaffold && (info.hasStarThread || info.radius > (starRadiusMean * 1.3));
      });
      if (!petalInfoCandidates.length) {
        petalInfoCandidates = faceInfo.filter(function(info) {
          if (forcedPetalFaceIds[String(info.face.id)]) return false;
          return info.hasScaffold;
        });
      }

      var petalComponentsByBin = buildConnectedComponentsByBin(petalInfoCandidates, adjacency);

      for (var pb = 0; pb < safeFold; pb++) {
        var petalBucket = petalComponentsByBin[pb] || [];
        if (!petalBucket.length) continue;
        petalBucket.sort(function(left, right) {
          return right.radius - left.radius;
        });
        var chosenPetal = petalBucket[0];
        expandComponent(chosenPetal, adjacency, infoById, {
          steps: 2,
          maxAngleDrift: angleStep * 0.78,
          filter: function(info, currentRadius) {
            return info.radius <= currentRadius && info.radius >= (starRadiusMean * 1.08);
          }
        });
        for (var pfi = 0; pfi < chosenPetal.faces.length; pfi++) {
          selectedPetalFaceIds[String(chosenPetal.faces[pfi].id)] = true;
        }
        var mergedPetal = mergeFacesToPolygon(chosenPetal.faces);
        if (mergedPetal.length >= 3) {
          petals.push(mergedPetal);
          debugRegions.push({
            label: 'P ' + pb + ' (' + chosenPetal.faces.length + ')',
            centroid: polygonCentroid(mergedPetal),
            color: '#a9491e'
          });
        }
      }
    }

    if (useForcedPetalProfiles) {
      for (var fi2 = 0; fi2 < faceInfo.length; fi2++) {
        var forcedInfo = faceInfo[fi2];
        var forcedId = String(forcedInfo.face.id);
        if (!forcedPetalFaceIds[forcedId]) continue;
        var forcedBin = getFaceBin(forcedInfo.face);
        petals.push(forcedInfo.face.vertices.slice());
        debugRegions.push({
          label: 'P ' + forcedBin + ' (1)',
          centroid: polygonCentroid(forcedInfo.face.vertices),
          color: '#a9491e'
        });
      }
    }

    var useForcedPointProfiles = forcedPointFaceIdList.length > 0;
    if (useForcedPointProfiles) {
      for (var fi3 = 0; fi3 < faceInfo.length; fi3++) {
        var forcedPointInfo = faceInfo[fi3];
        var forcedPointId = String(forcedPointInfo.face.id);
        if (!forcedPointFaceIds[forcedPointId]) continue;
        var forcedPointBin = getFaceBin(forcedPointInfo.face);
        pointRegions.push(forcedPointInfo.face.vertices.slice());
        debugRegions.push({
          label: 'T ' + forcedPointBin + ' (1)',
          centroid: polygonCentroid(forcedPointInfo.face.vertices),
          color: '#a73631'
        });
      }
    }

    // 3) pickTriangleFaces: connected components adjacent to star components, up to two per sector.
    if (!useForcedPointProfiles) {
      var starFaceIdLookup = Object.create(null);
      var starFaceIdList = Object.keys(usedStarFaceIds);
      for (var sId = 0; sId < starFaceIdList.length; sId++) {
        starFaceIdLookup[starFaceIdList[sId]] = true;
      }

      var triangleCandidates = [];
      for (var ti = 0; ti < faceInfo.length; ti++) {
        var info = faceInfo[ti];
        var infoId = String(info.face.id);
        if (selectedPetalFaceIds[infoId]) continue;
        if (starFaceIdLookup[infoId]) continue;
        if (info.hasScaffold) continue;
        if (info.radius <= (starRadiusMean * 0.95)) continue;

        var neighbors = adjacency[infoId] || {};
        var neighborIds = Object.keys(neighbors);
        var touchesStar = false;
        for (var ni = 0; ni < neighborIds.length; ni++) {
          if (starFaceIdLookup[neighborIds[ni]]) {
            touchesStar = true;
            break;
          }
        }
        if (!touchesStar) continue;
        triangleCandidates.push(info);
      }

      var triangleComponentsByBin = buildConnectedComponentsByBin(triangleCandidates, adjacency);
      for (var tb = 0; tb < safeFold; tb++) {
        var triBucket = triangleComponentsByBin[tb] || [];
        if (!triBucket.length) continue;
        var centerAngle = -Math.PI / 2 + tb * angleStep;
        triBucket.sort(function(left, right) {
          var leftKey = angleDistance(left.angle, centerAngle) * 10 + left.radius;
          var rightKey = angleDistance(right.angle, centerAngle) * 10 + right.radius;
          return leftKey - rightKey;
        });

        for (var tk = 0; tk < triBucket.length && tk < 2; tk++) {
          expandComponent(triBucket[tk], adjacency, infoById, {
            steps: 1,
            maxAngleDrift: angleStep * 0.65,
            filter: function(info) {
              return !info.hasScaffold;
            }
          });
          for (var tif = 0; tif < triBucket[tk].faces.length; tif++) {
            var triFace = triBucket[tk].faces[tif];
            if (!triFace || !triFace.vertices || triFace.vertices.length < 3) continue;
            var triFaceId = String(triFace.id);
            if (selectedPointFaceIds[triFaceId]) continue;
            selectedPointFaceIds[triFaceId] = true;
            pointRegions.push(triFace.vertices.slice());
            debugRegions.push({
              label: 'T ' + tb + ' (1)',
              centroid: polygonCentroid(triFace.vertices),
              color: '#a73631'
            });
          }
        }
      }
    }

    // Fold-8 specific stabilization: build star/point fill regions directly
    // from selected face IDs so fill edges always match extracted face boundaries.
    if (safeFold === 8) {
      starRegions = [];
      pointRegions = [];
      for (var fs = 0; fs < faceInfo.length; fs++) {
        var selectedInfo = faceInfo[fs];
        var selectedFace = selectedInfo.face;
        if (!selectedFace || !selectedFace.vertices || selectedFace.vertices.length < 3) continue;
        var selectedId = String(selectedFace.id);

        if (selectedStarFaceIds[selectedId]) {
          starRegions.push(selectedFace.vertices.slice());
          continue;
        }

        if (selectedPointFaceIds[selectedId]) {
          pointRegions.push(selectedFace.vertices.slice());
        }
      }
    }

    // Keep point fills strictly aligned with selected point face IDs.
    // This avoids union/merge artifacts causing correct labels but missing fills.
    var selectedPointFaceIdListForFill = Object.keys(selectedPointFaceIds);
    if (selectedPointFaceIdListForFill.length) {
      pointRegions = [];

      for (var pf = 0; pf < faceInfo.length; pf++) {
        var pointInfo = faceInfo[pf];
        var pointFaceId = String(pointInfo.face.id);
        if (!selectedPointFaceIds[pointFaceId]) continue;
        if (!pointInfo.face.vertices || pointInfo.face.vertices.length < 3) continue;
        pointRegions.push(pointInfo.face.vertices.slice());
      }
    }

    for (var fd = 0; fd < faceInfo.length; fd++) {
      var info = faceInfo[fd];
      var face = info.face;
      var faceId = String(face.id);
      var classification = 'other';
      if (selectedPetalFaceIds[faceId]) {
        classification = 'petal';
      } else if (selectedPointFaceIds[faceId]) {
        classification = 'point';
      } else if (selectedStarFaceIds[faceId]) {
        classification = 'star';
      }
      faceDiagnostics.faces.push({
        id: face.id,
        bin: getFaceBin(face),
        classification: classification,
        radius: info.radius,
        angle: info.angle,
        hasScaffold: !!info.hasScaffold,
        hasStarThread: !!info.hasStarThread,
        hasCircleEdge: !!face.hasCircleEdge,
        starEdgeCount: parseBoundedInt(face.starEdgeCount, 0, 9999, 0),
        areaAbs: Math.abs(face.areaAbs || 0),
        centroid: {
          x: face.centroid.x,
          y: face.centroid.y
        },
        vertexCount: (face.vertices && face.vertices.length) ? face.vertices.length : 0
      });
    }

    faceDiagnostics.summary.selectedStarFaceCount = Object.keys(selectedStarFaceIds).length;
    faceDiagnostics.summary.selectedPetalFaceCount = Object.keys(selectedPetalFaceIds).length;
    faceDiagnostics.summary.selectedPointFaceCount = Object.keys(selectedPointFaceIds).length;
  }

  if (!starPathVertices || starPathVertices.length < safeFold) {
    // Fallback star geometry if extraction is underconstrained.
    starPathVertices = [];
    for (var fallbackIndex = 0; fallbackIndex < safeFold; fallbackIndex++) {
      var fallbackAngle = -Math.PI / 2 + fallbackIndex * angleStep;
      starPathVertices.push(pointAt(fallbackAngle, radius * 0.33));
    }
  }

  if (!petals.length || (!pointRegions.length && safeFold !== 8)) {
    var legacy = buildLegacyFillGeometry(starPathVertices);
    if (!petals.length) petals = legacy.petals;
    if (!pointRegions.length && safeFold !== 8) pointRegions = legacy.pointRegions;
  }

  return {
    fold: safeFold,
    center: center,
    outerRadius: petalRadius,
    guideCircleVertices: guideCircleVertices,
    holePoints: petalTips,
    geometryMode: safeGeometryMode,
    scaffoldPoints: scaffoldPoints,
    scaffoldCount: scaffoldCount,
    innerGuideCircleVertices: innerGuideCircleVertices,
    circleSequence: circleSequence,
    firstPolygonSequence: firstPolygonSequence,
    offsetPolygonSequence: offsetPolygonSequence,
    starSequence: starSequence,
    starThreadSegments: starThreadSegments,
    starJump: starJump,
    petals: petals,
    pointRegions: pointRegions,
    starPathVertices: starPathVertices,
    starRegions: starRegions,
    debugRegions: debugRegions,
    faceDiagnostics: faceDiagnostics
  };
}

function drawMashrabiyaRegionPolygon(vertices, fillColor, fillOpacity) {
  if (!vertices || vertices.length < 3) return;
  var shape = new Path();
  for (var i = 0; i < vertices.length; i++) {
    shape.add(vertices[i]);
  }
  shape.closed = true;
  shape.fillColor = fillColor;
  shape.opacity = Math.max(0, Math.min(1, fillOpacity));
}

function getMashrabiyaPointKey(point) {
  if (!point) return '';
  return formatSvgNumber(point.x) + ',' + formatSvgNumber(point.y);
}

function getMashrabiyaEdgeKey(a, b) {
  var aKey = getMashrabiyaPointKey(a);
  var bKey = getMashrabiyaPointKey(b);
  if (!aKey || !bKey) return '';
  return aKey < bKey ? (aKey + '|' + bKey) : (bKey + '|' + aKey);
}

function normalizeMashrabiyaPoint(point) {
  return {
    x: Math.round(point.x * 1000) / 1000,
    y: Math.round(point.y * 1000) / 1000
  };
}

function isMashrabiyaPointOnSegment(point, from, to) {
  var epsilon = 1e-6;
  var abx = to.x - from.x;
  var aby = to.y - from.y;
  var apx = point.x - from.x;
  var apy = point.y - from.y;
  var cross = (abx * apy) - (aby * apx);
  if (Math.abs(cross) > epsilon) return false;
  var dot = (apx * abx) + (apy * aby);
  if (dot < -epsilon) return false;
  var lenSq = (abx * abx) + (aby * aby);
  if (dot > lenSq + epsilon) return false;
  return true;
}

function splitMashrabiyaEdge(edgeStart, edgeEnd, allPoints) {
  var pieces = [];
  if (!edgeStart || !edgeEnd || !allPoints || !allPoints.length) return pieces;

  var pointsOnEdge = [];
  for (var i = 0; i < allPoints.length; i++) {
    var candidate = allPoints[i];
    if (isMashrabiyaPointOnSegment(candidate, edgeStart, edgeEnd)) {
      pointsOnEdge.push(candidate);
    }
  }
  if (pointsOnEdge.length < 2) return pieces;

  var dominantAxis = Math.abs(edgeEnd.x - edgeStart.x) >= Math.abs(edgeEnd.y - edgeStart.y) ? 'x' : 'y';
  pointsOnEdge.sort(function(a, b) {
    if (dominantAxis === 'x') {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    }
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  for (var j = 0; j < pointsOnEdge.length - 1; j++) {
    var from = pointsOnEdge[j];
    var to = pointsOnEdge[j + 1];
    if (Math.abs(from.x - to.x) < 1e-6 && Math.abs(from.y - to.y) < 1e-6) continue;
    pieces.push({ from: from, to: to });
  }
  return pieces;
}

function collectMashrabiyaBoundaryEdges(polygons) {
  var edgeCounts = Object.create(null);
  var edgeRefs = Object.create(null);
  var edges = [];
  if (!polygons || !polygons.length) return edges;

  var pointMap = Object.create(null);
  for (var i = 0; i < polygons.length; i++) {
    var polygon = polygons[i];
    if (!polygon || !polygon.length) continue;
    for (var v = 0; v < polygon.length; v++) {
      var normalizedVertex = normalizeMashrabiyaPoint(polygon[v]);
      var vertexKey = getMashrabiyaPointKey(normalizedVertex);
      if (!pointMap[vertexKey]) {
        pointMap[vertexKey] = normalizedVertex;
      }
    }
  }
  var allPoints = Object.keys(pointMap).map(function(key) {
    return pointMap[key];
  });

  for (var p = 0; p < polygons.length; p++) {
    var vertices = polygons[p];
    if (!vertices || vertices.length < 2) continue;
    for (var j = 0; j < vertices.length; j++) {
      var from = normalizeMashrabiyaPoint(vertices[j]);
      var to = normalizeMashrabiyaPoint(vertices[(j + 1) % vertices.length]);
      if (!from || !to) continue;
      var subEdges = splitMashrabiyaEdge(from, to, allPoints);
      for (var s = 0; s < subEdges.length; s++) {
        var subEdge = subEdges[s];
        var edgeKey = getMashrabiyaEdgeKey(subEdge.from, subEdge.to);
        if (!edgeKey) continue;
        edgeCounts[edgeKey] = (edgeCounts[edgeKey] || 0) + 1;
        if (!edgeRefs[edgeKey]) {
          edgeRefs[edgeKey] = {
            from: subEdge.from,
            to: subEdge.to
          };
        }
      }
    }
  }

  var keys = Object.keys(edgeCounts);
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    if (edgeCounts[key] === 1 && edgeRefs[key]) {
      edges.push(edgeRefs[key]);
    }
  }

  return edges;
}

function drawMashrabiyaFillBorderEdges(polygons, strokeColor, strokeWidth, opacity) {
  if (!polygons || !polygons.length) return;
  if (!isFinite(strokeWidth) || strokeWidth <= 0) return;
  var strokeOpacity = Math.max(0, Math.min(1, isFinite(opacity) ? opacity : 1));
  if (strokeOpacity <= 0) return;

  // Unite same-type polygons first so shared internal seams cannot be stroked.
  var unionItem = null;
  for (var i = 0; i < polygons.length; i++) {
    var vertices = polygons[i];
    if (!vertices || vertices.length < 3) continue;
    var polygonPath = new Path({
      segments: vertices,
      closed: true,
      insert: false
    });
    if (!unionItem) {
      unionItem = polygonPath;
      continue;
    }
    var merged = unionItem.unite(polygonPath, { insert: false });
    unionItem.remove();
    polygonPath.remove();
    unionItem = merged;
  }

  if (!unionItem) return;

  unionItem.fillColor = null;
  unionItem.strokeColor = strokeColor;
  unionItem.strokeWidth = strokeWidth;
  unionItem.strokeCap = 'round';
  unionItem.strokeJoin = 'round';
  unionItem.opacity = strokeOpacity;
  if (!unionItem.parent) {
    project.activeLayer.addChild(unionItem);
  }
}

function getMashrabiyaFillPhaseBeats(fold) {
  var baseBeats = Math.max(2, Math.round(fold * 0.5));
  return Math.max(2, Math.round(baseBeats * mashrabiyaFillPhaseBeatScale));
}

function buildMashrabiyaAnimationTimeline(geometry) {
  var fillPhaseBeats = getMashrabiyaFillPhaseBeats(geometry.fold);
  return {
    dCircle: geometry.fold,
    dOuter: geometry.firstPolygonSequence.length,
    dOffset: geometry.offsetPolygonSequence.length,
    dInner: (geometry.innerGuideCircleVertices && geometry.innerGuideCircleVertices.length) ? Math.max(2, Math.round(geometry.innerGuideCircleVertices.length / 6)) : 0,
    dStar: (geometry.starThreadSegments && geometry.starThreadSegments.length) ? geometry.starThreadSegments.length : geometry.starSequence.length,
    dFillStar: fillPhaseBeats,
    dFillPetal: fillPhaseBeats,
    dFillPoint: fillPhaseBeats
  };
}

function getMashrabiyaTimelineFallback(geometry) {
  if (!geometry) {
    return {
      dCircle: 12,
      dOuter: 12,
      dOffset: 12,
      dInner: 0,
      dStar: 12,
      dFillStar: getMashrabiyaFillPhaseBeats(12),
      dFillPetal: getMashrabiyaFillPhaseBeats(12),
      dFillPoint: getMashrabiyaFillPhaseBeats(12)
    };
  }
  return buildMashrabiyaAnimationTimeline(geometry);
}

function drawMashrabiyaFilledGeometry(geometry, starOpacity, petalOpacity, pointOpacity) {
  if (!geometry) return;
  var opacityScale = Math.max(0, Math.min(1, mashrabiyaDebugFillOpacityScale));
  var starFillOpacity = Math.max(0, Math.min(1, starOpacity)) * opacityScale;
  var petalFillOpacity = Math.max(0, Math.min(1, petalOpacity)) * opacityScale;
  var pointFillOpacity = Math.max(0, Math.min(1, pointOpacity)) * opacityScale;
  var fillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);

  var starPolygons = (geometry.starRegions && geometry.starRegions.length)
    ? geometry.starRegions
    : [geometry.starPathVertices];

  // Paint order matters: point regions should sit above star/petal fills.
  // This avoids correctly classified point faces being visually overpainted.
  for (var s = 0; s < starPolygons.length; s++) {
    drawMashrabiyaRegionPolygon(starPolygons[s], mashrabiyaStarColor, starFillOpacity);
  }

  for (var i = 0; i < geometry.petals.length; i++) {
    drawMashrabiyaRegionPolygon(geometry.petals[i], mashrabiyaPetalColor, petalFillOpacity);
  }
  for (var j = 0; j < geometry.pointRegions.length; j++) {
    drawMashrabiyaRegionPolygon(geometry.pointRegions[j], mashrabiyaPointColor, pointFillOpacity);
  }

  if (fillBorderWidth > 0) {
    drawMashrabiyaFillBorderEdges(starPolygons, '#82511f', fillBorderWidth, starFillOpacity);
    drawMashrabiyaFillBorderEdges(geometry.petals, '#82511f', fillBorderWidth, petalFillOpacity);
    drawMashrabiyaFillBorderEdges(geometry.pointRegions, '#82511f', fillBorderWidth, pointFillOpacity);
  }
}

function drawMashrabiyaSelectionOutlines(polygons, strokeColor, progress) {
  if (!polygons || !polygons.length) return;
  var p = clamp01(progress);
  if (p <= 0) return;

  var visibleCount = Math.max(0, Math.min(polygons.length, Math.ceil(polygons.length * p)));
  var strokeWidth = 1.6 + (2.8 * p);
  var strokeOpacity = 0.22 + (0.6 * p);

  for (var i = 0; i < visibleCount; i++) {
    var vertices = polygons[i];
    if (!vertices || vertices.length < 3) continue;
    var outline = new Path();
    for (var v = 0; v < vertices.length; v++) {
      outline.add(vertices[v]);
    }
    outline.closed = true;
    outline.strokeColor = strokeColor;
    outline.strokeWidth = strokeWidth;
    outline.opacity = strokeOpacity;
  }
}

function drawMashrabiyaDebugLabels(debugRegions, opacity) {
  if (!mashrabiyaDebugLabelsEnabled || !debugRegions || !debugRegions.length) return;
  var alpha = Math.max(0, Math.min(1, isFinite(opacity) ? opacity : 1));
  if (alpha <= 0) return;

  for (var i = 0; i < debugRegions.length; i++) {
    var entry = debugRegions[i];
    if (!entry || !entry.centroid || !entry.label) continue;

    var badge = new Path.Rectangle({
      point: new Point(entry.centroid.x - 22, entry.centroid.y - 9),
      size: new Size(44, 18),
      radius: 4
    });
    badge.fillColor = '#fffaf0';
    badge.strokeColor = entry.color || '#6f4a1a';
    badge.strokeWidth = 0.8;
    badge.opacity = 0.75 * alpha;

    var text = new PointText({
      point: new Point(entry.centroid.x, entry.centroid.y + 3),
      content: entry.label,
      justification: 'center',
      fillColor: entry.color || '#6f4a1a',
      fontFamily: 'Arial',
      fontSize: 9,
      fontWeight: 'bold'
    });
    text.opacity = 0.9 * alpha;
  }
}

function drawMashrabiyaFaceDiagnostics(faceDiagnostics, opacity) {
  if (!mashrabiyaDebugLabelsEnabled || !faceDiagnostics || !faceDiagnostics.faces || !faceDiagnostics.faces.length) return;
  var alpha = Math.max(0, Math.min(1, isFinite(opacity) ? opacity : 1));
  if (alpha <= 0) return;

  for (var i = 0; i < faceDiagnostics.faces.length; i++) {
    var face = faceDiagnostics.faces[i];
    if (!face || !face.centroid) continue;

    var classColor = '#666666';
    var classToken = 'O';
    if (face.classification === 'star') {
      classColor = '#9c6f1d';
      classToken = 'S';
    } else if (face.classification === 'petal') {
      classColor = '#a9491e';
      classToken = 'P';
    } else if (face.classification === 'point') {
      classColor = '#a73631';
      classToken = 'T';
    }

    var text = new PointText({
      point: new Point(face.centroid.x, face.centroid.y + 3),
      content: 'F' + String(face.id) + ' ' + classToken + ' b' + String(face.bin),
      justification: 'center',
      fillColor: classColor,
      fontFamily: 'Arial',
      fontSize: 8,
      fontWeight: 'bold'
    });
    text.opacity = 0.86 * alpha;
  }
}

function drawMashrabiyaStitchedLines(geometry, opacity) {
  if (!geometry) return;
  var lineOpacity = Math.max(0, Math.min(1, opacity));
  if (lineOpacity <= 0) return;
  drawMashrabiyaClosedStrokeProgress(geometry.guideCircleVertices, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.firstPolygonSequence, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.offsetPolygonSequence, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaClosedStrokeProgress(geometry.innerGuideCircleVertices, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaSegmentListProgress(geometry.starThreadSegments, '#82511f', 2, lineOpacity, 1);
}

function drawMashrabiyaSequenceProgress(pointsList, sequence, color, strokeWidth, opacity, progress) {
  if (!pointsList || pointsList.length < 2 || !sequence || sequence.length < 2) return;
  var p = clamp01(progress);
  var strokeOpacity = Math.max(0, Math.min(1, opacity));
  if (p <= 0 || strokeOpacity <= 0) return;

  var lengths = [];
  var totalLength = 0;
  for (var i = 0; i < sequence.length; i++) {
    var startIndex = sequence[i];
    var endIndex = sequence[(i + 1) % sequence.length];
    var start = pointsList[startIndex];
    var end = pointsList[endIndex];
    if (!start || !end) continue;
    var edgeLength = start.getDistance(end);
    lengths.push(edgeLength);
    totalLength += edgeLength;
  }
  if (!isFinite(totalLength) || totalLength <= 1e-6) return;

  var targetLength = totalLength * p;
  var traversed = 0;
  var path = new Path();
  path.strokeColor = color;
  path.strokeWidth = strokeWidth;
  path.opacity = strokeOpacity;
  path.add(pointsList[sequence[0]]);

  for (var edgeIndex = 0; edgeIndex < sequence.length; edgeIndex++) {
    var edgeStart = pointsList[sequence[edgeIndex]];
    var edgeEnd = pointsList[sequence[(edgeIndex + 1) % sequence.length]];
    if (!edgeStart || !edgeEnd) continue;
    var edgeLen = edgeStart.getDistance(edgeEnd);
    var remaining = targetLength - traversed;

    if (remaining <= 0) {
      break;
    }

    if (remaining >= edgeLen) {
      path.add(edgeEnd);
      traversed += edgeLen;
    } else {
      var ratio = edgeLen > 0 ? (remaining / edgeLen) : 0;
      path.add(edgeStart.add(edgeEnd.subtract(edgeStart).multiply(ratio)));
      break;
    }
  }
}

function drawMashrabiyaSegmentListProgress(segments, color, strokeWidth, opacity, progress) {
  if (!segments || !segments.length) return;
  var p = clamp01(progress);
  var strokeOpacity = Math.max(0, Math.min(1, opacity));
  if (p <= 0 || strokeOpacity <= 0) return;

  var lengths = [];
  var totalLength = 0;
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (!segment || !segment.from || !segment.to) {
      lengths.push(0);
      continue;
    }
    var length = segment.from.getDistance(segment.to);
    lengths.push(length);
    totalLength += length;
  }
  if (!isFinite(totalLength) || totalLength <= 1e-6) return;

  var targetLength = totalLength * p;
  var traversed = 0;

  for (var s = 0; s < segments.length; s++) {
    var edge = segments[s];
    var edgeLen = lengths[s];
    if (!edge || !edge.from || !edge.to || edgeLen <= 1e-6) continue;

    var remaining = targetLength - traversed;
    if (remaining <= 0) break;

    var path = new Path();
    path.strokeColor = color;
    path.strokeWidth = strokeWidth;
    path.opacity = strokeOpacity;
    path.add(edge.from);

    if (remaining >= edgeLen) {
      path.add(edge.to);
      traversed += edgeLen;
    } else {
      var ratio = remaining / edgeLen;
      path.add(edge.from.add(edge.to.subtract(edge.from).multiply(ratio)));
      break;
    }
  }
}

function drawMashrabiyaClosedStrokeProgress(vertices, color, strokeWidth, opacity, progress) {
  if (!vertices || vertices.length < 3) return;
  var p = clamp01(progress);
  var strokeOpacity = Math.max(0, Math.min(1, opacity));
  if (p <= 0 || strokeOpacity <= 0) return;

  var lengths = [];
  var totalLength = 0;
  for (var i = 0; i < vertices.length; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % vertices.length];
    var edgeLength = start.getDistance(end);
    lengths.push(edgeLength);
    totalLength += edgeLength;
  }
  if (!isFinite(totalLength) || totalLength <= 1e-6) return;

  var targetLength = totalLength * p;
  var traversed = 0;
  var path = new Path();
  path.strokeColor = color;
  path.strokeWidth = strokeWidth;
  path.opacity = strokeOpacity;
  path.add(vertices[0]);

  for (var edgeIndex = 0; edgeIndex < vertices.length; edgeIndex++) {
    var edgeStart = vertices[edgeIndex];
    var edgeEnd = vertices[(edgeIndex + 1) % vertices.length];
    var edgeLen = lengths[edgeIndex];
    var remaining = targetLength - traversed;

    if (remaining <= 0) {
      break;
    }

    if (remaining >= edgeLen) {
      path.add(edgeEnd);
      traversed += edgeLen;
    } else {
      var ratio = edgeLen > 0 ? (remaining / edgeLen) : 0;
      path.add(edgeStart.add(edgeEnd.subtract(edgeStart).multiply(ratio)));
      break;
    }
  }
}

function mashrabiyaPhaseProgress(elapsed, phaseStart, phaseDuration) {
  return clamp01((elapsed - phaseStart) / phaseDuration);
}

function renderMashrabiyaAnimationStateFrame(state) {
  if (!state) {
    drawMashrabiyaStatic();
    return;
  }

  project.activeLayer.removeChildren();

  var timeline = state.timeline || getMashrabiyaTimelineFallback(state.geometry);

  var dCircle = timeline.dCircle;
  var dOuter = timeline.dOuter;
  var dOffset = timeline.dOffset;
  var dInner = timeline.dInner || 0;
  var dStar = timeline.dStar;
  var dFillStar = timeline.dFillStar;
  var dFillPetal = timeline.dFillPetal;
  var dFillPoint = timeline.dFillPoint;

  var t = state.elapsedBeats;
  var sCircle = 0;
  var sOuter = sCircle + dCircle;
  var sOffset = sOuter + dOuter;
  var sInner = sOffset + dOffset;
  var sStar = sInner + dInner;
  var sFillStar = sStar + dStar;
  var sFillPetal = sFillStar + dFillStar;
  var sFillPoint = sFillPetal + dFillPetal;
  var sEnd = sFillPoint + dFillPoint;

  var keepConstructionLinesVisible = mashrabiyaKeepConstructionLines || mashrabiyaDebugKeepStitchLinesVisible;
  var lineFade = 1 - mashrabiyaPhaseProgress(t, sFillStar, dFillStar + dFillPetal + dFillPoint);
  var lineOpacity = keepConstructionLinesVisible ? 0.92 : (0.9 * lineFade);

  var circleProgress = mashrabiyaPhaseProgress(t, sCircle, dCircle);
  var outerProgress = mashrabiyaPhaseProgress(t, sOuter, dOuter);
  var offsetProgress = mashrabiyaPhaseProgress(t, sOffset, dOffset);
  var innerProgress = mashrabiyaPhaseProgress(t, sInner, dInner);
  var starProgress = mashrabiyaPhaseProgress(t, sStar, dStar);

  drawMashrabiyaClosedStrokeProgress(state.geometry.guideCircleVertices, '#82511f', 2, lineOpacity, circleProgress);
  drawMashrabiyaSequenceProgress(state.geometry.scaffoldPoints || state.geometry.holePoints, state.geometry.firstPolygonSequence, '#82511f', 2, lineOpacity, outerProgress);
  drawMashrabiyaSequenceProgress(state.geometry.scaffoldPoints || state.geometry.holePoints, state.geometry.offsetPolygonSequence, '#82511f', 2, lineOpacity, offsetProgress);
  if (dInner > 0) {
    drawMashrabiyaClosedStrokeProgress(state.geometry.innerGuideCircleVertices, '#82511f', 2, lineOpacity, innerProgress);
  }
  drawMashrabiyaSegmentListProgress(state.geometry.starThreadSegments, '#82511f', 2, lineOpacity, starProgress);

  var selectStar = mashrabiyaPhaseProgress(t, sFillStar, dFillStar);
  var selectPetal = mashrabiyaPhaseProgress(t, sFillPetal, dFillPetal);
  var selectPoint = mashrabiyaPhaseProgress(t, sFillPoint, dFillPoint);

  drawMashrabiyaSelectionOutlines(state.geometry.starRegions && state.geometry.starRegions.length ? state.geometry.starRegions : [state.geometry.starPathVertices], '#c4902f', selectStar);
  drawMashrabiyaSelectionOutlines(state.geometry.petals, '#cf6f2a', selectPetal);
  drawMashrabiyaSelectionOutlines(state.geometry.pointRegions, '#d74f43', selectPoint);

  var starFillProgress = clamp01((selectStar - 0.78) / 0.22);
  var petalFillProgress = clamp01((selectPetal - 0.78) / 0.22);
  var pointFillProgress = clamp01((selectPoint - 0.78) / 0.22);

  drawMashrabiyaFilledGeometry(
    state.geometry,
    starFillProgress,
    petalFillProgress,
    pointFillProgress
  );

  drawMashrabiyaFaceDiagnostics(state.geometry.faceDiagnostics, 0.95);

  state.durationBeats = sEnd;
  clearHighlightedHoleNumbers();
}

function drawMashrabiyaStatic() {
  project.activeLayer.removeChildren();
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  if (mashrabiyaKeepConstructionLines || mashrabiyaDebugKeepStitchLinesVisible) {
    var lineOpacity = 0.92;
    drawMashrabiyaClosedStrokeProgress(geometry.guideCircleVertices, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.firstPolygonSequence, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.offsetPolygonSequence, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaClosedStrokeProgress(geometry.innerGuideCircleVertices, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaSegmentListProgress(geometry.starThreadSegments, '#82511f', 2, lineOpacity, 1);
  }
  drawMashrabiyaFilledGeometry(geometry, 1, 1, 1);
  drawMashrabiyaFaceDiagnostics(geometry.faceDiagnostics, 1);
  clearHighlightedHoleNumbers();
}

function buildMashrabiyaFaceSnapshot(geometry) {
  if (!geometry) return null;
  var diagnostics = geometry.faceDiagnostics || { summary: {}, faces: [] };
  var snapshot = {
    version: 1,
    timestamp: new Date().toISOString(),
    experience: 'mashrabiya',
    fold: geometry.fold,
    geometryMode: geometry.geometryMode,
    summary: diagnostics.summary || {},
    faces: (diagnostics.faces || []).map(function(face) {
      return {
        id: face.id,
        bin: face.bin,
        classification: face.classification,
        radius: Math.round(face.radius * 1000) / 1000,
        angle: Math.round(face.angle * 1000000) / 1000000,
        hasScaffold: !!face.hasScaffold,
        hasStarThread: !!face.hasStarThread,
        hasCircleEdge: !!face.hasCircleEdge,
        starEdgeCount: face.starEdgeCount,
        areaAbs: Math.round(face.areaAbs * 1000) / 1000,
        centroid: {
          x: Math.round(face.centroid.x * 1000) / 1000,
          y: Math.round(face.centroid.y * 1000) / 1000
        },
        vertexCount: face.vertexCount
      };
    })
  };
  return snapshot;
}

function exportMashrabiyaFaceSnapshot() {
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  var snapshot = buildMashrabiyaFaceSnapshot(geometry);
  if (!snapshot) return null;
  try {
    var payload = JSON.stringify(snapshot, null, 2);
    console.log('Mashrabiya face snapshot:', payload);
  } catch (error) {
    console.warn('Unable to serialize Mashrabiya face snapshot.', error);
  }
  return snapshot;
}

function runMashrabiyaAnimationFrame(event) {
  if (!animationActive || !mashrabiyaAnimationState) return;
  var delta = Math.min(event.delta || 0, 0.1);
  mashrabiyaAnimationState.elapsedBeats += delta / Math.max(1e-4, getAnimationSecondsPerSegment());
  renderMashrabiyaAnimationStateFrame(mashrabiyaAnimationState);

  if (mashrabiyaAnimationState.elapsedBeats < mashrabiyaAnimationState.durationBeats) return;

  animationActive = false;
  animationPlaybackState = 'idle';
  view.onFrame = null;
  mashrabiyaAnimationState = null;
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  drawMashrabiyaStatic();
}

function animateMashrabiya() {
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  squarusAnimationState = null;
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  var timeline = buildMashrabiyaAnimationTimeline(geometry);
  var durationBeats = timeline.dCircle + timeline.dOuter + timeline.dOffset + timeline.dInner + timeline.dStar + timeline.dFillStar + timeline.dFillPetal + timeline.dFillPoint;

  mashrabiyaAnimationState = {
    elapsedBeats: 0,
    durationBeats: durationBeats,
    timeline: timeline,
    geometry: geometry
  };

  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderMashrabiyaAnimationStateFrame(mashrabiyaAnimationState);
  view.onFrame = runMashrabiyaAnimationFrame;
}

function shouldShowHoleNumbersNow() {
  var holeCount = getCurrentStitchHoleCount();
  if (!isFinite(holeCount)) return false;
  return showHoleNumbers && holeCount <= HOLE_NUMBER_AUTO_HIDE_THRESHOLD;
}

function getOutwardDirectionAtHole(index, ccw) {
  if (!points.length) return new Point(0, -1);

  var n = points.length;
  var prev = points[(index - 1 + n) % n];
  var curr = points[index];
  var next = points[(index + 1) % n];
  var tangent = next.subtract(prev);

  if (tangent.length <= 0.001) {
    var fromCenter = curr.subtract(view.center);
    if (fromCenter.length <= 0.001) return new Point(0, -1);
    return fromCenter.normalize(1);
  }

  var outwardRotation = ccw ? -90 : 90;
  var outward = tangent.normalize(1).rotate(outwardRotation);
  if (outward.length <= 0.001) {
    var fallback = curr.subtract(view.center);
    if (fallback.length <= 0.001) return new Point(0, -1);
    return fallback.normalize(1);
  }

  // Ensure direction points away from center for stable "outer side" placement.
  if (outward.dot(curr.subtract(view.center)) < 0) {
    outward = outward.multiply(-1);
  }

  return outward.normalize(1);
}

function getOutwardDirectionAtHoleFromRing(ringPoints, index, ccw, invert) {
  if (!ringPoints || !ringPoints.length) return new Point(0, -1);

  var n = ringPoints.length;
  var prev = ringPoints[(index - 1 + n) % n];
  var curr = ringPoints[index];
  var next = ringPoints[(index + 1) % n];
  var tangent = next.subtract(prev);

  if (tangent.length <= 0.001) {
    var fromCenter = curr.subtract(view.center);
    if (fromCenter.length <= 0.001) return new Point(0, -1);
    var fallbackDirection = fromCenter.normalize(1);
    return invert ? fallbackDirection.multiply(-1) : fallbackDirection;
  }

  var outwardRotation = ccw ? -90 : 90;
  var outward = tangent.normalize(1).rotate(outwardRotation);
  if (outward.length <= 0.001) {
    var fallback = curr.subtract(view.center);
    if (fallback.length <= 0.001) return new Point(0, -1);
    outward = fallback.normalize(1);
  }

  if (outward.dot(curr.subtract(view.center)) < 0) {
    outward = outward.multiply(-1);
  }

  outward = outward.normalize(1);
  return invert ? outward.multiply(-1) : outward;
}

function getBoundsExtentAlongDirection(item, direction) {
  var dir = direction.normalize(1);
  var center = item.position;
  var corners = [
    item.bounds.topLeft,
    item.bounds.topRight,
    item.bounds.bottomLeft,
    item.bounds.bottomRight
  ];
  var maxProjection = 0;
  for (var i = 0; i < corners.length; i++) {
    var projection = corners[i].subtract(center).dot(dir);
    if (projection > maxProjection) {
      maxProjection = projection;
    }
  }
  return Math.max(0, maxProjection);
}

function getHoleNumberFontSize(holeCount) {
  if (holeCount >= 70) return 9;
  if (holeCount >= 55) return 9.5;
  return 10;
}

function getHoleLabelOffsetFromExtent(extent, borderClearance, holeClearance) {
  var borderPad = isFinite(borderClearance) ? borderClearance : LABEL_BORDER_CLEARANCE;
  var holePad = isFinite(holeClearance) ? holeClearance : LABEL_HOLE_CLEARANCE;
  var minOffset = 3 + holePad + extent;
  var maxOffset = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + borderPad + extent);
  // Interpolate within the feasible band so both hole and border clearances
  // influence the result. This makes padding constants responsive.
  var preferredOffset = minOffset + ((maxOffset - minOffset) * LABEL_OUTER_BIAS);
  var clampedOffset;

  if (maxOffset >= minOffset) {
    clampedOffset = Math.max(minOffset, Math.min(preferredOffset, maxOffset));
  } else {
    // Fallback: allow a very small overshoot beyond the border band so labels
    // remain visually even without drifting far from their ring holes.
    var overflowAllowance = 0.8;
    clampedOffset = Math.min(minOffset, maxOffset + overflowAllowance);
  }

  if (!isFinite(clampedOffset)) {
    clampedOffset = Math.max(4, BORDER_OUTER_GAP * 0.6);
  }

  return {
    offset: clampedOffset,
    minOffset: minOffset,
    maxOffset: maxOffset
  };
}

function estimateTextExtentAlongDirection(text, fontSize) {
  var len = String(text || '').length;
  if (len <= 1) return fontSize * 0.28;
  if (len === 2) return fontSize * 0.46;
  return fontSize * (0.56 + Math.min(2, len - 2) * 0.1);
}

function formatSvgNumber(value) {
  return String(Math.round(value * 1000) / 1000);
}

function colorToSvg(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value.toCSS === 'function') {
    return value.toCSS(true);
  }
  return '#000000';
}

function svgPathFromPoints(vertices) {
  if (!vertices || !vertices.length) return '';
  var parts = ['M ' + formatSvgNumber(vertices[0].x) + ' ' + formatSvgNumber(vertices[0].y)];
  for (var i = 1; i < vertices.length; i++) {
    parts.push('L ' + formatSvgNumber(vertices[i].x) + ' ' + formatSvgNumber(vertices[i].y));
  }
  parts.push('Z');
  return parts.join(' ');
}

function getTimestampLabel() {
  var now = new Date();
  var y = now.getFullYear();
  var m = String(now.getMonth() + 1).padStart(2, '0');
  var d = String(now.getDate()).padStart(2, '0');
  var hh = String(now.getHours()).padStart(2, '0');
  var mm = String(now.getMinutes()).padStart(2, '0');
  var ss = String(now.getSeconds()).padStart(2, '0');
  return y + m + d + '-' + hh + mm + ss;
}

function normalizeExportBaseName(rawName) {
  var fallback = 'stitchlab-' + getTimestampLabel();
  var source = String(rawName || '').trim();
  if (!source) return fallback;
  var cleaned = source
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\-.]+|[_\-.]+$/g, '');
  return cleaned || fallback;
}

function parseBoundedInt(rawValue, minValue, maxValue, fallback) {
  var parsed = parseInt(rawValue, 10);
  if (!isFinite(parsed)) return fallback;
  if (isFinite(minValue) && parsed < minValue) parsed = minValue;
  if (isFinite(maxValue) && parsed > maxValue) parsed = maxValue;
  return parsed;
}

function triggerBlobDownload(blob, fileName) {
  var url = URL.createObjectURL(blob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 0);
}

function buildTriangulaDesignSvgString() {
  var width = Math.round(view.viewSize.width);
  var height = Math.round(view.viewSize.height);
  var lines = [];
  var borderStrokeColor = BORDER_STROKE_COLOR;
  var holeFillColor = HOLE_FILL_COLOR;
  var holeLabelColor = HOLE_LABEL_COLOR;
  var base = getTriangulaBaseTriangle(1);
  var endDepth = triangulaCountToDepth(triangulaTargetCount);

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
  lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');

  lines.push(
    '<path d="' + svgPathFromPoints(base) +
    '" fill="' + colorToSvg(getTriangulaFillColorForSlot(1, 0)) +
    '" stroke="#234b61" stroke-width="' + formatSvgNumber(triangulaConstructionMode === 'cut' ? 1.7 : 1.1) +
    '" opacity="0.95"/>'
  );

  if (triangulaConstructionMode === 'cut') {
    for (var level = 1; level <= endDepth; level++) {
      var cutTriangles = [];
      collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
      for (var c = 0; c < cutTriangles.length; c++) {
        lines.push(
          '<path d="' + svgPathFromPoints(cutTriangles[c].vertices) +
          '" fill="#ffffff" stroke="#ffffff" stroke-width="1.08" opacity="0.97"/>'
        );
      }
    }
  } else {
    for (var d = 1; d <= endDepth; d++) {
      var triangles = [];
      collectTrianglesAtDepth(base, d, 0, 1, triangles);
      for (var t = 0; t < triangles.length; t++) {
        lines.push(
          '<path d="' + svgPathFromPoints(triangles[t].vertices) +
          '" fill="' + colorToSvg(getTriangulaFillColorForSlot(triangles[t].slot, t)) +
          '" stroke="' + colorToSvg(getTriangulaStrokeColorForSlot(triangles[t].slot, t)) +
          '" stroke-width="' + formatSvgNumber(Math.max(0.7, 1.3 - (d * 0.1))) +
          '" opacity="' + formatSvgNumber(Math.max(0.45, 0.92 - (d * 0.08))) +
          '"/>'
        );
      }
    }
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function getExportExperiencePrefix() {
  var id = String(currentExperienceId || 'stitching').toLowerCase();
  return 'stitchlab-' + id;
}

function ensureExportBaseNameHasExperiencePrefix(baseName) {
  var raw = String(baseName || '').trim();
  var prefix = getExportExperiencePrefix();
  var prefixWithDash = prefix + '-';
  if (!raw) {
    return prefixWithDash + getTimestampLabel();
  }
  if (raw === prefix || raw.indexOf(prefixWithDash) === 0) {
    return raw;
  }
  return prefixWithDash + raw;
}

function syncExportUiCopy() {
  var exportExperience = currentExperienceId;

  if (advancedExportHelp) {
    if (exportExperience === 'triangula') {
      advancedExportHelp.textContent = 'Exports Triangula target composition as SVG with instructions (preview PNG is omitted for this experience).';
    } else if (exportExperience === 'squarus') {
      advancedExportHelp.textContent = 'Exports Squarus cut-sheet SVG, parameterized PNG preview, and Squarus assembly instructions.';
    } else if (exportExperience === 'mashrabiya') {
      advancedExportHelp.textContent = 'Exports Mashrabiya rosette composition as SVG with instructions and optional preview.';
    } else {
      advancedExportHelp.textContent = 'Exports current Stitching view (borders, threads, holes, and visible hole numbers).';
    }
  }

  if (exportOptionsTitle) {
    if (exportExperience === 'triangula') {
      exportOptionsTitle.textContent = 'Triangula Export Options';
    } else if (exportExperience === 'squarus') {
      exportOptionsTitle.textContent = 'Squarus Export Options';
    } else if (exportExperience === 'mashrabiya') {
      exportOptionsTitle.textContent = 'Mashrabiya Export Options';
    } else {
      exportOptionsTitle.textContent = 'Stitching Export Options';
    }
  }

  if (exportNameInput) {
    exportNameInput.placeholder = ensureExportBaseNameHasExperiencePrefix('') ;
  }
}

function buildSquarusCutSheetSvgString() {
  var pieces = getSquarusPolyominoes(squarusOrder);
  var unit = 28;
  var spacing = Math.round(unit * 1.4);
  var padding = Math.round(unit * 0.9);
  var titleBand = Math.round(unit * 1.25);
  var labelBand = Math.round(unit * 0.95);
  var strokeWidth = 1.6;
  var maxHeightCells = 1;
  var maxWidthCells = 1;
  var i;

  for (i = 0; i < pieces.length; i++) {
    maxHeightCells = Math.max(maxHeightCells, pieces[i].height || 1);
    maxWidthCells = Math.max(maxWidthCells, pieces[i].width || 1);
  }

  var contentHeight = maxHeightCells * unit;
  var xCursor = padding;
  var placements = [];

  for (i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    var pieceWidth = Math.max(1, piece.width || 1) * unit;
    var offsetX = xCursor - (Math.min.apply(null, piece.cells.map(function(cell) { return cell[0]; })) * unit);
    var minY = Math.min.apply(null, piece.cells.map(function(cell) { return cell[1]; }));
    var yPadding = (contentHeight - (Math.max(1, piece.height || 1) * unit)) * 0.5;
    var offsetY = titleBand + padding + yPadding - (minY * unit);

    placements.push({
      piece: piece,
      offsetX: offsetX,
      offsetY: offsetY,
      centerX: xCursor + (pieceWidth * 0.5)
    });

    xCursor += pieceWidth + spacing;
  }

  var width = Math.max(240, Math.round(xCursor - spacing + padding));
  var height = Math.max(160, Math.round(titleBand + padding + contentHeight + labelBand + padding));
  var lines = [];

  function edgeKey(x1, y1, x2, y2) {
    if (x1 > x2 || (x1 === x2 && y1 > y2)) {
      var tx = x1;
      var ty = y1;
      x1 = x2;
      y1 = y2;
      x2 = tx;
      y2 = ty;
    }
    return String(x1) + ',' + String(y1) + '|' + String(x2) + ',' + String(y2);
  }

  function collectBoundaryEdges(cells) {
    var edgeMap = Object.create(null);
    for (var c = 0; c < cells.length; c++) {
      var cellX = cells[c][0];
      var cellY = cells[c][1];
      var edges = [
        [cellX, cellY, cellX + 1, cellY],
        [cellX + 1, cellY, cellX + 1, cellY + 1],
        [cellX + 1, cellY + 1, cellX, cellY + 1],
        [cellX, cellY + 1, cellX, cellY]
      ];
      for (var e = 0; e < edges.length; e++) {
        var key = edgeKey(edges[e][0], edges[e][1], edges[e][2], edges[e][3]);
        if (!edgeMap[key]) {
          edgeMap[key] = { x1: edges[e][0], y1: edges[e][1], x2: edges[e][2], y2: edges[e][3], count: 0 };
        }
        edgeMap[key].count += 1;
      }
    }
    return edgeMap;
  }

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
  lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');
  lines.push('<text x="' + formatSvgNumber(width * 0.5) + '" y="' + formatSvgNumber(padding) + '" fill="#1d1d1d" font-size="16" font-family="Nunito, sans-serif" text-anchor="middle" dominant-baseline="hanging">Squarus cut sheet - Order ' + String(squarusOrder) + '</text>');

  for (i = 0; i < placements.length; i++) {
    var placement = placements[i];
    var boundaryEdges = collectBoundaryEdges(placement.piece.cells);
    var keys = Object.keys(boundaryEdges);

    for (var k = 0; k < keys.length; k++) {
      var edge = boundaryEdges[keys[k]];
      if (edge.count !== 1) continue;
      lines.push(
        '<line x1="' + formatSvgNumber(placement.offsetX + edge.x1 * unit) +
        '" y1="' + formatSvgNumber(placement.offsetY + edge.y1 * unit) +
        '" x2="' + formatSvgNumber(placement.offsetX + edge.x2 * unit) +
        '" y2="' + formatSvgNumber(placement.offsetY + edge.y2 * unit) +
        '" stroke="#111111" stroke-width="' + formatSvgNumber(strokeWidth) + '" stroke-linecap="square"/>'
      );
    }

    lines.push(
      '<text x="' + formatSvgNumber(placement.centerX) +
      '" y="' + formatSvgNumber(titleBand + padding + contentHeight + (labelBand * 0.65)) +
      '" fill="#444444" font-size="12" font-family="Nunito, sans-serif" text-anchor="middle">P' + String(i + 1) + '</text>'
    );
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function buildMashrabiyaDesignSvgString(options) {
  options = options || {};
  var includeDebugLabels = options.mashrabiyaIncludeDebugLabels === true;
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  var width = Math.max(120, Math.round(view.viewSize.width || 900));
  var height = Math.max(120, Math.round(view.viewSize.height || 900));
  var lines = [];

  function toSvgPoints(vertices) {
    var chunks = [];
    for (var i = 0; i < vertices.length; i++) {
      chunks.push(formatSvgNumber(vertices[i].x) + ',' + formatSvgNumber(vertices[i].y));
    }
    return chunks.join(' ');
  }

  function pointKey(point) {
    if (!point) return '';
    return formatSvgNumber(point.x) + ',' + formatSvgNumber(point.y);
  }

  function edgeKey(a, b) {
    var aKey = pointKey(a);
    var bKey = pointKey(b);
    if (!aKey || !bKey) return '';
    return aKey < bKey ? (aKey + '|' + bKey) : (bKey + '|' + aKey);
  }

  function normalizePoint(point) {
    return {
      x: Math.round(point.x * 1000) / 1000,
      y: Math.round(point.y * 1000) / 1000
    };
  }

  function isPointOnSegment(point, from, to) {
    var epsilon = 1e-6;
    var abx = to.x - from.x;
    var aby = to.y - from.y;
    var apx = point.x - from.x;
    var apy = point.y - from.y;
    var cross = (abx * apy) - (aby * apx);
    if (Math.abs(cross) > epsilon) return false;
    var dot = (apx * abx) + (apy * aby);
    if (dot < -epsilon) return false;
    var lenSq = (abx * abx) + (aby * aby);
    if (dot > lenSq + epsilon) return false;
    return true;
  }

  function splitEdge(edgeStart, edgeEnd, allPoints) {
    var pieces = [];
    if (!edgeStart || !edgeEnd || !allPoints || !allPoints.length) return pieces;

    var pointsOnEdge = [];
    for (var i = 0; i < allPoints.length; i++) {
      var candidate = allPoints[i];
      if (isPointOnSegment(candidate, edgeStart, edgeEnd)) {
        pointsOnEdge.push(candidate);
      }
    }
    if (pointsOnEdge.length < 2) return pieces;

    var dominantAxis = Math.abs(edgeEnd.x - edgeStart.x) >= Math.abs(edgeEnd.y - edgeStart.y) ? 'x' : 'y';
    pointsOnEdge.sort(function(a, b) {
      if (dominantAxis === 'x') {
        if (a.x !== b.x) return a.x - b.x;
        return a.y - b.y;
      }
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    for (var j = 0; j < pointsOnEdge.length - 1; j++) {
      var from = pointsOnEdge[j];
      var to = pointsOnEdge[j + 1];
      if (Math.abs(from.x - to.x) < 1e-6 && Math.abs(from.y - to.y) < 1e-6) continue;
      pieces.push({ from: from, to: to });
    }

    return pieces;
  }

  function collectBoundaryEdges(polygons) {
    var edgeCounts = Object.create(null);
    var edgeRefs = Object.create(null);
    var edges = [];
    if (!polygons || !polygons.length) return edges;

    var pointMap = Object.create(null);
    for (var i = 0; i < polygons.length; i++) {
      var polygon = polygons[i];
      if (!polygon || !polygon.length) continue;
      for (var v = 0; v < polygon.length; v++) {
        var normalizedVertex = normalizePoint(polygon[v]);
        var vertexKey = pointKey(normalizedVertex);
        if (!pointMap[vertexKey]) {
          pointMap[vertexKey] = normalizedVertex;
        }
      }
    }
    var allPoints = Object.keys(pointMap).map(function(key) {
      return pointMap[key];
    });

    for (var p = 0; p < polygons.length; p++) {
      var vertices = polygons[p];
      if (!vertices || vertices.length < 2) continue;
      for (var j = 0; j < vertices.length; j++) {
        var from = normalizePoint(vertices[j]);
        var to = normalizePoint(vertices[(j + 1) % vertices.length]);
        if (!from || !to) continue;
        var subEdges = splitEdge(from, to, allPoints);
        for (var s = 0; s < subEdges.length; s++) {
          var subEdge = subEdges[s];
          var key = edgeKey(subEdge.from, subEdge.to);
          if (!key) continue;
          edgeCounts[key] = (edgeCounts[key] || 0) + 1;
          if (!edgeRefs[key]) {
            edgeRefs[key] = {
              from: subEdge.from,
              to: subEdge.to
            };
          }
        }
      }
    }

    var keys = Object.keys(edgeCounts);
    for (var k = 0; k < keys.length; k++) {
      var edgeLookupKey = keys[k];
      if (edgeCounts[edgeLookupKey] === 1 && edgeRefs[edgeLookupKey]) {
        edges.push(edgeRefs[edgeLookupKey]);
      }
    }

    return edges;
  }

  function appendBoundaryEdges(polygons, strokeColor, strokeWidth) {
    if (!polygons || !polygons.length || !isFinite(strokeWidth) || strokeWidth <= 0) return;
    var edges = collectBoundaryEdges(polygons);
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (!edge || !edge.from || !edge.to) continue;
      lines.push(
        '<line x1="' + formatSvgNumber(edge.from.x) + '" y1="' + formatSvgNumber(edge.from.y) +
        '" x2="' + formatSvgNumber(edge.to.x) + '" y2="' + formatSvgNumber(edge.to.y) +
        '" stroke="' + strokeColor + '" stroke-width="' + formatSvgNumber(strokeWidth) +
        '" stroke-linecap="round" stroke-linejoin="round"/>'
      );
    }
  }

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
  lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');

  if (includeDebugLabels) {
    function appendPolyline(vertices, strokeColor, strokeWidth, opacity, closePath) {
      if (!vertices || vertices.length < 2) return;
      var path = ['M ' + formatSvgNumber(vertices[0].x) + ' ' + formatSvgNumber(vertices[0].y)];
      for (var i = 1; i < vertices.length; i++) {
        path.push('L ' + formatSvgNumber(vertices[i].x) + ' ' + formatSvgNumber(vertices[i].y));
      }
      if (closePath) {
        path.push('Z');
      }
      lines.push(
        '<path d="' + path.join(' ') + '" fill="none" stroke="' + strokeColor +
        '" stroke-width="' + formatSvgNumber(strokeWidth) +
        '" stroke-linecap="round" stroke-linejoin="round" opacity="' + formatSvgNumber(opacity) + '"/>'
      );
    }

    function appendSequence(pointsList, sequence, strokeColor, strokeWidth, opacity) {
      if (!pointsList || !pointsList.length || !sequence || sequence.length < 2) return;
      var firstPoint = pointsList[sequence[0]];
      if (!firstPoint) return;
      var path = ['M ' + formatSvgNumber(firstPoint.x) + ' ' + formatSvgNumber(firstPoint.y)];
      var lastPoint = firstPoint;
      for (var i = 1; i < sequence.length; i++) {
        var point = pointsList[sequence[i]];
        if (!point) continue;
        path.push('L ' + formatSvgNumber(point.x) + ' ' + formatSvgNumber(point.y));
        lastPoint = point;
      }
      if (lastPoint !== firstPoint) {
        path.push('L ' + formatSvgNumber(firstPoint.x) + ' ' + formatSvgNumber(firstPoint.y));
      }
      lines.push(
        '<path d="' + path.join(' ') + '" fill="none" stroke="' + strokeColor +
        '" stroke-width="' + formatSvgNumber(strokeWidth) +
        '" stroke-linecap="round" stroke-linejoin="round" opacity="' + formatSvgNumber(opacity) + '"/>'
      );
    }

    function appendSegments(segments, strokeColor, strokeWidth, opacity) {
      if (!segments || !segments.length) return;
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        if (!seg || !seg.from || !seg.to) continue;
        lines.push(
          '<line x1="' + formatSvgNumber(seg.from.x) + '" y1="' + formatSvgNumber(seg.from.y) +
          '" x2="' + formatSvgNumber(seg.to.x) + '" y2="' + formatSvgNumber(seg.to.y) +
          '" stroke="' + strokeColor + '" stroke-width="' + formatSvgNumber(strokeWidth) +
          '" stroke-linecap="round" stroke-linejoin="round" opacity="' + formatSvgNumber(opacity) + '"/>'
        );
      }
    }

    appendPolyline(geometry.guideCircleVertices, '#82511f', 2, 0.9, true);
    appendSequence(geometry.scaffoldPoints || geometry.holePoints, geometry.firstPolygonSequence, '#82511f', 2, 0.9);
    appendSequence(geometry.scaffoldPoints || geometry.holePoints, geometry.offsetPolygonSequence, '#82511f', 2, 0.9);
    appendPolyline(geometry.innerGuideCircleVertices, '#82511f', 2, 0.9, true);
    appendSegments(geometry.starThreadSegments, '#82511f', 2, 0.9);

    var faces = geometry.faceDiagnostics && geometry.faceDiagnostics.faces
      ? geometry.faceDiagnostics.faces
      : [];
    for (var f = 0; f < faces.length; f++) {
      var face = faces[f];
      if (!face || !face.centroid) continue;
      var classToken = 'O';
      var classColor = '#666666';
      if (face.classification === 'star') {
        classToken = 'S';
        classColor = '#9c6f1d';
      } else if (face.classification === 'petal') {
        classToken = 'P';
        classColor = '#a9491e';
      } else if (face.classification === 'point') {
        classToken = 'T';
        classColor = '#a73631';
      }
      lines.push(
        '<text x="' + formatSvgNumber(face.centroid.x) + '" y="' + formatSvgNumber(face.centroid.y + 3) +
        '" fill="' + classColor + '" font-size="8" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" opacity="0.92">' +
        'F' + String(face.id) + ' ' + classToken + ' b' + String(face.bin) +
        '</text>'
      );
    }

    lines.push('</svg>');
    return lines.join('\n');
  }

  var fillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);
  var starPolygons = (geometry.starRegions && geometry.starRegions.length)
    ? geometry.starRegions
    : [geometry.starPathVertices];

  for (var p = 0; p < geometry.petals.length; p++) {
    lines.push('<polygon points="' + toSvgPoints(geometry.petals[p]) + '" fill="' + mashrabiyaPetalColor + '"/>');
  }

  for (var q = 0; q < geometry.pointRegions.length; q++) {
    lines.push('<polygon points="' + toSvgPoints(geometry.pointRegions[q]) + '" fill="' + mashrabiyaPointColor + '"/>');
  }

  for (var s = 0; s < starPolygons.length; s++) {
    lines.push('<polygon points="' + toSvgPoints(starPolygons[s]) + '" fill="' + mashrabiyaStarColor + '"/>');
  }

  if (fillBorderWidth > 0) {
    appendBoundaryEdges(starPolygons, '#82511f', fillBorderWidth);
    appendBoundaryEdges(geometry.petals, '#82511f', fillBorderWidth);
    appendBoundaryEdges(geometry.pointRegions, '#82511f', fillBorderWidth);
  }
  lines.push('</svg>');
  return lines.join('\n');
}

function buildCurrentDesignSvgString(options) {
  options = options || {};
  if (currentExperienceId === 'triangula') {
    return buildTriangulaDesignSvgString();
  }
  if (currentExperienceId === 'squarus') {
    return buildSquarusCutSheetSvgString();
  }
  if (currentExperienceId === 'mashrabiya') {
    return buildMashrabiyaDesignSvgString(options);
  }

  var includeThreads = options.includeThreads !== false;
  var includeStitchingBorder = borderEnabled;
  var includeStitchingHoleNumbers = shouldShowHoleNumbersNow();
  if (options.forceStitchingBorder === true) {
    includeStitchingBorder = true;
  }
  if (options.forceStitchingHoleNumbers === true) {
    includeStitchingHoleNumbers = true;
  }
  var borderStrokeColor = BORDER_STROKE_COLOR;
  var holeFillColor = HOLE_FILL_COLOR;
  var holeLabelColor = HOLE_LABEL_COLOR;

  // Export a fresh static snapshot independent from transient animation artifacts.
  computePoints();

  var width = Math.round(view.viewSize.width);
  var height = Math.round(view.viewSize.height);
  var lines = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');

  if (includeStitchingBorder && BORDER_INCLUDE_IN_SVG) {
    function appendBorderPair(borderGeometry) {
      if (!borderGeometry || !borderGeometry.outerSamples || !borderGeometry.innerSamples) return;
      var lineJoin = borderGeometry.isPolygon ? 'miter' : 'round';
      var outerPathData = svgPathFromPoints(borderGeometry.outerSamples);
      var innerPathData = svgPathFromPoints(borderGeometry.innerSamples);
      lines.push('<path d="' + outerPathData + '" fill="none" stroke="' + borderStrokeColor + '" stroke-width="' + BORDER_STROKE_WIDTH + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
      lines.push('<path d="' + innerPathData + '" fill="none" stroke="' + borderStrokeColor + '" stroke-width="' + BORDER_STROKE_WIDTH + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
    }

    appendBorderPair(getBorderGeometryForCurrentShape());

    if (nestedFrameEnabled) {
      var geometry = getShapeGeometry();
      var nestedGeometry = {
        center: geometry.center,
        radius: geometry.radius * sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)
      };
      appendBorderPair(getBorderGeometryForGeometry(nestedGeometry));
    }
  }

  if (includeThreads) {
    for (var t = 0; t < threads.length; t++) {
      var thread = threads[t];
      var segments = computeSegments(thread);
      for (var s = 0; s < segments.length; s++) {
        var parts = getThreadSegmentDrawParts(thread, segments[s]);
        var strokeColor = thread.color === 'rainbow'
          ? colorToSvg(rainbowColor(s / Math.max(1, segments.length)))
          : colorToSvg(thread.color);

        for (var p = 0; p < parts.length; p++) {
          lines.push(
            '<line x1="' + formatSvgNumber(parts[p].fromPoint.x) + '" y1="' + formatSvgNumber(parts[p].fromPoint.y) +
            '" x2="' + formatSvgNumber(parts[p].toPoint.x) + '" y2="' + formatSvgNumber(parts[p].toPoint.y) +
            '" stroke="' + strokeColor + '" stroke-width="' + formatSvgNumber(thread.width) +
            '" stroke-linecap="round" stroke-linejoin="round"/>'
          );
        }
      }
    }
  }

  function exportRingHoles(ringPoints) {
    if (!ringPoints || !ringPoints.length) return;
    for (var i = 0; i < ringPoints.length; i++) {
      lines.push('<circle cx="' + formatSvgNumber(ringPoints[i].x) + '" cy="' + formatSvgNumber(ringPoints[i].y) + '" r="3" fill="' + holeFillColor + '"/>');
    }
  }

  exportRingHoles(outerFramePoints.length ? outerFramePoints : points);
  if (nestedFrameEnabled && innerFramePoints.length) {
    exportRingHoles(innerFramePoints);
  }

  if (includeStitchingHoleNumbers) {
    var holeCount = getCurrentStitchHoleCount();
    if (!isFinite(holeCount)) holeCount = DEFAULT_HOLES;
    var fontSize = getHoleNumberFontSize(holeCount);

    function exportRingLabels(ringPoints, invertOutward, isInnerRing) {
      if (!ringPoints || !ringPoints.length) return;
      var ccw = signedAreaOfClosedPolyline(ringPoints) > 0;
      var ringFontSize = isInnerRing ? Math.max(6, fontSize * 0.9) : fontSize;
      var maxExtent = 0;

      for (var e = 0; e < ringPoints.length; e++) {
        var sampleText = String(e + 1);
        var sampleExtent = estimateTextExtentAlongDirection(sampleText, ringFontSize);
        if (sampleExtent > maxExtent) {
          maxExtent = sampleExtent;
        }
      }

      var metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE_SVG, LABEL_HOLE_CLEARANCE_SVG);
      if (metrics.maxOffset < metrics.minOffset) {
        var availableBand = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + LABEL_BORDER_CLEARANCE_SVG) - (3 + LABEL_HOLE_CLEARANCE_SVG);
        var reducedFont = Math.max(6, Math.min(ringFontSize, availableBand * 1.6));
        if (reducedFont < ringFontSize) {
          ringFontSize = reducedFont;
          maxExtent = 0;
          for (var r = 0; r < ringPoints.length; r++) {
            var reducedExtent = estimateTextExtentAlongDirection(String(r + 1), ringFontSize);
            if (reducedExtent > maxExtent) {
              maxExtent = reducedExtent;
            }
          }
          metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE_SVG, LABEL_HOLE_CLEARANCE_SVG);
        }
      }

      var sharedOffset = metrics.offset;
      for (var j = 0; j < ringPoints.length; j++) {
        var text = String(j + 1);
        var outward = getOutwardDirectionAtHoleFromRing(ringPoints, j, ccw, invertOutward);
        var labelPos = ringPoints[j].add(outward.multiply(sharedOffset));
        lines.push(
          '<text x="' + formatSvgNumber(labelPos.x) + '" y="' + formatSvgNumber(labelPos.y) +
          '" fill="' + holeLabelColor + '" font-size="' + formatSvgNumber(ringFontSize) +
          '" font-family="Nunito, sans-serif" text-anchor="middle" dominant-baseline="middle">' +
          text +
          '</text>'
        );
      }
    }

    exportRingLabels(outerFramePoints.length ? outerFramePoints : points, false, false);
    if (nestedFrameEnabled && innerFramePoints.length) {
      exportRingLabels(innerFramePoints, false, true);
    }
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function downloadCurrentDesignSvg(fileBaseName, options) {
  var svgString = buildCurrentDesignSvgString(options);
  var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerBlobDownload(blob, fileBaseName + '.svg');
}

function createCurrentDesignSvgBlob(options) {
  var svgString = buildCurrentDesignSvgString(options);
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

function buildStitchingGuideText(fileBaseName, options) {
  options = options || {};
  var includeStitchingHoleNumbers = shouldShowHoleNumbersNow() || options.forceStitchingHoleNumbers === true;

  function getReadableStitchMode(mode) {
    if (mode === 'connect') return 'Multiplication';
    if (mode === 'sequence') return 'Sequence';
    if (mode === 'formula') return 'Expression';
    return 'Addition';
  }

  function getReadableSequenceMode(mode) {
    return sanitizeThreadSequenceMode(mode, 'holes') === 'steps'
      ? 'Interval sequence'
      : 'Hole sequence';
  }

  function getReadableFrameMode(mode) {
    var normalized = sanitizeThreadFrameMode(mode, 'outer');
    if (normalized === 'inner') return 'Inner ring';
    if (normalized === 'bridge') return 'Bridge outer -> inner';
    if (normalized === 'bridge-reverse') return 'Bridge inner -> outer';
    if (normalized === 'bridge-reverse-project') return 'Bridge inner -> outer radial projection';
    return 'Outer ring';
  }

  function formatHoleReference(index, holeCount) {
    if (!nestedFrameEnabled) {
      return String(index + 1);
    }
    if (index >= holeCount) {
      return 'I' + String((index - holeCount) + 1);
    }
    return 'O' + String(index + 1);
  }

  function appendConnections(targetLines, segments, thread) {
    var holeCount = Math.max(1, getCurrentStitchHoleCount());
    var frameMode = sanitizeThreadFrameMode(thread && thread.frameMode, 'outer');
    for (var idx = 0; idx < segments.length; idx++) {
      var fromRef = formatHoleReference(segments[idx][0], holeCount);
      var toRef = formatHoleReference(segments[idx][1], holeCount);
      if (frameMode === 'bridge-reverse-project') {
        toRef += ' (+ radial extensions to outer frame at both ends)';
      }
      targetLines.push('    ' + fromRef + ' -> ' + toRef);
    }
  }

  computePoints();

  var lines = [];
  var now = new Date();
  lines.push('StitchLab manual stitching guide');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Global');
  lines.push('Shape: ' + currentShape);
  lines.push('Holes per frame: ' + holesSlider.value);
  lines.push('Inner frame enabled: ' + (nestedFrameEnabled ? 'yes' : 'no'));
  if (nestedFrameEnabled) {
    lines.push('Inner frame ratio: ' + String(sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)) + ' of outer radius');
    lines.push('Inner frame holes: ' + String(getCurrentInnerStitchHoleCount()));
    lines.push('Total physical holes: ' + String(getCurrentTotalStitchHoleCount()));
  }
  lines.push('Border enabled: ' + (borderEnabled ? 'yes' : 'no'));
  lines.push('Hole numbers visible in export: ' + (includeStitchingHoleNumbers ? 'yes' : 'no'));
  lines.push('Include stitched threads in SVG: ' + (options.includeThreads ? 'yes' : 'no'));
  lines.push('');
  lines.push('Threads');

  for (var p = 0; p < threads.length; p++) {
    var paramThread = threads[p];
    ensureThreadConnectConfig(paramThread);
    lines.push('Thread ' + (p + 1));
    lines.push('  Color: ' + String(paramThread.color));
    lines.push('  Size: ' + String(paramThread.width));
    lines.push('  Stitch mode: ' + getReadableStitchMode(paramThread.jumpMode));
    lines.push('  Frame path: ' + getReadableFrameMode(paramThread.frameMode));
    lines.push('  Start hole: ' + String(parseBoundedInt(paramThread.startHole, 1, Math.max(1, getThreadSourceHoleCount(paramThread)), 1)));
    lines.push('  Add value: ' + String(paramThread.jump));
    if (paramThread.jumpMode === 'connect') {
      lines.push('  Multiply by: ' + String(paramThread.connectMultiplier));
    }
    if (paramThread.jumpMode === 'sequence') {
      lines.push('  Sequence type: ' + getReadableSequenceMode(paramThread.jumpSequenceMode));
      lines.push('  Sequence values: ' + String(paramThread.jumpSequence || ''));
    }
    if (paramThread.jumpMode === 'formula') {
      lines.push('  Expression: ' + String(paramThread.jumpFormula || 'skip'));
    }
  }

  lines.push('');
  lines.push('Preparation');
  if (nestedFrameEnabled) {
    lines.push('1. Manufacture two concentric "' + currentShape + '" frames with matching hole counts.');
    lines.push('2. Outer frame: ' + String(getCurrentStitchHoleCount()) + ' holes, numbered clockwise O1..O' + String(getCurrentStitchHoleCount()) + '.');
    lines.push('3. Inner frame: ' + String(getCurrentInnerStitchHoleCount()) + ' holes at radius ratio ' + String(sanitizeNestedFrameRatio(nestedFrameRatio, DEFAULT_NESTED_FRAME_RATIO)) + ', numbered clockwise I1..I' + String(getCurrentInnerStitchHoleCount()) + '.');
    lines.push('4. Keep O1 and I1 angularly aligned as shown in the SVG preview.');
    lines.push('5. Use one thread sequence section per listed thread below.');
  } else {
    lines.push('1. Manufacture the board with shape "' + currentShape + '" and ' + String(points.length) + ' numbered holes.');
    lines.push('2. Number holes clockwise as shown in the preview/export from 1 to ' + String(points.length) + '.');
    lines.push('3. Use one thread sequence section per listed thread below.');
  }
  lines.push('');

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    ensureThreadConnectConfig(thread);
    var segments = computeSegments(thread);
    var modeName = getReadableStitchMode(thread.jumpMode);
    lines.push('Thread ' + (i + 1));
    lines.push('  Mode: ' + modeName);
    lines.push('  Color: ' + String(thread.color));
    lines.push('  Width: ' + String(thread.width));
    lines.push('  Frame path: ' + getReadableFrameMode(thread.frameMode));
    lines.push('  Start hole: ' + String(parseBoundedInt(thread.startHole, 1, Math.max(1, getThreadSourceHoleCount(thread)), 1)));

    if (thread.jumpMode === 'connect') {
      lines.push('  Rule: start at Start hole and count forward as i = 1..n, then target = ((start + multiplier * i - 2) mod n) + 1.');
      lines.push('  n is source ring holes (' + String(getThreadSourceHoleCount(thread)) + ').');
      lines.push('  Multiplier: ' + String(thread.connectMultiplier));
      lines.push('  Start value: ' + String(parseBoundedInt(thread.startHole, 1, Math.max(1, getThreadSourceHoleCount(thread)), 1)));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    } else if (thread.jumpMode === 'sequence') {
      if (sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes') === 'steps') {
        lines.push('  Rule: repeat the provided interval sequence from each current hole, wrapping modulo n.');
        lines.push('  Sequence type: Interval sequence');
      } else {
        lines.push('  Rule: stitch each consecutive pair from the provided hole sequence, in order.');
        lines.push('  Stop condition: the first value greater than n ends the sequence (no modulo wrap).');
        lines.push('  Sequence type: Hole sequence');
      }
      lines.push('  Sequence values: ' + String(thread.jumpSequence || ''));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    } else if (thread.jumpMode === 'formula') {
      lines.push('  Rule: evaluate expression per step, then connect current -> (current + step) mod n.');
      lines.push('  Expression: ' + String(thread.jumpFormula || 'skip'));
      lines.push('  Base add value: ' + String(thread.jump));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    } else {
      lines.push('  Rule: next = ((current + add - 1) mod n) + 1.');
      lines.push('  n is source ring holes (' + String(getThreadSourceHoleCount(thread)) + ').');
      lines.push('  Add value: ' + String(thread.jump));
      lines.push('  Full connections:');
      appendConnections(lines, segments, thread);
    }

    lines.push('');
  }

  lines.push('Notes');
  if (nestedFrameEnabled) {
    lines.push('- Connection labels use O# for outer and I# for inner frame references.');
    lines.push('- Keep both frames centered and aligned during fabrication for accurate stitching.');
  }
  lines.push('- If threads are hidden in the exported SVG, use this guide for reconstruction.');
  lines.push('- Keep consistent thread tension to match the on-screen reference closely.');

  return lines.join('\n');
}

function buildTriangulaGuideText(fileBaseName, options) {
  options = options || {};
  var now = new Date();
  var startDepth = triangulaCountToDepth(triangulaStartCount);
  var targetDepth = triangulaCountToDepth(triangulaTargetCount);
  var lines = [];

  lines.push('StitchLab Triangula instructions');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Experience: Triangula');
  lines.push('Construction mode: ' + triangulaConstructionMode);
  lines.push('Fractal mode: ' + triangulaFractalMode);
  lines.push('Canvas fit mode: ' + triangulaFitMode);
  lines.push('Color mode: ' + triangulaColorMode);
  lines.push('Start triangles: ' + String(triangulaStartCount) + ' (depth ' + String(startDepth) + ')');
  lines.push('Target triangles: ' + String(triangulaTargetCount) + ' (depth ' + String(targetDepth) + ')');
  lines.push('Band 1 color: ' + String(triangulaBandColors.band1));
  lines.push('Band 2 color: ' + String(triangulaBandColors.band2));
  lines.push('Band 4 color: ' + String(triangulaBandColors.band4));
  lines.push('Rainbow source color: ' + String(triangulaSourceColor || triangulaBandColors.band1));
  lines.push('');
  lines.push('Reconstruction');
  lines.push('1. Open Triangula in StitchLab.');
  lines.push('2. Set mode, color mode, and start/target values to match parameters above.');
  lines.push('3. Apply band/rainbow colors as listed above.');
  lines.push('4. Exported SVG captures the fully completed target-state triangle composition with colors.');
  lines.push('');
  lines.push('Notes');
  lines.push('- Triangula exports intentionally skip preview PNG files.');
  lines.push('- Include instructions controls whether this file is exported.');

  return lines.join('\n');
}

function buildSquarusGuideText(fileBaseName, options) {
  options = options || {};
  var now = new Date();
  var catalogPieces = getSquarusPolyominoes(squarusOrder);
  var totalPieces = getSquarusTotalPiecesForOrder(squarusOrder);
  var orderedPieces = getSquarusSequencedPieces(squarusOrder, squarusSequenceSeed);
  var colorSequence = getSquarusPieceColorSequence(Math.max(1, orderedPieces.length));
  var visibleCount = getSquarusVisiblePieceCount(totalPieces);
  var signatureToPieceNumber = Object.create(null);
  var orderedPieceNumbers = [];
  var linesForConnections = [];
  var lines = [];

  for (var c = 0; c < catalogPieces.length; c++) {
    if (catalogPieces[c] && catalogPieces[c].signature) {
      signatureToPieceNumber[catalogPieces[c].signature] = c + 1;
    }
  }

  for (var o = 0; o < orderedPieces.length; o++) {
    var sig = orderedPieces[o] && orderedPieces[o].signature ? orderedPieces[o].signature : '';
    orderedPieceNumbers.push(signatureToPieceNumber[sig] || (o + 1));
  }

  var visiblePieceNumbers = orderedPieceNumbers.slice(0, Math.max(0, visibleCount));
  for (var step = 1; step < visiblePieceNumbers.length; step++) {
    linesForConnections.push('  Step ' + String(step) + ': P' + String(visiblePieceNumbers[step - 1]) + ' -> P' + String(visiblePieceNumbers[step]));
  }

  lines.push('StitchLab Squarus instructions');
  lines.push('Generated: ' + now.toISOString());
  lines.push('Export name: ' + fileBaseName);
  lines.push('');
  lines.push('Parameters');
  lines.push('Experience: Squarus');
  lines.push('Squares order: ' + String(squarusOrder));
  lines.push('Polyomino set size: ' + String(totalPieces));
  lines.push('Layout formula: ' + String(squarusLayout));
  lines.push('Animation mode: ' + String(squarusAnimationMode));
  lines.push('Contact mode: ' + String(squarusContactMode));
  lines.push('Piece order seed: ' + String(squarusSequenceSeed));
  lines.push('Pieces placed: ' + String(visibleCount) + ' / ' + String(totalPieces));
  lines.push('Include preview PNG: ' + (options.includePreview ? 'yes' : 'no'));
  lines.push('SVG piece IDs are enumerated left-to-right as P1..P' + String(totalPieces) + '.');
  lines.push('');
  lines.push('Export outputs');
  lines.push('1. SVG: linear, evenly spaced cut sheet of the selected-order polyomino set (outline-only pieces for printing/cutting).');
  lines.push('2. PNG: on-canvas Squarus arrangement using active parameters and colors.');
  lines.push('3. This instructions file: parameter snapshot and assembly notes.');
  lines.push('');
  lines.push('Assembly notes');
  lines.push('1. Print the SVG at 100% scale to keep all pieces dimensionally consistent.');
  lines.push('2. Cut each outlined polyomino as an individual piece.');
  lines.push('3. Use the PNG preview as the reference arrangement for the selected layout formula and piece order.');
  lines.push('4. Deterministic piece placement order by SVG piece ID (full sequence): ' + orderedPieceNumbers.map(function(id) { return 'P' + String(id); }).join(' -> '));
  if (visiblePieceNumbers.length > 1) {
    lines.push('5. Piece connection order for current Pieces Placed setting:');
    for (var li = 0; li < linesForConnections.length; li++) {
      lines.push(linesForConnections[li]);
    }
  } else if (visiblePieceNumbers.length === 1) {
    lines.push('5. Piece connection order for current Pieces Placed setting: only P' + String(visiblePieceNumbers[0]) + ' is placed.');
  } else {
    lines.push('5. Piece connection order for current Pieces Placed setting: no pieces currently placed.');
  }
  lines.push('6. Color sequence preview (piece order): ' + colorSequence.join(', '));

  return lines.join('\n');
}

function getExportGuideFileName(fileBaseName) {
  if (currentExperienceId === 'triangula') {
    return fileBaseName + '-triangula-instructions.txt';
  }
  if (currentExperienceId === 'squarus') {
    return fileBaseName + '-squarus-instructions.txt';
  }
  return fileBaseName + '-stitching-guide.txt';
}

function buildExportGuideText(fileBaseName, options) {
  if (currentExperienceId === 'triangula') {
    return buildTriangulaGuideText(fileBaseName, options || {});
  }
  if (currentExperienceId === 'squarus') {
    return buildSquarusGuideText(fileBaseName, options || {});
  }
  return buildStitchingGuideText(fileBaseName, options || {});
}

function downloadStitchingGuide(fileBaseName, options) {
  var text = buildExportGuideText(fileBaseName, options || {});
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  triggerBlobDownload(blob, getExportGuideFileName(fileBaseName));
}

function createStitchingGuideBlob(fileBaseName, options) {
  var text = buildExportGuideText(fileBaseName, options || {});
  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}

function downloadPreviewImage(fileBaseName, options) {
  options = options || {};
  var appendPreviewSuffix = options.appendPreviewSuffix !== false;
  capturePreviewImageBlob(function(blob) {
    if (!blob) return;
    var fileName = appendPreviewSuffix ? (fileBaseName + '-preview.png') : (fileBaseName + '.png');
    triggerBlobDownload(blob, fileName);
  });
}

function createPreviewImageBlob() {
  return new Promise(function(resolve) {
    capturePreviewImageBlob(function(blob) {
      resolve(blob || null);
    });
  });
}

function capturePreviewImageBlob(callback) {
  var canvas = document.getElementById('myCanvas');
  if (!canvas || typeof canvas.toBlob !== 'function') {
    callback(null);
    return;
  }

  var previousForcedExportColors = forceExportRenderColors;
  forceExportRenderColors = true;
  redrawAnimationInPlace();

  canvas.toBlob(function(blob) {
    forceExportRenderColors = previousForcedExportColors;
    redrawAnimationInPlace();
    callback(blob || null);
  }, 'image/png');
}

async function downloadExportZipBundle(fileBaseName, options) {
  var zip = new JSZip();
  zip.file(fileBaseName + '.svg', createCurrentDesignSvgBlob(options));

  if (options.includeGuide) {
    zip.file(getExportGuideFileName(fileBaseName), createStitchingGuideBlob(fileBaseName, options));
  }

  if (options.includePreview) {
    var previewBlob = await createPreviewImageBlob();
    if (previewBlob) {
      zip.file(fileBaseName + '-preview.png', previewBlob);
    }
  }

  var zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(zipBlob, fileBaseName + '.zip');
}

function openExportOptionsModal() {
  var isTriangulaExport = currentExperienceId === 'triangula';
  var isSquarusExport = currentExperienceId === 'squarus';
  var isMashrabiyaExport = currentExperienceId === 'mashrabiya';
  var hideThreadsControl = isTriangulaExport || isSquarusExport || isMashrabiyaExport;
  var threadsRow = exportIncludeThreadsInput ? exportIncludeThreadsInput.closest('.modal-row') : null;
  var previewRow = exportIncludePreviewInput ? exportIncludePreviewInput.closest('.modal-row') : null;

  syncExportUiCopy();
  exportNameInput.value = ensureExportBaseNameHasExperiencePrefix(getTimestampLabel());
  exportIncludeThreadsInput.checked = false;
  exportIncludeThreadsInput.disabled = hideThreadsControl;
  exportIncludeGuideInput.checked = true;
  exportIncludePreviewInput.checked = isTriangulaExport ? false : true;
  exportIncludePreviewInput.disabled = isTriangulaExport;
  if (exportMashrabiyaDebugLabelsInput) {
    exportMashrabiyaDebugLabelsInput.checked = false;
  }
  if (threadsRow) {
    threadsRow.style.display = hideThreadsControl ? 'none' : '';
  }
  if (previewRow) {
    previewRow.style.display = isTriangulaExport ? 'none' : '';
  }
  if (exportMashrabiyaDebugRow) {
    exportMashrabiyaDebugRow.style.display = (isMashrabiyaExport && mashrabiyaDebugLabelsEnabled) ? '' : 'none';
  }
  exportOptionsModal.classList.add('open');
  exportNameInput.focus();
  exportNameInput.select();
}

function closeExportOptionsModal() {
  exportOptionsModal.classList.remove('open');
}

function openKidSaveModal() {
  if (!kidSaveModal) return;
  kidSaveModal.classList.add('open');
  syncKidSaveToggleButton();
}

function closeKidSaveModal() {
  if (!kidSaveModal) return;
  kidSaveModal.classList.remove('open');
  syncKidSaveToggleButton();
}

function stopAcknowledgmentsAutoplay() {
  if (acknowledgmentsViewerState.timerId) {
    clearTimeout(acknowledgmentsViewerState.timerId);
    acknowledgmentsViewerState.timerId = null;
  }
}

function parseAcknowledgmentsLinesFromText(text) {
  if (typeof text !== 'string') return [];
  return filterAcknowledgmentsLines(text.split(/\r?\n/));
}

function filterAcknowledgmentsLines(sourceLines) {
  if (!Array.isArray(sourceLines)) return [];
  var lines = [];
  for (var i = 0; i < sourceLines.length; i++) {
    var cleaned = String(sourceLines[i] || '').trim();
    if (cleaned.indexOf('//') === 0) continue;
    if (cleaned) {
      lines.push(cleaned);
    }
  }
  return lines;
}

function loadAcknowledgmentsLines() {
  if (acknowledgmentsLinesCache && acknowledgmentsLinesCache.length) {
    return Promise.resolve(acknowledgmentsLinesCache.slice());
  }

  var isFileProtocol = !!(window && window.location && window.location.protocol === 'file:');
  if (isFileProtocol) {
    acknowledgmentsLinesCache = filterAcknowledgmentsLines(
      ACKNOWLEDGMENTS_INLINE_LINES.length
        ? ACKNOWLEDGMENTS_INLINE_LINES
        : ACKNOWLEDGMENTS_FALLBACK_LINES
    );
    if (!acknowledgmentsLinesCache.length) {
      acknowledgmentsLinesCache = filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
    }
    return Promise.resolve(acknowledgmentsLinesCache.slice());
  }

  return fetch(ACKNOWLEDGMENTS_SOURCE_PATH, { cache: 'no-store' })
    .then(function(response) {
      if (!response || !response.ok) {
        throw new Error('Acknowledgments file not available');
      }
      return response.text();
    })
    .then(function(text) {
      var parsed = parseAcknowledgmentsLinesFromText(text);
      acknowledgmentsLinesCache = parsed.length ? parsed : filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
      return acknowledgmentsLinesCache.slice();
    })
    .catch(function() {
      acknowledgmentsLinesCache = filterAcknowledgmentsLines(ACKNOWLEDGMENTS_FALLBACK_LINES);
      return acknowledgmentsLinesCache.slice();
    });
}

function getAcknowledgmentsStyleForIndex(index) {
  if (!ACKNOWLEDGMENTS_STYLE_SEQUENCE.length) return 'stitching';
  var normalized = Math.max(0, parseBoundedInt(index, 0, 100000, 0));
  return ACKNOWLEDGMENTS_STYLE_SEQUENCE[normalized % ACKNOWLEDGMENTS_STYLE_SEQUENCE.length] || 'stitching';
}

function getAcknowledgmentsStyleLabel(styleId) {
  if (styleId === 'triangula') return 'Triangula';
  if (styleId === 'squarus') return 'Squarus';
  return 'Stitching';
}

function createSvgNode(name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createAcknowledgmentsSeededRng(seed) {
  var state = ((seed >>> 0) || 1) >>> 0;
  return function() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createAcknowledgmentsVisual(styleId, index) {
  var rng = createAcknowledgmentsSeededRng(((index + 1) * 2654435761) ^ (styleId === 'triangula' ? 73 : (styleId === 'squarus' ? 137 : 211)));
  if (styleId === 'triangula') {
    return {
      depth: 3 + Math.floor(rng() * 2),
      mode: rng() > 0.5 ? 'shrink' : 'cut',
      fractalMode: rng() > 0.5 ? 'parallel' : 'series'
    };
  }
  if (styleId === 'squarus') {
    return {
      order: 4 + Math.floor(rng() * 2),
      pieceCount: 8 + Math.floor(rng() * 8),
      sequenceSeed: 1 + Math.floor(rng() * 32),
      layout: rng() > 0.5 ? 'force-directed' : 'grid-packing'
    };
  }
  return {
    holes: 36 + Math.floor(rng() * 24),
    jump: 3 + Math.floor(rng() * 9),
    width: 1 + Math.floor(rng() * 2)
  };
}

function getAcknowledgmentsVisualForIndex(index, styleId) {
  var cacheKey = String(index);
  var cached = acknowledgmentsViewerState.visualByIndex[cacheKey];
  if (cached && cached.styleId === styleId && cached.visual) {
    return cached.visual;
  }
  var visual = createAcknowledgmentsVisual(styleId, index);
  acknowledgmentsViewerState.visualByIndex[cacheKey] = {
    styleId: styleId,
    visual: visual
  };
  return visual;
}

function clearAcknowledgmentsPattern() {
  if (!acknowledgmentsPattern) return;
  while (acknowledgmentsPattern.firstChild) {
    acknowledgmentsPattern.removeChild(acknowledgmentsPattern.firstChild);
  }
  acknowledgmentsViewerState.svgTextGroup = null;
  acknowledgmentsViewerState.svgTextNode = null;
  acknowledgmentsViewerState.svgTextSpec = null;
  acknowledgmentsViewerState.lastRevealText = '';
}

function stopAcknowledgmentsStageAnimation() {
  if (acknowledgmentsViewerState.rafId) {
    cancelAnimationFrame(acknowledgmentsViewerState.rafId);
    acknowledgmentsViewerState.rafId = null;
  }
}

function getAcknowledgmentsStageLogicalSize() {
  var canvasSize = null;
  if (view && view.viewSize && isFinite(view.viewSize.width) && isFinite(view.viewSize.height)) {
    canvasSize = Math.floor(Math.min(view.viewSize.width, view.viewSize.height));
  }
  if (!isFinite(canvasSize) || canvasSize <= 0) {
    canvasSize = ACKNOWLEDGMENTS_STAGE_SIZE;
  }
  return Math.max(240, canvasSize);
}

function configureAcknowledgmentsPatternViewport() {
  var stageSize = getAcknowledgmentsStageLogicalSize();
  if (acknowledgmentsPattern) {
    acknowledgmentsPattern.setAttribute('viewBox', '0 0 ' + stageSize + ' ' + stageSize);
    acknowledgmentsPattern.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  if (acknowledgmentsStage) {
    var canvasSizePx = null;
    var canvasEl = document.getElementById('myCanvas');
    if (canvasEl && isFinite(canvasEl.clientWidth) && canvasEl.clientWidth > 0) {
      canvasSizePx = Math.round(canvasEl.clientWidth);
    }
    if ((!isFinite(canvasSizePx) || canvasSizePx <= 0) && isFinite(stageSize)) {
      canvasSizePx = Math.round(stageSize);
    }
    if (isFinite(canvasSizePx) && canvasSizePx > 0) {
      canvasSizePx = Math.max(520, canvasSizePx);
      acknowledgmentsStage.style.setProperty('--ack-stage-target-size', String(canvasSizePx) + 'px');
    }
  }

  return stageSize;
}

function ensureAcknowledgmentsTextLayerInFront() {
  if (!acknowledgmentsPattern || !acknowledgmentsViewerState.svgTextGroup) return;
  if (acknowledgmentsViewerState.svgTextGroup.parentNode === acknowledgmentsPattern) {
    acknowledgmentsPattern.appendChild(acknowledgmentsViewerState.svgTextGroup);
  }
}

function buildAcknowledgmentsEquilateralTriangle(size, sideScale, baseYRatio) {
  var side = size * sideScale;
  var half = side * 0.5;
  var centerX = size * 0.5;
  var baseY = size * baseYRatio;
  var triHeight = side * (Math.sqrt(3) * 0.5);
  var apexY = baseY - triHeight;
  return {
    apex: { x: centerX, y: apexY },
    left: { x: centerX - half, y: baseY },
    right: { x: centerX + half, y: baseY },
    side: side,
    height: triHeight
  };
}

function getAcknowledgmentsTriangulaSideScale(size) {
  var safeSize = Math.max(220, Number(size) || ACKNOWLEDGMENTS_STAGE_SIZE);
  // Keep a fixed-like footprint (closer to Triangula's base frame) while preserving edge margins.
  var side = Math.max(safeSize * 0.78, safeSize - 64);
  side = Math.min(side, safeSize - 34);
  return Math.max(0.68, Math.min(0.94, side / safeSize));
}

function getAcknowledgmentsPaletteColors() {
  var palette = [];
  function pushColor(value, fallback) {
    var normalized = sanitizeHexColor(value, fallback || '#1982c4');
    var key = String(normalized || '').toLowerCase();
    if (!key || palette.indexOf(normalized) >= 0) return;
    palette.push(normalized);
  }

  if (Array.isArray(threads) && threads.length) {
    for (var i = 0; i < threads.length; i++) {
      pushColor(threads[i] && threads[i].color, '#1982c4');
    }
  }

  pushColor(triangulaBandColors && triangulaBandColors.band1, '#8ac926');
  pushColor(triangulaBandColors && triangulaBandColors.band2, '#6a4c93');
  pushColor(triangulaBandColors && triangulaBandColors.band4, '#1982c4');

  var source = normalizeTriangulaFillColor(triangulaSourceColor, '#8ac926');
  if (source !== 'rainbow') {
    pushColor(source, '#8ac926');
  }

  if (!palette.length) {
    for (var m = 0; m < magicThreadColors.length; m++) {
      pushColor(magicThreadColors[m], '#1982c4');
    }
  }

  return palette.length ? palette : ['#1982c4', '#8ac926', '#6a4c93'];
}

function getAcknowledgmentsSoftenedColor(color, amount) {
  var base = sanitizeHexColor(color, '#6f7f95');
  return squarusApplyShade(base, Math.max(0, Math.min(1, Number(amount) || 0.55)));
}

function getAcknowledgmentsTextFrameSpec(styleId) {
  var size = getAcknowledgmentsStageLogicalSize();
  if (styleId === 'triangula') {
    var triScale = getAcknowledgmentsTriangulaSideScale(size);
    var tri = buildAcknowledgmentsEquilateralTriangle(size, triScale, 0.86);
    var triTopPad = size * 0.136;
    var triBottomPad = size * 0.03;
    return {
      shapeType: 'path',
      shapePath: 'M ' + tri.apex.x + ' ' + tri.apex.y + ' L ' + tri.left.x + ' ' + tri.left.y + ' L ' + tri.right.x + ' ' + tri.right.y + ' Z',
      textX: size * 0.5,
      textY: tri.apex.y + (tri.height * 0.84),
      maxChars: 18,
      maxCharsMax: 26,
      minFontSize: 20,
      maxFontSize: 24,
      textAreaHeight: tri.height * 0.48,
      triangleApexY: tri.apex.y,
      triangleHeight: tri.height,
      triangleSide: tri.side,
      textPadding: size * 0.045,
      textTop: tri.apex.y + triTopPad,
      textBottom: tri.left.y - triBottomPad
    };
  }
  if (styleId === 'squarus') {
    var rectPad = size * 0.055;
    return {
      shapeType: 'rect',
      shapeRect: {
        x: size * 0.14,
        y: size * 0.14,
        width: size * 0.72,
        height: size * 0.72,
        rx: 18
      },
      textX: size * 0.5,
      textY: size * 0.56,
      maxChars: 34,
      maxCharsMax: 44,
      minFontSize: 20,
      maxFontSize: 28,
      textAreaHeight: size * 0.56,
      textPadding: size * 0.05,
      textTop: size * 0.14 + rectPad,
      textBottom: size * 0.86 - rectPad
    };
  }

  var circlePad = size * 0.055;
  return {
    shapeType: 'circle',
    shapeCircle: {
      cx: size * 0.5,
      cy: size * 0.5,
      r: size * 0.35
    },
    textX: size * 0.5,
    textY: size * 0.58,
    maxChars: 30,
    maxCharsMax: 40,
    minFontSize: 20,
    maxFontSize: 27,
    textAreaHeight: size * 0.55,
    textPadding: size * 0.05,
    textTop: (size * 0.5 - size * 0.35) + circlePad,
    textBottom: (size * 0.5 + size * 0.35) - circlePad
  };
}

var acknowledgmentsTextMeasureCanvas = null;

function getAcknowledgmentsTextMeasureContext() {
  if (!acknowledgmentsTextMeasureCanvas) {
    acknowledgmentsTextMeasureCanvas = document.createElement('canvas');
  }
  return acknowledgmentsTextMeasureCanvas.getContext('2d');
}

function measureAcknowledgmentsTextWidth(text, fontSize, fontFamily, fontWeight) {
  var ctx = getAcknowledgmentsTextMeasureContext();
  if (!ctx) return (String(text || '').length * fontSize * 0.62);
  ctx.font = String(fontWeight || 700) + ' ' + String(Math.max(8, fontSize || 12)) + 'px ' + String(fontFamily || 'sans-serif');
  return ctx.measureText(String(text || '')).width;
}

function getAcknowledgmentsLineMaxWidthForY(spec, lineY, stageSize) {
  var safePad = Math.max(6, Number(spec && spec.textPadding) || (stageSize * 0.03));
  var sideGuard = Math.max(8, safePad * 0.5);
  if (!spec) return stageSize - (safePad * 2);

  if (spec.shapeType === 'rect' && spec.shapeRect) {
    return Math.max(20, spec.shapeRect.width - (safePad * 2) - sideGuard);
  }

  if (spec.shapeType === 'circle' && spec.shapeCircle) {
    var dy = lineY - spec.shapeCircle.cy;
    var r = Math.max(1, spec.shapeCircle.r - safePad);
    var inside = (r * r) - (dy * dy);
    if (inside <= 0) return 20;
    return Math.max(20, Math.sqrt(inside) * 2 - sideGuard);
  }

  if (spec.shapeType === 'path' && isFinite(spec.triangleApexY) && isFinite(spec.triangleHeight) && isFinite(spec.triangleSide)) {
    var t = (lineY - spec.triangleApexY) / Math.max(1e-6, spec.triangleHeight);
    t = clamp01(t);
    return Math.max(20, (spec.triangleSide * t) - (safePad * 2) - sideGuard);
  }

  return Math.max(20, stageSize - (safePad * 2) - sideGuard);
}

function buildAcknowledgmentsWrappedLines(text, maxChars, maxLines) {
  var safeText = String(text || '').replace(/\s+/g, ' ').trim();
  if (!safeText) return [];

  var words = safeText.split(' ');
  var lines = [];
  var current = '';
  for (var i = 0; i < words.length; i++) {
    var probe = current ? (current + ' ' + words[i]) : words[i];
    if (probe.length <= maxChars || !current) {
      current = probe;
      continue;
    }
    lines.push(current);
    current = words[i];
    if (maxLines > 0 && lines.length >= maxLines) break;
  }
  if ((maxLines <= 0 || lines.length < maxLines) && current) {
    lines.push(current);
  }
  if (maxLines > 0 && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
  }
  return lines;
}

function createAcknowledgmentsTextLayer(styleId) {
  if (!acknowledgmentsPattern) return;

  configureAcknowledgmentsPatternViewport();

  var spec = getAcknowledgmentsTextFrameSpec(styleId);
  var defs = createSvgNode('defs');
  var clipPath = createSvgNode('clipPath');
  var clipId = 'acknowledgments-text-clip-' + styleId;
  var textFilterId = 'acknowledgments-text-edge-' + styleId;
  clipPath.setAttribute('id', clipId);

  var textFilter = createSvgNode('filter');
  textFilter.setAttribute('id', textFilterId);
  textFilter.setAttribute('x', '-12%');
  textFilter.setAttribute('y', '-12%');
  textFilter.setAttribute('width', '124%');
  textFilter.setAttribute('height', '124%');
  textFilter.setAttribute('color-interpolation-filters', 'sRGB');

  var edgeDilate = createSvgNode('feMorphology');
  edgeDilate.setAttribute('in', 'SourceAlpha');
  edgeDilate.setAttribute('operator', 'dilate');
  edgeDilate.setAttribute('radius', '0.85');
  edgeDilate.setAttribute('result', 'edgeBase');
  textFilter.appendChild(edgeDilate);

  var edgeBlur = createSvgNode('feGaussianBlur');
  edgeBlur.setAttribute('in', 'edgeBase');
  edgeBlur.setAttribute('stdDeviation', '1.15');
  edgeBlur.setAttribute('result', 'edgeBlur');
  textFilter.appendChild(edgeBlur);

  var edgeFlood = createSvgNode('feFlood');
  edgeFlood.setAttribute('flood-color', '#f8fbff');
  edgeFlood.setAttribute('flood-opacity', '0.95');
  edgeFlood.setAttribute('result', 'edgeColor');
  textFilter.appendChild(edgeFlood);

  var edgeComposite = createSvgNode('feComposite');
  edgeComposite.setAttribute('in', 'edgeColor');
  edgeComposite.setAttribute('in2', 'edgeBlur');
  edgeComposite.setAttribute('operator', 'in');
  edgeComposite.setAttribute('result', 'edgeGlow');
  textFilter.appendChild(edgeComposite);

  var textMerge = createSvgNode('feMerge');
  var textMergeEdge = createSvgNode('feMergeNode');
  textMergeEdge.setAttribute('in', 'edgeGlow');
  var textMergeSource = createSvgNode('feMergeNode');
  textMergeSource.setAttribute('in', 'SourceGraphic');
  textMerge.appendChild(textMergeEdge);
  textMerge.appendChild(textMergeSource);
  textFilter.appendChild(textMerge);

  var clipShape = null;
  var frameOutline = null;
  if (spec.shapeType === 'rect') {
    clipShape = createSvgNode('rect');
    clipShape.setAttribute('x', String(spec.shapeRect.x));
    clipShape.setAttribute('y', String(spec.shapeRect.y));
    clipShape.setAttribute('width', String(spec.shapeRect.width));
    clipShape.setAttribute('height', String(spec.shapeRect.height));
    clipShape.setAttribute('rx', String(spec.shapeRect.rx));

    frameOutline = createSvgNode('rect');
    frameOutline.setAttribute('x', String(spec.shapeRect.x));
    frameOutline.setAttribute('y', String(spec.shapeRect.y));
    frameOutline.setAttribute('width', String(spec.shapeRect.width));
    frameOutline.setAttribute('height', String(spec.shapeRect.height));
    frameOutline.setAttribute('rx', String(spec.shapeRect.rx));
  } else if (spec.shapeType === 'circle') {
    clipShape = createSvgNode('circle');
    clipShape.setAttribute('cx', String(spec.shapeCircle.cx));
    clipShape.setAttribute('cy', String(spec.shapeCircle.cy));
    clipShape.setAttribute('r', String(spec.shapeCircle.r));

    frameOutline = createSvgNode('circle');
    frameOutline.setAttribute('cx', String(spec.shapeCircle.cx));
    frameOutline.setAttribute('cy', String(spec.shapeCircle.cy));
    frameOutline.setAttribute('r', String(spec.shapeCircle.r));
  } else {
    clipShape = createSvgNode('path');
    clipShape.setAttribute('d', spec.shapePath);

    frameOutline = createSvgNode('path');
    frameOutline.setAttribute('d', spec.shapePath);
  }

  clipPath.appendChild(clipShape);
  defs.appendChild(clipPath);
  defs.appendChild(textFilter);
  acknowledgmentsPattern.appendChild(defs);

  frameOutline.setAttribute('fill', 'none');
  if (spec.shapeType === 'rect') {
    // Squarus uses an internal square clip frame; keep it invisible.
    frameOutline.setAttribute('stroke', 'none');
    frameOutline.setAttribute('opacity', '0');
  } else {
    frameOutline.setAttribute('stroke', '#748292');
    frameOutline.setAttribute('stroke-width', '2');
    frameOutline.setAttribute('opacity', '0.32');
  }
  acknowledgmentsPattern.appendChild(frameOutline);

  var textGroup = createSvgNode('g');
  textGroup.setAttribute('clip-path', 'url(#' + clipId + ')');
  textGroup.setAttribute('filter', 'url(#' + textFilterId + ')');
  textGroup.setAttribute('opacity', '0');

  var textNode = createSvgNode('text');
  textNode.setAttribute('x', String(spec.textX));
  textNode.setAttribute('y', String(spec.textY));
  textNode.setAttribute('fill', 'rgba(16, 23, 35, 0.9)');
  textNode.setAttribute('text-anchor', 'middle');
  textNode.setAttribute('font-size', '29');
  textNode.setAttribute('font-family', '"Clacon2", "Nunito", sans-serif');
  textNode.setAttribute('font-weight', '700');
  textNode.setAttribute('paint-order', 'stroke');
  textNode.setAttribute('stroke', 'rgba(248, 252, 255, 0.88)');
  textNode.setAttribute('stroke-width', '1.18');
  textNode.setAttribute('stroke-linejoin', 'round');

  textGroup.appendChild(textNode);
  acknowledgmentsPattern.appendChild(textGroup);

  acknowledgmentsViewerState.svgTextGroup = textGroup;
  acknowledgmentsViewerState.svgTextNode = textNode;
  acknowledgmentsViewerState.svgTextSpec = spec;
  acknowledgmentsViewerState.svgTextMaxChars = spec.maxChars;
  acknowledgmentsViewerState.svgTextMaxLines = spec.maxLines || 0;
  acknowledgmentsViewerState.svgTextLineHeight = spec.lineHeight || 32;
  acknowledgmentsViewerState.svgTextAnchorY = spec.textY;
}

function updateAcknowledgmentsSvgText(text) {
  var svgTextNode = acknowledgmentsViewerState.svgTextNode;
  if (!svgTextNode) return;
  var stageSize = getAcknowledgmentsStageLogicalSize();

  var safeText = String(text || '');
  if (acknowledgmentsViewerState.lastRevealText === safeText) return;
  acknowledgmentsViewerState.lastRevealText = safeText;

  while (svgTextNode.firstChild) {
    svgTextNode.removeChild(svgTextNode.firstChild);
  }

  if (!safeText) return;
  var spec = acknowledgmentsViewerState.svgTextSpec || {};
  var maxChars = Math.max(14, parseBoundedInt(acknowledgmentsViewerState.svgTextMaxChars, 14, 64, 32));
  var maxCharsCap = Math.max(maxChars, parseBoundedInt(spec.maxCharsMax, maxChars, 72, maxChars + 10));
  var maxLines = Math.max(0, parseBoundedInt(acknowledgmentsViewerState.svgTextMaxLines, 0, 24, 0));
  var textAreaHeight = Math.max(140, parseBoundedInt(spec.textAreaHeight, 140, stageSize - 40, Math.floor(stageSize * 0.56)));
  var minFontSize = Math.max(12, parseBoundedInt(spec.minFontSize, 12, 26, 15));
  var maxFontSize = Math.max(minFontSize, parseBoundedInt(spec.maxFontSize, minFontSize, 38, 27));
  var lines = [];
  var fontSize = minFontSize;
  var charLimit = maxChars;
  var fontFamily = svgTextNode.getAttribute('font-family') || 'sans-serif';
  var fontWeight = svgTextNode.getAttribute('font-weight') || '400';

  while (true) {
    lines = buildAcknowledgmentsWrappedLines(safeText, charLimit, maxLines);
    if (!lines.length) break;
    var candidate = Math.floor(textAreaHeight / Math.max(1, lines.length * 1.24));
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, candidate));
    if (fontSize > minFontSize || charLimit >= maxCharsCap) break;
    charLimit = Math.min(maxCharsCap, charLimit + 2);
  }
  if (!lines.length) return;

  var lineHeight = Math.max(18, Math.round(fontSize * 1.22));
  var textTop = isFinite(spec.textTop) ? spec.textTop : 80;
  var textBottom = isFinite(spec.textBottom) ? spec.textBottom : (stageSize - 80);
  var availableHeight = Math.max(40, textBottom - textTop);
  var ascentRatio = 0.78;
  var descentRatio = 0.22;
  var topPad = Math.max(2, fontSize * 0.08);
  var bottomPad = Math.max(2, fontSize * 0.06);
  var ascent = fontSize * ascentRatio;
  var descent = fontSize * descentRatio;
  var totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
  while (totalHeight > availableHeight && fontSize > minFontSize) {
    fontSize -= 1;
    lineHeight = Math.max(16, Math.round(fontSize * 1.2));
    topPad = Math.max(2, fontSize * 0.08);
    bottomPad = Math.max(2, fontSize * 0.06);
    ascent = fontSize * ascentRatio;
    descent = fontSize * descentRatio;
    totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
  }

  function fitsAllLineWidths() {
    var baselineStartProbe = textTop + ((availableHeight - totalHeight) * 0.5) + topPad + ascent;
    for (var li = 0; li < lines.length; li++) {
      var ly = baselineStartProbe + li * lineHeight;
      var allowed = getAcknowledgmentsLineMaxWidthForY(spec, ly, stageSize);
      var measured = measureAcknowledgmentsTextWidth(lines[li], fontSize, fontFamily, fontWeight);
      if (measured > allowed) return false;
    }
    return true;
  }

  while (!fitsAllLineWidths() && fontSize > minFontSize) {
    fontSize -= 1;
    lineHeight = Math.max(16, Math.round(fontSize * 1.2));
    topPad = Math.max(2, fontSize * 0.08);
    bottomPad = Math.max(2, fontSize * 0.06);
    ascent = fontSize * ascentRatio;
    descent = fontSize * descentRatio;
    totalHeight = ascent + descent + ((lines.length - 1) * lineHeight) + topPad + bottomPad;
    if (totalHeight > availableHeight) {
      continue;
    }
  }

  svgTextNode.setAttribute('font-size', String(fontSize));
  svgTextNode.setAttribute('stroke-width', String(Math.max(0.45, fontSize * 0.03)));

  var baselineStart = textTop + ((availableHeight - totalHeight) * 0.5) + topPad + ascent;
  if (!isFinite(baselineStart)) baselineStart = textTop + topPad + ascent;
  for (var i = 0; i < lines.length; i++) {
    var lineY = baselineStart + i * lineHeight;
    var maxWidth = getAcknowledgmentsLineMaxWidthForY(spec, lineY, stageSize);
    var measuredWidth = measureAcknowledgmentsTextWidth(lines[i], fontSize, fontFamily, fontWeight);
    var tspan = createSvgNode('tspan');
    tspan.setAttribute('x', svgTextNode.getAttribute('x') || String(stageSize * 0.5));
    tspan.setAttribute('y', String(lineY));
    if (measuredWidth > maxWidth) {
      // Last-resort clamp for edge cases (e.g., very long single tokens).
      tspan.setAttribute('textLength', String(Math.max(18, maxWidth - 2)));
      tspan.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
    tspan.textContent = lines[i];
    svgTextNode.appendChild(tspan);
  }

  ensureAcknowledgmentsTextLayerInFront();
}

function setAcknowledgmentsLineReveal(text, progress) {
  var safeText = String(text || '');
  var p = clamp01(progress);
  var revealText = safeText;
  if (acknowledgmentsLineText) {
    acknowledgmentsLineText.textContent = revealText;
  }
  updateAcknowledgmentsSvgText(revealText);

  if (acknowledgmentsViewerState.svgTextGroup) {
    var fadeStart = ACKNOWLEDGMENTS_TEXT_FADE_START;
    var fadeEnd = Math.max(fadeStart + 0.04, ACKNOWLEDGMENTS_TEXT_FADE_END);
    var alpha = 0;
    if (p >= fadeEnd) {
      alpha = 0.95;
    } else if (p > fadeStart) {
      var local = (p - fadeStart) / (fadeEnd - fadeStart);
      alpha = 0.95 * easeInOutCubic(clamp01(local));
    }
    acknowledgmentsViewerState.svgTextGroup.setAttribute('opacity', String(alpha));
  }
}

function getAcknowledgmentsSecondsPerBeat() {
  return 60 / ACKNOWLEDGMENTS_BPM;
}

function getAcknowledgmentsBaseLineDurationMs() {
  var spb = getAcknowledgmentsSecondsPerBeat();
  return Math.round(ACKNOWLEDGMENTS_LINE_BEATS * spb * 1000);
}

function countAcknowledgmentsWords(text) {
  var safeText = String(text || '').trim();
  if (!safeText) return 0;
  var matches = safeText.match(/\S+/g);
  return matches ? matches.length : 0;
}

function buildAcknowledgmentsLineDurations(lines) {
  var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES;
  var raw = [];
  var totalRaw = 0;
  for (var i = 0; i < safeLines.length; i++) {
    var words = countAcknowledgmentsWords(safeLines[i]);
    var ms = ACKNOWLEDGMENTS_LINE_BASE_MS + (words * ACKNOWLEDGMENTS_MS_PER_WORD);
    ms = Math.max(ACKNOWLEDGMENTS_LINE_MIN_MS, Math.min(ACKNOWLEDGMENTS_LINE_MAX_MS, Math.round(ms)));
    raw.push(ms);
    totalRaw += ms;
  }

  if (!raw.length) return [getAcknowledgmentsBaseLineDurationMs()];

  var trackDurationSec = (acknowledgmentsAudio && isFinite(acknowledgmentsAudio.duration))
    ? acknowledgmentsAudio.duration
    : 0;
  if (!(trackDurationSec > 0) || !(totalRaw > 0)) {
    return raw;
  }

  var trackMs = Math.round(trackDurationSec * 1000);
  var scale = trackMs / totalRaw;
  scale = Math.max(0.72, Math.min(1.4, scale));

  var scaled = [];
  for (var s = 0; s < raw.length; s++) {
    var scaledMs = Math.round(raw[s] * scale);
    scaled.push(Math.max(ACKNOWLEDGMENTS_LINE_MIN_MS, Math.min(ACKNOWLEDGMENTS_LINE_MAX_MS, scaledMs)));
  }
  return scaled;
}

function getAcknowledgmentsSeriesLineDurationMs(lineCount) {
  var count = Math.max(1, parseBoundedInt(lineCount, 1, 9999, 1));
  var trackDurationSec = (acknowledgmentsAudio && isFinite(acknowledgmentsAudio.duration))
    ? acknowledgmentsAudio.duration
    : 0;
  if (trackDurationSec > 0) {
    var perLineMs = Math.round((trackDurationSec * 1000) / count);
    return Math.max(2500, Math.min(14000, perLineMs));
  }
  return getAcknowledgmentsBaseLineDurationMs();
}

function getAcknowledgmentsLineDurationMs(styleId, visual, animatorData) {
  if (Array.isArray(acknowledgmentsViewerState.lineDurationsMsByIndex) && acknowledgmentsViewerState.lineDurationsMsByIndex.length) {
    var index = parseBoundedInt(acknowledgmentsViewerState.lineIndex, 0, acknowledgmentsViewerState.lineDurationsMsByIndex.length - 1, 0);
    var perLine = acknowledgmentsViewerState.lineDurationsMsByIndex[index];
    if (isFinite(perLine) && perLine > 0) {
      return perLine;
    }
  }
  if (isFinite(acknowledgmentsViewerState.seriesLineDurationMs) && acknowledgmentsViewerState.seriesLineDurationMs > 0) {
    return acknowledgmentsViewerState.seriesLineDurationMs;
  }
  return getAcknowledgmentsBaseLineDurationMs();
}

function buildAcknowledgmentsStitchingAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('stitching');
  var width = configureAcknowledgmentsPatternViewport();
  var height = width;
  var centerX = width * 0.5;
  var centerY = height * 0.5;
  var radius = Math.min(width, height) * 0.35;
  var holeCount = Math.max(16, parseBoundedInt(visual && visual.holes, 16, 120, 42));
  var jump = Math.max(2, parseBoundedInt(visual && visual.jump, 2, holeCount - 1, 5));
  var lineWidth = Math.max(1, parseBoundedInt(visual && visual.width, 1, 3, 2));
  var palette = getAcknowledgmentsPaletteColors();

  var pointsList = [];
  for (var i = 0; i < holeCount; i++) {
    var theta = -Math.PI / 2 + (Math.PI * 2 * i / holeCount);
    pointsList.push({
      x: centerX + Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius
    });
  }

  var circle = createSvgNode('circle');
  circle.setAttribute('cx', String(centerX));
  circle.setAttribute('cy', String(centerY));
  circle.setAttribute('r', String(radius));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[0] || '#b5bdc8', 0.5));
  circle.setAttribute('stroke-width', '1');
  circle.setAttribute('stroke-opacity', '0.28');
  acknowledgmentsPattern.appendChild(circle);

  for (var h = 0; h < holeCount; h++) {
    var hole = createSvgNode('circle');
    hole.setAttribute('cx', String(pointsList[h].x));
    hole.setAttribute('cy', String(pointsList[h].y));
    hole.setAttribute('r', '1.8');
    hole.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[h % palette.length] || '#8e98a8', 0.56));
    hole.setAttribute('opacity', '0.44');
    acknowledgmentsPattern.appendChild(hole);
  }

  var sequence = [];
  var visited = new Array(holeCount).fill(false);
  var current = 0;
  for (var s = 0; s < holeCount; s++) {
    if (visited[current]) break;
    visited[current] = true;
    sequence.push(current);
    current = (current + jump) % holeCount;
  }

  var segments = [];
  for (var si = 0; si < sequence.length; si++) {
    var from = pointsList[sequence[si]];
    var to = pointsList[sequence[(si + 1) % sequence.length]];
    var line = createSvgNode('line');
    line.setAttribute('x1', String(from.x));
    line.setAttribute('y1', String(from.y));
    line.setAttribute('x2', String(from.x));
    line.setAttribute('y2', String(from.y));
    line.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[si % palette.length] || '#2c323a', 0.4));
    line.setAttribute('stroke-width', String(lineWidth));
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.6');
    acknowledgmentsPattern.appendChild(line);
    segments.push({ line: line, from: from, to: to });
  }

  return {
    segmentCount: segments.length,
    render: function(progress) {
    var p = clamp01(progress);
    var scaled = p * segments.length;
    var fullCount = Math.floor(scaled);
    var partial = scaled - fullCount;

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (i < fullCount) {
        seg.line.setAttribute('x2', String(seg.to.x));
        seg.line.setAttribute('y2', String(seg.to.y));
      } else if (i === fullCount) {
        var px = seg.from.x + (seg.to.x - seg.from.x) * partial;
        var py = seg.from.y + (seg.to.y - seg.from.y) * partial;
        seg.line.setAttribute('x2', String(px));
        seg.line.setAttribute('y2', String(py));
      } else {
        seg.line.setAttribute('x2', String(seg.from.x));
        seg.line.setAttribute('y2', String(seg.from.y));
      }
    }
    }
  };
}

function splitAcknowledgmentsTriangle(vertices) {
  var m01 = { x: (vertices[0].x + vertices[1].x) / 2, y: (vertices[0].y + vertices[1].y) / 2 };
  var m12 = { x: (vertices[1].x + vertices[2].x) / 2, y: (vertices[1].y + vertices[2].y) / 2 };
  var m20 = { x: (vertices[2].x + vertices[0].x) / 2, y: (vertices[2].y + vertices[0].y) / 2 };
  return {
    central: [m01, m12, m20],
    children: [
      { vertices: [vertices[0], m01, m20], slot: 1 },
      { vertices: [m01, vertices[1], m12], slot: 2 },
      { vertices: [m20, m12, vertices[2]], slot: 4 }
    ]
  };
}

function collectAcknowledgmentsTriangles(vertices, depth, slot, collector) {
  if (depth <= 0) {
    collector.push({ vertices: vertices, slot: slot || 1 });
    return;
  }
  var split = splitAcknowledgmentsTriangle(vertices);
  for (var i = 0; i < split.children.length; i++) {
    collectAcknowledgmentsTriangles(split.children[i].vertices, depth - 1, split.children[i].slot, collector);
  }
}

function collectAcknowledgmentsCutCenters(vertices, depth, collector) {
  if (depth <= 0) return;
  var split = splitAcknowledgmentsTriangle(vertices);
  if (depth === 1) {
    collector.push(split.central);
    return;
  }
  for (var i = 0; i < split.children.length; i++) {
    collectAcknowledgmentsCutCenters(split.children[i].vertices, depth - 1, collector);
  }
}

function toAcknowledgmentsPath(vertices) {
  return 'M ' + vertices[0].x + ' ' + vertices[0].y + ' L ' + vertices[1].x + ' ' + vertices[1].y + ' L ' + vertices[2].x + ' ' + vertices[2].y + ' Z';
}

function buildAcknowledgmentsTriangulaAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('triangula');
  var width = configureAcknowledgmentsPatternViewport();
  var height = width;
  var depth = Math.max(2, parseBoundedInt(visual && visual.depth, 2, 5, 3));
  var mode = visual && visual.mode === 'cut' ? 'cut' : 'shrink';
  var palette = getAcknowledgmentsPaletteColors();
  var triScale = getAcknowledgmentsTriangulaSideScale(width);
  var tri = buildAcknowledgmentsEquilateralTriangle(width, triScale, 0.86);
  var base = [tri.apex, tri.left, tri.right];

  var basePath = createSvgNode('path');
  basePath.setAttribute('d', toAcknowledgmentsPath(base));
  basePath.setAttribute('fill', 'none');
  basePath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[0] || '#3d4652', 0.48));
  basePath.setAttribute('stroke-width', '2');
  basePath.setAttribute('opacity', '0.54');
  acknowledgmentsPattern.appendChild(basePath);

  var elements = [];
  var timelineBeats = 0;
  var slotPalette = {
    1: getTriangulaFillColorForSlot(1, 0),
    2: getTriangulaFillColorForSlot(2, 1),
    4: getTriangulaFillColorForSlot(4, 2)
  };
  if (mode === 'cut') {
    for (var d = 1; d <= depth; d++) {
      var cuts = [];
      collectAcknowledgmentsCutCenters(base, d, cuts);
      timelineBeats += (visual && visual.fractalMode === 'parallel') ? 1.85 : (cuts.length * 0.95);
      for (var c = 0; c < cuts.length; c++) {
        var cutPath = createSvgNode('path');
        cutPath.setAttribute('d', toAcknowledgmentsPath(cuts[c]));
        cutPath.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[(c + d) % palette.length] || '#6f7b8a', 0.48));
        cutPath.setAttribute('fill-opacity', '0.46');
        cutPath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[(c + d + 1) % palette.length] || '#353f4b', 0.38));
        cutPath.setAttribute('stroke-opacity', '0.56');
        cutPath.setAttribute('stroke-width', '1.2');
        cutPath.setAttribute('opacity', '0');
        acknowledgmentsPattern.appendChild(cutPath);
        elements.push(cutPath);
      }
    }
  } else {
    for (var level = 1; level <= depth; level++) {
      var triangles = [];
      collectAcknowledgmentsTriangles(base, level, 1, triangles);
      timelineBeats += (visual && visual.fractalMode === 'parallel') ? 1.75 : (triangles.length * 0.92);
      for (var t = 0; t < triangles.length; t++) {
        var trianglePath = createSvgNode('path');
        trianglePath.setAttribute('d', toAcknowledgmentsPath(triangles[t].vertices));
        trianglePath.setAttribute('fill', getAcknowledgmentsSoftenedColor(slotPalette[triangles[t].slot] || palette[t % palette.length], 0.5));
        trianglePath.setAttribute('fill-opacity', '0.48');
        trianglePath.setAttribute('stroke', getAcknowledgmentsSoftenedColor(palette[(t + level) % palette.length] || '#2f3946', 0.4));
        trianglePath.setAttribute('stroke-opacity', '0.58');
        trianglePath.setAttribute('stroke-width', String(Math.max(0.6, 1.2 - level * 0.1)));
        trianglePath.setAttribute('opacity', '0');
        acknowledgmentsPattern.appendChild(trianglePath);
        elements.push(trianglePath);
      }
    }
  }

  return {
    timelineBeats: timelineBeats,
    render: function(progress) {
    var p = clamp01(progress);
    var scaled = p * elements.length;
    var fullCount = Math.floor(scaled);
    var partial = scaled - fullCount;
    for (var i = 0; i < elements.length; i++) {
      if (i < fullCount) {
        elements[i].setAttribute('opacity', mode === 'cut' ? '0.72' : '0.66');
      } else if (i === fullCount) {
        elements[i].setAttribute('opacity', String(mode === 'cut' ? (partial * 0.72) : (partial * 0.66)));
      } else {
        elements[i].setAttribute('opacity', '0');
      }
    }
    }
  };
}

function getAcknowledgmentsPieceWorldPoint(piece, target, cellX, cellY) {
  var cosR = Math.cos(target.rotation);
  var sinR = Math.sin(target.rotation);
  var localX = (cellX - piece.centroidX) * target.scale;
  var localY = (cellY - piece.centroidY) * target.scale;
  return {
    x: target.x + (localX * cosR - localY * sinR),
    y: target.y + (localX * sinR + localY * cosR)
  };
}

function buildAcknowledgmentsViewportMapper(points) {
  var width = getAcknowledgmentsStageLogicalSize();
  var height = width;
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  for (var i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxX = Math.max(maxX, points[i].x);
    maxY = Math.max(maxY, points[i].y);
  }
  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    minX = 0; minY = 0; maxX = 1; maxY = 1;
  }
  var pad = 16;
  var sx = (width - pad * 2) / Math.max(1e-3, maxX - minX);
  var sy = (height - pad * 2) / Math.max(1e-3, maxY - minY);
  var scale = Math.min(sx, sy);
  var offsetX = pad + (width - pad * 2 - ((maxX - minX) * scale)) * 0.5;
  var offsetY = pad + (height - pad * 2 - ((maxY - minY) * scale)) * 0.5;
  return function(point) {
    return {
      x: offsetX + (point.x - minX) * scale,
      y: offsetY + (point.y - minY) * scale,
      scale: scale
    };
  };
}

function buildAcknowledgmentsSquarusAnimator(visual) {
  clearAcknowledgmentsPattern();
  createAcknowledgmentsTextLayer('squarus');
  var stageSize = configureAcknowledgmentsPatternViewport();
  var previousOrder = squarusOrder;
  var previousLayout = squarusLayout;
  var previousPieceCount = squarusPieceCount;
  var previousSequenceSeed = squarusSequenceSeed;
  var previousContactMode = squarusContactMode;
  var previousAnimationMode = squarusAnimationMode;

  var order = Math.max(2, parseBoundedInt(visual && visual.order, 2, 6, 4));
  var requestedLayout = (visual && visual.layout) ? String(visual.layout) : 'force-directed';
  var sequenceSeed = Math.max(1, parseBoundedInt(visual && visual.sequenceSeed, 1, 999, 7));

  squarusOrder = order;
  squarusLayout = requestedLayout;
  squarusContactMode = 'formula-only';
  squarusAnimationMode = 'sequential';
  squarusSequenceSeed = sequenceSeed;

  var orderedPieces = getSquarusSequencedPieces(squarusOrder, squarusSequenceSeed);
  var pieceCount = Math.max(1, Math.min(orderedPieces.length, parseBoundedInt(visual && visual.pieceCount, 1, orderedPieces.length || 1, 10)));
  squarusPieceCount = pieceCount;
  var pieces = orderedPieces.slice(0, pieceCount);
  var targets = buildSquarusTargets(pieces, squarusLayout).slice(0, pieceCount);

  squarusOrder = previousOrder;
  squarusLayout = previousLayout;
  squarusPieceCount = previousPieceCount;
  squarusSequenceSeed = previousSequenceSeed;
  squarusContactMode = previousContactMode;
  squarusAnimationMode = previousAnimationMode;

  var allPoints = [];
  for (var i = 0; i < pieceCount; i++) {
    var target = targets[i];
    var piece = pieces[i];
    allPoints.push({ x: target.x, y: target.y });
    for (var c = 0; c < piece.cells.length; c++) {
      var p1 = getAcknowledgmentsPieceWorldPoint(piece, target, piece.cells[c][0], piece.cells[c][1]);
      var p2 = getAcknowledgmentsPieceWorldPoint(piece, target, piece.cells[c][0] + 1, piece.cells[c][1] + 1);
      allPoints.push(p1);
      allPoints.push(p2);
    }
  }
  var mapPoint = buildAcknowledgmentsViewportMapper(allPoints);
  var palette = getAcknowledgmentsPaletteColors();
  var groups = [];

  for (var p = 0; p < pieceCount; p++) {
    var pieceMeta = pieces[p];
    var targetMeta = targets[p];
    var mappedTarget = mapPoint({ x: targetMeta.x, y: targetMeta.y });
    var targetScale = targetMeta.scale * mappedTarget.scale;
    var group = createSvgNode('g');
    group.setAttribute('opacity', '0.12');
    acknowledgmentsPattern.appendChild(group);

    for (var rc = 0; rc < pieceMeta.cells.length; rc++) {
      var rect = createSvgNode('rect');
      rect.setAttribute('x', String((pieceMeta.cells[rc][0] - pieceMeta.centroidX) * targetScale));
      rect.setAttribute('y', String((pieceMeta.cells[rc][1] - pieceMeta.centroidY) * targetScale));
      rect.setAttribute('width', String(targetScale));
      rect.setAttribute('height', String(targetScale));
      rect.setAttribute('fill', getAcknowledgmentsSoftenedColor(palette[p % palette.length], 0.52));
      rect.setAttribute('fill-opacity', '0.46');
      rect.setAttribute('stroke', '#6a7a90');
      rect.setAttribute('stroke-opacity', '0.44');
      rect.setAttribute('stroke-width', String(Math.max(0.55, targetScale * 0.045)));
      group.appendChild(rect);
    }

    var seedAngle = p * (Math.PI * (3 - Math.sqrt(5)));
    var scatterRadius = 130 * mappedTarget.scale;
    groups.push({
      group: group,
      targetX: mappedTarget.x,
      targetY: mappedTarget.y,
      targetR: (targetMeta.rotation * 180 / Math.PI),
      scatterX: (stageSize * 0.5) + Math.cos(seedAngle) * scatterRadius,
      scatterY: (stageSize * 0.5) + Math.sin(seedAngle) * scatterRadius,
      scatterR: (seedAngle * 180 / Math.PI) + 90
    });
  }

  var defaultBpm = DEFAULT_ANIMATION_BPM;
  var scale = defaultBpm / ACKNOWLEDGMENTS_BPM;
  var d = {
    scatter: 0.7 * scale,
    reveal: 0,
    travel: 2.0 * scale,
    snap: 0.5 * scale,
    fade: 0.5 * scale
  };
  var pieceMotion = d.scatter + d.reveal + d.travel + d.snap;
  var totalSeconds = pieceCount > 0 ? (pieceMotion * pieceCount + d.fade) : d.scatter;

  return {
    pieceCount: pieceCount,
    durationMs: Math.round(totalSeconds * 1000),
    render: function(progress) {
      var elapsedSeconds = clamp01(progress) * totalSeconds;
      for (var i = 0; i < groups.length; i++) {
        var localT = elapsedSeconds - (i * pieceMotion);
        var x = groups[i].scatterX;
        var y = groups[i].scatterY;
        var rot = groups[i].scatterR;
        var localOpacity = 0.16;

        if (localT > 0 && localT < d.scatter) {
          localOpacity = 0.28;
        } else if (localT >= d.scatter && localT < (d.scatter + d.reveal + d.travel)) {
          var travelP = easeInOutCubic(clamp01((localT - d.scatter - d.reveal) / Math.max(1e-4, d.travel)));
          x = groups[i].scatterX + (groups[i].targetX - groups[i].scatterX) * travelP;
          y = groups[i].scatterY + (groups[i].targetY - groups[i].scatterY) * travelP;
          rot = groups[i].scatterR + (groups[i].targetR - groups[i].scatterR) * travelP;
          localOpacity = 0.2 + 0.52 * travelP;
        } else if (localT >= (d.scatter + d.reveal + d.travel)) {
          x = groups[i].targetX;
          y = groups[i].targetY;
          rot = groups[i].targetR;
          localOpacity = 0.74;
        }

        groups[i].group.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + rot + ')');
        groups[i].group.setAttribute('opacity', String(localOpacity));
      }
    }
  };
}

function buildAcknowledgmentsStageAnimator(styleId, visual) {
  if (styleId === 'triangula') {
    return buildAcknowledgmentsTriangulaAnimator(visual);
  }
  if (styleId === 'squarus') {
    return buildAcknowledgmentsSquarusAnimator(visual);
  }
  return buildAcknowledgmentsStitchingAnimator(visual);
}

function playAcknowledgmentsStage(styleId, visual, lineText) {
  stopAcknowledgmentsStageAnimation();
  configureAcknowledgmentsPatternViewport();
  var animatorBundle = buildAcknowledgmentsStageAnimator(styleId, visual);
  var animator = (typeof animatorBundle === 'function') ? { render: animatorBundle } : animatorBundle;
  var start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var durationMs = getAcknowledgmentsLineDurationMs(styleId, visual, animator);
  acknowledgmentsViewerState.currentLineDurationMs = durationMs;

  function tick(nowMs) {
    var now = isFinite(nowMs) ? nowMs : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
    var progress = clamp01((now - start) / durationMs);
    if (animator && typeof animator.render === 'function') {
      animator.render(progress);
    }
    setAcknowledgmentsLineReveal(lineText, clamp01((progress - 0.06) / 0.9));
    if (progress >= 1) {
      setAcknowledgmentsLineReveal(lineText, 1);
      acknowledgmentsViewerState.rafId = null;
      return;
    }
    acknowledgmentsViewerState.rafId = requestAnimationFrame(tick);
  }

  acknowledgmentsViewerState.rafId = requestAnimationFrame(tick);
}

function renderAcknowledgmentsPattern(styleId, visual, lineText) {
  playAcknowledgmentsStage(styleId, visual, lineText);
}

function syncAcknowledgmentsControls(linesLength) {
  var total = Math.max(0, parseBoundedInt(linesLength, 0, 9999, 0));
  var index = Math.max(0, parseBoundedInt(acknowledgmentsViewerState.lineIndex, 0, Math.max(0, total - 1), 0));
  if (acknowledgmentsPrevBtn) {
    acknowledgmentsPrevBtn.disabled = index <= 0;
  }
  if (acknowledgmentsNextBtn) {
    acknowledgmentsNextBtn.disabled = index >= (total - 1);
  }
  if (acknowledgmentsAutoplayBtn) {
    acknowledgmentsAutoplayBtn.setAttribute('aria-pressed', acknowledgmentsViewerState.autoPlay ? 'true' : 'false');
    acknowledgmentsAutoplayBtn.textContent = acknowledgmentsViewerState.autoPlay ? 'Pause' : 'Auto play';
  }
}

function renderAcknowledgmentsLine(lines) {
  var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES;
  if (!safeLines.length) {
    safeLines = ['Acknowledgments unavailable.'];
  }
  acknowledgmentsViewerState.lineIndex = Math.max(0, Math.min(acknowledgmentsViewerState.lineIndex, safeLines.length - 1));
  var lineIndex = acknowledgmentsViewerState.lineIndex;
  var styleId = getAcknowledgmentsStyleForIndex(lineIndex);
  var visual = getAcknowledgmentsVisualForIndex(lineIndex, styleId);
  var activeLine = safeLines[lineIndex];

  if (acknowledgmentsLineText) {
    acknowledgmentsLineText.textContent = '';
  }
  if (acknowledgmentsProgress) {
    acknowledgmentsProgress.textContent = String(lineIndex + 1) + ' / ' + String(safeLines.length);
  }

  renderAcknowledgmentsPattern(styleId, visual, activeLine);
  syncAcknowledgmentsControls(safeLines.length);
}

function scheduleAcknowledgmentsAutoplayTick(lines) {
  stopAcknowledgmentsAutoplay();
  if (!acknowledgmentsViewerState.autoPlay) return;
  var safeLines = Array.isArray(lines) ? lines : [];
  if (!safeLines.length) return;
  if (acknowledgmentsViewerState.lineIndex >= safeLines.length - 1) {
    acknowledgmentsViewerState.autoPlay = false;
    syncAcknowledgmentsControls(safeLines.length);
    return;
  }

  var delayMs = Math.max(1200, parseBoundedInt(
    acknowledgmentsViewerState.currentLineDurationMs,
    1200,
    30000,
    ACKNOWLEDGMENTS_AUTOPLAY_DELAY_MS
  ));

  acknowledgmentsViewerState.timerId = window.setTimeout(function() {
    if (!acknowledgmentsModal || !acknowledgmentsModal.classList.contains('open')) return;
    if (!acknowledgmentsViewerState.autoPlay) return;
    acknowledgmentsViewerState.lineIndex = Math.min(acknowledgmentsViewerState.lineIndex + 1, safeLines.length - 1);
    renderAcknowledgmentsLine(safeLines);
    scheduleAcknowledgmentsAutoplayTick(safeLines);
  }, delayMs);
}

function openAcknowledgmentsViewer(options) {
  options = options || {};
  if (!acknowledgmentsModal) return;
  loadAcknowledgmentsLines().then(function(lines) {
    var safeLines = Array.isArray(lines) && lines.length ? lines : ACKNOWLEDGMENTS_FALLBACK_LINES.slice();
    acknowledgmentsViewerState.lineDurationsMsByIndex = buildAcknowledgmentsLineDurations(safeLines);
    acknowledgmentsViewerState.seriesLineDurationMs = getAcknowledgmentsSeriesLineDurationMs(safeLines.length);
    var requestedIndex = parseBoundedInt(options.lineIndex, 0, Math.max(0, safeLines.length - 1), 0);
    acknowledgmentsViewerState.lineIndex = requestedIndex;
    acknowledgmentsViewerState.autoPlay = (typeof options.autoPlay === 'boolean') ? options.autoPlay : true;
    stopAcknowledgmentsAutoplay();
    acknowledgmentsModal.classList.add('open');
    acknowledgmentsAudio.currentTime = 0;
    updateMusicPlaybackState();
    renderAcknowledgmentsLine(safeLines);
    scheduleAcknowledgmentsAutoplayTick(safeLines);
    if (acknowledgmentsCloseBtn) {
      acknowledgmentsCloseBtn.focus();
    }
  });
}

function closeAcknowledgmentsViewer() {
  if (!acknowledgmentsModal) return;
  stopAcknowledgmentsAutoplay();
  stopAcknowledgmentsStageAnimation();
  acknowledgmentsViewerState.autoPlay = false;
  acknowledgmentsViewerState.lineDurationsMsByIndex = [];
  acknowledgmentsViewerState.seriesLineDurationMs = 0;
  acknowledgmentsModal.classList.remove('open');
  updateMusicPlaybackState();
}

function triggerAcknowledgmentsViewerOpen(autoPlay) {
  syncExperienceInfoPanel(false);
  if (typeof autoPlay === 'boolean') {
    openAcknowledgmentsViewer({ lineIndex: 0, autoPlay: autoPlay });
    return;
  }
  openAcknowledgmentsViewer({ lineIndex: 0 });
}

function attachExperienceInfoAcknowledgmentsBridge() {
  if (!experienceInfoHtmlFrame) return;
  var frameDoc = null;
  try {
    frameDoc = experienceInfoHtmlFrame.contentDocument || (experienceInfoHtmlFrame.contentWindow && experienceInfoHtmlFrame.contentWindow.document) || null;
  } catch (error) {
    frameDoc = null;
  }
  if (!frameDoc || frameDoc.__ackBridgeAttached) return;

  frameDoc.addEventListener('click', function(event) {
    if (!event || !event.target || typeof event.target.closest !== 'function') return;
    var trigger = event.target.closest('[data-open-acknowledgments]');
    if (!trigger) return;
    event.preventDefault();
    triggerAcknowledgmentsViewerOpen();
  });
  frameDoc.__ackBridgeAttached = true;
}

async function runExportFromModalSelection() {
  var isTriangulaExport = currentExperienceId === 'triangula';
  var isSquarusExport = currentExperienceId === 'squarus';
  var isMashrabiyaExport = currentExperienceId === 'mashrabiya';
  var includeThreadsAllowed = !isTriangulaExport && !isSquarusExport && !isMashrabiyaExport;
  var baseName = ensureExportBaseNameHasExperiencePrefix(normalizeExportBaseName(exportNameInput.value));
  var options = {
    includeThreads: includeThreadsAllowed ? exportIncludeThreadsInput.checked : false,
    includeGuide: exportIncludeGuideInput.checked,
    includePreview: isTriangulaExport ? false : exportIncludePreviewInput.checked,
    mashrabiyaIncludeDebugLabels: !!(isMashrabiyaExport && mashrabiyaDebugLabelsEnabled && exportMashrabiyaDebugLabelsInput && exportMashrabiyaDebugLabelsInput.checked)
  };

  try {
    if (typeof JSZip === 'undefined') {
      // Fallback path if zip library fails to load.
      downloadCurrentDesignSvg(baseName, options);
      if (options.includeGuide) {
        downloadStitchingGuide(baseName, options);
      }
      if (options.includePreview) {
        downloadPreviewImage(baseName);
      }
    } else {
      await downloadExportZipBundle(baseName, options);
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  }

  closeExportOptionsModal();
}

async function runKidFriendlySaveSelection(mode) {
  var normalizedMode = mode === 'make' ? 'make' : 'image';
  var proposedName = normalizeExportBaseName(getTimestampLabel());
  var requestedName = window.prompt('What would you like to call it?', proposedName);
  if (requestedName === null) {
    return;
  }
  var baseName = ensureExportBaseNameHasExperiencePrefix(normalizeExportBaseName(requestedName));
  var options = {
    includeThreads: false,
    includeGuide: normalizedMode === 'make',
    includePreview: true,
    forceStitchingBorder: normalizedMode === 'make' && currentExperienceId === 'stitching',
    forceStitchingHoleNumbers: normalizedMode === 'make' && currentExperienceId === 'stitching'
  };

  try {
    if (normalizedMode === 'image') {
      downloadPreviewImage(baseName, { appendPreviewSuffix: false });
    } else if (typeof JSZip === 'undefined') {
      downloadCurrentDesignSvg(baseName, options);
      if (options.includeGuide) {
        downloadStitchingGuide(baseName, options);
      }
      if (options.includePreview) {
        downloadPreviewImage(baseName);
      }
    } else {
      await downloadExportZipBundle(baseName, options);
    }
  } catch (error) {
    console.error('Kid save failed:', error);
    alert('Save failed. Please try again.');
  }

  closeKidSaveModal();
}

function drawHoles() {
  var numbersVisible = shouldShowHoleNumbersNow();
  var holeCount = getCurrentStitchHoleCount();
  if (!isFinite(holeCount)) holeCount = DEFAULT_HOLES;
  var fontSize = getHoleNumberFontSize(holeCount);
  var holeFillColor = getThemeHoleFillColor();
  var holeLabelColor = getThemeHoleLabelColor();
  holeNumberLabelsByIndex = Object.create(null);
  highlightedHoleNumbers = [];

  function drawRingHoles(ringPoints, indexOffset, invertOutward, isInnerRing) {
    if (!ringPoints || !ringPoints.length) return;
    var ccw = signedAreaOfClosedPolyline(ringPoints) > 0;
    var ringBaseFontSize = isInnerRing ? Math.max(6, fontSize * 0.9) : fontSize;
    var ringLabels = [];
    var ringOutward = [];
    var maxExtent = 0;

    for (var i = 0; i < ringPoints.length; i++) {
      new Path.Circle(ringPoints[i], 3).fillColor = holeFillColor;
      if (!numbersVisible) continue;

      var outward = getOutwardDirectionAtHoleFromRing(ringPoints, i, ccw, invertOutward);
      ringOutward[i] = outward;

      var label = new PointText(ringPoints[i]);
      label.justification = 'center';
      label.fillColor = holeLabelColor;
      label.fontSize = ringBaseFontSize;
      label.fontWeight = 'normal';
      label.content = String(i + 1);
      ringLabels[i] = label;

      var extent = getBoundsExtentAlongDirection(label, outward);
      if (extent > maxExtent) {
        maxExtent = extent;
      }
    }

    if (!numbersVisible) return;

    var metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE, LABEL_HOLE_CLEARANCE);
    if (metrics.maxOffset < metrics.minOffset) {
      var availableBand = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + LABEL_BORDER_CLEARANCE) - (3 + LABEL_HOLE_CLEARANCE);
      var targetFont = Math.max(6, Math.min(ringBaseFontSize, availableBand * 1.6));
      if (targetFont < ringBaseFontSize) {
        ringBaseFontSize = targetFont;
        maxExtent = 0;
        for (var j = 0; j < ringLabels.length; j++) {
          if (!ringLabels[j]) continue;
          ringLabels[j].fontSize = ringBaseFontSize;
          var resizedExtent = getBoundsExtentAlongDirection(ringLabels[j], ringOutward[j]);
          if (resizedExtent > maxExtent) {
            maxExtent = resizedExtent;
          }
        }
        metrics = getHoleLabelOffsetFromExtent(maxExtent, LABEL_BORDER_CLEARANCE, LABEL_HOLE_CLEARANCE);
      }
    }

    var sharedOffset = metrics.offset;
    for (var k = 0; k < ringLabels.length; k++) {
      if (!ringLabels[k]) continue;
      ringLabels[k].position = ringPoints[k].add(ringOutward[k].multiply(sharedOffset));
      holeNumberLabelsByIndex[indexOffset + k] = ringLabels[k];
    }
  }

  drawRingHoles(outerFramePoints.length ? outerFramePoints : points, 0, false, false);
  if (nestedFrameEnabled && innerFramePoints.length) {
    drawRingHoles(innerFramePoints, getCurrentStitchHoleCount(), false, true);
  }
}

function bringHoleNumbersToFront() {
  if (!shouldShowHoleNumbersNow()) return;
  var children = project.activeLayer.children;
  var labels = [];
  for (var i = 0; i < children.length; i++) {
    if (children[i] instanceof PointText) {
      labels.push(children[i]);
    }
  }
  for (var j = 0; j < labels.length; j++) {
    labels[j].bringToFront();
  }
}

/* ------------------------------
   STATIC DRAW
------------------------------ */
function drawStatic() {
  if (currentExperienceId === 'triangula') {
    drawTriangulaStatic();
    return;
  }

  if (currentExperienceId === 'squarus') {
    drawSquarusStatic();
    return;
  }

  if (currentExperienceId === 'mashrabiya') {
    drawMashrabiyaStatic();
    return;
  }

  project.activeLayer.removeChildren();
  computePoints();

  // Border is a style-only layer for Stitching mode and should sit behind holes/threads.
  drawShapeBorder();

  // Draw holes
  drawHoles();

  // Draw threads
  for (var i = 0; i < threads.length; i++) {
    drawThread(threads[i]);
  }

  clearHighlightedHoleNumbers();
  bringHoleNumbersToFront();
}

/* ------------------------------
   ANIMATION
------------------------------ */
function runAnimationFrameTick(event) {
  if (!animationActive) return;

  if (!animationState || !animationState.segmentLists.length) {
    animationActive = false;
    view.onFrame = null;
    animationState = null;
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    clearHighlightedHoleNumbers();
    updateMusicPlaybackState();
    scheduleUrlStateSync(false);
    drawStatic();
    return;
  }

  // Clamp long frame gaps so a resumed tab or hitch cannot skip ahead visibly.
  var frameDelta = Math.min(event.delta, 0.1);
  animationState.elapsed += frameDelta;

  if (animationState.settle) {
    animationState.settle.remaining = Math.max(0, animationState.settle.remaining - frameDelta);
    if (animationState.settle.remaining <= 0) {
      animationState.settle = null;
    }
  }

  var secondsPerSegment = getAnimationSecondsPerSegment();

  while (animationState.elapsed >= secondsPerSegment && animationActive) {
    animationState.elapsed -= secondsPerSegment;

    var threadIndex = animationState.threadIndex;
    if (threadIndex < 0 || threadIndex >= threads.length) {
      animationActive = false;
      animationState = null;
      animationPlaybackState = 'idle';
      view.onFrame = null;
      syncAnimateButtonLabel();
      clearHighlightedHoleNumbers();
      updateMusicPlaybackState();
      scheduleUrlStateSync(false);
      drawStatic();
      return;
    }

    var segments = animationState.segmentLists[threadIndex] || [];

    if (animationState.step < segments.length) {
      animationState.settle = {
        threadIndex: threadIndex,
        segmentIndex: animationState.step,
        segments: segments,
        duration: STITCH_PULL_SETTLE_SECONDS,
        remaining: STITCH_PULL_SETTLE_SECONDS
      };
      animationState.step++;
    } else {
      animationState.threadIndex++;
      if (animationState.threadIndex >= threads.length) {
        animationActive = false;
        animationState = null;
        animationPlaybackState = 'idle';
        view.onFrame = null;
        syncAnimateButtonLabel();
        clearHighlightedHoleNumbers();
        updateMusicPlaybackState();
        scheduleUrlStateSync(false);
        drawStatic();
        return;
      }
      animationState.step = 0;
    }
  }

  renderAnimationFrame();
}

function startAnimationLoop() {
  view.onFrame = runAnimationFrameTick;
}

function animateStitch() {
  if (currentExperienceId === 'triangula') {
    animateTriangula();
    return;
  }
  if (currentExperienceId === 'squarus') {
    animateSquarus();
    return;
  }
  if (currentExperienceId === 'mashrabiya') {
    animateMashrabiya();
    return;
  }

  // Always treat this as a fresh run, even if a prior animation is active.
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  squarusAnimationState = null;
  mashrabiyaAnimationState = null;
  clearHighlightedHoleNumbers();

  project.activeLayer.removeChildren();
  computePoints();

  animationState = {
    threadIndex: 0,
    step: 0,
    elapsed: 0,
    activeHolePair: null,
    settle: null,
    segmentLists: threads.map(function(thread) {
      return computeSegments(thread);
    })
  };
  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderAnimationFrame();
  startAnimationLoop();
}

function resumeAnimationIfPaused() {
  if (animationActive) return;
  if (!animationState && !triangulaAnimationState && !squarusAnimationState && !mashrabiyaAnimationState) {
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    animateStitch();
    return;
  }
  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  if (triangulaAnimationState) {
    view.onFrame = runTriangulaAnimationFrame;
    return;
  }
  if (squarusAnimationState) {
    view.onFrame = runSquarusAnimationFrame;
    return;
  }
  if (mashrabiyaAnimationState) {
    view.onFrame = runMashrabiyaAnimationFrame;
    return;
  }
  startAnimationLoop();
}

function toggleAnimationPlayback() {
  if (animationPlaybackState === 'playing') {
    pauseAnimationIfActive();
    return;
  }
  if (animationPlaybackState === 'paused') {
    resumeAnimationIfPaused();
    return;
  }
  animateStitch();
}

joyAudio.addEventListener('ended', function() {
  if (!shouldMusicBePlaying()) return;
  joyAudio.currentTime = 0;
  playMusicFromCurrentState();
});

/* ------------------------------
   THREAD UI
------------------------------ */
function renderThreadControls() {
  var container = document.getElementById('thread-controls');
  container.innerHTML = '';
  var holeCount = getCurrentStitchHoleCount();

  if (!threads.length) {
    selectedThreadIndex = -1;
    refreshKidThreadPicker();
    return;
  }
  if (selectedThreadIndex < 0 || selectedThreadIndex >= threads.length) {
    selectedThreadIndex = 0;
  }

  threads.forEach((thread, index) => {
    ensureThreadConnectConfig(thread);
    thread.frameMode = sanitizeThreadFrameMode(thread.frameMode, 'outer');
    if (thread.frameMode === 'bridge') {
      thread.frameMode = 'bridge-reverse-project';
    }
    if (thread.color === 'rainbow') {
      thread.solidColor = sanitizeThreadSolidColor(thread.solidColor, '#1982c4');
    } else {
      thread.solidColor = sanitizeThreadSolidColor(thread.color, thread.solidColor || '#1982c4');
    }
    var sourceHoleCount = getThreadSourceHoleCount(thread);
    var jumpLimit = Math.max(1, sourceHoleCount - 1);
    normalizeThreadHoleDependentValues(thread, sourceHoleCount);

    var threadColorInputValue = thread.color === 'rainbow'
      ? sanitizeThreadSolidColor(thread.solidColor, '#1982c4')
      : sanitizeThreadSolidColor(thread.color, '#1982c4');

    var div = document.createElement('div');
    div.className = 'thread-card' + (index === selectedThreadIndex ? ' selected' : '');

    var isFixedMode = thread.jumpMode === 'fixed';
    var isFormulaMode = isExpressionStitchModeEnabled() && thread.jumpMode === 'formula';
    var isSequenceMode = thread.jumpMode === 'sequence';
    var isConnectMode = thread.jumpMode === 'connect';
    var sequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    var isHoleListMode = isThreadHoleListMode(thread);

    div.innerHTML = `
      <strong>Thread ${index + 1}</strong><br>
      Color: <input type="color" value="${threadColorInputValue}" id="color-${index}"><br>
      ${nestedFrameEnabled ? `
      Frame:
      <select id="frame-mode-${index}">
        <option value="outer" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'outer' ? 'selected' : ''}>Outer</option>
        <option value="inner" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'inner' ? 'selected' : ''}>Inner</option>
        <option value="bridge-reverse" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'bridge-reverse' ? 'selected' : ''}>Inner -&gt; Outer (Bridge)</option>
        <option value="bridge-reverse-project" ${sanitizeThreadFrameMode(thread.frameMode, 'outer') === 'bridge-reverse-project' ? 'selected' : ''}>Inner -&gt; Outer (Projected)</option>
      </select><br>
      ` : ''}
      Stitch by:
      <select id="jump-mode-${index}">
        <option value="fixed" ${thread.jumpMode === 'fixed' ? 'selected' : ''}>Addition</option>
        <option value="connect" ${thread.jumpMode === 'connect' ? 'selected' : ''}>Multiplication</option>
        <option value="sequence" ${thread.jumpMode === 'sequence' ? 'selected' : ''}>List</option>
        ${isExpressionStitchModeEnabled() ? `<option value="formula" ${thread.jumpMode === 'formula' ? 'selected' : ''}>Expression</option>` : ''}
      </select><br>
      ${isFixedMode ? `
      Add by: <input class="advanced-inline-number" type="number" min="1" max="${jumpLimit}" value="${thread.jump}" id="jump-number-${index}" aria-label="Thread ${index + 1} add value"><br>
      ` : ''}
      ${isFormulaMode ? `
      Base add: <input class="advanced-inline-number" type="number" min="1" max="${jumpLimit}" value="${thread.jump}" id="jump-number-${index}" aria-label="Thread ${index + 1} base add value"><br>
      Step expression: <input type="text" value="${thread.jumpFormula || 'skip'}" id="jump-formula-${index}" placeholder="e.g. (skip + i) mod n"><br>
      <div class="jump-help">Use + - * /, ^ for powers, and mod for modulo.</div>
      <div class="jump-help">Vars: i (step), n (holes), current, prev, skip</div>
      <div class="jump-preset-row">
        <select id="jump-preset-${index}">
          <option value="">Preset formulas...</option>
          <option value="(skip + i) mod n">Growing spiral ((skip + i) mod n)</option>
          <option value="skip + (i mod 5)">Wobble (skip + (i mod 5))</option>
          <option value="skip × ((i mod 3) + 1)">Pulse (skip × ((i mod 3) + 1))</option>
          <option value="(current mod 7) + skip">Current-based ((current mod 7) + skip)</option>
        </select>
        <button type="button" id="use-preset-${index}">Use</button>
      </div>
      ` : ''}
      ${isSequenceMode ? `
      List type:
      <select id="jump-sequence-mode-${index}">
        <option value="holes" ${sequenceMode === 'holes' ? 'selected' : ''}>Holes</option>
        <option value="steps" ${sequenceMode === 'steps' ? 'selected' : ''}>Steps</option>
      </select><br>
      List: <input type="text" value="${thread.jumpSequence || ''}" id="jump-sequence-${index}" placeholder="${sequenceMode === 'steps' ? 'e.g. 2,3,5,8' : 'e.g. 1,1,2,3,5,8'}"><br>
      <div class="jump-help">Hole sequence: 1,1,2,3... stitches each listed pair in order.</div>
      <div class="jump-help">Hole sequence stops at the first value above the current hole count.</div>
      <div class="jump-help">Interval sequence: values are repeated jumps from each current hole.</div>
      ` : ''}
      ${!isHoleListMode ? `Start hole: <input class="advanced-inline-number" type="number" min="1" max="${sourceHoleCount}" value="${thread.startHole}" id="start-hole-number-${index}" aria-label="Thread ${index + 1} start hole"><br>` : ''}
      ${isConnectMode ? `
      Multiply by: <input class="advanced-inline-number" type="number" min="1" max="12" value="${thread.connectMultiplier}" id="connect-m-number-${index}" aria-label="Thread ${index + 1} multiply value"><br>
      <div class="jump-help">Begin at Start hole and count forward as i = 1..n, then connect to ((start + multiplier × i - 2) mod n) + 1.</div>
      ` : ''}
      Size: <input class="advanced-inline-number" type="number" min="1" max="10" value="${thread.width}" id="width-number-${index}" aria-label="Thread ${index + 1} size value"><br>
      Rainbow: <input type="checkbox" id="rainbow-${index}" ${thread.color === 'rainbow' ? 'checked' : ''}><br>
      <button id="delete-${index}">Delete</button>
    `;

    container.appendChild(div);

    div.addEventListener('click', (event) => {
      if (event.target.closest('input, select, button')) return;
      selectedThreadIndex = index;
      renderThreadControls();
      syncKidControlsFromSelectedThread();
    });

    document.getElementById(`color-${index}`).addEventListener('input', e => {
      thread.color = e.target.value;
      thread.solidColor = sanitizeThreadSolidColor(e.target.value, thread.solidColor || '#1982c4');
      syncKidControlsFromSelectedThread();
      redrawAnimationInPlace();
    });

    var skipNumberInput = document.getElementById(`jump-number-${index}`);
    if (skipNumberInput) {
      skipNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.jump = parseBoundedInt(e.target.value, 1, jumpLimit, thread.jump || 1);
        e.target.value = String(thread.jump);
        if (index === getKidTargetThreadIndex()) {
          jumpSlider.value = thread.jump;
          updateKidControlValues();
        }
        redrawForPathChange();
      });
      skipNumberInput.addEventListener('change', e => {
        thread.jump = parseBoundedInt(e.target.value, 1, jumpLimit, thread.jump || 1);
        e.target.value = String(thread.jump);
      });
    }

    var startHoleNumberInput = document.getElementById(`start-hole-number-${index}`);
    if (startHoleNumberInput) {
      startHoleNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        var localSourceCount = getThreadSourceHoleCount(thread);
        thread.startHole = parseBoundedInt(e.target.value, 1, localSourceCount, thread.startHole || 1);
        e.target.value = String(thread.startHole);
        redrawForPathChange();
      });
      startHoleNumberInput.addEventListener('change', e => {
        var localSourceCount = getThreadSourceHoleCount(thread);
        thread.startHole = parseBoundedInt(e.target.value, 1, localSourceCount, thread.startHole || 1);
        e.target.value = String(thread.startHole);
      });
    }

    document.getElementById(`jump-mode-${index}`).addEventListener('change', e => {
      var nextMode = e.target.value;
      if (nextMode === 'formula' && !isExpressionStitchModeEnabled()) {
        nextMode = 'fixed';
      }
      thread.jumpMode = nextMode;
      if (thread.jumpMode === 'sequence') {
        thread.jumpSequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
        if (!thread.jumpSequence) {
          thread.jumpSequence = thread.jumpSequenceMode === 'steps' ? '2,3,5,8' : '1,1,2,3,5,8';
        }
      }
      renderThreadControls();
      syncKidControlsFromSelectedThread();
      redrawForPathChange();
    });

    var frameModeInput = document.getElementById(`frame-mode-${index}`);
    if (frameModeInput) {
      frameModeInput.addEventListener('change', e => {
        thread.frameMode = sanitizeThreadFrameMode(e.target.value, thread.frameMode || 'outer');
        redrawForPathChange();
      });
    }

    var formulaInput = document.getElementById(`jump-formula-${index}`);
    if (formulaInput) {
      formulaInput.addEventListener('input', e => {
        thread.jumpFormula = e.target.value;
        if (isExpressionStitchModeEnabled() && thread.jumpMode === 'formula') {
          redrawForPathChange();
        }
      });
    }

    var usePresetBtn = document.getElementById(`use-preset-${index}`);
    if (usePresetBtn) {
      usePresetBtn.addEventListener('click', () => {
        if (!isExpressionStitchModeEnabled()) return;
        var preset = document.getElementById(`jump-preset-${index}`).value;
        if (!preset) return;
        thread.jumpFormula = preset;
        thread.jumpMode = 'formula';
        renderThreadControls();
        redrawForPathChange();
      });
    }

    var sequenceInput = document.getElementById(`jump-sequence-${index}`);
    if (sequenceInput) {
      sequenceInput.addEventListener('input', e => {
        thread.jumpSequence = e.target.value;
        if (thread.jumpMode === 'sequence') {
          redrawForPathChange();
        }
      });
    }

    var sequenceModeInput = document.getElementById(`jump-sequence-mode-${index}`);
    if (sequenceModeInput) {
      sequenceModeInput.addEventListener('change', e => {
        thread.jumpSequenceMode = sanitizeThreadSequenceMode(e.target.value, 'holes');
        renderThreadControls();
        syncKidControlsFromSelectedThread();
        redrawForPathChange();
      });
    }

    var connectMultiplierNumberInput = document.getElementById(`connect-m-number-${index}`);
    if (connectMultiplierNumberInput) {
      connectMultiplierNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.connectMultiplier = parseBoundedInt(e.target.value, 1, 12, thread.connectMultiplier || 1);
        e.target.value = String(thread.connectMultiplier);
        if (index === getKidTargetThreadIndex()) {
          syncKidControlsFromSelectedThread();
        }
        redrawForPathChange();
      });
      connectMultiplierNumberInput.addEventListener('change', e => {
        thread.connectMultiplier = parseBoundedInt(e.target.value, 1, 12, thread.connectMultiplier || 1);
        e.target.value = String(thread.connectMultiplier);
      });
    }

    var widthNumberInput = document.getElementById(`width-number-${index}`);
    if (widthNumberInput) {
      widthNumberInput.addEventListener('input', e => {
        if (e.target.value === '') return;
        thread.width = parseBoundedInt(e.target.value, 1, 10, thread.width || 1);
        e.target.value = String(thread.width);
        if (index === getKidTargetThreadIndex()) {
          widthSlider.value = thread.width;
          updateKidControlValues();
        }
        redrawAnimationInPlace();
      });
      widthNumberInput.addEventListener('change', e => {
        thread.width = parseBoundedInt(e.target.value, 1, 10, thread.width || 1);
        e.target.value = String(thread.width);
      });
    }

    document.getElementById(`rainbow-${index}`).addEventListener('change', e => {
      if (e.target.checked) {
        if (thread.color !== 'rainbow') {
          thread.solidColor = sanitizeThreadSolidColor(thread.color, thread.solidColor || '#1982c4');
        }
        thread.color = 'rainbow';
      } else {
        thread.color = sanitizeThreadSolidColor(thread.solidColor, '#1982c4');
      }
      syncKidControlsFromSelectedThread();
      redrawAnimationInPlace();
    });

    document.getElementById(`delete-${index}`).addEventListener('click', () => {
      threads.splice(index, 1);
      if (!threads.length) {
        selectedThreadIndex = -1;
      } else if (selectedThreadIndex >= threads.length) {
        selectedThreadIndex = threads.length - 1;
      }
      renderThreadControls();
      syncKidControlsFromSelectedThread();
      redrawForPathChange();
    });
  });

  syncKidControlsFromSelectedThread();
}

/* ------------------------------
   EVENT LISTENERS
------------------------------ */
document.addEventListener('pointerdown', function(event) {
  var slider = event.target && event.target.closest ? event.target.closest('input[type="range"]') : null;
  if (!slider) return;
  markSliderAsMoving(slider);
  updateMusicPlaybackState();
});

document.addEventListener('input', function(event) {
  var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
  if (!slider) return;
  markSliderAsMoving(slider);
  updateMusicPlaybackState();
});

document.addEventListener('keyup', function(event) {
  var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
  if (!slider) return;
  settleSliderMotion(slider);
});

document.addEventListener('pointerup', settleAllSliderMotion);
document.addEventListener('mouseup', settleAllSliderMotion);
document.addEventListener('touchend', settleAllSliderMotion, { passive: true });
document.addEventListener('touchcancel', settleAllSliderMotion, { passive: true });
document.addEventListener('pointercancel', settleAllSliderMotion);
document.addEventListener('blur', function(event) {
  var slider = event.target && event.target.matches && event.target.matches('input[type="range"]') ? event.target : null;
  if (!slider) return;
  settleSliderMotion(slider);
}, true);

function handleHolesSliderChange() {
  syncJumpBoundsFromHoleCount();
  renderThreadControls();
  updateKidControlValues();
  // Hole count changes point geometry and stitch path.
  redrawForPathChange();
}

function handleAdvancedHolesNumberInput() {
  if (!advancedHolesNumberInput) return;
  if (advancedHolesNumberInput.value === '') return;
  var holeCount = parseInt(advancedHolesNumberInput.value, 10);
  if (!isFinite(holeCount)) return;
  if (holeCount < 3 || holeCount > MAX_HOLES) return;
  holesSlider.value = String(holeCount);
  handleHolesSliderChange();
}

function handleAdvancedHolesNumberCommit() {
  if (!advancedHolesNumberInput) return;
  if (advancedHolesNumberInput.value === '') {
    advancedHolesNumberInput.value = String(getCurrentStitchHoleCount());
    return;
  }
  var holeCount = parseBoundedInt(advancedHolesNumberInput.value, 3, MAX_HOLES, getCurrentStitchHoleCount());
  advancedHolesNumberInput.value = String(holeCount);
  holesSlider.value = String(holeCount);
  handleHolesSliderChange();
}

holesSlider.addEventListener('input', handleHolesSliderChange);
holesSlider.addEventListener('change', handleHolesSliderChange);
if (advancedHolesNumberInput) {
  advancedHolesNumberInput.addEventListener('input', handleAdvancedHolesNumberInput);
  advancedHolesNumberInput.addEventListener('change', handleAdvancedHolesNumberCommit);
  advancedHolesNumberInput.addEventListener('blur', handleAdvancedHolesNumberCommit);
}
if (nestedFrameEnabledInput) {
  nestedFrameEnabledInput.addEventListener('change', function() {
    nestedFrameEnabled = !!nestedFrameEnabledInput.checked;
    syncNestedFrameControls();
    renderThreadControls();
    redrawForPathChange();
  });
}
if (nestedFrameRatioSelect) {
  nestedFrameRatioSelect.addEventListener('change', function() {
    nestedFrameRatio = sanitizeNestedFrameRatio(nestedFrameRatioSelect.value, nestedFrameRatio);
    syncNestedFrameControls();
    redrawForPathChange();
  });
}
advancedHoleNumbersToggle.addEventListener('change', () => {
  showHoleNumbers = advancedHoleNumbersToggle.checked;
  syncHoleNumberToggles();
  // Labels only; keep animation continuity.
  redrawAnimationInPlace();
});
advancedBorderEnabledInput.addEventListener('change', () => {
  borderEnabled = advancedBorderEnabledInput.checked;
  syncBorderControls();
  // Border is style-only and should not reset animation progress.
  redrawAnimationInPlace();
});
kidStitchBySelect.addEventListener('change', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0 || !threads[targetIndex]) return;

  var thread = threads[targetIndex];
  var choice = kidStitchBySelect.value;

  if (choice === 'multiply') {
    thread.jumpMode = 'connect';
    thread.connectMultiplier = parseBoundedInt(thread.connectMultiplier, 1, 12, 2);
  } else if (choice === 'sequence') {
    thread.jumpMode = 'sequence';
    thread.jumpSequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    thread.jumpSequence = String(thread.jumpSequence || (thread.jumpSequenceMode === 'steps' ? '2,3,5,8' : '1,1,2,3,5,8'));
  } else if (choice === 'formula' && isExpressionStitchModeEnabled()) {
    thread.jumpMode = 'formula';
    thread.jumpFormula = String(thread.jumpFormula || 'skip');
  } else if (choice === 'add') {
    if (thread.jumpMode === 'connect' || thread.jumpMode === 'sequence' || thread.jumpMode === 'formula') {
      thread.jumpMode = 'fixed';
    }
  }

  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});

if (kidJumpSequenceInput) {
  kidJumpSequenceInput.addEventListener('input', () => {
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    var thread = threads[targetIndex];
    thread.jumpMode = 'sequence';
    thread.jumpSequenceMode = sanitizeThreadSequenceMode(thread.jumpSequenceMode, 'holes');
    thread.jumpSequence = kidJumpSequenceInput.value;
    kidStitchBySelect.value = 'sequence';
    syncBasicMathSliderVisibility();
    renderThreadControls();
    redrawForPathChange();
  });
}

if (kidSequenceModeSelect) {
  kidSequenceModeSelect.addEventListener('change', () => {
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    var thread = threads[targetIndex];
    thread.jumpMode = 'sequence';
    thread.jumpSequenceMode = sanitizeThreadSequenceMode(kidSequenceModeSelect.value, 'holes');
    if (kidJumpSequenceInput) {
      kidJumpSequenceInput.placeholder = thread.jumpSequenceMode === 'steps'
        ? 'e.g. 2,3,5,8'
        : 'e.g. 1,1,2,3,5,8';
    }
    kidStitchBySelect.value = 'sequence';
    syncBasicMathSliderVisibility();
    renderThreadControls();
    redrawForPathChange();
  });
}

if (kidJumpFormulaInput) {
  kidJumpFormulaInput.addEventListener('input', () => {
    if (!isExpressionStitchModeEnabled()) return;
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    var thread = threads[targetIndex];
    thread.jumpMode = 'formula';
    thread.jumpFormula = kidJumpFormulaInput.value;
    kidStitchBySelect.value = 'formula';
    syncBasicMathSliderVisibility();
    renderThreadControls();
    redrawForPathChange();
  });
}

function syncExpressionStitchModeOptionVisibility() {
  if (!kidStitchBySelect) return;

  var expressionOption = kidStitchBySelect.querySelector('option[value="formula"]');
  if (isExpressionStitchModeEnabled()) {
    if (!expressionOption) {
      expressionOption = document.createElement('option');
      expressionOption.value = 'formula';
      expressionOption.textContent = 'Expression';
      kidStitchBySelect.appendChild(expressionOption);
    }
    return;
  }

  if (expressionOption) {
    expressionOption.remove();
  }

  if (kidStitchBySelect.value === 'formula') {
    kidStitchBySelect.value = 'add';
  }
}

syncExpressionStitchModeOptionVisibility();
jumpSlider.addEventListener('input', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0) return;
  if (threads[targetIndex].jumpMode === 'connect') return;
  var jumpLimit = getCurrentJumpLimit();
  updateKidControlValues();
  threads[targetIndex].jump = parseBoundedInt(jumpSlider.value, 1, jumpLimit, threads[targetIndex].jump || 1);
  jumpSlider.value = String(threads[targetIndex].jump);
  renderThreadControls();
  redrawForPathChange();
});

if (startHoleInput) {
  function handleStartHoleInputChange() {
    var targetIndex = getKidTargetThreadIndex();
    if (targetIndex < 0 || !threads[targetIndex]) return;
    if (startHoleInput.value === '') return;
    var holeCount = getCurrentStitchHoleCount();
    threads[targetIndex].startHole = parseBoundedInt(startHoleInput.value, 1, holeCount, threads[targetIndex].startHole || 1);
    startHoleInput.value = String(threads[targetIndex].startHole);
    updateKidControlValues();
    renderThreadControls();
    redrawForPathChange();
  }

  function settleStartHolePlaybackMotion() {
    settleSliderMotion(startHoleInput);
  }

  function beginStartHolePlaybackMotion() {
    markSliderAsMoving(startHoleInput);
    updateMusicPlaybackState();
  }

  startHoleInput.addEventListener('pointerdown', beginStartHolePlaybackMotion);
  startHoleInput.addEventListener('input', function() {
    beginStartHolePlaybackMotion();
    handleStartHoleInputChange();
  });
  startHoleInput.addEventListener('change', function() {
    beginStartHolePlaybackMotion();
    handleStartHoleInputChange();
    settleStartHolePlaybackMotion();
  });
  startHoleInput.addEventListener('blur', settleStartHolePlaybackMotion);
}
multiplySlider.addEventListener('input', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0 || !threads[targetIndex]) return;
  ensureThreadConnectConfig(threads[targetIndex]);
  threads[targetIndex].jumpMode = 'connect';
  threads[targetIndex].connectMultiplier = parseInt(multiplySlider.value, 10);
  updateKidControlValues();
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});
widthSlider.addEventListener('input', () => {
  var targetIndex = getKidTargetThreadIndex();
  if (targetIndex < 0) return;
  updateKidControlValues();
  threads[targetIndex].width = parseInt(widthSlider.value, 10);
  renderThreadControls();
  // Stroke width is style-only for the already-determined route.
  redrawAnimationInPlace();
});

animateBtn.addEventListener('click', toggleAnimationPlayback);

discoveryToggleBtn.addEventListener('click', () => {
  discoveryPanel.classList.toggle('open');
  if (discoveryPanel.classList.contains('open')) {
    hasUnseenDiscoveries = false;
  }
  syncDiscoveryToggleButton();
});

closeDiscoveryBtn.addEventListener('click', () => {
  discoveryPanel.classList.remove('open');
  syncDiscoveryToggleButton();
});

if (discoveryPassphraseForm) {
  discoveryPassphraseForm.addEventListener('submit', function(event) {
    event.preventDefault();
    submitDiscoveryPassphraseEntry();
  });
}

gearBtn.addEventListener('click', () => {
  advancedPanel.classList.toggle('open');
  syncAdvancedToggleButton();
});

closeAdvancedBtn.addEventListener('click', () => {
  advancedPanel.classList.remove('open');
  syncAdvancedToggleButton();
});

if (backToStitchingBtn) {
  backToStitchingBtn.addEventListener('click', () => {
    var startPoint = getElementCenterPoint(backToStitchingBtn);
    var endPoint = getElementCenterPoint(experienceInline) || getElementCenterPoint(canvasStage);
    animateReturnToStitchingTrail(startPoint, endPoint);

    window.setTimeout(function() {
      setCurrentExperience('stitching');
      redrawForPathChange();
      discoveryPanel.classList.remove('open');
      syncDiscoveryToggleButton();
    }, 110);
  });
}

document.querySelectorAll('.color-dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    if (!threads.length) return;
    if (dot.id === 'palette-custom-color-btn') return;
    applyExperiencePaletteColorChoice(dot.getAttribute('data-color') || '#1982c4');
    renderThreadControls();
    redrawAnimationInPlace();
  });
});

if (paletteCustomColorBtn && paletteCustomColorInput) {
  function syncPaletteCustomInputFromActiveColor() {
    if (!threads.length) return;
    var initialColor = getActiveTrailColor();
    if (initialColor && initialColor !== 'rainbow') {
      paletteCustomColorInput.value = sanitizeThreadSolidColor(initialColor, paletteCustomColorInput.value || '#1982c4');
    }
  }

  paletteCustomColorBtn.addEventListener('pointerdown', syncPaletteCustomInputFromActiveColor);
  paletteCustomColorBtn.addEventListener('touchstart', syncPaletteCustomInputFromActiveColor, { passive: true });
  paletteCustomColorBtn.addEventListener('mousedown', syncPaletteCustomInputFromActiveColor);

  paletteCustomColorInput.addEventListener('input', (event) => {
    if (!threads.length) return;
    var chosenColor = sanitizeThreadSolidColor(event.target.value, '#1982c4');
    applyExperiencePaletteColorChoice(chosenColor);
    renderThreadControls();
    redrawAnimationInPlace();
  });
}

document.querySelectorAll('.shape-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setCurrentShape(btn.getAttribute('data-shape') || 'circle');
  });
});

advancedShapeSelect.addEventListener('change', () => {
  setCurrentShape(advancedShapeSelect.value || 'circle');
});

advancedTempoInput.addEventListener('change', () => {
  applyTempoValue(advancedTempoInput.value);
});

resetTempoBtn.addEventListener('click', () => {
  applyDefaultTempo();
});

kidTempoSlowBtn.addEventListener('click', () => {
  var presets = getKidTempoPresetsForSong(currentSongId);
  applyTempoValue(presets.slow);
});

kidTempoNormalBtn.addEventListener('click', () => {
  var presets = getKidTempoPresetsForSong(currentSongId);
  applyTempoValue(presets.normal);
});

kidTempoFastBtn.addEventListener('click', () => {
  var presets = getKidTempoPresetsForSong(currentSongId);
  applyTempoValue(presets.fast);
});

exportSvgBtn.addEventListener('click', () => {
  openExportOptionsModal();
});

exportConfirmBtn.addEventListener('click', () => {
  runExportFromModalSelection();
});

exportCancelBtn.addEventListener('click', () => {
  closeExportOptionsModal();
});

exportOptionsModal.addEventListener('click', (event) => {
  if (event.target === exportOptionsModal) {
    closeExportOptionsModal();
  }
});

if (kidSaveToggleBtn) {
  kidSaveToggleBtn.addEventListener('click', () => {
    if (kidSaveModal && kidSaveModal.classList.contains('open')) {
      closeKidSaveModal();
      return;
    }
    openKidSaveModal();
  });
}

if (kidSaveCancelBtn) {
  kidSaveCancelBtn.addEventListener('click', () => {
    closeKidSaveModal();
  });
}

if (kidSaveImageOptionBtn) {
  kidSaveImageOptionBtn.addEventListener('click', () => {
    runKidFriendlySaveSelection('image');
  });
}

if (kidSaveMakeOptionBtn) {
  kidSaveMakeOptionBtn.addEventListener('click', () => {
    runKidFriendlySaveSelection('make');
  });
}

if (kidSaveModal) {
  kidSaveModal.addEventListener('click', (event) => {
    if (event.target === kidSaveModal) {
      closeKidSaveModal();
    }
  });
}

if (experienceAcknowledgmentsToggle) {
  experienceAcknowledgmentsToggle.addEventListener('click', () => {
    triggerAcknowledgmentsViewerOpen();
  });
}

if (acknowledgmentsCloseBtn) {
  acknowledgmentsCloseBtn.addEventListener('click', () => {
    closeAcknowledgmentsViewer();
    if (experienceAcknowledgmentsToggle) {
      experienceAcknowledgmentsToggle.focus();
    }
  });
}

if (acknowledgmentsModal) {
  acknowledgmentsModal.addEventListener('click', (event) => {
    if (event.target === acknowledgmentsModal) {
      closeAcknowledgmentsViewer();
    }
  });
}

if (acknowledgmentsPrevBtn) {
  acknowledgmentsPrevBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    if (!lines.length) return;
    acknowledgmentsViewerState.lineIndex = Math.max(0, acknowledgmentsViewerState.lineIndex - 1);
    renderAcknowledgmentsLine(lines);
    if (acknowledgmentsViewerState.autoPlay) {
      scheduleAcknowledgmentsAutoplayTick(lines);
    }
  });
}

if (acknowledgmentsNextBtn) {
  acknowledgmentsNextBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    if (!lines.length) return;
    acknowledgmentsViewerState.lineIndex = Math.min(lines.length - 1, acknowledgmentsViewerState.lineIndex + 1);
    renderAcknowledgmentsLine(lines);
    if (acknowledgmentsViewerState.autoPlay) {
      scheduleAcknowledgmentsAutoplayTick(lines);
    }
  });
}

if (acknowledgmentsRestartBtn) {
  acknowledgmentsRestartBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    acknowledgmentsViewerState.lineIndex = 0;
    renderAcknowledgmentsLine(lines);
    if (acknowledgmentsViewerState.autoPlay) {
      scheduleAcknowledgmentsAutoplayTick(lines);
    }
  });
}

if (acknowledgmentsAutoplayBtn) {
  acknowledgmentsAutoplayBtn.addEventListener('click', () => {
    var lines = acknowledgmentsLinesCache && acknowledgmentsLinesCache.length
      ? acknowledgmentsLinesCache
      : ACKNOWLEDGMENTS_FALLBACK_LINES;
    acknowledgmentsViewerState.autoPlay = !acknowledgmentsViewerState.autoPlay;
    syncAcknowledgmentsControls(lines.length);
    scheduleAcknowledgmentsAutoplayTick(lines);
  });
}

window.addEventListener('message', function(event) {
  if (!event || !event.data) return;
  if (event.source && experienceInfoHtmlFrame && event.source !== experienceInfoHtmlFrame.contentWindow) {
    return;
  }
  var data = event.data;
  if (typeof data === 'string') {
    if (data === 'stitchlab-open-acknowledgments') {
      triggerAcknowledgmentsViewerOpen();
    }
    return;
  }
  if (typeof data !== 'object' || data === null) return;

  if (data.type === 'stitchlab-about-narration-text' || data.type === 'stitchlab-about-narration-response') {
    var bridgedText = cacheAboutNarrationBridgeText(data.path || '', data.text || '');
    if (data.type === 'stitchlab-about-narration-response') {
      var requestId = typeof data.requestId === 'string' ? data.requestId : '';
      var pending = requestId ? aboutNarrationBridgePendingByRequestId[requestId] : null;
      if (pending) {
        delete aboutNarrationBridgePendingByRequestId[requestId];
        var expectedPath = pending.expectedPath || '';
        var responsePath = normalizeLoadedAboutDocPath(data.path || '');
        if (!bridgedText) {
          pending.reject(new Error('Narration bridge response had no text'));
        } else if (expectedPath && responsePath && expectedPath !== responsePath) {
          pending.reject(new Error('Narration bridge response path mismatch'));
        } else {
          pending.resolve(bridgedText);
        }
      }
    }
    return;
  }

  if (data.type === 'stitchlab-open-acknowledgments') {
    triggerAcknowledgmentsViewerOpen(!!data.autoPlay);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (acknowledgmentsModal && acknowledgmentsModal.classList.contains('open')) {
    closeAcknowledgmentsViewer();
    return;
  }
  if (kidSaveModal.classList.contains('open')) {
    closeKidSaveModal();
    return;
  }
  if (exportOptionsModal.classList.contains('open')) {
    closeExportOptionsModal();
    return;
  }
  if (!experienceInfoPanel.hasAttribute('hidden')) {
    syncExperienceInfoPanel(false);
    experienceInfoToggle.focus();
    return;
  }
  if (advancedPanel.classList.contains('open')) {
    advancedPanel.classList.remove('open');
    syncAdvancedToggleButton();
    return;
  }
  if (discoveryPanel.classList.contains('open')) {
    discoveryPanel.classList.remove('open');
    syncDiscoveryToggleButton();
    return;
  }
});

if (addThreadBtn) {
  addThreadBtn.addEventListener('click', () => {
    threads.push(buildMagicThread());
    selectedThreadIndex = threads.length - 1;
    renderThreadControls();
    syncKidControlsFromSelectedThread();
    redrawForPathChange();
  });
}

if (triangulaColorScopeSelect) {
  triangulaColorScopeSelect.addEventListener('change', () => {
    triangulaColorMode = triangulaColorScopeSelect.value || 'all';
    if (currentExperienceId === 'triangula' && triangulaConstructionMode === 'shrink-duplicate') {
      var activeColor = normalizeTriangulaFillColor(
        triangulaSourceColor,
        triangulaBandColors.band1
      );
      if (triangulaColorMode === 'band-1') {
        triangulaBandColors.band1 = activeColor;
      } else if (triangulaColorMode === 'band-2') {
        triangulaBandColors.band2 = activeColor;
      } else if (triangulaColorMode === 'band-4') {
        triangulaBandColors.band4 = activeColor;
      }
    }
    persistTriangulaStateCache();
    syncTriangulaControls();
    redrawAnimationInPlace();
  });
}

if (triangulaConstructionModeSelect) {
  triangulaConstructionModeSelect.addEventListener('change', () => {
    triangulaConstructionMode = triangulaConstructionModeSelect.value || 'shrink-duplicate';
    persistTriangulaStateCache();
    syncTriangulaControls();
    redrawForPathChange();
  });
}

if (triangulaStartSlider) {
  triangulaStartSlider.addEventListener('input', () => {
    var startCountFromSlider = getTriangulaCountFromSliderIndex(triangulaStartSlider.value, 'start', triangulaStartCount);
    applyTriangulaCountUpdate(startCountFromSlider, triangulaTargetCount, true);
  });
  triangulaStartSlider.addEventListener('change', () => {
    var startCountFromSlider = getTriangulaCountFromSliderIndex(triangulaStartSlider.value, 'start', triangulaStartCount);
    applyTriangulaCountUpdate(startCountFromSlider, triangulaTargetCount, false);
    settleSliderMotion(triangulaStartSlider);
  });
}

if (triangulaTargetSlider) {
  triangulaTargetSlider.addEventListener('input', () => {
    var targetCountFromSlider = getTriangulaCountFromSliderIndex(triangulaTargetSlider.value, 'target', triangulaTargetCount);
    applyTriangulaCountUpdate(triangulaStartCount, targetCountFromSlider, true);
  });
  triangulaTargetSlider.addEventListener('change', () => {
    var targetCountFromSlider = getTriangulaCountFromSliderIndex(triangulaTargetSlider.value, 'target', triangulaTargetCount);
    applyTriangulaCountUpdate(triangulaStartCount, targetCountFromSlider, false);
    settleSliderMotion(triangulaTargetSlider);
  });
}

if (triangulaFitModeSelect) {
  triangulaFitModeSelect.addEventListener('change', () => {
    triangulaFitMode = triangulaFitModeSelect.value || 'dynamic';
    syncTriangulaControls();
    redrawAnimationInPlace();
  });
}

if (triangulaFractalModeSelect) {
  triangulaFractalModeSelect.addEventListener('change', () => {
    triangulaFractalMode = triangulaFractalModeSelect.value === 'parallel' ? 'parallel' : 'series';
    syncTriangulaControls();
    redrawForPathChange();
  });
}

if (squarusOrderSelect) {
  squarusOrderSelect.addEventListener('change', () => {
    squarusOrder = parseBoundedInt(squarusOrderSelect.value, 1, 6, squarusOrder);
    var maxPieces = getSquarusTotalPiecesForOrder(squarusOrder);
    squarusPieceCount = normalizeSquarusPieceCount(maxPieces, maxPieces, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusOrderInlineSelect) {
  squarusOrderInlineSelect.addEventListener('change', () => {
    squarusOrder = parseBoundedInt(squarusOrderInlineSelect.value, 1, 6, squarusOrder);
    var maxPieces = getSquarusTotalPiecesForOrder(squarusOrder);
    squarusPieceCount = normalizeSquarusPieceCount(maxPieces, maxPieces, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusLayoutSelect) {
  squarusLayoutSelect.addEventListener('change', () => {
    squarusLayout = squarusLayoutSelect.value || 'grid-packing';
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusLayoutInlineSelect) {
  squarusLayoutInlineSelect.addEventListener('change', () => {
    squarusLayout = squarusLayoutInlineSelect.value || 'grid-packing';
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusContactModeInlineSelect) {
  squarusContactModeInlineSelect.addEventListener('change', () => {
    squarusContactMode = sanitizeSquarusContactMode(squarusContactModeInlineSelect.value, squarusContactMode);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusAnimationModeSelect) {
  squarusAnimationModeSelect.addEventListener('change', () => {
    squarusAnimationMode = sanitizeSquarusAnimationMode(squarusAnimationModeSelect.value, squarusAnimationMode);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusContactModeSelect) {
  squarusContactModeSelect.addEventListener('change', () => {
    squarusContactMode = sanitizeSquarusContactMode(squarusContactModeSelect.value, squarusContactMode);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusPieceCountSlider) {
  squarusPieceCountSlider.addEventListener('input', () => {
    squarusPieceCount = normalizeSquarusPieceCount(squarusPieceCountSlider.value, squarusPieceCount, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
  squarusPieceCountSlider.addEventListener('change', () => {
    squarusPieceCount = normalizeSquarusPieceCount(squarusPieceCountSlider.value, squarusPieceCount, squarusOrder);
    syncSquarusControls();
    settleSliderMotion(squarusPieceCountSlider);
  });
}

function randomizeSquarusSequenceSeed() {
  var maxIndex = getSquarusSequenceMaxIndex(squarusOrder);
  if (maxIndex <= 0) {
    squarusSequenceSeed = 0;
  } else if (parseBoundedInt(squarusOrder, 1, 6, squarusOrder) <= 4) {
    squarusSequenceSeed = Math.floor(Math.random() * (maxIndex + 1));
  } else {
    squarusSequenceSeed = Math.floor(Math.random() * maxIndex) + 1;
  }
  syncSquarusControls();
  redrawForPathChange();
}

if (squarusSequenceSlider) {
  squarusSequenceSlider.addEventListener('input', () => {
    squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSlider.value, squarusSequenceSeed, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
  squarusSequenceSlider.addEventListener('change', () => {
    squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceSlider.value, squarusSequenceSeed, squarusOrder);
    syncSquarusControls();
    settleSliderMotion(squarusSequenceSlider);
  });
}

if (squarusSequenceNumberInput) {
  squarusSequenceNumberInput.addEventListener('input', () => {
    squarusSequenceSeed = normalizeSquarusSequenceSeed(squarusSequenceNumberInput.value, squarusSequenceSeed, squarusOrder);
    syncSquarusControls();
    redrawForPathChange();
  });
}

if (squarusSequenceRandomizeBtn) {
  squarusSequenceRandomizeBtn.addEventListener('click', () => {
    randomizeSquarusSequenceSeed();
  });
}

if (squarusSequenceRandomizeAdvancedBtn) {
  squarusSequenceRandomizeAdvancedBtn.addEventListener('click', () => {
    randomizeSquarusSequenceSeed();
  });
}

if (mashrabiyaFoldSelect) {
  mashrabiyaFoldSelect.addEventListener('change', () => {
    mashrabiyaFold = sanitizeMashrabiyaFold(mashrabiyaFoldSelect.value, mashrabiyaFold);
    syncMashrabiyaControls();
    redrawForPathChange();
  });
}

if (mashrabiyaFillBorderSlider) {
  mashrabiyaFillBorderSlider.addEventListener('input', () => {
    mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderSlider.value, mashrabiyaFillBorderWidth);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaKeepConstructionLinesInput) {
  mashrabiyaKeepConstructionLinesInput.addEventListener('change', () => {
    mashrabiyaKeepConstructionLines = !!mashrabiyaKeepConstructionLinesInput.checked;
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (advancedMashrabiyaFillBorderInput) {
  advancedMashrabiyaFillBorderInput.addEventListener('input', () => {
    if (advancedMashrabiyaFillBorderInput.value === '') return;
    mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(advancedMashrabiyaFillBorderInput.value, mashrabiyaFillBorderWidth);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
  advancedMashrabiyaFillBorderInput.addEventListener('change', () => {
    mashrabiyaFillBorderWidth = sanitizeMashrabiyaFillBorderWidth(advancedMashrabiyaFillBorderInput.value, mashrabiyaFillBorderWidth);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaStarColorInput) {
  mashrabiyaStarColorInput.addEventListener('input', () => {
    mashrabiyaStarColor = sanitizeHexColor(mashrabiyaStarColorInput.value, mashrabiyaStarColor);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaPetalColorInput) {
  mashrabiyaPetalColorInput.addEventListener('input', () => {
    mashrabiyaPetalColor = sanitizeHexColor(mashrabiyaPetalColorInput.value, mashrabiyaPetalColor);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

if (mashrabiyaPointColorInput) {
  mashrabiyaPointColorInput.addEventListener('input', () => {
    mashrabiyaPointColor = sanitizeHexColor(mashrabiyaPointColorInput.value, mashrabiyaPointColor);
    syncMashrabiyaControls();
    redrawAnimationInPlace();
  });
}

kidThreadToggle.addEventListener('click', () => {
  var isOpen = !kidThreadMenu.hasAttribute('hidden');
  if (isOpen) {
    kidThreadMenu.setAttribute('hidden', '');
    kidThreadToggle.setAttribute('aria-expanded', 'false');
  } else {
    kidThreadMenu.removeAttribute('hidden');
    kidThreadToggle.setAttribute('aria-expanded', 'true');
  }
});

kidSongToggle.addEventListener('click', () => {
  if (kidSongToggle.disabled) return;
  if (hasUnseenSongUnlock) {
    hasUnseenSongUnlock = false;
  }
  var isOpen = !kidSongMenu.hasAttribute('hidden');
  if (isOpen) {
    kidSongMenu.setAttribute('hidden', '');
    kidSongToggle.setAttribute('aria-expanded', 'false');
    kidSongToggle.classList.remove('is-active');
  } else {
    kidSongMenu.removeAttribute('hidden');
    kidSongToggle.setAttribute('aria-expanded', 'true');
    kidSongToggle.classList.add('is-active');
  }
  syncSongPickerToggleButton();
});

kidThreadMenu.addEventListener('click', (event) => {
  var option = event.target.closest('.kid-thread-option');
  if (!option) return;
  var nextIndex = parseInt(option.dataset.index, 10);
  if (!isFinite(nextIndex) || nextIndex < 0 || nextIndex >= threads.length) return;
  selectedThreadIndex = nextIndex;
  kidThreadMenu.setAttribute('hidden', '');
  kidThreadToggle.setAttribute('aria-expanded', 'false');
  renderThreadControls();
  syncKidControlsFromSelectedThread();
});

kidSongMenu.addEventListener('click', (event) => {
  var option = event.target.closest('.kid-song-option');
  if (!option) return;
  var songId = option.dataset.songId;
  if (!songId) return;
  kidSongMenu.setAttribute('hidden', '');
  kidSongToggle.setAttribute('aria-expanded', 'false');
  kidSongToggle.classList.remove('is-active');
  syncSongPickerToggleButton();
  setCurrentSong(songId);
});

document.addEventListener('click', (event) => {
  var eventPath = (event && typeof event.composedPath === 'function') ? event.composedPath() : [];
  function eventPathContains(node) {
    if (!node) return false;
    if (eventPath && eventPath.length) {
      for (var i = 0; i < eventPath.length; i++) {
        if (eventPath[i] === node) return true;
      }
    }
    return !!(event.target && node.contains && node.contains(event.target));
  }

  function eventPathMatchesSelector(selector) {
    if (!selector || !eventPath || !eventPath.length) return false;
    for (var i = 0; i < eventPath.length; i++) {
      var entry = eventPath[i];
      if (entry && entry.nodeType === 1 && typeof entry.matches === 'function' && entry.matches(selector)) {
        return true;
      }
    }
    return false;
  }

  var clickedWithinAdvanced = eventPathContains(advancedPanel);
  var clickedAdvancedToggle = eventPathContains(gearBtn);
  var clickedWithinDiscovery = eventPathContains(discoveryPanel);
  var clickedDiscoveryToggle = eventPathContains(discoveryToggleBtn);
  var clickedThreadCard = eventPathMatchesSelector('.thread-card');
  var clickedCanvasArea = eventPathMatchesSelector('#myCanvas') || eventPathMatchesSelector('#canvas-container') || eventPathMatchesSelector('#canvas-stage');

  if (!kidThreadMenu.hasAttribute('hidden') && !kidThreadPicker.contains(event.target)) {
    kidThreadMenu.setAttribute('hidden', '');
    kidThreadToggle.setAttribute('aria-expanded', 'false');
  }
  if (!kidSongMenu.hasAttribute('hidden') && !kidSongPicker.contains(event.target)) {
    kidSongMenu.setAttribute('hidden', '');
    kidSongToggle.setAttribute('aria-expanded', 'false');
    kidSongToggle.classList.remove('is-active');
    syncSongPickerToggleButton();
  }
  if (!experienceInfoPanel.hasAttribute('hidden') && !experienceInfoPanel.contains(event.target) && !experienceInfoToggle.contains(event.target)) {
    syncExperienceInfoPanel(false);
  }
  if (advancedPanel.classList.contains('open') && clickedCanvasArea && !clickedWithinAdvanced && !clickedAdvancedToggle && !clickedThreadCard) {
    advancedPanel.classList.remove('open');
    syncAdvancedToggleButton();
  }
  if (discoveryPanel.classList.contains('open') && !clickedWithinDiscovery && !clickedDiscoveryToggle) {
    discoveryPanel.classList.remove('open');
    syncDiscoveryToggleButton();
  }
});

experienceInfoToggle.addEventListener('click', () => {
  var willOpen = experienceInfoToggle.getAttribute('aria-expanded') !== 'true';
  syncExperienceInfoPanel(willOpen);
  if (willOpen) {
    positionExperienceInfoPanel();
    experienceInfoClose.focus();
  }
});

experienceInfoClose.addEventListener('click', () => {
  syncExperienceInfoPanel(false);
  experienceInfoToggle.focus();
});

if (experienceInfoHtmlFrame) {
  experienceInfoHtmlFrame.addEventListener('load', () => {
    enforceExperienceInfoFrameAllowlist();
    attachExperienceInfoAcknowledgmentsBridge();
  });
}

experienceNarrateToggle.addEventListener('click', () => {
  toggleExperienceNarration();
});

if (window.ResizeObserver) {
  canvasResizeObserver = new ResizeObserver(() => {
    scheduleFitCanvasToStage();
  });
  canvasResizeObserver.observe(canvasStage);
  if (canvasContainer) {
    canvasResizeObserver.observe(canvasContainer);
  }
}

window.addEventListener('resize', scheduleFitCanvasToStage);
window.addEventListener('resize', function() {
  renderExperienceTitleStatic();
  refreshExperienceInfoPanelPlacement();
});
window.addEventListener('orientationchange', scheduleFitCanvasToStage);
window.addEventListener('orientationchange', function() {
  renderExperienceTitleStatic();
  refreshExperienceInfoPanelPlacement();
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', scheduleFitCanvasToStage);
  window.visualViewport.addEventListener('resize', function() {
    renderExperienceTitleStatic();
    refreshExperienceInfoPanelPlacement();
  });
}

window.addEventListener('pageshow', () => {
  if (!hasUrlStateParams()) {
    hydrateStitchingStateCacheFromStorage();
    if (stitchingStateCacheLoadedFromStorage) {
      restoreStitchingStateFromCache();
    } else {
      applyDefaultHoles();
      applyDefaultSkipAndSize();
      applyDefaultTempo();
    }
    animationPlaybackState = 'idle';
    syncAnimateButtonLabel();
    renderThreadControls();
    syncKidControlsFromSelectedThread();
    redrawForPathChange();
  }
  applyExperienceOverlayPosition(EXPERIENCE_OVERLAY_POSITION_CLASS);
  renderExperienceTitleStatic();
  applyStateFromCurrentUrl({ forceUrlSync: false });
  syncKidControlsFromSelectedThread();
});

window.addEventListener('popstate', function() {
  applyStateFromCurrentUrl({ forceUrlSync: false });
});

addMagicThreadBtn.addEventListener('click', () => {
  threads.push(buildMagicThread());
  // Keep basic controls focused on the newest magic thread.
  selectedThreadIndex = threads.length - 1;
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});

removeLastThreadBtn.addEventListener('click', () => {
  if (threads.length <= 1) return;
  var indexToRemove = getKidTargetThreadIndex();
  if (indexToRemove < 0 || indexToRemove >= threads.length) return;
  threads.splice(indexToRemove, 1);
  if (!threads.length) {
    threads.push(buildMagicThread());
    selectedThreadIndex = 0;
  } else {
    selectedThreadIndex = Math.min(indexToRemove, threads.length - 1);
  }
  renderThreadControls();
  syncKidControlsFromSelectedThread();
  redrawForPathChange();
});

holeNumbersToggleBtn.addEventListener('click', () => {
  showHoleNumbers = !showHoleNumbers;
  syncHoleNumberToggles();
  // Labels only; keep animation continuity.
  redrawAnimationInPlace();
});

musicToggleBtn.addEventListener('click', () => {
  isMusicMuted = !isMusicMuted;
  syncMusicToggleButton();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

if (onboardingHelpBtn) {
  onboardingHelpBtn.addEventListener('click', function() {
    if (onboardingTour && !onboardingTour.hidden) {
      handleOnboardingTourSkip();
      return;
    }
    startOnboardingTour();
  });
}

if (onboardingDismissBtn) {
  onboardingDismissBtn.addEventListener('click', function() {
    dismissOnboardingQuickStart();
    dismissOnboardingHints();
  });
}

if (onboardingStartTourBtn) {
  onboardingStartTourBtn.addEventListener('click', function() {
    setOnboardingStatePatch({ quickStartDismissed: true });
    startOnboardingTour();
  });
}

if (onboardingTourNextBtn) {
  onboardingTourNextBtn.addEventListener('click', handleOnboardingTourNext);
}

if (onboardingTourSkipBtn) {
  onboardingTourSkipBtn.addEventListener('click', handleOnboardingTourSkip);
}

if (onboardingTourHearBtn) {
  onboardingTourHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingTourNarration();
  });
}

if (onboardingHintShapeHearBtn) {
  onboardingHintShapeHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingHintNarration(onboardingHintShape, onboardingHintShapeHearBtn);
  });
}

if (onboardingHintHolesHearBtn) {
  onboardingHintHolesHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingHintNarration(onboardingHintHoles, onboardingHintHolesHearBtn);
  });
}

if (onboardingHintPlayHearBtn) {
  onboardingHintPlayHearBtn.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleOnboardingHintNarration(onboardingHintPlay, onboardingHintPlayHearBtn);
  });
}

if (onboardingHintsLayer) {
  onboardingHintsLayer.addEventListener('click', function(event) {
    if (!event || !event.target || !event.target.closest) return;
    var nextButton = event.target.closest('.onboarding-hint-next-btn');
    if (nextButton) {
      event.preventDefault();
      event.stopPropagation();
      advanceOnboardingHintStep();
      return;
    }

    var startTourButton = event.target.closest('.onboarding-hint-start-tour-btn');
    if (startTourButton) {
      event.preventDefault();
      event.stopPropagation();
      setOnboardingStatePatch({ quickStartDismissed: true });
      startOnboardingTour();
      return;
    }

    var button = event.target.closest('.onboarding-hint-hear-btn');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (button.id === 'onboarding-hint-shape-hear') {
      toggleOnboardingHintNarration(onboardingHintShape, button);
      return;
    }
    if (button.id === 'onboarding-hint-holes-hear') {
      toggleOnboardingHintNarration(onboardingHintHoles, button);
      return;
    }
    if (button.id === 'onboarding-hint-play-hear') {
      toggleOnboardingHintNarration(onboardingHintPlay, button);
    }
  });
}

window.addEventListener('resize', refreshOnboardingOverlayPositions);

window.addEventListener('orientationchange', function() {
  window.setTimeout(refreshOnboardingOverlayPositions, 120);
});

document.addEventListener('pointerdown', markOnboardingInteractionFromEvent, true);
document.addEventListener('touchstart', markOnboardingInteractionFromEvent, true);
document.addEventListener('mousedown', markOnboardingInteractionFromEvent, true);
document.addEventListener('click', markOnboardingInteractionFromEvent, true);
document.addEventListener('input', markOnboardingInteractionFromEvent, true);
document.addEventListener('change', markOnboardingInteractionFromEvent, true);
document.addEventListener('keydown', function(event) {
  if (!event) return;
  if (event.key === 'Tab' || event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta') {
    return;
  }
  markOnboardingInteractionFromEvent(event);
}, true);

shapeButtons.forEach(function(btn) {
  btn.addEventListener('click', markOnboardingInteraction);
});

if (holesSlider) {
  holesSlider.addEventListener('input', markOnboardingInteraction);
}

if (jumpSlider) {
  jumpSlider.addEventListener('input', markOnboardingInteraction);
}

if (animateBtn) {
  animateBtn.addEventListener('click', markOnboardingInteraction);
}

/* ------------------------------
   INITIALIZE
------------------------------ */
initializeThemeFromStorage();
renderThreadControls();
syncExperienceInfoPanel(false);
applyExperienceOverlayPosition(EXPERIENCE_OVERLAY_POSITION_CLASS);
clearSessionScopedCachesOnLoad();
hydrateStitchingStateCacheFromStorage();
var restoredStitchingStateOnInit = false;
if (hasUrlStateParams()) {
  var initialParams = new URLSearchParams(window.location.search || '');
  var initialExperience = resolveExperienceId(getUrlStateParam(initialParams, 'experienceId')) || 'stitching';
  setCurrentExperience(initialExperience, { suppressUrlSync: true });
  if (initialExperience === 'stitching') {
    var initialUrlStitchingShape = sanitizeShape(getUrlStateParam(initialParams, 'stitchingShape'), '');
    setCurrentShape(
      initialUrlStitchingShape || sanitizeShape(stitchingFrameShape, currentShape || 'circle'),
      false
    );
  }
} else {
  setCurrentExperience('stitching');
  restoredStitchingStateOnInit = stitchingStateCacheLoadedFromStorage;
  if (!restoredStitchingStateOnInit) {
    setCurrentShape('circle', false);
  }
}
advancedPanel.classList.remove('open');
discoveryPanel.classList.remove('open');
renderAdvancedTempoOptions();
if (!hasUrlStateParams()) {
  if (!restoredStitchingStateOnInit) {
    applyDefaultHoles();
    applyDefaultSkipAndSize();
    applyDefaultTempo();
  }
}
syncAnimateButtonLabel();
syncHoleNumberToggles();
syncBorderControls();
syncMusicToggleButton();
syncKidControlsFromSelectedThread();
renderDiscoveryLibrary();
syncAdvancedToggleButton();
syncDiscoveryToggleButton();
fitCanvasToStage();
if (hasUrlStateParams()) {
  applyStateFromCurrentUrl({ forceUrlSync: false, initialLoad: true });
} else {
  redrawForPathChange();
}
scheduleDiscoveryEvaluation();
syncExportUiCopy();
scheduleUrlStateSync(true);
initializeOnboarding();
window.setCurrentExperience = setCurrentExperience;
window.exportMashrabiyaFaceSnapshot = exportMashrabiyaFaceSnapshot;