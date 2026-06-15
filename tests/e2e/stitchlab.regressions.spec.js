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
});
