const puppeteer = require("puppeteer");
const tradingViewLogin = require("./tradingview/login");
const { tradingView } = require("./configs");
sessionid_sign = tradingView.sessionid_sign;
sessionid = tradingView.sessionid;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1820, height: 900 },
  });

  tradingViewLogin(browser, sessionid_sign, sessionid).then(() => {
    console.log("Logged in");
  });
})();
