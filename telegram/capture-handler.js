const chartData = require("../tradingview/chart-data");
const { tradingView } = require("../configs");
const timeIntervals = tradingView.timeInterval;
const stock = tradingView.stock;
const fs = require("fs");

async function captureHandler(msg, chatState, chatId, bot, page) {
  const imgName = `${chatId}_${chatState.coin}_${chatState.timeInterval}`;
  const responData = await chartData(
    page,
    stock[chatState.coin],
    timeIntervals[chatState.timeInterval],
    imgName
  );
  let priceIncrease1 =
    100 *
    (+responData.increase1 / (+responData.decrease1 + +responData.increase1));
  priceIncrease1 = priceIncrease1.toFixed(2);
  let priceIncrease2 =
    100 *
    (+responData.increase2 / (+responData.decrease2 + +responData.increase2));
  priceIncrease2 = priceIncrease2.toFixed(2);
  let priceIncrease3 =
    100 *
    (+responData.increase3 / (+responData.decrease3 + +responData.increase3));
  priceIncrease3 = priceIncrease3.toFixed(2);
  /*
  bot.sendMessage(
    chatId,
    `1: ${priceIncrease1}% up(${responData.increase1}/${responData.decrease1})\n2: ${priceIncrease2}% up(${responData.increase2}/${responData.decrease2})\n3: ${priceIncrease3}% up(${responData.increase3}/${responData.decrease3})`
  );*/
  bot.sendMessage(
    chatId,
    `There is a ${priceIncrease1}% chance of the price increasing in the next 1 time frame, ${priceIncrease2}% for an increase for next 2 time frames and ${priceIncrease3}% for an increase for next 3 time frames.` +
      `<pre>+------------+----+------+-------+\n
| Time Frame | Up | Down | % Up  |\n
+------------+----+------+-------+\n
|      1     | ${responData.increase1} | ${responData.decrease1}   | ${priceIncrease1}%|\n
|      2     | ${responData.increase2} | ${responData.decrease2}   | ${priceIncrease2}%|\n
|      3     | ${responData.increase3} | ${responData.decrease3}   | ${priceIncrease3}%|\n
+------------+----+------+-------+\n
</pre>`,
    { parse_mode: "HTML" }
  );
  bot.sendPhoto(chatId, `./screenshots/${imgName}.png`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  setTimeout(() => {
    fs.unlinkSync(`./screenshots/${imgName}.png`);
  }, 1000);
}

module.exports = captureHandler;
