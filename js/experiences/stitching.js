const stitchingExperience = Object.freeze({
  id: 'stitching',
  title: 'Stitching',
  defaultSongId: 'bach',
  titleFontFamily: 'MadeLikesScript',
  titleSvgPath: 'assets/images/experience_title_stitching.svg',
  strokeColor: '#1f4f94',
  infoTitle: 'About Stitching',
  infoText: 'Stitching turns math into thread motion. Pick a shape, set holes, then stitch by adding or multiplying to explore geometric patterns and unlock new worlds.',
  narrationText: 'Welcome to Stitching. Here, arithmetic becomes thread paths. Adjust holes, choose add or multiply, and watch geometry emerge one stitch at a time.',
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
});

window.stitchingExperience = stitchingExperience;
