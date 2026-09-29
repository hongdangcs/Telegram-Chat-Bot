const sendPhoto = require("../telegram/send-photo");

async function captureMarketDepth(page, bot, chatId, stockList) {
  await page.evaluate((stockList) => {
    stock = stockList;
    drawChart();
  }, stockList);
  await new Promise((r) => setTimeout(r, 500));
  const image = await page.screenshot();
  await sendPhoto(bot, chatId, image);
}
module.exports = captureMarketDepth;
