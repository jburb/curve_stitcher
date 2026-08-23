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

