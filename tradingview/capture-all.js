const { tradingView } = require("../configs");
const captureChart = require("./capture-chart");
const timeIntervalSetting = require("./time-interval");
const jimp = require("jimp");
const fs = require("fs");

async function captureAll(browser, url, imgName) {
  const page = await browser.newPage();
  await page.goto(url);
  const timeInterval = tradingView.timeInterval;
  await new Promise((resolve) => setTimeout(resolve, 1800));
  // create new image
  let image;

  for (let [index, [key, value]] of Object.entries(
    Object.entries(timeInterval)
  )) {
    await timeIntervalSetting(page, value);
    await captureChart(page, imgName + key);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const img = await jimp.read(`./screenshots/${imgName + key}.png`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!image) {
      image = new jimp(img.bitmap.width, img.bitmap.height * 4, 0xffffffff);
      image.composite(img, 0, img.bitmap.height * index);
    } else {
      image.composite(img, 0, img.bitmap.height * index);
    }
    setTimeout(() => {
      fs.unlinkSync(`./screenshots/${imgName + key}.png`);
    }, 400);
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  image.write(`./screenshots/${imgName}.png`);

  await page.close();
}
module.exports = captureAll;
