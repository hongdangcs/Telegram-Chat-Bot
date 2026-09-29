const captureChart = require("../tradingview/capture-chart");
const sendPhoto = require("./send-photo");

async function similarHandler(page, bot, chatId) {
  await page.mouse.move(900, 600);
  await page.mouse.down();
  await new Promise((resolve) => setTimeout(resolve, 300));
  // Scrolls the chart left until the bar under the cursor is flagged by the
  // Pine script (similarLine == High). Resolves once scrolling has stopped:
  // true if a similar bar was found, false after the 30s timeout.
  const found = await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const arrowLeft = {
          key: "ArrowLeft",
          keyCode: 37,
          code: "ArrowLeft",
          which: 37,
        };
        const classNameSuffix = document
          .querySelector('div[data-name="legend"]')
          .className.split("-")[1]
          .split(" ")[0];
        const startTime = Date.now();
        const timeout = 30000;

        function stopScrolling(done) {
          setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent("keyup", arrowLeft));
            done();
          }, 150);
        }

        function monitorChange() {
          try {
            const conditionMet = checkCondition();
            if (conditionMet || Date.now() - startTime > timeout) {
              stopScrolling(() => resolve(conditionMet));
            } else {
              requestAnimationFrame(monitorChange);
            }
          } catch (error) {
            stopScrolling(() => reject(error));
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

        document.dispatchEvent(new KeyboardEvent("keydown", arrowLeft));
        monitorChange();
      })
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const image = await captureChart(page);
  await sendPhoto(bot, chatId, image);
  await bot.sendMessage(
    chatId,
    found
      ? "/similar for next similar interval"
      : "No similar interval found within 30s of scrolling. /similar to keep searching"
  );
}
module.exports = similarHandler;
