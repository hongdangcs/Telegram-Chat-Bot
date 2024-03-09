const { tradingView } = require("../configs");
const chartData = require("../tradingview/chart-data");

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
      return;
    }
    bot.sendMessage(chatId, "Invalid input");
  });
};
