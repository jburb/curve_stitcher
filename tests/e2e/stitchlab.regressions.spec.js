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

  test('squarus basic and advanced squares controls stay synchronized', async ({ page }) => {
    await page.goto('/stitchlab.html?version=2&experience=squarus');
    await page.locator('#gear').click();

    await page.selectOption('#squarus-order-inline', '3');
    await expect(page.locator('#squarus-order')).toHaveValue('3');

    await page.selectOption('#squarus-order', '5');
    await expect(page.locator('#squarus-order-inline')).toHaveValue('5');
  });
});
