// Draws a TradingView-style chart: candles, Ichimoku cloud, the bars the
// similarity search highlights, and a Stochastic RSI pane.
const { createCanvas } = require("@napi-rs/canvas");
const { DISPLACEMENT } = require("../analysis/similar");
const { formatPrice, formatPercent, formatTime } = require("./format");

const FONT = "Arial, 'Segoe UI', 'DejaVu Sans', sans-serif";
const COLORS = {
  background: "#ffffff",
  grid: "#f0f3fa",
  border: "#e0e3eb",
  text: "#131722",
  muted: "#787b86",
  up: "#26a69a",
  down: "#ef5350",
  conversion: "#2962ff",
  base: "#b71c1c",
  lagging: "#43a047",
  leadA: "#a5d6a7",
  leadB: "#ef9a9a",
  cloudUp: "rgba(67, 160, 71, 0.12)",
  cloudDown: "rgba(244, 67, 54, 0.12)",
  highlight: "rgba(255, 152, 0, 0.22)",
  focus: "#ff9800",
  k: "#2962ff",
  d: "#ff6d00",
  band: "#9598a1",
  bandFill: "rgba(33, 150, 243, 0.08)",
};
const VISIBLE_BARS = 120;
// Bars shown after the focused bar when stepping through /similar.
const BARS_AFTER_FOCUS = 40;
// Leading spans are drawn DISPLACEMENT - 1 bars ahead of the bar they belong to.
const LEAD_OFFSET = DISPLACEMENT - 1;
const PRICE_AXIS_WIDTH = 90;
const HEADER_HEIGHT = 44;
const TIME_AXIS_HEIGHT = 26;
const PANE_GAP = 8;

function niceStep(range, targetTicks) {
  const rough = range / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice = residual > 5 ? 10 : residual > 2.5 ? 5 : residual > 2 ? 2.5 : residual > 1 ? 2 : 1;
  return nice * magnitude;
}

function visibleRange(barCount, focusIndex) {
  const last = barCount - 1;
  if (focusIndex === undefined) {
    return { start: Math.max(0, last - VISIBLE_BARS + 1), end: last };
  }
  const end = Math.min(last, focusIndex + BARS_AFTER_FOCUS);
  return { start: Math.max(0, end - VISIBLE_BARS + 1), end };
}

/**
 * @param ctx 2D context to draw into
 * @param box {x, y, width, height} area to fill
 * @param options {data, analysis, title, focusIndex?}
 */
