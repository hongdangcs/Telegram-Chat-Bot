const captureChart = require("./capture-chart");
const modify = require("./modify-values");
const timeIntervalSetting = require("./time-interval");

async function chartData(page, url, timeInterval, imgName) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // set time period
    await timeIntervalSetting(page, timeInterval);
    // capture chart
    await captureChart(page, imgName);
    // extract price and indicator value
    const priceChange = await modify(page);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return priceChange;
  } catch (e) {
    console.log(e);
  }
}

module.exports = chartData;
