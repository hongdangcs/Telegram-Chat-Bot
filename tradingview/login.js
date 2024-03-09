const modify = require("./modify-values");
const priceData = require("./price-data");
const saveSettings = require("./savesettings");

async function tradingViewLogin(browser, sessionid_sign, sessionid) {
  const page = await browser.newPage();
  await page.goto("https://www.tradingview.com/");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  cookies = [
    { name: "sessionid_sign", value: sessionid_sign },
    { name: "sessionid", value: sessionid },
  ];
  await page.setCookie(...cookies);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await saveSettings(page);
  // priceData(page, "https://www.tradingview.com/chart/Z2D2ibVU/").then(
  //   (data) => {
  //     console.log(data);
  //   }
  // );
  modify(page, "https://www.tradingview.com/chart/Z2D2ibVU/").then((data) => {
    console.log(data);
  });
  // await page.close();
}

module.exports = tradingViewLogin;
