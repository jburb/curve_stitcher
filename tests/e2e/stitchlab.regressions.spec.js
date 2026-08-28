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

  test('onboarding tour uses stitching-only intro and startup opt-out control', async ({ page }) => {
    await page.goto('/stitchlab.html');

    const onboardingProbe = await page.evaluate(() => {
      const readTourState = () => ({
        title: (document.getElementById('onboarding-tour-title') || {}).textContent || '',
        optOutHidden: !!((document.querySelector('.onboarding-tour-optout') || {}).hidden),
        optOutDisabled: !!((document.getElementById('onboarding-tour-optout') || {}).disabled),
        prevHidden: !!((document.getElementById('onboarding-tour-prev') || {}).hidden),
        prevDisabled: !!((document.getElementById('onboarding-tour-prev') || {}).disabled),
        nextHidden: !!((document.getElementById('onboarding-tour-next') || {}).hidden),
        nextDisabled: !!((document.getElementById('onboarding-tour-next') || {}).disabled),
        hearHidden: !!((document.getElementById('onboarding-tour-hear') || {}).hidden),
        hearPressed: ((document.getElementById('onboarding-tour-hear') || {}).getAttribute || function() { return null; }).call(document.getElementById('onboarding-tour-hear'), 'aria-pressed'),
        hearLabel: (document.getElementById('onboarding-tour-hear') || {}).textContent || '',
        hearAllHidden: !!((document.getElementById('onboarding-tour-hear-all') || {}).hidden),
        hearAllPressed: ((document.getElementById('onboarding-tour-hear-all') || {}).getAttribute || function() { return null; }).call(document.getElementById('onboarding-tour-hear-all'), 'aria-pressed'),
        hearAllLabel: (document.getElementById('onboarding-tour-hear-all') || {}).textContent || ''
      });

      if (typeof window.setCurrentExperience !== 'function' || typeof window.startOnboardingTour !== 'function') {
        return { missingHooks: true };
      }

      window.setCurrentExperience('triangula', { suppressUrlSync: true });
      window.startOnboardingTour();
      const triangula = readTourState();
      var triangulaNext = document.getElementById('onboarding-tour-next');
      if (triangulaNext) triangulaNext.click();
      const triangulaAfterNext = readTourState();

      window.setCurrentExperience('stitching', { suppressUrlSync: true });
      window.startOnboardingTour();
      const stitching = readTourState();

      var hearBtn = document.getElementById('onboarding-tour-hear');
      var hearAllBtn = document.getElementById('onboarding-tour-hear-all');

      if (hearBtn) hearBtn.click();
      const stitchingHearSingleActive = readTourState();

      if (hearBtn) hearBtn.click();
      const stitchingHearSingleStopped = readTourState();

      if (hearAllBtn) hearAllBtn.click();
      const stitchingHearAllActive = readTourState();

      if (hearBtn) hearBtn.click();
      const stitchingAfterStopCurrent = readTourState();

      if (hearAllBtn) hearAllBtn.click();
      const stitchingHearAllStopped = readTourState();

      var stitchingNext = document.getElementById('onboarding-tour-next');
      if (stitchingNext) stitchingNext.click();
      const stitchingAfterNext = readTourState();

      window.startOnboardingTour({ autoplay: true });
      const stitchingAutoplay = readTourState();

      return {
        missingHooks: false,
        triangula,
        triangulaAfterNext,
        stitching,
        stitchingHearSingleActive,
        stitchingHearSingleStopped,
        stitchingHearAllActive,
        stitchingAfterStopCurrent,
        stitchingHearAllStopped,
        stitchingAfterNext,
        stitchingAutoplay
      };
    });

    expect(onboardingProbe.missingHooks).toBe(false);
    expect(onboardingProbe.triangula.title).toBe('Play Animation');
    expect(onboardingProbe.triangula.optOutHidden).toBe(true);
    expect(onboardingProbe.triangula.optOutDisabled).toBe(true);
    expect(onboardingProbe.triangula.prevHidden).toBe(true);
    expect(onboardingProbe.triangula.prevDisabled).toBe(true);
    expect(onboardingProbe.triangula.nextHidden).toBe(false);
    expect(onboardingProbe.triangula.nextDisabled).toBe(false);
    expect(onboardingProbe.triangulaAfterNext.prevHidden).toBe(false);
    expect(onboardingProbe.triangulaAfterNext.prevDisabled).toBe(false);

    expect(onboardingProbe.stitching.title).toBe('Welcome!');
    expect(onboardingProbe.stitching.optOutHidden).toBe(false);
    expect(onboardingProbe.stitching.optOutDisabled).toBe(false);
    expect(onboardingProbe.stitching.prevHidden).toBe(true);
    expect(onboardingProbe.stitching.prevDisabled).toBe(true);
    expect(onboardingProbe.stitching.nextHidden).toBe(false);
    expect(onboardingProbe.stitching.nextDisabled).toBe(false);
    expect(onboardingProbe.stitching.hearPressed).toBe('false');
    expect(onboardingProbe.stitching.hearLabel).toContain('Hear this');
    expect(onboardingProbe.stitching.hearHidden).toBe(false);
    expect(onboardingProbe.stitching.hearAllPressed).toBe('false');
    expect(onboardingProbe.stitching.hearAllLabel).toContain('Hear all');
    expect(onboardingProbe.stitching.hearAllHidden).toBe(false);

    expect(onboardingProbe.stitchingHearSingleActive.hearPressed).toBe('true');
    expect(onboardingProbe.stitchingHearSingleActive.hearLabel).toContain('Stop');
    expect(onboardingProbe.stitchingHearSingleActive.hearHidden).toBe(false);
    expect(onboardingProbe.stitchingHearSingleActive.hearAllHidden).toBe(true);

    expect(onboardingProbe.stitchingHearSingleStopped.hearPressed).toBe('false');
    expect(onboardingProbe.stitchingHearSingleStopped.hearLabel).toContain('Hear this');
    expect(onboardingProbe.stitchingHearSingleStopped.hearHidden).toBe(false);
    expect(onboardingProbe.stitchingHearSingleStopped.hearAllHidden).toBe(false);

    expect(onboardingProbe.stitchingHearAllActive.hearAllPressed).toBe('true');
    expect(onboardingProbe.stitchingHearAllActive.hearAllLabel).toContain('Stop all');
    expect(onboardingProbe.stitchingHearAllActive.hearHidden).toBe(true);
    expect(onboardingProbe.stitchingHearAllActive.hearAllHidden).toBe(false);
    expect(onboardingProbe.stitchingHearAllActive.nextHidden).toBe(true);
    expect(onboardingProbe.stitchingHearAllActive.nextDisabled).toBe(true);
    expect(onboardingProbe.stitchingHearAllActive.prevHidden).toBe(true);

    expect(onboardingProbe.stitchingAfterStopCurrent.hearAllPressed).toBe('true');

    expect(onboardingProbe.stitchingHearAllStopped.hearAllPressed).toBe('false');
    expect(onboardingProbe.stitchingHearAllStopped.hearAllLabel).toContain('Hear all');
    expect(onboardingProbe.stitchingHearAllStopped.prevHidden).toBe(true);
    expect(onboardingProbe.stitchingHearAllStopped.nextHidden).toBe(false);
    expect(onboardingProbe.stitchingHearAllStopped.nextDisabled).toBe(false);

    expect(onboardingProbe.stitchingAfterNext.prevHidden).toBe(false);
    expect(onboardingProbe.stitchingAfterNext.prevDisabled).toBe(false);

    expect(onboardingProbe.stitchingAutoplay.prevHidden).toBe(true);
    expect(onboardingProbe.stitchingAutoplay.prevDisabled).toBe(true);
    expect(onboardingProbe.stitchingAutoplay.nextHidden).toBe(true);
    expect(onboardingProbe.stitchingAutoplay.nextDisabled).toBe(true);
    expect(onboardingProbe.stitchingAutoplay.hearHidden).toBe(true);
    expect(onboardingProbe.stitchingAutoplay.hearAllPressed).toBe('true');
    expect(onboardingProbe.stitchingAutoplay.hearAllLabel).toContain('Stop all');
  });

  test('onboarding autoplay preference and hear-all stop-all flow work across reloads', async ({ page }) => {
    const ONBOARDING_STATE_KEY = 'stitchlab.onboarding.v1';

    await page.goto('/stitchlab.html');
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, ONBOARDING_STATE_KEY);

    await page.goto('/stitchlab.html');

    const tour = page.locator('#onboarding-tour');
    const quickStart = page.locator('#onboarding-quickstart');
    const hearAll = page.locator('#onboarding-tour-hear-all');
    const nextBtn = page.locator('#onboarding-tour-next');
    const optOut = page.locator('#onboarding-tour-optout');
    const endBtn = page.locator('#onboarding-tour-skip');

    await expect(tour).toBeVisible({ timeout: 12000 });
    await expect(hearAll).toHaveAttribute('aria-pressed', 'true');
    await expect(hearAll).toContainText('Stop all');

    await hearAll.click();
    await expect(hearAll).toHaveAttribute('aria-pressed', 'false');
    await expect(hearAll).toContainText('Hear all');
    await expect(nextBtn).toBeVisible();

    await page.evaluate((key) => {
      window.localStorage.setItem(key, JSON.stringify({
        quickStartDismissed: false,
        tourCompleted: false,
        startupTutorialOptOut: true
      }));
    }, ONBOARDING_STATE_KEY);

    await page.goto('/stitchlab.html');
    await expect(tour).toBeHidden();
    await expect(quickStart).toBeVisible();

    await page.evaluate((key) => {
      window.localStorage.setItem(key, JSON.stringify({
        quickStartDismissed: false,
        tourCompleted: false,
        startupTutorialOptOut: false
      }));
    }, ONBOARDING_STATE_KEY);

    await page.goto('/stitchlab.html');
    await expect(tour).toBeVisible();
    await expect(hearAll).toHaveAttribute('aria-pressed', 'true');
    await expect(hearAll).toContainText('Stop all');

    await hearAll.click();
    await expect(hearAll).toHaveAttribute('aria-pressed', 'false');

    await optOut.check();
    await endBtn.click();
    await page.goto('/stitchlab.html');
    await expect(tour).toBeHidden();
    await expect(quickStart).toBeHidden();
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

    await page.selectOption('#jump-mode-0', 'fixed');
    await expect(page.locator('#start-hole-number-0')).toBeVisible();
    await page.locator('#start-hole-number-0').fill('2');
    await page.locator('#start-hole-number-0').press('Tab');
    await expect(advancedPanel).toHaveClass(/open/);

    await page.selectOption('#jump-mode-0', 'sequence');
    await expect(advancedPanel).toHaveClass(/open/);

    await page.locator('#jump-sequence-0').fill('2,3,5,8');
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

    await page.selectOption('#kid-stitch-by', 'add');
    await expect(page.locator('#jump')).toBeVisible();
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

    await expect.poll(() => {
      return page.evaluate(() => window.animationPlaybackState);
    }).toBe('idle');

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

    // Keep a deterministic control stack height for viewport assertions.
    await page.selectOption('#kid-stitch-by', 'add');

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

  test('list type variants produce the expected stitch routing', async ({ page }) => {
    await page.goto('/stitchlab.html');

    const probe = await page.evaluate(() => {
      function makeThread(options) {
        options = options || {};
        return {
          jump: Number(options.jump || 1),
          width: Number(options.width || 2),
          color: String(options.color || '#1982c4'),
          solidColor: String(options.solidColor || '#1982c4'),
          startHole: Number(options.startHole || 1),
          sequence: null,
          jumpMode: String(options.jumpMode || 'fixed'),
          jumpFormula: String(options.jumpFormula || 'skip'),
          jumpSequence: String(options.jumpSequence || ''),
          jumpSequenceMode: String(options.jumpSequenceMode || 'holes'),
          connectMultiplier: Number(options.connectMultiplier || 2),
          connectOffset: Number(options.connectOffset || 0),
          frameMode: String(options.frameMode || 'outer')
        };
      }

      function setHoleCount(value) {
        if (!window.holesSlider) return;
        window.holesSlider.value = String(value);
        var inputEvt = document.createEvent('Event');
        inputEvt.initEvent('input', true, true);
        window.holesSlider.dispatchEvent(inputEvt);
        var changeEvt = document.createEvent('Event');
        changeEvt.initEvent('change', true, true);
        window.holesSlider.dispatchEvent(changeEvt);
      }

      setHoleCount(10);
      if (typeof window.computePoints === 'function') {
        window.computePoints();
      }

      var holeListThread = makeThread({
        jumpMode: 'sequence',
        jumpSequenceMode: 'holes',
        jumpSequence: '1,1,2,3,5,8',
        startHole: 7
      });

      var stepListThread = makeThread({
        jumpMode: 'sequence',
        jumpSequenceMode: 'steps',
        jumpSequence: '1,2,3',
        startHole: 1
      });

      return {
        holeListSegments: (window.computeSegments(holeListThread) || []).slice(0, 8),
        stepListSegments: (window.computeSegments(stepListThread) || []).slice(0, 8)
      };
    });

    expect(probe.holeListSegments).toEqual([
      [0, 0],
      [0, 1],
      [1, 2],
      [2, 4],
      [4, 7]
    ]);

    expect(probe.stepListSegments).toEqual([
      [0, 1],
      [1, 3],
      [3, 6],
      [6, 7],
      [7, 9],
      [9, 2],
      [2, 0]
    ]);
  });

  test('start hole is hidden and ignored for list mode with Holes list type', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.selectOption('#kid-stitch-by', 'sequence');
    await page.selectOption('#kid-sequence-mode', 'holes');

    await expect(page.locator('#start-hole-block')).toBeHidden();

    const probe = await page.evaluate(() => {
      function makeThread(startHole) {
        return {
          jump: 1,
          width: 2,
          color: '#1982c4',
          solidColor: '#1982c4',
          startHole: startHole,
          sequence: null,
          jumpMode: 'sequence',
          jumpFormula: 'skip',
          jumpSequence: '1,1,2,3,5,8',
          jumpSequenceMode: 'holes',
          connectMultiplier: 2,
          connectOffset: 0,
          frameMode: 'outer'
        };
      }

      if (window.holesSlider) {
        window.holesSlider.value = '10';
      }
      if (typeof window.computePoints === 'function') {
        window.computePoints();
      }

      var a = window.computeSegments(makeThread(1));
      var b = window.computeSegments(makeThread(9));

      return {
        equalSegments: JSON.stringify(a) === JSON.stringify(b),
        a: a,
        b: b
      };
    });

    expect(probe.equalSegments).toBe(true);
  });

  test('start hole remains functional for add, multiply, and Steps list modes', async ({ page }) => {
    await page.goto('/stitchlab.html');

    const probe = await page.evaluate(() => {
      function makeThread(options) {
        options = options || {};
        return {
          jump: Number(options.jump || 1),
          width: 2,
          color: '#1982c4',
          solidColor: '#1982c4',
          startHole: Number(options.startHole || 1),
          sequence: null,
          jumpMode: String(options.jumpMode || 'fixed'),
          jumpFormula: 'skip',
          jumpSequence: String(options.jumpSequence || ''),
          jumpSequenceMode: String(options.jumpSequenceMode || 'holes'),
          connectMultiplier: Number(options.connectMultiplier || 2),
          connectOffset: 0,
          frameMode: 'outer'
        };
      }

      if (window.holesSlider) {
        window.holesSlider.value = '10';
      }
      if (typeof window.computePoints === 'function') {
        window.computePoints();
      }

      var addA = window.computeSegments(makeThread({ jumpMode: 'fixed', jump: 2, startHole: 1 }));
      var addB = window.computeSegments(makeThread({ jumpMode: 'fixed', jump: 2, startHole: 3 }));

      var mulA = window.computeSegments(makeThread({ jumpMode: 'connect', connectMultiplier: 2, startHole: 1 }));
      var mulB = window.computeSegments(makeThread({ jumpMode: 'connect', connectMultiplier: 2, startHole: 4 }));

      var stepA = window.computeSegments(makeThread({ jumpMode: 'sequence', jumpSequenceMode: 'steps', jumpSequence: '1,2,3', startHole: 1 }));
      var stepB = window.computeSegments(makeThread({ jumpMode: 'sequence', jumpSequenceMode: 'steps', jumpSequence: '1,2,3', startHole: 4 }));

      function differs(x, y) {
        return JSON.stringify(x) !== JSON.stringify(y);
      }

      function canonicalUndirectedSet(segments) {
        return (segments || [])
          .map(function(seg) {
            var a = Math.min(seg[0], seg[1]);
            var b = Math.max(seg[0], seg[1]);
            return a + '-' + b;
          })
          .sort()
          .join('|');
      }

      return {
        addDiffers: differs(addA, addB),
        multiplyDiffers: differs(mulA, mulB),
        stepListDiffers: differs(stepA, stepB),
        multiplyStartSourceA: mulA.length ? (mulA[0][0] + 1) : null,
        multiplyStartSourceB: mulB.length ? (mulB[0][0] + 1) : null,
        multiplyEdgeSetA: canonicalUndirectedSet(mulA),
        multiplyEdgeSetB: canonicalUndirectedSet(mulB)
      };
    });

    expect(probe.addDiffers).toBe(true);
    expect(probe.multiplyDiffers).toBe(true);
    expect(probe.stepListDiffers).toBe(true);
    expect(probe.multiplyStartSourceA).toBe(1);
    expect(probe.multiplyStartSourceB).toBe(4);
    expect(probe.multiplyEdgeSetA).not.toBe(probe.multiplyEdgeSetB);
  });

  test('stitching discovery candidates unlock their corresponding discovery cards', async ({ page }) => {
    await page.goto('/stitchlab.html');

    const probe = await page.evaluate(() => {
      function makeThread(options) {
        options = options || {};
        return {
          jump: Number(options.jump || 1),
          width: Number(options.width || 2),
          color: String(options.color || '#1982c4'),
          solidColor: String(options.solidColor || '#1982c4'),
          startHole: Number(options.startHole || 1),
          sequence: null,
          jumpMode: String(options.jumpMode || 'fixed'),
          jumpFormula: String(options.jumpFormula || 'skip'),
          jumpSequence: String(options.jumpSequence || ''),
          connectMultiplier: Number(options.connectMultiplier || 2),
          connectOffset: Number(options.connectOffset || 0),
          frameMode: String(options.frameMode || 'outer'),
          sourceHoleCount: options.sourceHoleCount ? Number(options.sourceHoleCount) : undefined
        };
      }

      function setHoleCount(value) {
        if (!window.holesSlider) return;
        window.holesSlider.value = String(value);
        if (window.advancedHolesNumberInput) {
          window.advancedHolesNumberInput.value = String(value);
        }
      }

      function resetDiscoveryState() {
        window.discoveredShapeKeys = Object.create(null);
        window.unlockedSongIds = [];
        window.hasUnseenDiscoveries = false;
        window.hasUnseenSongUnlock = false;
        if (typeof window.renderDiscoveryLibrary === 'function') {
          window.renderDiscoveryLibrary();
        }
      }

      function cardStatusForTitle(titleText) {
        var cardsRoot = document.getElementById('discovery-cards');
        if (!cardsRoot) {
          return { found: false, unlocked: false, preview: false, actionText: '' };
        }

        var cards = Array.prototype.slice.call(cardsRoot.querySelectorAll('.discovery-card'));
        for (var i = 0; i < cards.length; i++) {
          var titleNode = cards[i].querySelector('h4');
          var currentTitle = titleNode ? String(titleNode.textContent || '').replace(/\s+/g, ' ').trim() : '';
          if (currentTitle.indexOf(String(titleText || '')) === -1) continue;
          var actionBtn = cards[i].querySelector('button');
          var actionText = actionBtn ? String(actionBtn.textContent || '').trim() : '';
          return {
            found: true,
            preview: cards[i].classList.contains('is-preview'),
            unlocked: !cards[i].classList.contains('is-preview') && /^Travel to\s+/i.test(actionText),
            actionText: actionText
          };
        }

        return { found: false, unlocked: false, preview: false, actionText: '' };
      }

      function runCandidate(candidate) {
        var discoveryEntry = window.DISCOVERY_LIBRARY && window.DISCOVERY_LIBRARY[candidate.discoveryKey]
          ? window.DISCOVERY_LIBRARY[candidate.discoveryKey]
          : null;
        var cardTitle = discoveryEntry && discoveryEntry.title
          ? String(discoveryEntry.title)
          : String(candidate.discoveryKey || '');

        if (typeof window.setCurrentExperience === 'function') {
          window.setCurrentExperience('stitching', { suppressUrlSync: true });
        } else {
          window.currentExperienceId = 'stitching';
        }

        if (typeof window.setCurrentShape === 'function') {
          window.setCurrentShape(candidate.shape, false);
        } else {
          window.currentShape = candidate.shape;
        }

        window.nestedFrameEnabled = !!candidate.nestedFrameEnabled;
        window.nestedFrameRatio = Number(candidate.nestedFrameRatio || 0.5);
        setHoleCount(candidate.holes);

        window.threads = candidate.threads.map(function(thread) {
          return makeThread(thread);
        });
        window.selectedThreadIndex = 0;

        if (typeof window.computePoints === 'function') {
          window.computePoints();
        }
        if (typeof window.evaluateDiscoveryCandidates === 'function') {
          window.evaluateDiscoveryCandidates();
        }

        var discovered = !!window.discoveredShapeKeys[candidate.discoveryKey];
        var card = cardStatusForTitle(cardTitle);
        return {
          key: candidate.discoveryKey,
          discovered: discovered,
          card: card
        };
      }

      resetDiscoveryState();

      var candidates = [
        {
          discoveryKey: 'triangle',
          shape: 'circle',
          holes: 3,
          nestedFrameEnabled: false,
          nestedFrameRatio: 0.5,
          threads: [
            { jumpMode: 'fixed', jump: 1, startHole: 1 }
          ]
        },
        {
          discoveryKey: 'square',
          shape: 'square',
          holes: 16,
          nestedFrameEnabled: false,
          nestedFrameRatio: 0.5,
          threads: [
            { jumpMode: 'fixed', jump: 1, startHole: 1 }
          ]
        },
        {
          discoveryKey: 'rosette8',
          shape: 'circle',
          holes: 64,
          nestedFrameEnabled: true,
          nestedFrameRatio: 0.5,
          threads: [
            { jumpMode: 'fixed', jump: 16, startHole: 1 },
            { jumpMode: 'fixed', jump: 16, startHole: 9 },
            { jumpMode: 'fixed', jump: 20, startHole: 3, frameMode: 'bridge-reverse-project', sourceHoleCount: 32 }
          ]
        },
        {
          discoveryKey: 'rosette12',
          shape: 'circle',
          holes: 96,
          nestedFrameEnabled: true,
          nestedFrameRatio: 0.5,
          threads: [
            { jumpMode: 'fixed', jump: 16, startHole: 1 },
            { jumpMode: 'fixed', jump: 16, startHole: 9 },
            { jumpMode: 'fixed', jump: 20, startHole: 3, frameMode: 'bridge-reverse-project', sourceHoleCount: 48 }
          ]
        }
      ];

      return candidates.map(runCandidate);
    });

    for (const result of probe) {
      expect(result.discovered, `Expected ${result.key} to unlock`).toBe(true);
      expect(result.card.found, `Expected ${result.key} card to be present`).toBe(true);
      expect(result.card.preview, `Expected ${result.key} card to leave preview mode`).toBe(false);
      expect(result.card.unlocked, `Expected ${result.key} card action to be travel-enabled`).toBe(true);
    }
  });

  test('core interaction sweep does not raise runtime reference/type errors', async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];

    page.on('pageerror', (error) => {
      pageErrors.push(String(error && error.message ? error.message : error));
    });

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = String(msg.text() || '');
      if (/(ReferenceError|TypeError|SyntaxError|is not defined|Cannot read properties)/i.test(text)) {
        consoleErrors.push(text);
      }
    });

    await page.goto('/stitchlab.html');

    await page.locator('.shape-btn[data-shape="square"]').click();
    await page.locator('#gear').click();
    await page.selectOption('#jump-mode-0', 'sequence');
    await page.locator('#jump-sequence-0').fill('2,3,5,8');

    await page.evaluate(() => window.setCurrentExperience('triangula'));
    await page.evaluate(() => window.setCurrentExperience('squarus'));
    await page.evaluate(() => window.setCurrentExperience('mashrabiya'));
    await page.evaluate(() => window.setCurrentExperience('stitching'));

    await page.locator('#experience-info-toggle').click();
    await page.locator('#experience-acknowledgments-toggle').click();
    await expect(page.locator('#acknowledgments-modal')).toHaveClass(/open/);
    await page.locator('#acknowledgments-close-btn').click();

    await page.waitForTimeout(150);

    expect(pageErrors, 'Unexpected page errors during core interaction sweep').toEqual([]);
    expect(consoleErrors, 'Unexpected console runtime errors during core interaction sweep').toEqual([]);
  });

  test('acknowledgments viewer autoplay lifecycle resets cleanly across reopen', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.evaluate(() => {
      var tour = document.getElementById('onboarding-tour');
      var skip = document.getElementById('onboarding-tour-skip');
      if (!tour || tour.hidden || !skip) return;
      skip.click();
    });

    await page.locator('#experience-info-toggle').click();
    await page.locator('#experience-acknowledgments-toggle').click();
    const modal = page.locator('#acknowledgments-modal');
    await expect(modal).toHaveClass(/open/);
    await expect(page.locator('#acknowledgments-progress')).toContainText('1 /');

    const autoplayBtn = page.locator('#acknowledgments-autoplay-btn');
    await expect(autoplayBtn).toContainText('Pause');
    await autoplayBtn.click();
    await expect(autoplayBtn).toContainText('Auto play');

    await page.locator('#acknowledgments-next-btn').click();
    await expect(page.locator('#acknowledgments-progress')).toContainText('2 /');

    await page.locator('#acknowledgments-close-btn').click();
    await expect(modal).not.toHaveClass(/open/);

    const closeProbe = await page.evaluate(() => {
      return {
        autoPlay: !!(window.acknowledgmentsViewerState && window.acknowledgmentsViewerState.autoPlay),
        timerCleared: !!(window.acknowledgmentsViewerState && window.acknowledgmentsViewerState.timerId == null)
      };
    });
    expect(closeProbe.autoPlay).toBe(false);
    expect(closeProbe.timerCleared).toBe(true);

    await page.locator('#experience-info-toggle').click();
    await page.locator('#experience-acknowledgments-toggle').click();
    await expect(modal).toHaveClass(/open/);
    await expect(page.locator('#acknowledgments-progress')).toContainText('1 /');
    await expect(page.locator('#acknowledgments-autoplay-btn')).toContainText('Pause');
  });

  test('triangula URL state roundtrip persists key controls on reload', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=triangula');

    await page.selectOption('#triangula-construction-mode', 'cut');
    await page.evaluate(() => {
      var slider = document.getElementById('triangula-start-count');
      if (!slider) return;
      slider.value = '2';
      var inputEvt = document.createEvent('Event');
      inputEvt.initEvent('input', true, true);
      slider.dispatchEvent(inputEvt);
      var changeEvt = document.createEvent('Event');
      changeEvt.initEvent('change', true, true);
      slider.dispatchEvent(changeEvt);
    });

    await expect.poll(() => new URL(page.url()).searchParams.get('experience')).toBe('triangula');
    await expect.poll(() => new URL(page.url()).searchParams.get('triangulaConstructionMode')).toBe('cut');
    await expect.poll(() => new URL(page.url()).searchParams.get('triangulaStartCount')).toBe('9');

    await page.reload();

    await expect(page.locator('#triangula-construction-mode')).toHaveValue('cut');
    await expect(page.locator('#triangula-start-count')).toHaveValue('2');
  });

  test('squarus URL state roundtrip persists key controls on reload', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=squarus');

    await page.selectOption('#squarus-order-inline', '5');
    await page.selectOption('#squarus-layout-inline', 'force-directed');

    await expect.poll(() => new URL(page.url()).searchParams.get('experience')).toBe('squarus');
    await expect.poll(() => new URL(page.url()).searchParams.get('squarusOrder')).toBe('5');
    await expect.poll(() => new URL(page.url()).searchParams.get('squarusLayout')).toBe('force-directed');

    await page.reload();

    await expect(page.locator('#squarus-order-inline')).toHaveValue('5');
    await expect(page.locator('#squarus-layout-inline')).toHaveValue('force-directed');
  });

  test('mashrabiya URL state roundtrip persists key controls on reload', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=mashrabiya');

    await page.selectOption('#mashrabiya-fold', '8');
    await page.locator('#mashrabiya-keep-construction-lines').check();

    await expect.poll(() => new URL(page.url()).searchParams.get('experience')).toBe('mashrabiya');
    await expect.poll(() => new URL(page.url()).searchParams.get('mashrabiyaFold')).toBe('8');
    await expect.poll(() => new URL(page.url()).searchParams.get('mashrabiyaKeepConstructionLines')).toBe('1');

    await page.reload();

    await expect(page.locator('#mashrabiya-fold')).toHaveValue('8');
    await expect(page.locator('#mashrabiya-keep-construction-lines')).toBeChecked();
  });

  test('export fallback path works when JSZip is unavailable', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.evaluate(() => {
      window.__exportFallbackProbe = { svg: 0, guide: 0, preview: 0 };
      window.__savedJSZip = window.JSZip;
      window.JSZip = undefined;

      window.downloadCurrentDesignSvg = function() {
        window.__exportFallbackProbe.svg += 1;
      };
      window.downloadStitchingGuide = function() {
        window.__exportFallbackProbe.guide += 1;
      };
      window.downloadPreviewImage = function() {
        window.__exportFallbackProbe.preview += 1;
      };
    });

    await page.locator('#gear').click();
    await page.locator('#advanced-export-svg').click();
    const exportModal = page.locator('#export-options-modal');
    await expect(exportModal).toHaveClass(/open/);

    await page.locator('#export-confirm-btn').click();
    await expect(exportModal).not.toHaveClass(/open/);

    const probe = await page.evaluate(() => {
      var payload = window.__exportFallbackProbe || { svg: 0, guide: 0, preview: 0 };
      if (window.__savedJSZip !== undefined) {
        window.JSZip = window.__savedJSZip;
      }
      return payload;
    });

    expect(probe.svg).toBeGreaterThanOrEqual(1);
  });

  test('squarus seeded piece sequencing is deterministic for fixed seed', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=squarus');

    const deterministicProbe = await page.evaluate(() => {
      function signatures(order, seed) {
        return (window.getSquarusSequencedPieces(order, seed) || []).map(function(piece) {
          return piece && piece.signature ? piece.signature : '';
        }).join('|');
      }

      var a = signatures(5, 17);
      var b = signatures(5, 17);
      var c = signatures(5, 18);
      return {
        sameSeedStable: a === b,
        differentSeedChangesOrder: a !== c,
        sampleLength: a ? a.split('|').length : 0
      };
    });

    expect(deterministicProbe.sameSeedStable).toBe(true);
    expect(deterministicProbe.differentSeedChangesOrder).toBe(true);
    expect(deterministicProbe.sampleLength).toBeGreaterThan(1);
  });

  test('runtime load-order contract exposes required global functions', async ({ page }) => {
    await page.goto('/stitchlab.html');

    const contract = await page.evaluate(() => {
      var required = {
        setCurrentExperience: typeof window.setCurrentExperience === 'function',
        applyStateFromCurrentUrl: typeof window.applyStateFromCurrentUrl === 'function',
        redrawForPathChange: typeof window.redrawForPathChange === 'function',
        animateTriangula: typeof window.animateTriangula === 'function',
        getSquarusPolyominoes: typeof window.getSquarusPolyominoes === 'function',
        buildMashrabiyaRosetteGeometry: typeof window.buildMashrabiyaRosetteGeometry === 'function',
        openExportOptionsModal: typeof window.openExportOptionsModal === 'function',
        openAcknowledgmentsViewer: typeof window.openAcknowledgmentsViewer === 'function',
        attachExperienceInfoAcknowledgmentsBridge: typeof window.attachExperienceInfoAcknowledgmentsBridge === 'function'
      };

      var missing = Object.keys(required).filter(function(key) {
        return !required[key];
      });

      return { required, missing };
    });

    expect(contract.missing).toEqual([]);
  });

  test('about narration uses paragraph text and excludes figure captions', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await page.locator('#experience-info-toggle').click();
    await expect(page.locator('#experience-info-html')).toBeVisible();
    await expect.poll(() => {
      return page.evaluate(() => {
        var frame = document.getElementById('experience-info-html');
        if (!frame) return false;
        try {
          var doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
          return !!(doc && doc.querySelector('p'));
        } catch (error) {
          return false;
        }
      });
    }).toBe(true);

    const narrationProbe = await page.evaluate(async () => {
      const text = await window.getExperienceNarrationScript('stitching');
      const normalized = String(text || '');
      return {
        hasNarration: normalized.length > 0,
        includesParagraphText: normalized.indexOf('Curve stitching is a special mathematical art') >= 0,
        includesFigureCaptionText: normalized.indexOf('Cardioid Stitching from the Seattle Universal Math Museum (SUMM) - full view.') >= 0
      };
    });

    expect(narrationProbe.hasNarration).toBe(true);
    expect(narrationProbe.includesParagraphText).toBe(true);
    expect(narrationProbe.includesFigureCaptionText).toBe(false);
  });

  test('about and onboarding Hear this buttons include speaker icon', async ({ page }) => {
    await page.goto('/stitchlab.html');

    await expect(page.locator('#experience-narrate-toggle')).toHaveText(/🔊\s*Hear this/);
    await expect(page.locator('#onboarding-tour-hear')).toHaveText(/🔊\s*Hear this/);

    await page.evaluate(() => {
      var btn = document.getElementById('onboarding-help');
      if (btn) btn.click();
    });

    const iconProbe = await page.evaluate(() => {
      const ids = [
        'experience-narrate-toggle',
        'onboarding-tour-hear',
        'onboarding-hint-shape-hear',
        'onboarding-hint-holes-hear',
        'onboarding-hint-play-hear'
      ];
      return ids.map((id) => {
        const el = document.getElementById(id);
        const text = el ? String(el.textContent || '').trim() : '';
        return {
          id,
          present: !!el,
          text,
          hasSpeakerIcon: text.indexOf('🔊') === 0 && /Hear this$/i.test(text)
        };
      });
    });

    for (const entry of iconProbe) {
      if (!entry.present) continue;
      expect(entry.hasSpeakerIcon, `Expected speaker icon hear label for ${entry.id}, got "${entry.text}"`).toBe(true);
    }
  });
});
