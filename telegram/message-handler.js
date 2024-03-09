const { tradingView } = require("../configs");
const chartData = require("../tradingview/chart-data");
const fs = require("fs");

module.exports = (bot, browser) => {
  const chatStates = {};
  const stock = tradingView.stock;
  const stockSymbols = Object.keys(stock);

  const timeIntervals = tradingView.timeInterval;

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    chatStates[chatId] = {};
    bot.sendMessage(chatId, "Choose 1", {
      reply_markup: {
        keyboard: stockSymbols.map((symbol) => [symbol]),
      },
    });
    return;
  });

  bot.on("message", async (msg) => {
    if (msg.text.startsWith("/")) {
      return;
    }
    const chatId = msg.chat.id;
    const chatState = chatStates[chatId];
    if (!chatState) {
      bot.sendMessage(chatId, "Try /start first");
      return;
    }
    if (stock.hasOwnProperty(msg.text)) {
      chatState.coin = msg.text;
      bot.sendMessage(chatId, "Choose 2", {
        reply_markup: {
          keyboard: Object.keys(timeIntervals).map((time) => [time]),
        },
      });
      return;
    } else if (timeIntervals.hasOwnProperty(msg.text)) {
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
        const imgName = `${chatId}_${chatState.coin}_${chatState.timeInterval}`;
        const responData = await chartData(
          browser,
          stock[chatState.coin],
          timeIntervals[chatState.timeInterval],
          imgName
        );
        bot.sendMessage(
          chatId,
          `Price increase: 1(${responData.increase1}/${responData.decrease1}), 2(${responData.increase2}/${responData.decrease2}), 3(${responData.increase3}/${responData.decrease3})`
        );
        bot.sendPhoto(chatId, `./screenshots/${imgName}.png`);

        // Delete the image after sending
        setTimeout(() => {
          fs.unlinkSync(`./screenshots/${imgName}.png`);
        }, 1000);
      } catch (error) {
        console.log(error);
        bot.sendMessage(chatId, "Something went wrong");
        return;
      }

      return;
    }
    bot.sendMessage(chatId, "Invalid input");
  });
};
