const puppeteer = require("puppeteer");
const tradingViewLogin = require("./tradingview/login");
const { tradingView } = require("./configs");
sesionid_sign = tradingView.sessionid_sign;
sessionid = tradingView.sessionid;
(async () => {
  const browser = await puppeteer.launch({ headless: false });

  tradingViewLogin(browser, sessionid_sign, sessionid).then(() => {
    console.log("Logged in");
  });
})();
