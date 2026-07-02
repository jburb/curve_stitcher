const { test, expect } = require('@playwright/test');

test.describe('StitchLab regressions', () => {
  test('stitching shape selection persists to URL and survives refresh', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.locator('.shape-btn[data-shape="triangle"]').click();

    await expect.poll(() => new URL(page.url()).searchParams.get('stitchingShape')).toBe('triangle');

    await page.reload();

    await expect(page.locator('.shape-btn[data-shape="triangle"]')).toHaveClass(/active/);
    await expect.poll(() => new URL(page.url()).searchParams.get('stitchingShape')).toBe('triangle');
  });

  test('export flow completes without export failure alert', async ({ page }) => {
    const dialogMessages = [];

    page.on('dialog', async (dialog) => {
      dialogMessages.push(dialog.message());
      await dialog.dismiss();
    });

    await page.goto('/stitchlab.html');

    await page.locator('#gear').click();
    await page.locator('#advanced-export-svg').click();

    const exportModal = page.locator('#export-options-modal');
    await expect(exportModal).toHaveClass(/open/);

    await page.locator('#export-confirm-btn').click();

    await expect(exportModal).not.toHaveClass(/open/);
    await page.waitForTimeout(500);
    await expect(dialogMessages, 'Unexpected export alert dialog(s)').toEqual([]);
  });

  test('squarus squares selection snaps pieces placed to max for that polyomino set', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=squarus');

    const pieceCountSlider = page.locator('#squarus-piece-count');
    await expect(pieceCountSlider).toBeVisible();

    await page.evaluate(() => {
      const slider = document.getElementById('squarus-piece-count');
      if (!slider) return;
      slider.value = '1';
      const inputEvt = document.createEvent('Event');
      inputEvt.initEvent('input', true, true);
      slider.dispatchEvent(inputEvt);
      const changeEvt = document.createEvent('Event');
      changeEvt.initEvent('change', true, true);
      slider.dispatchEvent(changeEvt);
    });

    await page.selectOption('#squarus-order-inline', '4');

    await expect.poll(() => {
      return page.evaluate(() => {
        const slider = document.getElementById('squarus-piece-count');
        if (!slider) return false;
        return slider.value === slider.max;
      });
    }).toBe(true);
  });

  test('experience switching updates visible control groups correctly', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await expect(page.locator('#triangula-start-block')).toBeHidden();
    await expect(page.locator('#squarus-order-block')).toBeHidden();

    await page.evaluate(() => window.setCurrentExperience('triangula'));
    await expect(page.locator('#triangula-start-block')).toBeVisible();
    await expect(page.locator('#squarus-order-block')).toBeHidden();
    await expect(page.locator('.shape-btn[data-shape="triangle"]')).toHaveClass(/active/);

    await page.evaluate(() => window.setCurrentExperience('squarus'));
    await expect(page.locator('#squarus-order-block')).toBeVisible();
    await expect(page.locator('#triangula-start-block')).toBeHidden();
    await expect(page.locator('.shape-btn[data-shape="square"]')).toHaveClass(/active/);

    await page.evaluate(() => window.setCurrentExperience('stitching'));
    await expect(page.locator('#squarus-order-block')).toBeHidden();
    await expect(page.locator('#triangula-start-block')).toBeHidden();
  });

  test('basic and advanced shared controls stay in sync', async ({ page }) => {
    await page.goto('/stitchlab.html');
    await page.locator('#gear').click();

    await page.evaluate(() => {
      const slider = document.getElementById('holes');
      if (!slider) return;
      slider.value = '42';
      const inputEvt = document.createEvent('Event');
      inputEvt.initEvent('input', true, true);
      slider.dispatchEvent(inputEvt);
      const changeEvt = document.createEvent('Event');
      changeEvt.initEvent('change', true, true);
      slider.dispatchEvent(changeEvt);
    });
    await expect(page.locator('#advanced-holes-number')).toHaveValue('42');

    await page.locator('#advanced-holes-number').fill('36');
    await page.locator('#advanced-holes-number').press('Tab');
    await expect(page.locator('#holes')).toHaveValue('36');

    await page.locator('#kid-tempo-fast').click();
    await expect(page.locator('#advanced-tempo')).toHaveValue('252');

    await page.selectOption('#advanced-tempo', '84');
    await expect(page.locator('#kid-tempo-slow')).toHaveClass(/is-active/);
  });

  test('basic palette custom dropper applies selected thread color', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.evaluate(() => {
      const input = document.getElementById('palette-custom-color-input');
      if (!input) return;
      input.value = '#123abc';
      const inputEvt = document.createEvent('Event');
      inputEvt.initEvent('input', true, true);
      input.dispatchEvent(inputEvt);
    });

    await expect.poll(() => {
      return page.evaluate(() => {
        const index = (typeof window.selectedThreadIndex === 'number' && window.selectedThreadIndex >= 0)
          ? window.selectedThreadIndex
          : 0;
        const thread = window.threads && window.threads[index];
        return thread ? String(thread.color || '').toLowerCase() : null;
      });
    }).toBe('#123abc');
  });

  test('acknowledgments viewer opens from about controls and cycles styles by line', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.locator('#experience-info-toggle').click();
    await page.locator('#experience-acknowledgments-toggle').click();

    const modal = page.locator('#acknowledgments-modal');
    await expect(modal).toHaveClass(/open/);

    await expect(page.locator('#acknowledgments-progress')).toContainText('1 /');
    await expect(page.locator('#acknowledgments-style-chip')).toHaveCount(0);

    await page.locator('#acknowledgments-next-btn').click();
    await expect(page.locator('#acknowledgments-progress')).toContainText('2 /');

    await page.locator('#acknowledgments-next-btn').click();
    await expect(page.locator('#acknowledgments-progress')).toContainText('3 /');
  });

  test('acknowledgments viewer opens from About actions', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.locator('#experience-info-toggle').click();
    const aboutFrame = page.frameLocator('#experience-info-html');
    const documentAction = aboutFrame.locator('[data-open-acknowledgments]');
    const panelAction = page.locator('#experience-acknowledgments-toggle');

    if (await documentAction.count()) {
      await expect(documentAction.first()).toBeVisible();
      await documentAction.first().click();
    } else {
      await expect(panelAction).toBeVisible();
      await panelAction.click();
    }

    await expect(page.locator('#acknowledgments-modal')).toHaveClass(/open/);
    await expect(page.locator('#acknowledgments-progress')).toContainText('1 /');
  });

  test('advanced pane stays open during thread-card interactions', async ({ page }) => {
    await page.goto('/stitchlab.html');
    await page.locator('#gear').click();

    const advancedPanel = page.locator('#advanced-panel');
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('#thread-controls .thread-card strong').first().click();
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('#start-hole-number-0').fill('2');
    await page.locator('#start-hole-number-0').press('Tab');
    await expect(advancedPanel).toHaveClass(/open/);

    await page.selectOption('#jump-mode-0', 'formula');
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('#use-preset-0').click();
    await expect(advancedPanel).toHaveClass(/open/);
  });

  test('advanced pane stays open for top and lower control bars, closes on canvas click', async ({ page }) => {
    await page.goto('/stitchlab.html');
    await page.locator('#gear').click();

    const advancedPanel = page.locator('#advanced-panel');
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('.shape-btn[data-shape="square"]').click();
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('#holes').click();
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('#jump').click();
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('#canvas-container').click();
    await expect(advancedPanel).not.toHaveClass(/open/);
  });

  test('squarus basic and advanced squares controls stay synchronized', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=squarus');
    await page.locator('#gear').click();

    await page.selectOption('#squarus-order-inline', '3');
    await expect(page.locator('#squarus-order')).toHaveValue('3');

    await page.selectOption('#squarus-order', '5');
    await expect(page.locator('#squarus-order-inline')).toHaveValue('5');
  });

  test('slider touchmove events are not canceled by global handlers', async ({ page }) => {
    await page.goto('/stitchlab.html');

    const touchMoveProbe = await page.evaluate(() => {
      const slider = document.getElementById('holes');
      if (!slider) {
        return { missingSlider: true };
      }

      const event = document.createEvent('Event');
      event.initEvent('touchmove', true, true);
      const dispatchResult = slider.dispatchEvent(event);

      return {
        missingSlider: false,
        defaultPrevented: event.defaultPrevented,
        dispatchResult
      };
    });

    expect(touchMoveProbe.missingSlider).toBe(false);
    expect(touchMoveProbe.defaultPrevented).toBe(false);
    expect(touchMoveProbe.dispatchResult).toBe(true);
  });

  test('playback remains operable after orientation-style viewport changes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/stitchlab.html');

    const animateBtn = page.locator('#animate');

    await animateBtn.click();
    await expect.poll(() => {
      return page.evaluate(() => window.animationPlaybackState);
    }).toBe('playing');

    await page.setViewportSize({ width: 844, height: 390 });
    await expect.poll(() => {
      return page.evaluate(() => window.animationPlaybackState);
    }).toBe('idle');
    await expect(animateBtn).toContainText('Play');

    await animateBtn.click();
    await expect.poll(() => {
      return page.evaluate(() => window.animationPlaybackState);
    }).toBe('playing');

    await animateBtn.click();
    await expect.poll(() => {
      return page.evaluate(() => window.animationPlaybackState);
    }).toBe('paused');
    await expect(animateBtn).toContainText('Resume');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => {
      return page.evaluate(() => window.animationPlaybackState);
    }).toBe('idle');
    await expect(animateBtn).toContainText('Play');

    await animateBtn.click();
    await expect.poll(() => {
      return page.evaluate(() => window.animationPlaybackState);
    }).toBe('playing');
  });

  test('mobile layout baseline remains usable at phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/stitchlab.html');

    await expect(page.locator('#shape-bar')).toBeVisible();
    await expect(page.locator('#canvas-container')).toBeVisible();
    await expect(page.locator('#sliders')).toBeVisible();

    const layoutProbe = await page.evaluate(() => {
      const shapeBar = document.getElementById('shape-bar');
      const canvas = document.getElementById('canvas-container');
      const sliders = document.getElementById('sliders');
      if (!shapeBar || !canvas || !sliders) {
        return { ok: false, reason: 'missing-elements' };
      }

      const shapeRect = shapeBar.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const slidersRect = sliders.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const body = document.body;
      const root = document.documentElement;
      const maxScrollWidth = Math.max(body.scrollWidth, root.scrollWidth);

      return {
        ok: true,
        shapeTop: shapeRect.top,
        canvasHeight: canvasRect.height,
        slidersBottom: slidersRect.bottom,
        viewportHeight,
        viewportWidth,
        maxScrollWidth
      };
    });

    expect(layoutProbe.ok).toBe(true);
    expect(layoutProbe.shapeTop).toBeGreaterThanOrEqual(0);
    expect(layoutProbe.canvasHeight).toBeGreaterThanOrEqual(119);
    expect(layoutProbe.slidersBottom).toBeLessThanOrEqual(layoutProbe.viewportHeight + 2);
    expect(layoutProbe.maxScrollWidth).toBeLessThanOrEqual(layoutProbe.viewportWidth + 2);
  });

  test('mashrabiya debug SVG export closes sequence stitch paths', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=mashrabiya');

    const svgProbe = await page.evaluate(() => {
      if (typeof window.buildCurrentDesignSvgString !== 'function') {
        return { ok: false, reason: 'missing-export-builder' };
      }

      const svgText = window.buildCurrentDesignSvgString({ mashrabiyaIncludeDebugLabels: true });
      if (typeof svgText !== 'string' || !svgText.length) {
        return { ok: false, reason: 'empty-svg' };
      }

      var parser = new DOMParser();
      var doc = parser.parseFromString(svgText, 'image/svg+xml');
      var paths = Array.prototype.slice.call(doc.querySelectorAll('path'));
      var sequencePaths = [];

      function parseMovesAndLines(d) {
        var tokens = String(d || '').trim().match(/[ML]\s*-?\d*\.?\d+\s+-?\d*\.?\d+/gi) || [];
        return tokens.map(function(token) {
          var parts = token.trim().split(/\s+/);
          return {
            cmd: parts[0],
            x: Number(parts[1]),
            y: Number(parts[2])
          };
        });
      }

      function almostEqual(a, b) {
        return Math.abs(Number(a) - Number(b)) <= 1e-6;
      }

      for (var i = 0; i < paths.length; i++) {
        var d = paths[i].getAttribute('d') || '';
        if (d.indexOf('Z') >= 0 || d.indexOf('z') >= 0) {
          continue;
        }
        var points = parseMovesAndLines(d);
        if (points.length < 3) {
          continue;
        }
        var first = points[0];
        var last = points[points.length - 1];
        var isClosedByEndpoint = almostEqual(first.x, last.x) && almostEqual(first.y, last.y);
        sequencePaths.push({
          index: i,
          segmentCount: points.length - 1,
          isClosedByEndpoint: isClosedByEndpoint
        });
      }

      var longSequencePaths = sequencePaths.filter(function(entry) {
        return entry.segmentCount >= 4;
      });

      return {
        ok: true,
        longSequencePathCount: longSequencePaths.length,
        allLongSequencesClosed: longSequencePaths.every(function(entry) { return entry.isClosedByEndpoint; }),
        debug: longSequencePaths.slice(0, 3)
      };
    });

    expect(svgProbe.ok).toBe(true);
    expect(svgProbe.longSequencePathCount).toBeGreaterThanOrEqual(2);
    expect(svgProbe.allLongSequencesClosed).toBe(true);
  });

  test('mashrabiya fold 8 classification and fills match expected point IDs and area coverage', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=mashrabiya&mashrabiyaFold=8');

    const probe = await page.evaluate(() => {
      function polyArea(vertices) {
        if (!vertices || vertices.length < 3) return 0;
        var sum = 0;
        for (var i = 0; i < vertices.length; i++) {
          var p = vertices[i];
          var q = vertices[(i + 1) % vertices.length];
          sum += (p.x * q.y) - (q.x * p.y);
        }
        return Math.abs(sum) * 0.5;
      }

      var expectedPointIds = [41, 42, 46, 48, 49, 52, 54, 55];
      var expectedPointIdSet = Object.create(null);
      for (var ep = 0; ep < expectedPointIds.length; ep++) {
        expectedPointIdSet[String(expectedPointIds[ep])] = true;
      }

      var previousFold = window.mashrabiyaFold;
      window.mashrabiyaFold = 8;
      var geometry = window.buildMashrabiyaRosetteGeometry(window.mashrabiyaFold, window.mashrabiyaGeometryMode);
      window.mashrabiyaFold = previousFold;

      var faces = geometry.faceDiagnostics && geometry.faceDiagnostics.faces ? geometry.faceDiagnostics.faces : [];
      var pointFaces = [];
      var starFaces = [];
      var petalFaces = [];
      for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        if (face.classification === 'point') pointFaces.push(face);
        if (face.classification === 'star') starFaces.push(face);
        if (face.classification === 'petal') petalFaces.push(face);
      }

      var pointIds = pointFaces.map(function(face) { return face.id; }).sort(function(a, b) { return a - b; });
      var unexpectedPointIds = pointIds.filter(function(id) { return !expectedPointIdSet[String(id)]; });
      var missingPointIds = expectedPointIds.filter(function(id) {
        return pointIds.indexOf(id) < 0;
      });

      var pointFaceArea = pointFaces.reduce(function(total, face) { return total + (face.areaAbs || 0); }, 0);
      var pointRegionArea = (geometry.pointRegions || []).reduce(function(total, region) {
        return total + polyArea(region);
      }, 0);
      var petalFaceArea = petalFaces.reduce(function(total, face) { return total + (face.areaAbs || 0); }, 0);
      var petalRegionArea = (geometry.petals || []).reduce(function(total, region) {
        return total + polyArea(region);
      }, 0);
      var starFaceArea = starFaces.reduce(function(total, face) { return total + (face.areaAbs || 0); }, 0);
      var starRegionArea = (geometry.starRegions || []).reduce(function(total, region) {
        return total + polyArea(region);
      }, 0);

      return {
        pointIds: pointIds,
        unexpectedPointIds: unexpectedPointIds,
        missingPointIds: missingPointIds,
        counts: {
          pointFaces: pointFaces.length,
          pointRegions: (geometry.pointRegions || []).length,
          petalFaces: petalFaces.length,
          petalRegions: (geometry.petals || []).length,
          starFaces: starFaces.length,
          starRegions: (geometry.starRegions || []).length
        },
        areaRatios: {
          point: pointFaceArea ? (pointRegionArea / pointFaceArea) : null,
          petal: petalFaceArea ? (petalRegionArea / petalFaceArea) : null,
          star: starFaceArea ? (starRegionArea / starFaceArea) : null
        }
      };
    });

    expect(probe.missingPointIds).toEqual([]);
    expect(probe.unexpectedPointIds).toEqual([]);
    expect(probe.counts.pointFaces).toBe(8);
    expect(probe.counts.pointRegions).toBe(8);
    expect(probe.counts.petalFaces).toBe(16);
    expect(probe.counts.petalRegions).toBe(16);
    expect(probe.counts.starFaces).toBe(9);
    expect(probe.counts.starRegions).toBe(9);
    expect(probe.areaRatios.point).toBeCloseTo(1, 6);
    expect(probe.areaRatios.petal).toBeCloseTo(1, 6);
    expect(probe.areaRatios.star).toBeCloseTo(1, 6);
  });

  test('mashrabiya fold 8 and 12 fills are invariant to debug-label toggle', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=mashrabiya');

    const probe = await page.evaluate(() => {
      function polyArea(vertices) {
        if (!vertices || vertices.length < 3) return 0;
        var sum = 0;
        for (var i = 0; i < vertices.length; i++) {
          var p = vertices[i];
          var q = vertices[(i + 1) % vertices.length];
          sum += (p.x * q.y) - (q.x * p.y);
        }
        return Math.abs(sum) * 0.5;
      }

      function snapshot(fold, debugEnabled) {
        var previousFold = window.mashrabiyaFold;
        var previousDebugEnabled = window.mashrabiyaDebugLabelsEnabled;
        window.mashrabiyaFold = fold;
        window.mashrabiyaDebugLabelsEnabled = !!debugEnabled;
        var geometry = window.buildMashrabiyaRosetteGeometry(window.mashrabiyaFold, window.mashrabiyaGeometryMode);
        window.mashrabiyaFold = previousFold;
        window.mashrabiyaDebugLabelsEnabled = previousDebugEnabled;

        var faces = geometry.faceDiagnostics && geometry.faceDiagnostics.faces ? geometry.faceDiagnostics.faces : [];
        var pointFaces = faces.filter(function(face) { return face.classification === 'point'; });
        var petalFaces = faces.filter(function(face) { return face.classification === 'petal'; });
        var starFaces = faces.filter(function(face) { return face.classification === 'star'; });

        var pointFaceArea = pointFaces.reduce(function(total, face) { return total + (face.areaAbs || 0); }, 0);
        var pointRegionArea = (geometry.pointRegions || []).reduce(function(total, region) {
          return total + polyArea(region);
        }, 0);
        var petalFaceArea = petalFaces.reduce(function(total, face) { return total + (face.areaAbs || 0); }, 0);
        var petalRegionArea = (geometry.petals || []).reduce(function(total, region) {
          return total + polyArea(region);
        }, 0);

        return {
          fold: fold,
          summary: geometry.faceDiagnostics ? geometry.faceDiagnostics.summary : null,
          counts: {
            pointFaces: pointFaces.length,
            pointRegions: (geometry.pointRegions || []).length,
            petalFaces: petalFaces.length,
            petalRegions: (geometry.petals || []).length,
            starFaces: starFaces.length,
            starRegions: (geometry.starRegions || []).length
          },
          areaRatios: {
            point: pointFaceArea ? (pointRegionArea / pointFaceArea) : null,
            petal: petalFaceArea ? (petalRegionArea / petalFaceArea) : null
          }
        };
      }

      return {
        fold8: {
          debugOff: snapshot(8, false),
          debugOn: snapshot(8, true)
        },
        fold12: {
          debugOff: snapshot(12, false),
          debugOn: snapshot(12, true)
        }
      };
    });

    expect(probe.fold8.debugOff.summary).toEqual(probe.fold8.debugOn.summary);
    expect(probe.fold8.debugOff.counts).toEqual(probe.fold8.debugOn.counts);
    expect(probe.fold8.debugOff.areaRatios.point).toBeCloseTo(probe.fold8.debugOn.areaRatios.point, 9);
    expect(probe.fold8.debugOff.areaRatios.petal).toBeCloseTo(probe.fold8.debugOn.areaRatios.petal, 9);
    expect(probe.fold8.debugOff.areaRatios.point).toBeCloseTo(1, 6);
    expect(probe.fold8.debugOff.areaRatios.petal).toBeCloseTo(1, 6);

    expect(probe.fold12.debugOff.summary).toEqual(probe.fold12.debugOn.summary);
    expect(probe.fold12.debugOff.counts).toEqual(probe.fold12.debugOn.counts);
    expect(probe.fold12.debugOff.areaRatios.point).toBeCloseTo(probe.fold12.debugOn.areaRatios.point, 9);
    expect(probe.fold12.debugOff.areaRatios.petal).toBeCloseTo(probe.fold12.debugOn.areaRatios.petal, 9);
    expect(probe.fold12.debugOff.areaRatios.point).toBeCloseTo(1, 6);
    expect(probe.fold12.debugOff.areaRatios.petal).toBeCloseTo(1, 6);
  });
});
