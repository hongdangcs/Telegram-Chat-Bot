const { telegram } = require("./configs");
// Photos are sent with an explicit content type, so opt in to the library's
// new file handling instead of printing its deprecation warning.
process.env.NTBA_FIX_350 = "1";
const TelegramBot = require("node-telegram-bot-api");
const messageHandler = require("./telegram/message-handler");
const marketData = require("./tradingview/market-data");
const token = telegram.botToken;
// Polling starts once handlers are registered; Telegram keeps messages sent
// during startup and delivers them then, instead of them being dropped.
const bot = new TelegramBot(token, { polling: false });

(async () => {
  await messageHandler(bot);
  await bot.startPolling();
  console.log("Bot is running");
})();

// A failed Telegram send (network error, user blocked the bot, ...) must not
// take the whole bot down.
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("SIGINT", () => {
  console.log("Caught interrupt signal");
  marketData.close();
  process.exit();
});
