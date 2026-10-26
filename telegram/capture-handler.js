const { fetchBars } = require("../tradingview/market-data");
const timeframeFor = require("../tradingview/timeframes");
const { analyzeSimilarPatterns } = require("../analysis/similar");
const { renderChart } = require("../render/chart");
const { formatTime } = require("../render/format");
const sendPhoto = require("./send-photo");

/**
 * Sends the chart with the similar-pattern odds as its caption and returns
 * what /similar needs to step back through the highlighted bars.
 */
async function captureHandler(bot, chatId, symbol, interval) {
  const data = await fetchBars(symbol, timeframeFor(interval));
  const analysis = analyzeSimilarPatterns(data.bars);
  const title = `${symbol} · ${interval}`;
  const image = await renderChart({ data, analysis, title });
  await sendPhoto(bot, chatId, image, {
    caption: formatPatternStats(analysis.counts, data),
    parse_mode: "HTML",
  });
  const last = data.bars.length - 1;
  return {
    data,
    analysis,
    title,
    // Index into analysis.highlighted; /similar walks it backwards,
    // skipping the latest bar since that is the setup being compared.
    cursor: analysis.highlighted.filter((index) => index < last).length,
  };
}

function formatPatternStats(counts, data) {
  const rows = [1, 2, 3].map((frame) => {
    const up = counts[`increase${frame}`];
    const down = counts[`decrease${frame}`];
    return { frame, up, down, percentUp: ((100 * up) / (up + down)).toFixed(2) };
  });

  // Every similar bar adds exactly one up-or-down count per time frame, so
  // all three rows share the same total.
  const total = rows[0].up + rows[0].down;
  if (total === 0) {
    return "No similar patterns were found in this chart's history.";
  }

  const since = formatTime(data.bars[0].time, data.timeframe, data.info);
  return (
    `There is a ${rows[0].percentUp}% chance of the price increasing in the next 1 time frame, ` +
    `${rows[1].percentUp}% for an increase for next 2 time frames and ` +
    `${rows[2].percentUp}% for an increase for next 3 time frames.\n` +
    `Based on ${total} similar setups in ${data.bars.length} bars since ${since}.` +
    `<pre>${formatTable(
      ["Time Frame", "Up", "Down", "% Up"],
      rows.map((row) => [row.frame, row.up, row.down, `${row.percentUp}%`])
    )}</pre>` +
    "/similar to see the latest one"
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
