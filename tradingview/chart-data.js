const captureChart = require("./capture-chart");
const modify = require("./modify-values");
const timeIntervalSetting = require("./time-interval");

async function chartData(page, timeInterval) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // set time period
  await timeIntervalSetting(page, timeInterval);
  // capture chart
  const image = await captureChart(page);
  // extract price and indicator value
  const priceChange = await modify(page);
  return { image, priceChange };
}

module.exports = chartData;
