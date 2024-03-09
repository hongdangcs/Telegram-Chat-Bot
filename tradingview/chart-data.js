const captureChart = require("./capture-chart");
const modify = require("./modify-values");
const timeIntervalSetting = require("./time-interval");

async function chartData(browser, url, timeInterval, imgName) {
  try {
    const page = await browser.newPage();
    await page.goto(url);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await timeIntervalSetting(page, timeInterval);
    await captureChart(page, imgName);
    const priceChange = await modify(page);
    await page.close();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return priceChange;
  } catch (e) {
    console.log(e);
  }
}

module.exports = chartData;
