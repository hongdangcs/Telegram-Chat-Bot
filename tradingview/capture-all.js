const { tradingView } = require("../configs");
const captureChart = require("./capture-chart");
const timeIntervalSetting = require("./time-interval");
const jimp = require("jimp");

// Captures the chart at every configured interval and stacks the shots
// vertically into one PNG buffer.
async function captureAll(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const intervals = Object.values(tradingView.timeInterval);
    let image;

    for (const [index, interval] of intervals.entries()) {
      await timeIntervalSetting(page, interval);
      const img = await jimp.read(await captureChart(page));
      if (!image) {
        image = new jimp(
          img.bitmap.width,
          img.bitmap.height * intervals.length,
          0xffffffff
        );
      }
      image.composite(img, 0, img.bitmap.height * index);
    }

    return await image.getBufferAsync(jimp.MIME_PNG);
  } finally {
    await page.close();
  }
}
module.exports = captureAll;
