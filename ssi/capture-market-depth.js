const fs = require("fs");

async function captureMarketDepth(page, bot, chatId, stockList) {
  await page.evaluate((stockList) => {
    stock = stockList;
    drawChart();
  }, stockList);
  await new Promise((r) => setTimeout(r, 500));

  const imageName = chatId + "_market_depth";
  await page.screenshot({ path: `./screenshots/${imageName}.png` });
  await new Promise((r) => setTimeout(r, 1000));

  await bot.sendPhoto(chatId, `./screenshots/${imageName}.png`);
  await new Promise((r) => setTimeout(r, 1000));
  setTimeout(() => {
    fs.unlinkSync(`./screenshots/${imageName}.png`);
  }, 1000);
}
module.exports = captureMarketDepth;
