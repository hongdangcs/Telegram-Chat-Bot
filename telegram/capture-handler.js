const chartData = require("../tradingview/chart-data");
const { tradingView } = require("../configs");
const sendPhoto = require("./send-photo");
const timeIntervals = tradingView.timeInterval;

async function captureHandler(bot, chatId, page, interval) {
  const { image, priceChange } = await chartData(page, timeIntervals[interval]);
  await bot.sendMessage(chatId, formatPatternStats(priceChange), {
    parse_mode: "HTML",
  });
  await sendPhoto(bot, chatId, image);
}

function formatPatternStats(priceChange) {
  const rows = [1, 2, 3].map((frame) => {
    const up = priceChange[`increase${frame}`];
    const down = priceChange[`decrease${frame}`];
    if (!Number.isFinite(up) || !Number.isFinite(down)) {
      throw new Error("Could not read pattern counts from the chart legend");
    }
    return { frame, up, down, percentUp: ((100 * up) / (up + down)).toFixed(2) };
  });

  // Every similar bar adds exactly one up-or-down count per time frame, so
  // all three rows share the same total.
  if (rows[0].up + rows[0].down === 0) {
    return "No similar patterns were found in this chart's history.";
  }

  return (
    `There is a ${rows[0].percentUp}% chance of the price increasing in the next 1 time frame, ` +
    `${rows[1].percentUp}% for an increase for next 2 time frames and ` +
    `${rows[2].percentUp}% for an increase for next 3 time frames.` +
    `<pre>${formatTable(
      ["Time Frame", "Up", "Down", "% Up"],
      rows.map((row) => [row.frame, row.up, row.down, `${row.percentUp}%`])
    )}</pre>`
  );
}

function formatTable(header, body) {
  const cells = [header, ...body].map((row) => row.map(String));
  const widths = header.map((_, i) =>
    Math.max(...cells.map((row) => row[i].length))
  );
  const border = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";
  const line = (row) =>
    "| " + row.map((cell, i) => cell.padStart(widths[i])).join(" | ") + " |";
  const [headerRow, ...bodyRows] = cells;
  return [border, line(headerRow), border, ...bodyRows.map(line), border].join(
    "\n"
  );
}

module.exports = captureHandler;
