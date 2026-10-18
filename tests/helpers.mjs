export async function chooseTheme(page, value) {
  const picker = page.locator('.theme-picker');
  if ((await picker.getAttribute('open')) === null) await picker.locator('summary').click();
  await picker.locator(`[data-theme-choice="${value}"]`).click();
}
