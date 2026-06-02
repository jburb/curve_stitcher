const mashrabiyaExperience = Object.freeze({
  id: 'mashrabiya',
  title: 'Mashrabiya',
  defaultSongId: 'rosette',
  titleFontFamily: 'Nunito',
  titleSvgPath: '',
  strokeColor: '#82511f',
  infoTitle: 'About Mashrabiya',
  infoText: 'Mashrabiya will open into Islamic rosette and lattice explorations built from radial symmetry.',
  narrationText: 'Welcome to Mashrabiya. This upcoming world explores radial rosette geometry and ornamental lattices.',
  uiProfile: {
    allowedShapes: ['star'],
    fixedShape: 'star',
    threadsEnabled: false,
    allowMultipleThreads: false,
    paletteMode: 'global',
    supportsHoleNumbers: false,
    supportsBorder: false,
    basicControls: {
      holes: false,
      stitchBy: false,
      add: false,
      multiply: false,
      width: false
    },
    advancedControls: {
      shape: true,
      border: false,
      holeNumbers: false,
      holesNumber: false,
      threads: false
    }
  }
});

window.mashrabiyaExperience = mashrabiyaExperience;
