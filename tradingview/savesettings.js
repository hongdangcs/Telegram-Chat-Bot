async function saveSettings(page) {
  await page.goto("https://www.tradingview.com/symbols/SPX/");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.click('a[data-target="title"]');
  await new Promise((resolve) => setTimeout(resolve, 5500));
  /*
  await page.click(
    '#bottom-area .bottom-widgetbar-content div[data-name="open-script"]'
  );
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.click('div[data-name="menu-inner"] div[data-name="my-scripts"]');
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.click(
    'div[data-name="open-user-script-dialog"] div[data-name="open-script-dialog-item-name"]'
  );
  await new Promise((resolve) => setTimeout(resolve, 2500));
  */
}

module.exports = saveSettings;
