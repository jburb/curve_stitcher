window.DISCOVERY_LIBRARY = Object.freeze({
  triangle: {
    title: 'Equilateral Triangle',
    icon: '🔺',
    description: 'Unlocked the path to Triangula.',
    experienceName: 'Triangula',
    songId: 'triangle',
    passphrase: 'Holes of three and step of one do this tri-angled creature make, if they\'re set in even shape.',
    passphraseInputEnabled: true,
    discoveryRule: {
      detectorId: 'equilateralTriangle',
      detectorScope: 'thread',
      enabledFlag: null
    }
  },
  square: {
    title: 'Square',
    icon: '⬜',
    description: 'Unlocked the path to Squarus.',
    experienceName: 'Squarus',
    songId: 'square',
    passphrase: 'Square passphrase placeholder.',
    passphraseInputEnabled: false,
    discoveryRule: {
      detectorId: 'square',
      detectorScope: 'thread',
      enabledFlag: null
    }
  },
  rosette: {
    title: 'Mystic Rose / Rosette',
    icon: '✺',
    description: 'Unlocked the path to Mashrabiya.',
    experienceName: 'Mashrabiya',
    songId: 'rosette',
    passphrase: 'Rosette passphrase placeholder.',
    passphraseInputEnabled: false,
    discoveryRule: {
      detectorId: 'rosetteCandidate',
      detectorScope: 'global',
      enabledFlag: 'rosetteDiscovery'
    }
  }
});

window.DISCOVERY_FEATURE_FLAGS = Object.freeze({
  rosetteDiscovery: false
});
