const squarusExperience = Object.freeze({
  id: 'squarus',
  title: 'Squarus',
  defaultSongId: 'square',
  titleFontFamily: 'Nunito',
  titleSvgPath: '',
  strokeColor: '#5a4bb2',
  infoTitle: 'About Squarus',
  infoText: 'Squarus will focus on polyonimo generation through square counts, with parametric exploration of filling shapes using polyonimoes at different square-count levels.',
  narrationText: 'Welcome to Squarus. This upcoming world centers on polyonimo generation by square counts, with parametric exploration of filling shapes using different square-count polyonimoes.',
  uiProfile: {
    allowedShapes: ['square'],
    fixedShape: 'square',
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

window.squarusExperience = squarusExperience;
