const captureChart = require("../tradingview/capture-chart");
const fs = require("fs");

async function similarHandler(page, bot, chatId) {
  await page.mouse.move(900, 600);
  await page.mouse.down();
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.evaluate(() => {
    var keyDownEvent = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      keyCode: 37,
      code: "ArrowLeft",
      which: 37,
    });

    document.dispatchEvent(keyDownEvent);
    const classNameSuffix = document
      .querySelector('div[data-name="legend"]')
      .className.split("-")[1]
      .split(" ")[0];

    let startTime = Date.now();
    let timeout = 30000;

    function monitorChange() {
      var conditionMet = checkCondition();

      if (conditionMet || Date.now() - startTime > timeout) {
        var keyUpEvent = new KeyboardEvent("keyup", {
          key: "ArrowLeft",
          keyCode: 37,
          code: "ArrowLeft",
          which: 37,
        });
        setTimeout(() => {
          document.dispatchEvent(keyUpEvent);
        }, 150);
        return;
      } else {
        requestAnimationFrame(monitorChange);
      }
    }

    function checkCondition() {
      let similarValue = document.querySelectorAll(
        `div[data-name="legend-source-item"] .valueValue-${classNameSuffix}`
      )[17].innerText;
      let highValue = document.querySelectorAll(
        `div[data-name="legend-series-item"] .valueValue-${classNameSuffix}`
      )[2].innerText;
      return similarValue == highValue;
    }
    return monitorChange();
  });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await captureChart(page, chatId + "similar");
  await new Promise((resolve) => setTimeout(resolve, 600));
  bot.sendPhoto(chatId, `./screenshots/${chatId}similar.png`);
  bot.sendMessage(chatId, "/similar for next similar date");
  setTimeout(() => {
    fs.unlinkSync(`./screenshots/${chatId}similar.png`);
  }, 1000);
}
module.exports = similarHandler;
