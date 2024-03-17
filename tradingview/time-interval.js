async function timeIntervalSetting(page, time) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await page.click(`#header-toolbar-intervals button[aria-label="${time}"]`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (e) {
    console.log(e);
  }
}
module.exports = timeIntervalSetting;
