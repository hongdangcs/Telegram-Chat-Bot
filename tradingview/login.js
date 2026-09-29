const saveSettings = require("./savesettings");

async function tradingViewLogin(browser, sessionid_sign, sessionid) {
  // open new browser page
  const page = await browser.newPage();
  await page.goto("https://tradingview.com/");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // login by session id
  const cookies = [
    { name: "sessionid_sign", value: sessionid_sign },
    { name: "sessionid", value: sessionid },
  ];
  await page.setCookie(...cookies);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // reload chart page
  await saveSettings(page);
  await page.close();
}

module.exports = tradingViewLogin;
