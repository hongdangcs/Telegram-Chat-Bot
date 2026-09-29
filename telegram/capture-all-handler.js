const { tradingView } = require("../configs");
const { fetchBars } = require("../tradingview/market-data");
const timeframeFor = require("../tradingview/timeframes");
const { analyzeSimilarPatterns } = require("../analysis/similar");
const { renderChartStack } = require("../render/chart");
const sendPhoto = require("./send-photo");

// Every configured interval stacked into one image.
async function captureAllHandler(bot, chatId, symbol) {
  const charts = await Promise.all(
    Object.keys(tradingView.timeInterval).map(async (interval) => {
      const data = await fetchBars(symbol, timeframeFor(interval));
      return {
        data,
        analysis: analyzeSimilarPatterns(data.bars),
        title: `${symbol} · ${interval}`,
      };
    })
  );
  await sendPhoto(bot, chatId, await renderChartStack(charts));
}

module.exports = captureAllHandler;
