(function(global) {
  var PREFERRED_PIPER_VOICE_ID = 'hfc_female [medium]';
  var PREFERRED_PIPER_VOICE_ALIASES = [
    'hfc_female [medium]',
    'hfc_femail [medium]',
    'hfc_female medium',
    'hfc_femail medium',
  ];

  var activeRequest = null;
  var requestCounter = 0;

  function normalizeVoiceKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function getPiperBridge() {
    if (global.stitchlabPiperTts && typeof global.stitchlabPiperTts.speak === 'function') {
      return global.stitchlabPiperTts;
    }
    if (global.PiperTTS && typeof global.PiperTTS.speak === 'function') {
      return global.PiperTTS;
    }
    if (global.piperTts && typeof global.piperTts.speak === 'function') {
      return global.piperTts;
    }
    return null;
  }

  function hasWebSpeechSupport() {
    return !!(global.speechSynthesis && global.SpeechSynthesisUtterance);
  }

  function findPreferredSpeechSynthesisVoice() {
    if (!hasWebSpeechSupport() || typeof global.speechSynthesis.getVoices !== 'function') {
      return null;
    }
    var voices = global.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    var normalizedAliasMap = PREFERRED_PIPER_VOICE_ALIASES.map(normalizeVoiceKey);
    for (var i = 0; i < voices.length; i++) {
      var voice = voices[i];
      var normalizedName = normalizeVoiceKey(voice && voice.name);
      for (var j = 0; j < normalizedAliasMap.length; j++) {
        if (normalizedName.indexOf(normalizedAliasMap[j]) !== -1) {
          return voice;
        }
      }
    }

    return null;
  }

  function clearActiveRequestIfMatches(id) {
    if (activeRequest && activeRequest.id === id) {
      activeRequest = null;
    }
  }

  function cancelSpeechSynthesis() {
    if (hasWebSpeechSupport()) {
      global.speechSynthesis.cancel();
    }
  }

  function cancel() {
    var request = activeRequest;
    activeRequest = null;
    if (!request) {
      cancelSpeechSynthesis();
      return;
    }

    if (request.engine === 'piper') {
      if (request.bridge && typeof request.bridge.cancel === 'function') {
        try {
          request.bridge.cancel();
        } catch (_error) {
          // Ignore bridge cancellation errors.
        }
      }
      return;
    }

    cancelSpeechSynthesis();
  }

  function supportsNarration() {
    return !!getPiperBridge() || hasWebSpeechSupport();
  }

  function prewarm() {
    var bridge = getPiperBridge();
    if (bridge && typeof bridge.prewarm === 'function') {
      try {
        var maybePromise = bridge.prewarm({ voiceId: PREFERRED_PIPER_VOICE_ID });
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.catch(function() {});
        }
        return true;
      } catch (_error) {
        return false;
      }
    }

    if (!hasWebSpeechSupport()) return false;
    try {
      var synth = global.speechSynthesis;
      var prewarmUtterance = new global.SpeechSynthesisUtterance('');
      prewarmUtterance.volume = 0;
      prewarmUtterance.rate = 1;
      prewarmUtterance.pitch = 1;
      synth.cancel();
      synth.speak(prewarmUtterance);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function speakWithPiperBridge(text, options, requestId, bridge, onPiperFailure) {
    var failureHandled = false;

    function handlePiperFailure(error) {
      if (failureHandled) return;
      failureHandled = true;
      if (!activeRequest || activeRequest.id !== requestId) return;

      var fallbackStarted = false;
      if (typeof onPiperFailure === 'function') {
        try {
          fallbackStarted = !!onPiperFailure(error || new Error('Piper speech failed.'));
        } catch (_fallbackError) {
          fallbackStarted = false;
        }
      }

      if (fallbackStarted) {
        return;
      }

      clearActiveRequestIfMatches(requestId);
      if (typeof options.onerror === 'function') {
        options.onerror(error || new Error('Piper speech failed.'));
      }
    }

    var payload = {
      text: text,
      voiceId: PREFERRED_PIPER_VOICE_ID,
      rate: options.rate,
      pitch: options.pitch,
      volume: options.volume,
      onEnd: function() {
        clearActiveRequestIfMatches(requestId);
        if (typeof options.onend === 'function') {
          options.onend();
        }
      },
      onError: function(error) {
        handlePiperFailure(error);
      }
    };

    var result = bridge.speak(payload);
    if (result && typeof result.then === 'function') {
      result.then(function() {
        if (!activeRequest || activeRequest.id !== requestId) return;
        clearActiveRequestIfMatches(requestId);
        if (typeof options.onend === 'function') {
          options.onend();
        }
      }).catch(function(error) {
        handlePiperFailure(error);
      });
    }
  }

  function speakWithSpeechSynthesis(text, options, requestId) {
    var utterance = new global.SpeechSynthesisUtterance(text);
    utterance.rate = typeof options.rate === 'number' ? options.rate : 1;
    utterance.pitch = typeof options.pitch === 'number' ? options.pitch : 1;
    utterance.volume = typeof options.volume === 'number' ? options.volume : 1;

    var preferredVoice = findPreferredSpeechSynthesisVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = function() {
      if (!activeRequest || activeRequest.id !== requestId) return;
      clearActiveRequestIfMatches(requestId);
      if (typeof options.onend === 'function') {
        options.onend();
      }
    };
    utterance.onerror = function(error) {
      if (!activeRequest || activeRequest.id !== requestId) return;
      clearActiveRequestIfMatches(requestId);
      if (typeof options.onerror === 'function') {
        options.onerror(error || new Error('Speech synthesis failed.'));
      }
    };

    cancelSpeechSynthesis();
    global.speechSynthesis.speak(utterance);
  }

  function speak(options) {
    options = options || {};
    var text = String(options.text || '').replace(/\s+/g, ' ').trim();
    if (!text) return null;

    cancel();

    var requestId = ++requestCounter;
    var bridge = getPiperBridge();
    var request = {
      id: requestId,
      engine: bridge ? 'piper' : 'speechSynthesis',
      bridge: bridge
    };
    activeRequest = request;

    try {
      if (bridge) {
        speakWithPiperBridge(text, options, requestId, bridge, function() {
          if (!hasWebSpeechSupport()) {
            return false;
          }

          if (!activeRequest || activeRequest.id !== requestId) {
            return false;
          }

          activeRequest.engine = 'speechSynthesis';
          speakWithSpeechSynthesis(text, options, requestId);
          return true;
        });
      } else if (hasWebSpeechSupport()) {
        speakWithSpeechSynthesis(text, options, requestId);
      } else {
        activeRequest = null;
        if (typeof options.onerror === 'function') {
          options.onerror(new Error('Narration is unavailable in this browser.'));
        }
        return null;
      }
    } catch (error) {
      clearActiveRequestIfMatches(requestId);
      if (typeof options.onerror === 'function') {
        options.onerror(error);
      }
      return null;
    }

    return {
      id: requestId,
      engine: request.engine,
      voiceId: PREFERRED_PIPER_VOICE_ID,
      stop: function() {
        if (!activeRequest || activeRequest.id !== requestId) return;
        cancel();
      }
    };
  }

  global.stitchlabTts = {
    preferredVoiceId: PREFERRED_PIPER_VOICE_ID,
    preferredVoiceAliases: PREFERRED_PIPER_VOICE_ALIASES.slice(),
    supportsNarration: supportsNarration,
    prewarm: prewarm,
    speak: speak,
    cancel: cancel,
    getActiveEngine: function() {
      return activeRequest ? activeRequest.engine : null;
    }
  };
})(window);
