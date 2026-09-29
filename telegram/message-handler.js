const path = require("path");
const { pathToFileURL } = require("url");
const { tradingView } = require("../configs");
const captureHandler = require("./capture-handler");
const captureAllHandler = require("./capture-all-handler");
const similarHandler = require("./similar-handler");
const get_tradingview_urls = require("../tradingview/get-tradingview-urls");
const streamer = require("../ssi/stream-data");
const captureMarketDepth = require("../ssi/capture-market-depth");

const SESSION_IDLE_MS = 300000;
// Rendered from the local file so the chart code always matches this
// checkout, without depending on a GitHub Pages deployment.
const MARKET_DEPTH_URL = pathToFileURL(
  path.join(__dirname, "..", "index.html")
).href;
const HELP_TEXT =
  "/help - Show this message" +
  "\n/s <stock name> - Select a stock" +
  "\n/list - Show all stocks";

module.exports = async (bot, browser) => {
  const chatStates = {};
  const stockListSSI = streamer.stockList;
  const timeIntervals = tradingView.timeInterval;

  // Stocks from configs.js stay available even if the scanner request fails.
  const symbolUrls = new Map([
    ...Object.entries(tradingView.stock || {}),
    ...(await get_tradingview_urls()),
  ]);
  const stockSymbols = new Map(
    [...symbolUrls].sort(([a], [b]) => a.localeCompare(b))
  );

  // Drops the session (and closes its browser page) after SESSION_IDLE_MS
  // without activity; every interaction restarts the countdown.
  function touchSession(chatId, chatState) {
    clearTimeout(chatState.idleTimer);
    chatState.idleTimer = setTimeout(() => {
      if (chatState.busy) {
        touchSession(chatId, chatState);
        return;
      }
      if (chatStates[chatId] === chatState) {
        delete chatStates[chatId];
      }
      if (chatState.page) {
        chatState.page.close().catch(() => {});
      }
    }, SESSION_IDLE_MS);
  }

  async function getPage(chatState) {
    if (!chatState.page || chatState.page.isClosed()) {
      chatState.page = await browser.newPage();
      chatState.page.on("dialog", async (dialog) => {
        await dialog.accept();
      });
    }
    return chatState.page;
  }

  // Each chat shares one browser page, so only one request may drive it at
  // a time; overlapping requests would corrupt each other's screenshots.
  async function runExclusive(chatId, chatState, task) {
    if (chatState.busy) {
      await bot.sendMessage(
        chatId,
        "Too many requests, please wait for last request to finish"
      );
      return;
    }
    chatState.busy = true;
    touchSession(chatId, chatState);
    try {
      await task();
    } catch (error) {
      console.log(error);
      await bot.sendMessage(chatId, "Something went wrong");
    } finally {
      chatState.busy = false;
      touchSession(chatId, chatState);
    }
  }

  bot.onText(/^\/(help|start)\b/, (msg) => {
    bot.sendMessage(msg.chat.id, HELP_TEXT);
  });

  bot.onText(/^\/similar\b/, async (msg) => {
    const chatId = msg.chat.id;
    const chatState = chatStates[chatId];
    if (!chatState || !chatState.coin) {
      bot.sendMessage(chatId, "Choose stock first, \n/help for help");
      return;
    }
    if (!chatState.chartLoaded) {
      bot.sendMessage(chatId, "Choose a time interval first");
      return;
    }
    await runExclusive(chatId, chatState, () =>
      similarHandler(chatState.page, bot, chatId)
    );
  });

  bot.onText(/^\/list\b/, async (msg) => {
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
  });

  bot.on("message", async (msg) => {
    // Stickers, photos, etc. have no text.
    if (!msg.text) {
      return;
    }
    const chatId = msg.chat.id;
    const [rawCommand, stockArg] = msg.text.trim().split(/\s+/);
    // "/s@BotName FPT" is how Telegram sends commands in group chats.
    const command = rawCommand.split("@")[0];

    if (command === "/s") {
      if (!stockArg) {
        bot.sendMessage(chatId, "Invalid stock name, \n/help for help");
        return;
      }
      const stockName = stockArg.toUpperCase();
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
      touchSession(chatId, chatStates[chatId]);
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
    if (command.startsWith("/")) {
      return;
    }

    const chatState = chatStates[chatId];
    const isKnownButton =
      msg.text == "Market Depth" ||
      msg.text == "ALL" ||
      timeIntervals.hasOwnProperty(msg.text);
    if (!isKnownButton) {
      bot.sendMessage(chatId, "Invalid input,\n/help for help");
      return;
    }
    if (!chatState || !chatState.coin) {
      bot.sendMessage(chatId, "Choose stock first, \n/help for help");
      return;
    }
    // Read the selection now so a later /s cannot change it mid-request.
    const stockName = chatState.coin;

    if (msg.text == "Market Depth") {
      await runExclusive(chatId, chatState, async () => {
        if (!stockListSSI[stockName]) {
          await bot.sendMessage(chatId, "There is no data for requested stock!");
          return;
        }
        const page = await getPage(chatState);
        if (page.url() !== MARKET_DEPTH_URL) {
          chatState.chartLoaded = false;
          await page.goto(MARKET_DEPTH_URL);
        }
        await captureMarketDepth(page, bot, chatId, stockListSSI[stockName]);
      });
      return;
    }

    if (msg.text == "ALL") {
      await runExclusive(chatId, chatState, () =>
        captureAllHandler(bot, chatId, browser, stockSymbols.get(stockName))
      );
      return;
    }

    const interval = msg.text;
    await runExclusive(chatId, chatState, async () => {
      const page = await getPage(chatState);
      chatState.chartLoaded = false;
      await page.goto(stockSymbols.get(stockName));
      await captureHandler(bot, chatId, page, interval);
      chatState.chartLoaded = true;
    });
  });
};
