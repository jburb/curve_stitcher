const triangulaExperience = Object.freeze({
  id: 'triangula',
  title: 'TrIAnguLa',
  defaultSongId: 'triangle',
  titleFontFamily: 'EiforyaTypeface',
  titleSvgPath: 'assets/images/experience_title_triangula.svg',
  strokeColor: '#256f7a',
  infoTitle: 'About Triangula',
  infoText: 'Triangula explores recursive triangle patterns inspired by Sierpinski structures. Zoom and iterate to discover repeating self-similarity.',
  narrationText: 'Welcome to Triangula. This world explores self-similar triangle growth and recursive geometry.',
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
});

window.triangulaExperience = triangulaExperience;
