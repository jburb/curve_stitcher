(function() {
  var PATTERN_LIBRARY_INDEXED_DB_NAME = 'stitchlab.patternLibrary.v1';
  var PATTERN_LIBRARY_INDEXED_DB_VERSION = 1;
  var PATTERN_LIBRARY_STORE_NAME = 'patterns';
  var PATTERN_LIBRARY_EXPORT_VERSION = 1;
  var PATTERN_NAME_MAX_LENGTH = 512;
  var PATTERN_DESCRIPTION_MAX_LENGTH = 4000;
  var PATTERN_SMALL_PREVIEW_SIZE = 52;
  var PATTERN_NAME_ALLOWED_REGEX = /^[A-Za-z0-9 _()\-]+$/;

  var patternLibraryState = {
    adapterName: 'indexeddb',
    adapter: null,
    records: [],
    loaded: false,
    loadingPromise: null,
    detailPatternId: '',
    pendingExportPatternId: ''
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function generateRecordId(prefix) {
    var stamp = Date.now().toString(36);
    var random = Math.random().toString(36).slice(2, 9);
    return prefix + '-' + stamp + '-' + random;
  }

  function normalizePatternName(name) {
    return String(name || '').replace(/\s+/g, ' ').trim();
  }

  function normalizePatternNameKey(name) {
    return normalizePatternName(name).toLowerCase();
  }

  function validatePatternName(name) {
    var normalized = normalizePatternName(name);
    if (!normalized) {
      return { ok: false, message: 'Pattern name is required.' };
    }
    if (normalized.length > PATTERN_NAME_MAX_LENGTH) {
      return { ok: false, message: 'Pattern name is too long.' };
    }
    if (!PATTERN_NAME_ALLOWED_REGEX.test(normalized)) {
      return { ok: false, message: 'Pattern name may only use letters, numbers, spaces, underscores, parentheses, and dashes.' };
    }
    return { ok: true, value: normalized };
  }

  function normalizePatternDescription(value) {
    var raw = String(value || '');
    if (raw.length > PATTERN_DESCRIPTION_MAX_LENGTH) {
      return raw.slice(0, PATTERN_DESCRIPTION_MAX_LENGTH);
    }
    return raw;
  }

  function isSameOriginUrl(urlText) {
    try {
      var parsed = new URL(urlText, window.location.href);
      return parsed.origin === window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function parseQueryFromUrl(urlText) {
    try {
      var parsed = new URL(urlText, window.location.href);
      return new URLSearchParams(parsed.search || '');
    } catch (error) {
      return new URLSearchParams('');
    }
  }

  function ensurePatternUrlForStitching(urlText) {
    var safe = String(urlText || '').trim();
    if (!safe) return false;
    if (!isSameOriginUrl(safe)) return false;
    var params = parseQueryFromUrl(safe);
    var experienceId = (typeof resolveExperienceId === 'function')
      ? resolveExperienceId(getUrlStateParam(params, 'experienceId'))
      : null;
    if (!experienceId) {
      experienceId = 'stitching';
    }
    return experienceId === 'stitching';
  }

  function normalizePatternUrl(urlText) {
    try {
      var parsed = new URL(urlText, window.location.href);
      return parsed.toString();
    } catch (error) {
      return String(urlText || '').trim();
    }
  }

  function buildDiscoveryIconPath(discoveryKey, isUnlocked) {
    if (typeof getDiscoveryIconPath === 'function') {
      return getDiscoveryIconPath(discoveryKey, isUnlocked);
    }
    return '';
  }

  async function fetchTextAtPath(path) {
    if (!path) return '';
    try {
      var response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) return '';
      return await response.text();
    } catch (error) {
      return '';
    }
  }

  function extractSvgInnerMarkup(svgText) {
    var text = String(svgText || '');
    var openIndex = text.indexOf('>');
    var closeIndex = text.lastIndexOf('</svg>');
    if (openIndex === -1 || closeIndex === -1 || closeIndex <= openIndex) {
      return '';
    }
    return text.slice(openIndex + 1, closeIndex);
  }

  function extractSvgViewBox(svgText) {
    var text = String(svgText || '');
    var match = text.match(/viewBox\s*=\s*"([^"]+)"/i);
    return match && match[1] ? match[1] : '0 0 600 600';
  }

  function wrapScaledSvg(svgText, sizePx) {
    var inner = extractSvgInnerMarkup(svgText);
    if (!inner) return String(svgText || '');
    var viewBox = extractSvgViewBox(svgText);
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + String(sizePx) + '" height="' + String(sizePx) + '" viewBox="' + viewBox + '" preserveAspectRatio="xMidYMid meet">',
      inner,
      '</svg>'
    ].join('\n');
  }

  function readCurrentPatternUrl() {
    return window.location.href;
  }

  function buildCurrentPatternPreviewFullSvg() {
    if (typeof buildCurrentDesignSvgString !== 'function') return '';
    return buildCurrentDesignSvgString({
      includeThreads: true,
      includeGuide: false,
      includePreview: false,
      forceStitchingBorder: true,
      forceStitchingHoleNumbers: true
    });
  }

  function buildCurrentPatternPreviewSmallSvg(fullSvgText) {
    return wrapScaledSvg(fullSvgText, PATTERN_SMALL_PREVIEW_SIZE);
  }

  function comparePatternRecords(a, b) {
    var typeRankA = a.kind === 'discovery' ? 0 : 1;
    var typeRankB = b.kind === 'discovery' ? 0 : 1;
    if (typeRankA !== typeRankB) {
      return typeRankA - typeRankB;
    }
    if (a.kind === 'discovery' && b.kind === 'discovery') {
      var indexA = parseInt(a.discoveryOrder, 10);
      var indexB = parseInt(b.discoveryOrder, 10);
      if (isFinite(indexA) && isFinite(indexB) && indexA !== indexB) {
        return indexA - indexB;
      }
    }
    var at = String(a.updatedAt || a.createdAt || '');
    var bt = String(b.updatedAt || b.createdAt || '');
    if (at !== bt) {
      return at < bt ? 1 : -1;
    }
    return String(a.patternName || '').localeCompare(String(b.patternName || ''));
  }

  function cloneRecord(record) {
    return JSON.parse(JSON.stringify(record || {}));
  }

  function sanitizeIncomingRecord(raw, fallbackIdPrefix) {
    raw = raw || {};
    var kind = raw.kind === 'discovery' ? 'discovery' : 'user';
    var id = String(raw.id || '').trim() || generateRecordId(fallbackIdPrefix || kind);
    var patternName = normalizePatternName(raw.patternName || 'Untitled Pattern');
    var nameValidation = validatePatternName(patternName);
    if (!nameValidation.ok) {
      patternName = kind === 'discovery' ? normalizePatternName(raw.patternName || 'Discovery Pattern') : 'Untitled Pattern';
    } else {
      patternName = nameValidation.value;
    }
    var now = nowIso();

    return {
      id: id,
      kind: kind,
      isProtected: kind === 'discovery',
      discoveryKey: raw.discoveryKey ? String(raw.discoveryKey) : '',
      discoveryOrder: isFinite(raw.discoveryOrder) ? Number(raw.discoveryOrder) : null,
      isDiscovered: !!raw.isDiscovered,
      experienceName: raw.experienceName ? String(raw.experienceName) : '',
      songId: raw.songId ? String(raw.songId) : '',
      patternUrl: raw.patternUrl ? normalizePatternUrl(raw.patternUrl) : '',
      patternName: patternName,
      patternNameKey: normalizePatternNameKey(patternName),
      patternDescription: normalizePatternDescription(raw.patternDescription || ''),
      patternPreviewFull: String(raw.patternPreviewFull || ''),
      patternPreviewSmall: String(raw.patternPreviewSmall || ''),
      createdAt: String(raw.createdAt || now),
      updatedAt: String(raw.updatedAt || now)
    };
  }

  function createIndexedDbAdapter() {
    var cachedDbPromise = null;

    function openDb() {
      if (cachedDbPromise) return cachedDbPromise;
      cachedDbPromise = new Promise(function(resolve, reject) {
        if (!window.indexedDB) {
          reject(new Error('IndexedDB is unavailable in this environment.'));
          return;
        }
        var request = window.indexedDB.open(PATTERN_LIBRARY_INDEXED_DB_NAME, PATTERN_LIBRARY_INDEXED_DB_VERSION);
        request.onupgradeneeded = function(event) {
          var db = event.target.result;
          if (!db.objectStoreNames.contains(PATTERN_LIBRARY_STORE_NAME)) {
            var store = db.createObjectStore(PATTERN_LIBRARY_STORE_NAME, { keyPath: 'id' });
            store.createIndex('patternNameKey', 'patternNameKey', { unique: true });
            store.createIndex('kind', 'kind', { unique: false });
            store.createIndex('discoveryKey', 'discoveryKey', { unique: false });
          }
        };
        request.onsuccess = function() {
          resolve(request.result);
        };
        request.onerror = function() {
          reject(request.error || new Error('Failed to open IndexedDB for pattern library.'));
        };
      });
      return cachedDbPromise;
    }

    function runTx(mode, work) {
      return openDb().then(function(db) {
        return new Promise(function(resolve, reject) {
          var tx = db.transaction([PATTERN_LIBRARY_STORE_NAME], mode);
          var store = tx.objectStore(PATTERN_LIBRARY_STORE_NAME);
          var result = work(store, tx);
          tx.oncomplete = function() {
            resolve(result);
          };
          tx.onerror = function() {
            reject(tx.error || new Error('Pattern library transaction failed.'));
          };
          tx.onabort = function() {
            reject(tx.error || new Error('Pattern library transaction aborted.'));
          };
        });
      });
    }

    function getAllRecords() {
      return openDb().then(function(db) {
        return new Promise(function(resolve, reject) {
          var tx = db.transaction([PATTERN_LIBRARY_STORE_NAME], 'readonly');
          var store = tx.objectStore(PATTERN_LIBRARY_STORE_NAME);
          var request = store.getAll();
          request.onsuccess = function() {
            resolve(Array.isArray(request.result) ? request.result : []);
          };
          request.onerror = function() {
            reject(request.error || new Error('Failed to load pattern library records.'));
          };
        });
      });
    }

    function getById(id) {
      return openDb().then(function(db) {
        return new Promise(function(resolve, reject) {
          var tx = db.transaction([PATTERN_LIBRARY_STORE_NAME], 'readonly');
          var store = tx.objectStore(PATTERN_LIBRARY_STORE_NAME);
          var request = store.get(id);
          request.onsuccess = function() {
            resolve(request.result || null);
          };
          request.onerror = function() {
            reject(request.error || new Error('Failed to read pattern record.'));
          };
        });
      });
    }

    function getByNameKey(nameKey) {
      return openDb().then(function(db) {
        return new Promise(function(resolve, reject) {
          var tx = db.transaction([PATTERN_LIBRARY_STORE_NAME], 'readonly');
          var store = tx.objectStore(PATTERN_LIBRARY_STORE_NAME);
          var index = store.index('patternNameKey');
          var request = index.get(nameKey);
          request.onsuccess = function() {
            resolve(request.result || null);
          };
          request.onerror = function() {
            reject(request.error || new Error('Failed to read pattern name index.'));
          };
        });
      });
    }

    function upsert(record) {
      return runTx('readwrite', function(store) {
        store.put(record);
      }).then(function() {
        return record;
      });
    }

    function remove(id) {
      return runTx('readwrite', function(store) {
        store.delete(id);
      });
    }

    function bulkUpsert(records) {
      return runTx('readwrite', function(store) {
        for (var i = 0; i < records.length; i++) {
          store.put(records[i]);
        }
      });
    }

    return {
      name: 'indexeddb',
      list: getAllRecords,
      getById: getById,
      getByNameKey: getByNameKey,
      upsert: upsert,
      remove: remove,
      bulkUpsert: bulkUpsert
    };
  }

  function createSqliteAdapter() {
    var bridge = window.stitchlabSqlitePatternLibrary || null;

    async function notAvailable() {
      throw new Error('SQLite adapter is unavailable in this web runtime.');
    }

    if (!bridge || typeof bridge.listPatterns !== 'function') {
      return {
        name: 'sqlite',
        list: notAvailable,
        getById: notAvailable,
        getByNameKey: notAvailable,
        upsert: notAvailable,
        remove: notAvailable,
        bulkUpsert: notAvailable
      };
    }

    return {
      name: 'sqlite',
      list: function() {
        return bridge.listPatterns();
      },
      getById: function(id) {
        return bridge.getPatternById(id);
      },
      getByNameKey: function(nameKey) {
        return bridge.getPatternByNameKey(nameKey);
      },
      upsert: function(record) {
        return bridge.upsertPattern(record);
      },
      remove: function(id) {
        return bridge.removePattern(id);
      },
      bulkUpsert: function(records) {
        return bridge.bulkUpsertPatterns(records);
      }
    };
  }

  function pickAdapter() {
    var requested = String(window.__STITCHLAB_STORAGE_TARGET__ || '').toLowerCase();
    if (requested === 'sqlite') {
      return createSqliteAdapter();
    }
    return createIndexedDbAdapter();
  }

  async function loadPatternLibraryRecords() {
    var list = await patternLibraryState.adapter.list();
    var normalized = [];
    for (var i = 0; i < list.length; i++) {
      normalized.push(sanitizeIncomingRecord(list[i], 'pattern'));
    }
    normalized.sort(comparePatternRecords);
    patternLibraryState.records = normalized;
    patternLibraryState.loaded = true;
    return normalized;
  }

  async function ensureDiscoverySeeds() {
    if (!window.DISCOVERY_LIBRARY || typeof window.DISCOVERY_LIBRARY !== 'object') return;

    var keys = Object.keys(window.DISCOVERY_LIBRARY);
    if (!keys.length) return;

    var existingByDiscoveryKey = Object.create(null);
    for (var i = 0; i < patternLibraryState.records.length; i++) {
      var rec = patternLibraryState.records[i];
      if (rec.kind === 'discovery' && rec.discoveryKey) {
        existingByDiscoveryKey[rec.discoveryKey] = rec;
      }
    }

    var upserts = [];

    for (var index = 0; index < keys.length; index++) {
      var key = keys[index];
      var config = window.DISCOVERY_LIBRARY[key];
      if (!config) continue;

      var patternName = normalizePatternName(config.title || key);
      var iconPath = buildDiscoveryIconPath(key, true);
      var iconSvg = await fetchTextAtPath(iconPath);
      var existing = existingByDiscoveryKey[key] || null;
      var next = sanitizeIncomingRecord(existing || {}, 'discovery');
      next.kind = 'discovery';
      next.isProtected = true;
      next.discoveryKey = key;
      next.discoveryOrder = index;
      next.patternName = patternName;
      next.patternNameKey = normalizePatternNameKey(patternName);
      next.patternDescription = normalizePatternDescription(config.passphrase || '');
      next.patternPreviewSmall = iconSvg || existing && existing.patternPreviewSmall || '';
      next.experienceName = String(config.experienceName || '');
      next.songId = String(config.songId || '');
      next.isDiscovered = !!((existing && existing.isDiscovered) || (window.discoveredShapeKeys && window.discoveredShapeKeys[key]));
      next.updatedAt = nowIso();
      if (!next.createdAt) {
        next.createdAt = next.updatedAt;
      }
      upserts.push(next);
    }

    if (upserts.length) {
      await patternLibraryState.adapter.bulkUpsert(upserts);
      await loadPatternLibraryRecords();
    }
  }

  function applyRuntimeDiscoveryStateFromRecords() {
    if (!window.discoveredShapeKeys || !window.unlockedSongIds) return;

    for (var i = 0; i < patternLibraryState.records.length; i++) {
      var record = patternLibraryState.records[i];
      if (record.kind !== 'discovery' || !record.discoveryKey || !record.isDiscovered) continue;
      window.discoveredShapeKeys[record.discoveryKey] = true;
      if (record.songId && window.MUSIC_LIBRARY && window.MUSIC_LIBRARY[record.songId]) {
        if (window.unlockedSongIds.indexOf(record.songId) === -1) {
          window.unlockedSongIds.push(record.songId);
        }
      }
    }
  }

  async function initializePatternLibrary() {
    if (patternLibraryState.loadingPromise) {
      return patternLibraryState.loadingPromise;
    }

    patternLibraryState.adapter = pickAdapter();
    patternLibraryState.adapterName = patternLibraryState.adapter.name;

    patternLibraryState.loadingPromise = loadPatternLibraryRecords()
      .then(function() {
        return ensureDiscoverySeeds();
      })
      .then(function() {
        applyRuntimeDiscoveryStateFromRecords();
      })
      .then(function() {
        return patternLibraryState.records;
      })
      .catch(function(error) {
        console.error('Pattern library initialization failed:', error);
        patternLibraryState.records = [];
        patternLibraryState.loaded = true;
        return patternLibraryState.records;
      });

    return patternLibraryState.loadingPromise;
  }

  function getPatternLibrarySnapshot() {
    return patternLibraryState.records.map(cloneRecord);
  }

  function getPatternRecordById(recordId) {
    if (!recordId) return null;
    for (var i = 0; i < patternLibraryState.records.length; i++) {
      if (patternLibraryState.records[i].id === recordId) {
        return cloneRecord(patternLibraryState.records[i]);
      }
    }
    return null;
  }

  async function ensureUniquePatternName(name, existingId) {
    var nameKey = normalizePatternNameKey(name);
    if (!nameKey) return;

    var byIndex = await patternLibraryState.adapter.getByNameKey(nameKey);
    if (byIndex && String(byIndex.id) !== String(existingId || '')) {
      throw new Error('A pattern with this name already exists.');
    }
  }

  function assertStitchingExperienceForUserSave() {
    if (String(window.currentExperienceId || '') !== 'stitching') {
      throw new Error('Saving user patterns is available only in Stitching.');
    }
  }

  async function saveUserPatternFromCurrentState(name, description) {
    await initializePatternLibrary();
    assertStitchingExperienceForUserSave();

    var nameValidation = validatePatternName(name);
    if (!nameValidation.ok) {
      throw new Error(nameValidation.message);
    }

    await ensureUniquePatternName(nameValidation.value, null);

    var fullSvg = buildCurrentPatternPreviewFullSvg();
    if (!fullSvg) {
      throw new Error('Unable to capture pattern preview at this time.');
    }

    var record = sanitizeIncomingRecord({}, 'user');
    var now = nowIso();
    record.kind = 'user';
    record.isProtected = false;
    record.patternName = nameValidation.value;
    record.patternNameKey = normalizePatternNameKey(record.patternName);
    record.patternDescription = normalizePatternDescription(description);
    record.patternUrl = normalizePatternUrl(readCurrentPatternUrl());
    record.patternPreviewFull = fullSvg;
    record.patternPreviewSmall = buildCurrentPatternPreviewSmallSvg(fullSvg);
    record.createdAt = now;
    record.updatedAt = now;

    await patternLibraryState.adapter.upsert(record);
    await loadPatternLibraryRecords();
    return cloneRecord(record);
  }

  async function upsertDiscoveryPatternFromCurrentState(discoveryKey) {
    await initializePatternLibrary();
    var key = String(discoveryKey || '');
    if (!key || !window.DISCOVERY_LIBRARY || !window.DISCOVERY_LIBRARY[key]) return null;

    var config = window.DISCOVERY_LIBRARY[key];
    var existing = null;
    for (var i = 0; i < patternLibraryState.records.length; i++) {
      var rec = patternLibraryState.records[i];
      if (rec.kind === 'discovery' && rec.discoveryKey === key) {
        existing = rec;
        break;
      }
    }

    var now = nowIso();
    var record = sanitizeIncomingRecord(existing || {}, 'discovery');
    record.kind = 'discovery';
    record.isProtected = true;
    record.discoveryKey = key;
    record.discoveryOrder = Object.keys(window.DISCOVERY_LIBRARY).indexOf(key);
    record.patternName = normalizePatternName(config.title || key);
    record.patternNameKey = normalizePatternNameKey(record.patternName);
    record.patternDescription = normalizePatternDescription(config.passphrase || '');
    record.experienceName = String(config.experienceName || '');
    record.songId = String(config.songId || '');
    record.isDiscovered = true;
    record.patternUrl = normalizePatternUrl(readCurrentPatternUrl());

    var fullSvg = buildCurrentPatternPreviewFullSvg();
    if (fullSvg) {
      record.patternPreviewFull = fullSvg;
    }

    if (!record.patternPreviewSmall) {
      var iconPath = buildDiscoveryIconPath(key, true);
      var iconSvg = await fetchTextAtPath(iconPath);
      if (iconSvg) {
        record.patternPreviewSmall = iconSvg;
      }
    }

    if (!record.createdAt) {
      record.createdAt = now;
    }
    record.updatedAt = now;

    await ensureUniquePatternName(record.patternName, record.id);
    await patternLibraryState.adapter.upsert(record);
    await loadPatternLibraryRecords();
    return cloneRecord(record);
  }

  async function renameUserPattern(recordId, nextName) {
    await initializePatternLibrary();
    var existing = await patternLibraryState.adapter.getById(recordId);
    if (!existing) {
      throw new Error('Pattern not found.');
    }
    if (existing.kind !== 'user' || existing.isProtected) {
      throw new Error('Protected patterns cannot be renamed.');
    }

    var nameValidation = validatePatternName(nextName);
    if (!nameValidation.ok) {
      throw new Error(nameValidation.message);
    }

    await ensureUniquePatternName(nameValidation.value, existing.id);

    var record = sanitizeIncomingRecord(existing, 'user');
    record.patternName = nameValidation.value;
    record.patternNameKey = normalizePatternNameKey(nameValidation.value);
    record.updatedAt = nowIso();

    await patternLibraryState.adapter.upsert(record);
    await loadPatternLibraryRecords();
    return cloneRecord(record);
  }

  async function deleteUserPattern(recordId) {
    await initializePatternLibrary();
    var existing = await patternLibraryState.adapter.getById(recordId);
    if (!existing) {
      throw new Error('Pattern not found.');
    }
    if (existing.kind !== 'user' || existing.isProtected) {
      throw new Error('Protected patterns cannot be deleted.');
    }

    await patternLibraryState.adapter.remove(recordId);
    await loadPatternLibraryRecords();
    return true;
  }

  function triggerJsonDownload(fileName, dataObject) {
    var json = JSON.stringify(dataObject, null, 2);
    var blob = new Blob([json], { type: 'application/json;charset=utf-8' });
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

  async function exportPatternLibraryToJsonFile() {
    await initializePatternLibrary();
    var payload = {
      schema: 'stitchlab.patternLibrary',
      version: PATTERN_LIBRARY_EXPORT_VERSION,
      exportedAt: nowIso(),
      records: getPatternLibrarySnapshot()
    };
    triggerJsonDownload('stitchlab-pattern-library.json', payload);
    return payload;
  }

  function sanitizeImportedRecords(rawRecords) {
    if (!Array.isArray(rawRecords)) return [];
    var output = [];
    for (var i = 0; i < rawRecords.length; i++) {
      var rec = sanitizeIncomingRecord(rawRecords[i], 'import');
      output.push(rec);
    }
    return output;
  }

  async function importPatternLibraryFromJsonText(jsonText) {
    await initializePatternLibrary();

    var parsed;
    try {
      parsed = JSON.parse(String(jsonText || '{}'));
    } catch (error) {
      throw new Error('Import file is not valid JSON.');
    }

    if (!parsed || parsed.schema !== 'stitchlab.patternLibrary' || !Array.isArray(parsed.records)) {
      throw new Error('Import file has an unsupported format.');
    }

    var incoming = sanitizeImportedRecords(parsed.records);
    var existingById = Object.create(null);
    for (var e = 0; e < patternLibraryState.records.length; e++) {
      existingById[patternLibraryState.records[e].id] = patternLibraryState.records[e];
    }

    var merged = [];
    var nameRegistry = Object.create(null);

    for (var i = 0; i < patternLibraryState.records.length; i++) {
      var current = cloneRecord(patternLibraryState.records[i]);
      nameRegistry[current.patternNameKey] = current.id;
      merged.push(current);
    }

    var importedCount = 0;
    var updatedCount = 0;

    for (var j = 0; j < incoming.length; j++) {
      var next = incoming[j];
      var validation = validatePatternName(next.patternName);
      if (!validation.ok) {
        continue;
      }
      next.patternName = validation.value;
      next.patternNameKey = normalizePatternNameKey(next.patternName);
      next.patternDescription = normalizePatternDescription(next.patternDescription);
      next.updatedAt = nowIso();
      if (!next.createdAt) {
        next.createdAt = next.updatedAt;
      }

      var protectedImport = next.kind === 'discovery' || next.isProtected;
      if (protectedImport) {
        next.kind = 'discovery';
        next.isProtected = true;
      }

      var existingByIdMatch = existingById[next.id] || null;
      if (existingByIdMatch) {
        if (existingByIdMatch.kind === 'discovery' && next.kind === 'discovery') {
          existingByIdMatch.patternDescription = next.patternDescription;
          existingByIdMatch.patternPreviewSmall = next.patternPreviewSmall || existingByIdMatch.patternPreviewSmall;
          if (next.patternUrl) {
            existingByIdMatch.patternUrl = next.patternUrl;
          }
          if (next.patternPreviewFull) {
            existingByIdMatch.patternPreviewFull = next.patternPreviewFull;
          }
          existingByIdMatch.isDiscovered = !!(existingByIdMatch.isDiscovered || next.isDiscovered);
          existingByIdMatch.updatedAt = nowIso();
          updatedCount++;
          continue;
        }

        if (existingByIdMatch.kind === 'user' && next.kind === 'user') {
          if (next.patternNameKey !== existingByIdMatch.patternNameKey && nameRegistry[next.patternNameKey]) {
            continue;
          }
          delete nameRegistry[existingByIdMatch.patternNameKey];
          nameRegistry[next.patternNameKey] = existingByIdMatch.id;
          existingByIdMatch.patternName = next.patternName;
          existingByIdMatch.patternNameKey = next.patternNameKey;
          existingByIdMatch.patternDescription = next.patternDescription;
          existingByIdMatch.patternUrl = next.patternUrl;
          existingByIdMatch.patternPreviewFull = next.patternPreviewFull;
          existingByIdMatch.patternPreviewSmall = next.patternPreviewSmall;
          existingByIdMatch.updatedAt = nowIso();
          updatedCount++;
          continue;
        }
      }

      if (nameRegistry[next.patternNameKey]) {
        continue;
      }

      if (next.kind === 'discovery') {
        if (!next.discoveryKey || !window.DISCOVERY_LIBRARY || !window.DISCOVERY_LIBRARY[next.discoveryKey]) {
          continue;
        }
      } else if (!ensurePatternUrlForStitching(next.patternUrl || '')) {
        continue;
      }

      nameRegistry[next.patternNameKey] = next.id;
      merged.push(next);
      importedCount++;
    }

    await patternLibraryState.adapter.bulkUpsert(merged);
    await loadPatternLibraryRecords();

    return {
      importedCount: importedCount,
      updatedCount: updatedCount,
      totalCount: patternLibraryState.records.length
    };
  }

  function setPatternLibraryDetailPatternId(patternId) {
    patternLibraryState.detailPatternId = String(patternId || '');
  }

  function getPatternLibraryDetailPatternId() {
    return patternLibraryState.detailPatternId;
  }

  function setPatternLibraryPendingExportPatternId(patternId) {
    patternLibraryState.pendingExportPatternId = String(patternId || '');
  }

  function getPatternLibraryPendingExportPatternId() {
    return patternLibraryState.pendingExportPatternId;
  }

  window.initializePatternLibrary = initializePatternLibrary;
  window.getPatternLibrarySnapshot = getPatternLibrarySnapshot;
  window.getPatternRecordById = getPatternRecordById;
  window.saveUserPatternFromCurrentState = saveUserPatternFromCurrentState;
  window.upsertDiscoveryPatternFromCurrentState = upsertDiscoveryPatternFromCurrentState;
  window.renameUserPattern = renameUserPattern;
  window.deleteUserPattern = deleteUserPattern;
  window.exportPatternLibraryToJsonFile = exportPatternLibraryToJsonFile;
  window.importPatternLibraryFromJsonText = importPatternLibraryFromJsonText;
  window.ensurePatternUrlForStitching = ensurePatternUrlForStitching;
  window.validatePatternName = validatePatternName;
  window.normalizePatternDescription = normalizePatternDescription;
  window.setPatternLibraryDetailPatternId = setPatternLibraryDetailPatternId;
  window.getPatternLibraryDetailPatternId = getPatternLibraryDetailPatternId;
  window.setPatternLibraryPendingExportPatternId = setPatternLibraryPendingExportPatternId;
  window.getPatternLibraryPendingExportPatternId = getPatternLibraryPendingExportPatternId;
})();
