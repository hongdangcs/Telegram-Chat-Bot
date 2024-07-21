const { tradingView } = require("../configs");
const captureAll = require("../tradingview/capture-all");
const chartData = require("../tradingview/chart-data");
const fs = require("fs");
const captureHandler = require("./capture-handler");
const captureAllHandler = require("./capture-all-handler");
const { createPage } = require("../puppeteer-page/puppeteer-page");
const similarHandler = require("./similar-handler");
const get_tradingview_urls = require("../tradingview/get-tradingview-urls");
const streamer = require("../ssi/stream-data");
const captureMarketDepth = require("../ssi/capture-market-depth");

module.exports = async (bot, browser) => {
  const chatStates = {};
  const stock = tradingView.stock;

  let stockSymbols = await get_tradingview_urls();
  stockSymbols = new Map([...stockSymbols.entries()].sort());

  stockListSSI = streamer.stockList;

  const timeIntervals = tradingView.timeInterval;

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "/help - Show this message" +
        "\n/s <stock name> - Search for stock" +
        "\n/list - Show all stocks"
    );

    return;
  });
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "/help - Show this message" +
        "\n/s <stock name> - Select a stock" +
        "\n/list - Show all stocks"
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

  bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id;
    let message = "Stocks: \n";
    for (let stock of stockSymbols.keys()) {
      if (message.length > 3000) {
        bot.sendMessage(chatId, message);
        message = "";
      }
      message += stock + ", ";
    }
    bot.sendMessage(chatId, message);
    return;
  });

  bot.on("message", async (msg) => {
    if (msg.text == "/start") {
      return;
    }
    if (msg.text.startsWith("/s")) {
      const chatId = msg.chat.id;
      let stockName = msg.text.split(" ")[1];
      if (!stockName) {
        bot.sendMessage(chatId, "Invalid stock name, \n/help for help");
        return;
      }
      stockName = stockName.toUpperCase();

      if (!stockSymbols.has(stockName)) {
        bot.sendMessage(
          chatId,
          "No stock found for " + stockName + ". Try /list to see all stocks"
        );
        return;
      }
      if (!chatStates[chatId]) {
        chatStates[chatId] = {};
      }
      chatStates[chatId].coin = stockName;
      updateTimeout(chatStates, chatId);
      bot.sendMessage(chatId, stockName + " was chosen.", {
        reply_markup: {
          keyboard: [
            ...Object.keys(timeIntervals).map((time) => [time]),
            //["ALL"],
            ["Market Depth"],
          ],
        },
      });
      return;
    }
    if (msg.text.startsWith("/")) {
      return;
    }

    if (msg.text == "Market Depth") {
      const chatId = msg.chat.id;
      const chatState = chatStates[chatId];
      updateTimeout(chatStates, chatId);
      if (!chatState) {
        bot.sendMessage(chatId, "Choose stock first!");
        return;
      }
      const timeNow = new Date();
      if (chatState.time && timeNow - chatState.time < 30000) {
        bot.sendMessage(
          chatId,
          "Too many requests, please wait for last request to finish"
        );
        return;
      }
      try {
        // update time
        chatState.time = timeNow;
        // execute request
        stockName = chatState.coin;
        if (!stockName) {
          bot.sendMessage(chatId, "Choose stock first, \n/help for help");
          return;
        }
        if (!stockListSSI[stockName]) {
          await bot.sendMessage(
            chatId,
            "There is no data for requested stock!"
          );
          return;
        }
        if (!chatState.page) {
          chatState.page = await browser.newPage();
          chatState.page.on("dialog", async (dialog) => {
            await dialog.accept();
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1800));
        await chatState.page.goto(
          "https://hongdangcs.github.io/Telegram-Chat-Bot/"
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await captureMarketDepth(
          chatState.page,
          bot,
          chatId,
          stockListSSI[stockName]
        );
      } catch (error) {
        console.log(error);
        bot.sendMessage(chatId, "Something went wrong");
        return;
      }
      return;
    }

    if (timeIntervals.hasOwnProperty(msg.text)) {
      const chatId = msg.chat.id;
      const chatState = chatStates[chatId];
      updateTimeout(chatStates, chatId);
      if (!chatState) {
        bot.sendMessage(chatId, "Choose stock first!");
        return;
      }
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
          bot.sendMessage(chatId, "Choose stock first");
          return;
        }
        if (!chatState.page) {
          chatState.page = await browser.newPage();
          chatState.page.on("dialog", async (dialog) => {
            await dialog.accept();
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1800));
        await chatState.page.goto(stockSymbols.get(chatState.coin));
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
      const chatId = msg.chat.id;
      const chatState = chatStates[chatId];
      updateTimeout(chatStates, chatId);
      if (!chatState) {
        bot.sendMessage(chatId, "Choose stock first!");
        return;
      }
      await captureAllHandler(msg, chatState, chatId, bot, browser);
      return;
    }
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Invalid input,\n/help for help");
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
