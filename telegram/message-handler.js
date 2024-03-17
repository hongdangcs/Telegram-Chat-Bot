const { tradingView } = require("../configs");
const captureAll = require("../tradingview/capture-all");
const chartData = require("../tradingview/chart-data");
const fs = require("fs");
const captureHandler = require("./capture-handler");
const captureAllHandler = require("./capture-all-handler");
const { createPage } = require("../puppeteer-page/puppeteer-page");
const similarHandler = require("./similar-handler");

module.exports = (bot, browser) => {
  const chatStates = {};
  const stock = tradingView.stock;
  const stockSymbols = Object.keys(stock);

  const timeIntervals = tradingView.timeInterval;

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    chatStates[chatId] = {};
    updateTimeout(chatStates, chatId);
    bot.sendMessage(chatId, "Choose 1", {
      reply_markup: {
        keyboard: stockSymbols.map((symbol) => [symbol]),
      },
    });
    return;
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "/start - Start the bot\n/help - Show this message"
    );

    return;
  });

  bot.onText(/\/similar/, async (msg) => {
    const chatId = msg.chat.id;
    const chatState = chatStates[chatId];
    if (!chatState) {
      bot.sendMessage(chatId, "Try /start first");
      return;
    }
    if (!chatState.coin) {
      bot.sendMessage(chatId, "Choose 1 first");
      return;
    }
    if (!chatState.page) {
      bot.sendMessage(chatId, "Try /start again and choose 1 and 2");
      return;
    }
    const timeNow = new Date();
    if (chatState.time && timeNow - chatState.time < 15000) {
      bot.sendMessage(
        chatId,
        "Too many requests, please wait for last request to finish"
      );
      return;
    }
    chatState.time = timeNow;
    try {
      await similarHandler(chatState.page, bot, chatId);
    } catch (error) {
      console.log(error);
      bot.sendMessage(chatId, "Something went wrong");
      return;
    }
  });

  bot.on("message", async (msg) => {
    if (msg.text.startsWith("/")) {
      return;
    }
    const chatId = msg.chat.id;
    const chatState = chatStates[chatId];
    updateTimeout(chatStates, chatId);
    if (!chatState) {
      bot.sendMessage(chatId, "Try /start first");
      return;
    }
    if (stock.hasOwnProperty(msg.text)) {
      chatState.coin = msg.text;
      bot.sendMessage(chatId, "Choose 2", {
        reply_markup: {
          keyboard: [
            ...Object.keys(timeIntervals).map((time) => [time]),
            ["ALL"],
          ],
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
        if (!chatState.page) {
          chatState.page = await browser.newPage();
        }
        await new Promise((resolve) => setTimeout(resolve, 1800));
        await chatState.page.goto(stock[chatState.coin]);
        await captureHandler(
          msg,
          chatState,
          chatId,
          bot,
          chatState.page,
          stock
        );
      } catch (error) {
        console.log(error);
        bot.sendMessage(chatId, "Something went wrong");
        return;
      }

      return;
    } else if (msg.text == "ALL") {
      await captureAllHandler(msg, chatState, chatId, bot, browser);
      return;
    }
    bot.sendMessage(chatId, "Invalid input");
  });
};

function updateTimeout(chatStates, chatId) {
  setTimeout(() => {
    const chatState = chatStates[chatId];
    if (chatState && chatState.page) {
      chatState.page.close();
    }
    delete chatStates[chatId];
  }, 300000);
}
