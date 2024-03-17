const captureChart = require("./capture-chart");
const modify = require("./modify-values");
const timeIntervalSetting = require("./time-interval");

async function chartData(page, url, timeInterval, imgName) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await timeIntervalSetting(page, timeInterval);
    await captureChart(page, imgName);
    const priceChange = await modify(page);
    // await page.close();
    await new Promise((resolve) => setTimeout(resolve, 600));
    return priceChange;
  } catch (e) {
    console.log(e);
  }
}

module.exports = chartData;
