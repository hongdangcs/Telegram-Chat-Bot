// Canvas port of drawChart() in index.html: order-book snapshots over time,
// one bubble per price level sized by its volume.
const { createCanvas } = require("@napi-rs/canvas");

const FONT = "Arial, 'Segoe UI', 'DejaVu Sans', sans-serif";
const COLORS = {
  background: "#ffffff",
  text: "#131722",
  muted: "#787b86",
  axis: "#e0e3eb",
  askFill: "rgba(255, 155, 73, 0.46)",
  askStroke: "#ff9b49",
  bidFill: "rgba(0, 168, 107, 0.46)",
  bidStroke: "#00a86b",
  volatileFill: "rgba(201, 37, 25, 0.53)",
  volatileStroke: "#c92519",
  bestAsk: "#ef5350",
  bestBid: "#26a69a",
};
const MAX_RADIUS = 100;
const MIN_RADIUS = 5;
const LEVELS = 10;

// A price level whose volume dropped below 25% of the first snapshot's.
function detectVolatileKey(stock) {
  if (stock.length == 1) return 0;
  let out = LEVELS;
  for (let i = 1; i <= LEVELS; i++) {
    if (stock[0]["AskPrice" + i] == 0) {
      out = i - 1;
      break;
    }
  }
  for (let i = 1; i < stock.length; i++) {
    for (let j = 1; j <= out; j++) {
      if (stock[i]["AskVol" + j] / stock[0]["AskVol" + j] < 0.25) return stock[i]["AskPrice" + j];
      if (stock[i]["BidVol" + j] / stock[0]["BidVol" + j] < 0.25) return stock[i]["BidPrice" + j];
    }
  }
  return 0;
}

const toSeconds = (time) => {
  const [h, m, s] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

function span(values, padRatio, minPad) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * padRatio, minPad);
  return [min - pad, max + pad];
}

// Labels at most one per `minGap` pixels.
function thin(positions, minGap) {
  const kept = [];
  for (const item of positions) {
    if (!kept.length || Math.abs(item.at - kept[kept.length - 1].at) >= minGap) kept.push(item);
  }
  return kept;
}

/** Renders SSI X-QUOTE snapshots of one symbol to a PNG buffer. */
function renderMarketDepth(stock, width = 1280, height = 720) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const plot = { left: 90, right: width - 30, top: 50, bottom: height - 40 };

  const times = stock.map((snapshot) => toSeconds(snapshot.Time));
  const levels = [];
  for (const snapshot of stock) {
    for (let j = 1; j <= LEVELS; j++) {
      for (const side of ["Ask", "Bid"]) {
        const price = snapshot[`${side}Price${j}`];
        const volume = snapshot[`${side}Vol${j}`];
        if (price) levels.push({ side, price, volume });
      }
    }
  }
  if (!levels.length) throw new Error("No order book levels to draw");
  const prices = [...new Set(levels.map((level) => level.price))].sort((a, b) => a - b);
  const maxVolume = Math.max(...levels.map((level) => level.volume));
  const volatileKey = detectVolatileKey(stock);

  const [xMin, xMax] = span(times, 0.08, 30);
  const [yMin, yMax] = span(prices, 0.12, prices[0] * 0.01 || 1);
  const x = (seconds) => plot.left + ((seconds - xMin) / (xMax - xMin)) * (plot.right - plot.left);
  const y = (price) => plot.bottom - ((price - yMin) / (yMax - yMin)) * (plot.bottom - plot.top);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  // Axes with every price level and snapshot time, thinned to stay legible.
  ctx.strokeStyle = COLORS.axis;
  ctx.strokeRect(plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top);
  ctx.font = `13px ${FONT}`;
  ctx.fillStyle = COLORS.text;
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  for (const { value, at } of thin(prices.map((value) => ({ value, at: y(value) })), 16)) {
    ctx.fillText(value.toLocaleString("en-US"), plot.left - 8, at);
  }
  ctx.textAlign = "center";
  for (const { value, at } of thin(stock.map((s, i) => ({ value: s.Time, at: x(times[i]) })), 70)) {
    ctx.fillText(value, at, plot.bottom + 18);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top);
  ctx.clip();
  stock.forEach((snapshot, i) => {
    for (const side of ["Ask", "Bid"]) {
      for (let j = 1; j <= LEVELS; j++) {
        const price = snapshot[`${side}Price${j}`];
        const volume = snapshot[`${side}Vol${j}`];
        if (!price || !volume) continue;
        const volatile = volatileKey != 0 && price == volatileKey;
        ctx.fillStyle = volatile ? COLORS.volatileFill : side === "Ask" ? COLORS.askFill : COLORS.bidFill;
        ctx.strokeStyle = volatile ? COLORS.volatileStroke : side === "Ask" ? COLORS.askStroke : COLORS.bidStroke;
        ctx.beginPath();
        ctx.arc(x(times[i]), y(price), Math.max(MIN_RADIUS, (volume / maxVolume) * MAX_RADIUS), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  });
  // Best ask / best bid over time.
  for (const [key, color] of [["AskPrice1", COLORS.bestAsk], ["BidPrice1", COLORS.bestBid]]) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let drawing = false;
    stock.forEach((snapshot, i) => {
      if (!snapshot[key]) {
        drawing = false;
        return;
      }
      if (drawing) ctx.lineTo(x(times[i]), y(snapshot[key]));
      else ctx.moveTo(x(times[i]), y(snapshot[key]));
      drawing = true;
    });
    ctx.stroke();
    ctx.lineWidth = 1;
  }
  ctx.restore();

  // Title and legend.
  const first = stock[0];
  ctx.textAlign = "left";
  ctx.font = `bold 16px ${FONT}`;
  ctx.fillStyle = COLORS.text;
  const title = `${first.Exchange ? first.Exchange + ":" : ""}${first.Symbol} market depth  ${first.TradingDate} ${first.Time}–${stock[stock.length - 1].Time}`;
  ctx.fillText(title, plot.left, 24);
  ctx.font = `13px ${FONT}`;
  let legendX = plot.right;
  ctx.textAlign = "right";
  for (const [label, color] of [
    ["Volatile level", COLORS.volatileStroke],
    ["Bid", COLORS.bidStroke],
    ["Ask", COLORS.askStroke],
  ]) {
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(label, legendX, 24);
    legendX -= ctx.measureText(label).width + 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(legendX, 24, 5, 0, Math.PI * 2);
    ctx.fill();
    legendX -= 22;
  }

  return canvas.encode("png");
}

module.exports = { renderMarketDepth, detectVolatileKey };
