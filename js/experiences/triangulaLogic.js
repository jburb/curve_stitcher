function parseBoundedIntValue(value, min, max, fallback) {
  var parsed = parseInt(value, 10);
  if (!isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

const TRIANGULA_DRAWABLE_COUNTS = Object.freeze([1, 3, 9, 27, 81, 243, 729]);

function normalizeTriangulaDrawableCount(value, role, fallback) {
  var parsed = parseBoundedIntValue(value, 1, 729, fallback);
  if (!isFinite(parsed)) {
    parsed = parseBoundedIntValue(fallback, 1, 729, 1);
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

function stepTriangulaCount(baseValue, stepAction) {
  var value = parseBoundedIntValue(baseValue, 1, 729, 1);
  if (stepAction === 'div3') {
    return Math.max(1, Math.floor(value / 3));
  }
  if (stepAction === 'mul3') {
    return Math.min(729, value * 3);
  }
  if (stepAction === 'dec10') {
    return Math.max(1, value - 10);
  }
  if (stepAction === 'inc10') {
    return Math.min(729, value + 10);
  }
  return value;
}

window.TRIANGULA_DRAWABLE_COUNTS = TRIANGULA_DRAWABLE_COUNTS;
window.normalizeTriangulaDrawableCount = normalizeTriangulaDrawableCount;
window.sanitizeTriangulaCount = sanitizeTriangulaCount;
window.sanitizeTriangulaColorMode = sanitizeTriangulaColorMode;
window.sanitizeTriangulaConstructionMode = sanitizeTriangulaConstructionMode;
window.sanitizeTriangulaFractalMode = sanitizeTriangulaFractalMode;
window.sanitizeTriangulaFitMode = sanitizeTriangulaFitMode;
window.stepTriangulaCount = stepTriangulaCount;
