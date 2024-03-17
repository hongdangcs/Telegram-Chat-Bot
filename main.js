const puppeteer = require("puppeteer");
const tradingViewLogin = require("./tradingview/login");
const { tradingView, telegram } = require("./configs");
const sessionid_sign = tradingView.login.sessionid_sign;
const sessionid = tradingView.login.sessionid;
const TelegramBot = require("node-telegram-bot-api");
const messageHandler = require("./telegram/message-handler");
const token = telegram.botToken;
const bot = new TelegramBot(token, { polling: true });

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--no-sandbox"],
  });

  tradingViewLogin(browser, sessionid_sign, sessionid).then(() => {
    console.log("Logged in");
  });

  messageHandler(bot, browser);
})();
