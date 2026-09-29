const puppeteer = require("puppeteer");
const tradingViewLogin = require("./tradingview/login");
const { tradingView, telegram } = require("./configs");
const sessionid_sign = tradingView.login.sessionid_sign;
const sessionid = tradingView.login.sessionid;
// Photos are sent with an explicit content type, so opt in to the library's
// new file handling instead of printing its deprecation warning.
process.env.NTBA_FIX_350 = "1";
const TelegramBot = require("node-telegram-bot-api");
const messageHandler = require("./telegram/message-handler");
const token = telegram.botToken;
// Polling starts once handlers are registered; Telegram keeps messages sent
// during startup and delivers them then, instead of them being dropped.
const bot = new TelegramBot(token, { polling: false });
var browser;
(async () => {
  browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--no-sandbox"],
  });

  try {
    await tradingViewLogin(browser, sessionid_sign, sessionid);
    console.log("Logged in");
  } catch (error) {
    console.error("TradingView login failed:", error);
  }

  await messageHandler(bot, browser);
  await bot.startPolling();
  console.log("Bot is running");
})();

// A failed Telegram send (network error, user blocked the bot, ...) must not
// take the whole bot down.
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("SIGINT", async () => {
  console.log("Caught interrupt signal");
  if (browser) {
    await browser.close();
  }
  process.exit();
});
