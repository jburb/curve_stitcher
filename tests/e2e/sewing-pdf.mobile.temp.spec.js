const { test, expect, devices } = require('@playwright/test');

test.use({
  ...devices['Pixel 5']
});

test.describe('TEMP mobile sewing PDF navigation debug', () => {
  test('logs reveal mobile PDF init/nav state transitions', async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(key, JSON.stringify({
        quickStartDismissed: true,
        tourCompleted: true,
        startupTutorialOptOut: true
      }));
    }, 'stitchlab.onboarding.v1');

    const sewingLogs = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.indexOf('[sewing-pdf]') !== -1) {
        sewingLogs.push(text);
      }
    });

    await page.goto('/stitchlab.html');
    await page.locator('#experience-info-toggle').click();
    await page.locator('#experience-sewing-cards-toggle').click();

    await expect(page.locator('#sewing-cards-modal')).toHaveClass(/open/);
    await expect(page.locator('#sewing-pdf-page-label')).toContainText('Page 34');

    await page.locator('#sewing-pdf-next-btn').click();
    await expect(page.locator('#sewing-pdf-page-label')).toContainText('Page 35');

    await page.locator('#sewing-pdf-next-btn').click();
    await expect(page.locator('#sewing-pdf-page-label')).toContainText('Page 36');

    await page.waitForTimeout(1400);

    const finalSrc = await page.locator('#sewing-pdf-frame').getAttribute('src');
    expect(String(finalSrc || '')).toContain('#page=36');

    const hasOpenLog = sewingLogs.some((line) => line.indexOf('open-viewer') !== -1);
    const hasCommitLog = sewingLogs.some((line) => line.indexOf('commit-start') !== -1);
    const hasStepLog = sewingLogs.some((line) => line.indexOf('step-page') !== -1);
    const hasInitialApply36 = sewingLogs.some((line) => line.indexOf('mobile-initial-apply') !== -1 && line.indexOf('#page=36') !== -1);
    const hasReloadApply36 = sewingLogs.some((line) => line.indexOf('mobile-reload-applied') !== -1 && line.indexOf('#page=36') !== -1);
    const hasBlankReset = sewingLogs.some((line) => line.indexOf('mobile-reset-blank') !== -1);

    expect(hasOpenLog, JSON.stringify(sewingLogs, null, 2)).toBe(true);
    expect(hasCommitLog, JSON.stringify(sewingLogs, null, 2)).toBe(true);
    expect(hasStepLog, JSON.stringify(sewingLogs, null, 2)).toBe(true);
    expect(hasInitialApply36, JSON.stringify(sewingLogs, null, 2)).toBe(true);
    expect(hasReloadApply36, JSON.stringify(sewingLogs, null, 2)).toBe(true);
    expect(hasBlankReset, JSON.stringify(sewingLogs, null, 2)).toBe(false);
  });
});
