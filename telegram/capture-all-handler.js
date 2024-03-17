const captureAll = require("../tradingview/capture-all");
const { tradingView } = require("../configs");
const fs = require("fs");
const stock = tradingView.stock;

async function captureAllHandler(msg, chatState, chatId, bot, browser) {
  chatState.timeInterval = msg.text;
  const timeNow = new Date();
  if (chatState.time && timeNow - chatState.time < 30000) {
    bot.sendMessage(
      chatId,
      "Too many requests, please wait for last request to finish"
    );
    return;
  }
  chatState.time = timeNow;
  try {
    if (!chatState.coin) {
      bot.sendMessage(chatId, "Choose 1 first");
      return;
    }
    const imgName = `${chatId}_${chatState.coin}_ALL`;
    await captureAll(browser, stock[chatState.coin], imgName);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    bot.sendPhoto(chatId, `./screenshots/${imgName}.png`);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    // Delete the image after sending
    setTimeout(() => {
      fs.unlinkSync(`./screenshots/${imgName}.png`);
    }, 1000);
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, "Something went wrong");
    return;
  }
}

module.exports = captureAllHandler;
