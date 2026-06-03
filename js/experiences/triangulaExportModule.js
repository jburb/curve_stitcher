(function() {
  function createTriangulaExportModule(deps) {
    deps = deps || {};

    function buildTriangulaDesignSvgString() {
      var width = Math.round(deps.getViewSize().width);
      var height = Math.round(deps.getViewSize().height);
      var lines = [];
      var base = deps.getTriangulaBaseTriangle(1);
      var endDepth = deps.triangulaCountToDepth(deps.getTriangulaTargetCount());

      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
      lines.push('<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff"/>');

      lines.push(
        '<path d="' + deps.svgPathFromPoints(base) +
        '" fill="' + deps.colorToSvg(deps.getTriangulaFillColorForSlot(1, 0)) +
        '" stroke="#234b61" stroke-width="' + deps.formatSvgNumber(deps.getTriangulaConstructionMode() === 'cut' ? 1.7 : 1.1) +
        '" opacity="0.95"/>'
      );

      if (deps.getTriangulaConstructionMode() === 'cut') {
        for (var level = 1; level <= endDepth; level++) {
          var cutTriangles = [];
          deps.collectCutTrianglesAtDepth(base, level, 0, cutTriangles);
          for (var c = 0; c < cutTriangles.length; c++) {
            lines.push(
              '<path d="' + deps.svgPathFromPoints(cutTriangles[c].vertices) +
              '" fill="#ffffff" stroke="#ffffff" stroke-width="1.08" opacity="0.97"/>'
            );
          }
        }
      } else {
        for (var d = 1; d <= endDepth; d++) {
          var triangles = [];
          deps.collectTrianglesAtDepth(base, d, 0, 1, triangles);
          for (var t = 0; t < triangles.length; t++) {
            lines.push(
              '<path d="' + deps.svgPathFromPoints(triangles[t].vertices) +
              '" fill="' + deps.colorToSvg(deps.getTriangulaFillColorForSlot(triangles[t].slot, t)) +
              '" stroke="' + deps.colorToSvg(deps.getTriangulaStrokeColorForSlot(triangles[t].slot, t)) +
              '" stroke-width="' + deps.formatSvgNumber(Math.max(0.7, 1.3 - (d * 0.1))) +
              '" opacity="' + deps.formatSvgNumber(Math.max(0.45, 0.92 - (d * 0.08))) +
              '"/>'
            );
          }
        }
      }

      lines.push('</svg>');
      return lines.join('\n');
    }

    function buildTriangulaGuideText(fileBaseName, options) {
      options = options || {};
      var now = new Date();
      var startDepth = deps.triangulaCountToDepth(deps.getTriangulaStartCount());
      var targetDepth = deps.triangulaCountToDepth(deps.getTriangulaTargetCount());
      var lines = [];
      var bandColors = deps.getTriangulaBandColors();
      var threads = deps.getThreads();

      lines.push('curve_stitcher Triangula instructions');
      lines.push('Generated: ' + now.toISOString());
      lines.push('Export name: ' + fileBaseName);
      lines.push('');
      lines.push('Parameters');
      lines.push('Experience: Triangula');
      lines.push('Construction mode: ' + deps.getTriangulaConstructionMode());
      lines.push('Fractal mode: ' + deps.getTriangulaFractalMode());
      lines.push('Canvas fit mode: ' + deps.getTriangulaFitMode());
      lines.push('Color mode: ' + deps.getTriangulaColorMode());
      lines.push('Start triangles: ' + String(deps.getTriangulaStartCount()) + ' (depth ' + String(startDepth) + ')');
      lines.push('Target triangles: ' + String(deps.getTriangulaTargetCount()) + ' (depth ' + String(targetDepth) + ')');
      lines.push('Band 1 color: ' + String(bandColors.band1));
      lines.push('Band 2 color: ' + String(bandColors.band2));
      lines.push('Band 4 color: ' + String(bandColors.band4));
      lines.push('Rainbow source color: ' + String(threads[0] ? threads[0].color : bandColors.band1));
      lines.push('');
      lines.push('Reconstruction');
      lines.push('1. Open Triangula in curve_stitcher.');
      lines.push('2. Set mode, color mode, and start/target values to match parameters above.');
      lines.push('3. Apply band/rainbow colors as listed above.');
      lines.push('4. Exported SVG captures the fully completed target-state triangle composition with colors.');
      lines.push('');
      lines.push('Notes');
      lines.push('- Triangula exports intentionally skip preview PNG files.');
      lines.push('- Include instructions controls whether this file is exported.');

      return lines.join('\n');
    }

    return {
      buildTriangulaDesignSvgString: buildTriangulaDesignSvgString,
      buildTriangulaGuideText: buildTriangulaGuideText
    };
  }

  window.createTriangulaExportModule = createTriangulaExportModule;
})();