function drawChart(ctx, box, { data, analysis, title, focusIndex }) {
  const { bars, info, timeframe } = data;
  const { indicators, highlighted } = analysis;
  const last = bars.length - 1;
  const { start, end } = visibleRange(bars.length, focusIndex);
  // Project the cloud into the future only when the latest bar is visible.
  const slotEnd = end === last ? end + LEAD_OFFSET : end;
  const reference = focusIndex === undefined ? end : focusIndex;

  const plotLeft = box.x + 8;
  const plotRight = box.x + box.width - PRICE_AXIS_WIDTH;
  const barWidth = (plotRight - plotLeft) / (slotEnd - start + 1);
  const xAt = (i) => plotLeft + (i - start + 0.5) * barWidth;

  const available = box.height - HEADER_HEIGHT - TIME_AXIS_HEIGHT;
  const stochHeight = Math.round(available * 0.24);
  const main = { top: box.y + HEADER_HEIGHT, bottom: box.y + HEADER_HEIGHT + available - stochHeight - PANE_GAP };
  const stoch = { top: main.bottom + PANE_GAP, bottom: main.bottom + PANE_GAP + stochHeight };

  const leadA = (i) => indicators.leadLine1[i - LEAD_OFFSET];
  const leadB = (i) => indicators.leadLine2[i - LEAD_OFFSET];
  const lagging = (i) => (i + LEAD_OFFSET <= last ? bars[i + LEAD_OFFSET].close : NaN);

  // Price scale covers everything drawn in the main pane.
  let low = Infinity;
  let high = -Infinity;
  const include = (value) => {
    if (Number.isFinite(value)) {
      low = Math.min(low, value);
      high = Math.max(high, value);
    }
  };
  for (let i = start; i <= slotEnd; i++) {
    if (i <= end) {
      include(bars[i].low);
      include(bars[i].high);
      include(indicators.conversion[i]);
      include(indicators.base[i]);
      include(lagging(i));
    }
    include(leadA(i));
    include(leadB(i));
  }
  const padding = (high - low || Math.abs(high) || 1) * 0.05;
  low -= padding;
  high += padding;
  const yPrice = (value) => main.bottom - ((value - low) / (high - low)) * (main.bottom - main.top);
  // 0-100 with a little headroom so K and D are not clipped at the extremes.
  const yStoch = (value) => stoch.bottom - ((value + 6) / 112) * (stoch.bottom - stoch.top);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(box.x, box.y, box.width, box.height);

  // Grid and price axis labels.
  const step = niceStep(high - low, 7);
  const priceTicks = [];
  for (let value = Math.ceil(low / step) * step; value <= high; value += step) priceTicks.push(value);
  const timeStep = Math.max(1, Math.ceil((slotEnd - start + 1) / 8));
  const timeTicks = [];
  for (let i = start + Math.floor(timeStep / 2); i <= end; i += timeStep) timeTicks.push(i);

  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.grid;
  for (const value of priceTicks) line(ctx, plotLeft, yPrice(value), plotRight, yPrice(value));
  for (const i of timeTicks) {
    line(ctx, xAt(i), main.top, xAt(i), main.bottom);
    line(ctx, xAt(i), stoch.top, xAt(i), stoch.bottom);
  }

  clip(ctx, plotLeft, main.top, plotRight, main.bottom, () => {
    // Bars the Pine script painted orange.
    ctx.fillStyle = COLORS.highlight;
    for (const i of highlighted) {
      if (i >= start && i <= end) ctx.fillRect(xAt(i) - barWidth / 2, main.top, barWidth, main.bottom - main.top);
    }

    // Cloud between the leading spans, green while span A is above span B.
    for (let i = start; i < slotEnd; i++) {
      const [a1, b1, a2, b2] = [leadA(i), leadB(i), leadA(i + 1), leadB(i + 1)];
      if (![a1, b1, a2, b2].every(Number.isFinite)) continue;
      ctx.fillStyle = a1 > b1 ? COLORS.cloudUp : COLORS.cloudDown;
      ctx.beginPath();
      ctx.moveTo(xAt(i), yPrice(a1));
      ctx.lineTo(xAt(i + 1), yPrice(a2));
      ctx.lineTo(xAt(i + 1), yPrice(b2));
      ctx.lineTo(xAt(i), yPrice(b1));
      ctx.closePath();
      ctx.fill();
    }

    series(ctx, start, slotEnd, xAt, (i) => yPrice(leadA(i)), COLORS.leadA);
    series(ctx, start, slotEnd, xAt, (i) => yPrice(leadB(i)), COLORS.leadB);
    series(ctx, start, end, xAt, (i) => yPrice(lagging(i)), COLORS.lagging);
    series(ctx, start, end, xAt, (i) => yPrice(indicators.conversion[i]), COLORS.conversion);
    series(ctx, start, end, xAt, (i) => yPrice(indicators.base[i]), COLORS.base);

    const bodyWidth = Math.max(1, barWidth * 0.7);
    for (let i = start; i <= end; i++) {
      const bar = bars[i];
      ctx.strokeStyle = ctx.fillStyle = bar.close >= bar.open ? COLORS.up : COLORS.down;
      line(ctx, xAt(i), yPrice(bar.high), xAt(i), yPrice(bar.low));
      const top = yPrice(Math.max(bar.open, bar.close));
      const bottom = yPrice(Math.min(bar.open, bar.close));
      ctx.fillRect(xAt(i) - bodyWidth / 2, top, bodyWidth, Math.max(1, bottom - top));
    }
  });

  // Stochastic RSI pane.
  ctx.fillStyle = COLORS.bandFill;
  ctx.fillRect(plotLeft, yStoch(80), plotRight - plotLeft, yStoch(20) - yStoch(80));
  ctx.strokeStyle = COLORS.band;
  ctx.setLineDash([4, 4]);
  for (const level of [80, 50, 20]) line(ctx, plotLeft, yStoch(level), plotRight, yStoch(level));
  ctx.setLineDash([]);
  clip(ctx, plotLeft, stoch.top, plotRight, stoch.bottom, () => {
    series(ctx, start, end, xAt, (i) => yStoch(indicators.k[i]), COLORS.k);
    series(ctx, start, end, xAt, (i) => yStoch(indicators.d[i]), COLORS.d);
  });

  if (focusIndex !== undefined) {
    ctx.strokeStyle = COLORS.focus;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    line(ctx, xAt(focusIndex), main.top, xAt(focusIndex), stoch.bottom);
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
  }

  // Pane borders.
  ctx.strokeStyle = COLORS.border;
  ctx.strokeRect(plotLeft, main.top, plotRight - plotLeft, main.bottom - main.top);
  ctx.strokeRect(plotLeft, stoch.top, plotRight - plotLeft, stoch.bottom - stoch.top);

  // Axes.
  ctx.font = `12px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.muted;
  for (const value of priceTicks) {
    const y = yPrice(value);
    if (y > main.top + 6 && y < main.bottom - 6) ctx.fillText(formatPrice(value, info), plotRight + 8, y);
  }
  for (const level of [80, 50, 20]) ctx.fillText(String(level), plotRight + 8, yStoch(level));

  if (end === last) {
    const close = bars[last].close;
    const color = close >= bars[last].open ? COLORS.up : COLORS.down;
    ctx.strokeStyle = color;
    ctx.setLineDash([2, 3]);
    line(ctx, plotLeft, yPrice(close), plotRight, yPrice(close));
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.fillRect(plotRight + 1, yPrice(close) - 10, PRICE_AXIS_WIDTH - 2, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(formatPrice(close, info), plotRight + 8, yPrice(close));
  }

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.muted;
  const timeY = stoch.bottom + TIME_AXIS_HEIGHT / 2;
  for (const i of timeTicks) ctx.fillText(formatTime(bars[i].time, timeframe, info, true), xAt(i), timeY);

  // Header: symbol, OHLC and Stoch RSI values of the reference bar.
  const bar = bars[reference];
  const previous = bars[reference - 1];
  const barColor = bar.close >= bar.open ? COLORS.up : COLORS.down;
  let x = plotLeft;
  const text = (value, color, font = `13px ${FONT}`) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(value, x, box.y + 18);
    x += ctx.measureText(value).width + 10;
  };
  ctx.textAlign = "left";
  text(title, COLORS.text, `bold 15px ${FONT}`);
  text(formatTime(bar.time, timeframe, info), COLORS.muted);
  for (const [label, value] of [["O", bar.open], ["H", bar.high], ["L", bar.low], ["C", bar.close]]) {
    text(`${label} ${formatPrice(value, info)}`, barColor);
  }
  if (previous) text(formatPercent(((bar.close - previous.close) / previous.close) * 100), barColor);

  const value = (v) => (Number.isFinite(v) ? v.toFixed(2) : "n/a");
  const legend = [
    ["Stoch RSI 3 3 14 14", COLORS.muted],
    [`K ${value(indicators.k[reference])}`, COLORS.k],
    [`D ${value(indicators.d[reference])}`, COLORS.d],
  ];
  ctx.font = `12px ${FONT}`;
  const legendWidth = legend.reduce((sum, [label]) => sum + ctx.measureText(label).width + 10, 0);
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(plotLeft + 1, stoch.top + 1, legendWidth + 8, 22);
  x = plotLeft + 6;
  for (const [label, color] of legend) {
    ctx.fillStyle = color;
    ctx.fillText(label, x, stoch.top + 12);
    x += ctx.measureText(label).width + 10;
  }
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Polyline that breaks wherever the value is missing (na).
function series(ctx, from, to, xAt, yAt, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  let drawing = false;
  for (let i = from; i <= to; i++) {
    const y = yAt(i);
    if (!Number.isFinite(y)) {
      drawing = false;
      continue;
    }
    if (drawing) ctx.lineTo(xAt(i), y);
    else ctx.moveTo(xAt(i), y);
    drawing = true;
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

function clip(ctx, left, top, right, bottom, draw) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  draw();
  ctx.restore();
}

/** Renders one chart to a PNG buffer. */
function renderChart(options, width = 1280, height = 720) {
  const canvas = createCanvas(width, height);
  drawChart(canvas.getContext("2d"), { x: 0, y: 0, width, height }, options);
  return canvas.encode("png");
}

/** Renders several charts stacked vertically into one PNG buffer. */
function renderChartStack(optionsList, width = 1280, heightEach = 560) {
  const canvas = createCanvas(width, heightEach * optionsList.length);
  const ctx = canvas.getContext("2d");
  optionsList.forEach((options, index) => {
    drawChart(ctx, { x: 0, y: index * heightEach, width, height: heightEach }, options);
  });
  return canvas.encode("png");
}

module.exports = { renderChart, renderChartStack };
