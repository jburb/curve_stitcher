(function() {
  function sanitizeHexLikeColor(value, fallback) {
    if (typeof value !== 'string') return fallback;
    var trimmed = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
    if (trimmed === 'rainbow') return 'rainbow';
    return fallback;
  }

  function parseBoundedInt(value, min, max, fallback) {
    var parsed = parseInt(value, 10);
    if (!isFinite(parsed)) return fallback;
    if (isFinite(min) && parsed < min) parsed = min;
    if (isFinite(max) && parsed > max) parsed = max;
    return parsed;
  }

  function sanitizeThreadJumpMode(value, fallback) {
    var allowed = ['fixed', 'connect', 'sequence', 'formula'];
    if (allowed.indexOf(value) === -1) return fallback;
    return value;
  }

  function sanitizeThreadColor(value, fallback) {
    return sanitizeHexLikeColor(value, fallback);
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

  function sanitizeThreadDescriptor(raw, fallback, options) {
    options = options || {};
    var parseIntSafe = options.parseBoundedInt || parseBoundedInt;
    var sanitizeJumpMode = options.sanitizeThreadJumpMode || sanitizeThreadJumpMode;
    var sanitizeColor = options.sanitizeThreadColor || sanitizeThreadColor;
    var defaultSkip = isFinite(options.defaultSkip) ? options.defaultSkip : 22;
    var defaultThreadSize = isFinite(options.defaultThreadSize) ? options.defaultThreadSize : 2;
    var maxHoles = isFinite(options.maxHoles) ? options.maxHoles : 140;

    fallback = fallback || {
      jump: defaultSkip,
      width: defaultThreadSize,
      color: '#1982c4',
      jumpMode: 'fixed',
      jumpFormula: 'skip',
      jumpSequence: '',
      connectMultiplier: 2,
      connectOffset: 0
    };

    raw = raw || {};
    var jumpMode = sanitizeJumpMode(raw.m || raw.jumpMode, fallback.jumpMode || 'fixed');
    var thread = {
      jump: parseIntSafe(raw.j != null ? raw.j : raw.jump, 1, 100, fallback.jump || defaultSkip),
      width: parseIntSafe(raw.w != null ? raw.w : raw.width, 1, 10, fallback.width || defaultThreadSize),
      color: sanitizeColor(raw.c != null ? raw.c : raw.color, fallback.color || '#1982c4'),
      sequence: null,
      jumpMode: jumpMode,
      jumpFormula: String(raw.f != null ? raw.f : (raw.jumpFormula != null ? raw.jumpFormula : (fallback.jumpFormula || 'skip'))),
      jumpSequence: String(raw.s != null ? raw.s : (raw.jumpSequence != null ? raw.jumpSequence : (fallback.jumpSequence || ''))),
      connectMultiplier: parseIntSafe(raw.cm != null ? raw.cm : raw.connectMultiplier, 1, 12, fallback.connectMultiplier || 2),
      connectOffset: parseIntSafe(raw.co != null ? raw.co : raw.connectOffset, 0, maxHoles, fallback.connectOffset || 0)
    };

    if (thread.jumpMode !== 'formula') {
      thread.jumpFormula = fallback.jumpFormula || 'skip';
    }
    if (thread.jumpMode !== 'sequence') {
      thread.jumpSequence = '';
    }

    return thread;
  }

  function sanitizeThreadList(threadList, options) {
    options = options || {};
    var sanitizeDescriptor = options.sanitizeThreadDescriptor || sanitizeThreadDescriptor;
    var getFallback = typeof options.getFallback === 'function'
      ? options.getFallback
      : function(list, index) {
          return list[index] || list[0] || null;
        };
    if (!Array.isArray(threadList)) return [];
    return threadList.map(function(thread, index) {
      var fallback = getFallback(threadList, index, thread);
      return sanitizeDescriptor(thread, fallback);
    }).filter(function(thread) {
      return !!thread;
    });
  }

  function ensureThreadList(threadList, options) {
    options = options || {};
    var sanitizeDescriptor = options.sanitizeThreadDescriptor || sanitizeThreadDescriptor;
    var sanitized = sanitizeThreadList(threadList, options);
    if (!sanitized.length) {
      sanitized.push(sanitizeDescriptor({}, null));
    }
    return sanitized;
  }

  function serializeStitchingThreadState(threadList, options) {
    options = options || {};
    var parseIntSafe = options.parseBoundedInt || parseBoundedInt;
    var sanitizeColor = options.sanitizeThreadColor || sanitizeThreadColor;
    var sanitizeJumpMode = options.sanitizeThreadJumpMode || sanitizeThreadJumpMode;
    var defaultSkip = isFinite(options.defaultSkip) ? options.defaultSkip : 22;
    var defaultThreadSize = isFinite(options.defaultThreadSize) ? options.defaultThreadSize : 2;
    var maxHoles = isFinite(options.maxHoles) ? options.maxHoles : 140;

    var compact = (threadList || []).map(function(thread) {
      return {
        j: parseIntSafe(thread.jump, 1, 100, defaultSkip),
        w: parseIntSafe(thread.width, 1, 10, defaultThreadSize),
        c: sanitizeColor(thread.color, '#1982c4'),
        m: sanitizeJumpMode(thread.jumpMode, 'fixed'),
        f: String(thread.jumpFormula || 'skip'),
        s: String(thread.jumpSequence || ''),
        cm: parseIntSafe(thread.connectMultiplier, 1, 12, 2),
        co: parseIntSafe(thread.connectOffset, 0, maxHoles, 0)
      };
    });

    if (!compact.length) {
      compact.push({
        j: defaultSkip,
        w: defaultThreadSize,
        c: '#1982c4',
        m: 'fixed',
        f: 'skip',
        s: '',
        cm: 2,
        co: 0
      });
    }

    return encodeURIComponent(JSON.stringify(compact));
  }

  function parseStitchingThreadState(value, fallbackList, options) {
    options = options || {};
    var sanitizeDescriptor = options.sanitizeThreadDescriptor || sanitizeThreadDescriptor;
    var sanitizeList = options.sanitizeThreadList || sanitizeThreadList;

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

      var sanitized = sanitizeList(parsed, {
        sanitizeThreadDescriptor: sanitizeDescriptor,
        getFallback: function(list, index) {
          return fallbackList[index] || fallbackList[0] || null;
        }
      });

      if (!sanitized.length) {
        return fallbackList.slice();
      }
      return sanitized;
    } catch (error) {
      return fallbackList.slice();
    }
  }

  function buildStitchingUrlState(runtime, options) {
    runtime = runtime || {};
    options = options || {};

    var parseIntSafe = options.parseBoundedInt || parseBoundedInt;
    var sanitizeColor = options.sanitizeThreadColor || sanitizeThreadColor;
    var serializeState = options.serializeStitchingThreadState || serializeStitchingThreadState;
    var defaultThreadColor = options.defaultThreadColor || '#1982c4';
    var maxHoles = isFinite(options.maxHoles) ? options.maxHoles : 140;
    var defaultHoles = isFinite(options.defaultHoles) ? options.defaultHoles : 60;
    var threads = Array.isArray(runtime.threads) ? runtime.threads : [];

    return {
      holes: parseIntSafe(runtime.holesValue, 3, maxHoles, defaultHoles),
      selectedThreadIndex: parseIntSafe(runtime.selectedThreadIndex, 0, Math.max(0, threads.length - 1), 0),
      threadColors: threads.map(function(thread) {
        return sanitizeColor(thread.color, defaultThreadColor);
      }),
      threadState: serializeState(threads, options.serializeOptions)
    };
  }

  function hydrateStitchingUrlState(runtime, options) {
    runtime = runtime || {};
    options = options || {};

    var parseIntSafe = options.parseBoundedInt || parseBoundedInt;
    var sanitizeList = options.sanitizeThreadList || sanitizeThreadList;
    var parseState = options.parseStitchingThreadState || parseStitchingThreadState;
    var sanitizeColorList = options.sanitizeThreadColorList || sanitizeThreadColorList;
    var ensureList = options.ensureThreadList || ensureThreadList;
    var defaultThreadColor = options.defaultThreadColor || '#1982c4';
    var maxHoles = isFinite(options.maxHoles) ? options.maxHoles : 140;
    var defaultHoles = isFinite(options.defaultHoles) ? options.defaultHoles : 60;
    var baseThreads = Array.isArray(runtime.threads) ? runtime.threads : [];
    var nextThreads = baseThreads.slice();

    var fallbackThreads = sanitizeList(baseThreads);
    var requestedThreadState = parseState(runtime.threadStateParam, fallbackThreads, options.parseStateOptions);

    if (requestedThreadState.length) {
      nextThreads = sanitizeList(requestedThreadState);
    }

    var fallbackColors = nextThreads.map(function(thread) {
      return sanitizeThreadColor(thread.color, defaultThreadColor);
    });
    var requestedThreadColors = sanitizeColorList(runtime.threadColorsParam, fallbackColors);
    for (var i = 0; i < nextThreads.length && i < requestedThreadColors.length; i++) {
      nextThreads[i].color = requestedThreadColors[i];
    }

    if (!nextThreads.length) {
      nextThreads = ensureList(null);
    }

    var holes = parseIntSafe(
      runtime.stitchingHolesParam,
      3,
      maxHoles,
      parseIntSafe(runtime.currentHolesValue, 3, maxHoles, defaultHoles)
    );

    var selectedThreadIndex = parseIntSafe(
      runtime.selectedThreadIndexParam,
      0,
      nextThreads.length - 1,
      isFinite(runtime.selectedThreadIndex) ? runtime.selectedThreadIndex : 0
    );

    return {
      threads: nextThreads,
      holes: holes,
      selectedThreadIndex: selectedThreadIndex
    };
  }

  window.STITCHING_LOGIC = Object.freeze({
    parseBoundedInt: parseBoundedInt,
    sanitizeThreadJumpMode: sanitizeThreadJumpMode,
    sanitizeThreadColor: sanitizeThreadColor,
    sanitizeThreadColorList: sanitizeThreadColorList,
    sanitizeThreadDescriptor: sanitizeThreadDescriptor,
    sanitizeThreadList: sanitizeThreadList,
    ensureThreadList: ensureThreadList,
    serializeStitchingThreadState: serializeStitchingThreadState,
    parseStitchingThreadState: parseStitchingThreadState,
    buildStitchingUrlState: buildStitchingUrlState,
    hydrateStitchingUrlState: hydrateStitchingUrlState
  });
})();
