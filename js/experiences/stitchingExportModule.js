(function() {
  function createStitchingExportModule(deps) {
    deps = deps || {};

    function buildStitchingDesignSvgString(options) {
      options = options || {};
      var includeThreads = options.includeThreads !== false;

      deps.computePoints();

      var width = Math.round(deps.getViewSize().width);
      var height = Math.round(deps.getViewSize().height);
      var lines = [];

      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');

      if (deps.getBorderEnabled() && deps.getBorderIncludeInSvg()) {
        var borderGeometry = deps.getBorderGeometryForCurrentShape();
        if (borderGeometry && borderGeometry.outerSamples && borderGeometry.innerSamples) {
          var lineJoin = borderGeometry.isPolygon ? 'miter' : 'round';
          var outerPathData = deps.svgPathFromPoints(borderGeometry.outerSamples);
          var innerPathData = deps.svgPathFromPoints(borderGeometry.innerSamples);
          lines.push('<path d="' + outerPathData + '" fill="none" stroke="' + deps.getBorderStrokeColor() + '" stroke-width="' + deps.getBorderStrokeWidth() + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
          lines.push('<path d="' + innerPathData + '" fill="none" stroke="' + deps.getBorderStrokeColor() + '" stroke-width="' + deps.getBorderStrokeWidth() + '" stroke-linejoin="' + lineJoin + '" stroke-linecap="round" stroke-miterlimit="8"/>');
        }
      }

      var points = deps.getPoints();
      var threads = deps.getThreads();

      if (includeThreads) {
        for (var t = 0; t < threads.length; t++) {
          var thread = threads[t];
          var segments = deps.computeSegments(thread);
          for (var s = 0; s < segments.length; s++) {
            var fromPoint = points[segments[s][0]];
            var toPoint = points[segments[s][1]];
            if (!fromPoint || !toPoint) continue;

            var strokeColor = thread.color === 'rainbow'
              ? deps.colorToSvg(deps.rainbowColor(s / Math.max(1, segments.length)))
              : deps.colorToSvg(thread.color);

            lines.push(
              '<line x1="' + deps.formatSvgNumber(fromPoint.x) + '" y1="' + deps.formatSvgNumber(fromPoint.y) +
              '" x2="' + deps.formatSvgNumber(toPoint.x) + '" y2="' + deps.formatSvgNumber(toPoint.y) +
              '" stroke="' + strokeColor + '" stroke-width="' + deps.formatSvgNumber(thread.width) +
              '" stroke-linecap="round" stroke-linejoin="round"/>'
            );
          }
        }
      }

      for (var i = 0; i < points.length; i++) {
        lines.push('<circle cx="' + deps.formatSvgNumber(points[i].x) + '" cy="' + deps.formatSvgNumber(points[i].y) + '" r="3" fill="#333"/>');
      }

      if (deps.shouldShowHoleNumbersNow()) {
        var holeCount = parseInt(deps.getHolesValue(), 10);
        if (!isFinite(holeCount)) holeCount = deps.getDefaultHoles();
        var fontSize = deps.getHoleNumberFontSize(holeCount);
        var ccw = deps.signedAreaOfClosedPolyline(points) > 0;

        for (var j = 0; j < points.length; j++) {
          var text = String(j + 1);
          var outward = deps.getOutwardDirectionAtHole(j, ccw);
          var extent = deps.estimateTextExtentAlongDirection(text, fontSize);
          var metrics = deps.getHoleLabelOffsetFromExtent(extent, deps.getLabelBorderClearanceSvg(), deps.getLabelHoleClearanceSvg());

          if (metrics.maxOffset < metrics.minOffset) {
            var availableBand = deps.getBorderOuterGap() - (deps.getBorderStrokeWidth() * 0.5 + deps.getLabelBorderClearanceSvg()) - (3 + deps.getLabelHoleClearanceSvg());
            var reducedFont = Math.max(6, Math.min(fontSize, availableBand * 1.6));
            if (reducedFont < fontSize) {
              fontSize = reducedFont;
              extent = deps.estimateTextExtentAlongDirection(text, fontSize);
              metrics = deps.getHoleLabelOffsetFromExtent(extent, deps.getLabelBorderClearanceSvg(), deps.getLabelHoleClearanceSvg());
            }
          }

          var labelPos = points[j].add(outward.multiply(metrics.offset));
          lines.push(
            '<text x="' + deps.formatSvgNumber(labelPos.x) + '" y="' + deps.formatSvgNumber(labelPos.y) +
            '" fill="#555" font-size="' + deps.formatSvgNumber(fontSize) +
            '" font-family="Nunito, sans-serif" text-anchor="middle" dominant-baseline="middle">' +
            text +
            '</text>'
          );
        }
      }

      lines.push('</svg>');
      return lines.join('\n');
    }

    function buildStitchingGuideText(fileBaseName, options) {
      function getReadableStitchMode(mode) {
        if (mode === 'connect') return 'Multiplication';
        if (mode === 'sequence') return 'Step list';
        if (mode === 'formula') return 'Expression';
        return 'Addition';
      }

      function appendConnections(targetLines, segments) {
        for (var idx = 0; idx < segments.length; idx++) {
          targetLines.push('    ' + String(segments[idx][0] + 1) + ' -> ' + String(segments[idx][1] + 1));
        }
      }

      deps.computePoints();

      var lines = [];
      var now = new Date();
      lines.push('curve_stitcher manual stitching guide');
      lines.push('Generated: ' + now.toISOString());
      lines.push('Export name: ' + fileBaseName);
      lines.push('');
      lines.push('Parameters');
      lines.push('Global');
      lines.push('Shape: ' + deps.getCurrentShape());
      lines.push('Holes: ' + deps.getHolesValue());
      lines.push('Border enabled: ' + (deps.getBorderEnabled() ? 'yes' : 'no'));
      lines.push('Hole numbers visible in export: ' + (deps.shouldShowHoleNumbersNow() ? 'yes' : 'no'));
      lines.push('Include stitched threads in SVG: ' + (options.includeThreads ? 'yes' : 'no'));
      lines.push('');
      lines.push('Threads');

      var threads = deps.getThreads();

      for (var p = 0; p < threads.length; p++) {
        var paramThread = threads[p];
        deps.ensureThreadConnectConfig(paramThread);
        lines.push('Thread ' + (p + 1));
        lines.push('  Color: ' + String(paramThread.color));
        lines.push('  Size: ' + String(paramThread.width));
        lines.push('  Stitch mode: ' + getReadableStitchMode(paramThread.jumpMode));
        lines.push('  Add value: ' + String(paramThread.jump));
        if (paramThread.jumpMode === 'connect') {
          lines.push('  Multiply by: ' + String(paramThread.connectMultiplier));
          lines.push('  Offset: ' + String(paramThread.connectOffset));
        }
        if (paramThread.jumpMode === 'sequence') {
          lines.push('  Step list: ' + String(paramThread.jumpSequence || ''));
        }
        if (paramThread.jumpMode === 'formula') {
          lines.push('  Expression: ' + String(paramThread.jumpFormula || 'skip'));
        }
      }

      lines.push('');
      lines.push('Preparation');
      lines.push('1. Manufacture the board with shape "' + deps.getCurrentShape() + '" and ' + String(deps.getPoints().length) + ' numbered holes.');
      lines.push('2. Number holes clockwise as shown in the preview/export from 1 to ' + String(deps.getPoints().length) + '.');
      lines.push('3. Use one thread sequence section per listed thread below.');
      lines.push('');

      for (var i = 0; i < threads.length; i++) {
        var thread = threads[i];
        deps.ensureThreadConnectConfig(thread);
        var segments = deps.computeSegments(thread);
        var modeName = getReadableStitchMode(thread.jumpMode);
        lines.push('Thread ' + (i + 1));
        lines.push('  Mode: ' + modeName);
        lines.push('  Color: ' + String(thread.color));
        lines.push('  Width: ' + String(thread.width));

        if (thread.jumpMode === 'connect') {
          lines.push('  Formula: target = (' + String(thread.connectMultiplier) + ' × i + ' + String(thread.connectOffset) + ') mod ' + String(deps.getPoints().length));
        } else if (thread.jumpMode === 'sequence') {
          lines.push('  Step list: ' + String(thread.jumpSequence || '(empty, falls back to add value)'));
        } else if (thread.jumpMode === 'formula') {
          lines.push('  Expression: ' + String(thread.jumpFormula || 'skip'));
          lines.push('  Base add: ' + String(thread.jump));
        } else {
          lines.push('  Add value: ' + String(thread.jump));
        }

        lines.push('  Connections (hole labels):');
        appendConnections(lines, segments);
        lines.push('');
      }

      lines.push('Tips');
      lines.push('- Use the same hole numbering orientation as the exported guide image.');
      lines.push('- When a thread color is rainbow, follow the order shown in the export image rather than a single color.');
      lines.push('- For expression mode, keep integer outputs for stable hole-to-hole paths.');

      return lines.join('\n');
    }

    return {
      buildStitchingDesignSvgString: buildStitchingDesignSvgString,
      buildStitchingGuideText: buildStitchingGuideText
    };
  }

  window.createStitchingExportModule = createStitchingExportModule;
})();
