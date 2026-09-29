const captureAll = require("../tradingview/capture-all");
const sendPhoto = require("./send-photo");

async function captureAllHandler(bot, chatId, browser, url) {
  const image = await captureAll(browser, url);
  await sendPhoto(bot, chatId, image);
}

module.exports = captureAllHandler;
