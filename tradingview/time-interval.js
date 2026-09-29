// Throws if the interval button is missing, so a failed switch is reported
// instead of silently sending a chart for the wrong time frame.
async function timeIntervalSetting(page, time) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.click(`#header-toolbar-intervals button[aria-label="${time}"]`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
module.exports = timeIntervalSetting;
