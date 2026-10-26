const { renderChart } = require("../render/chart");
const { formatPercent, formatTime } = require("../render/format");
const sendPhoto = require("./send-photo");

/**
 * Shows the next older bar the similarity search highlighted, with how the
 * price moved 1, 2 and 3 bars after it. `chart` is what captureHandler
 * returned; its cursor moves back one match per call.
 */
async function similarHandler(bot, chatId, chart) {
  if (chart.cursor === 0) {
    await bot.sendMessage(chatId, "No earlier similar setup in the loaded history.");
    return;
  }
  chart.cursor--;
  const { data, analysis, title } = chart;
  const index = analysis.highlighted[chart.cursor];
  const image = await renderChart({ data, analysis, title, focusIndex: index });

  const close = data.bars[index].close;
  const moves = [1, 2, 3].map((n) => {
    const later = data.bars[index + n];
    const label = `${n} bar${n > 1 ? "s" : ""}`;
    return later ? `${label} ${formatPercent(((later.close - close) / close) * 100)}` : `${label} n/a`;
  });
  await sendPhoto(bot, chatId, image, {
    caption:
      `Similar setup on ${formatTime(data.bars[index].time, data.timeframe, data.info)}\n` +
      `Price after ${moves.join(", ")}\n` +
      (chart.cursor > 0
        ? `/similar for the previous one (${chart.cursor} more)`
        : "This is the oldest similar setup in the loaded history."),
  });
}

module.exports = similarHandler;
