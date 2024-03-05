async function tradingViewLogin(browser, sessionid_sign, sessionid) {
  const page = await browser.newPage();
  await page.goto("https://www.tradingview.com/");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.evaluate(
    (sessionid_sign, sessionid) => {
      function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }

      setCookie("sessionid_sign", sessionid_sign, 30);
      setCookie("sessionid", sessionid, 30);
    },
    sessionid_sign,
    sessionid
  );
  await page.close();
}

module.exports = tradingViewLogin;
