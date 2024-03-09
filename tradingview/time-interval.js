async function timeIntervalSetting(page, time) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await page.click("#header-toolbar-intervals");
    let timeIntervalButton = await page.$$(
      'div[data-name="menu-inner"] div[data-role="menuitem"]'
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    await timeIntervalButton[time].click();
    await new Promise((resolve) => setTimeout(resolve, 1200));
  } catch (e) {
    console.log(e);
  }
}
module.exports = timeIntervalSetting;
