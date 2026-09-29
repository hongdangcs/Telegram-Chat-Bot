// Pine Script v5 built-ins over plain arrays. NaN plays the role of `na`:
// arithmetic with it stays NaN and every comparison with it is false, which
// is how Pine treats `na` in conditions.

function sma(values, length) {
  return values.map((_, i) => {
    if (i < length - 1) return NaN;
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) sum += values[j];
    return sum / length;
  });
}

// ta.rma: seeded with the SMA of the first full window, then Wilder smoothing.
function rma(values, length) {
  const alpha = 1 / length;
  const seed = sma(values, length);
  let previous = NaN;
  return values.map((value, i) => {
    previous = Number.isNaN(previous)
      ? seed[i]
      : alpha * value + (1 - alpha) * previous;
    return previous;
  });
}

function rsi(values, length) {
  const change = values.map((value, i) => (i === 0 ? NaN : value - values[i - 1]));
  const up = rma(change.map((c) => Math.max(c, 0)), length);
  const down = rma(change.map((c) => -Math.min(c, 0)), length);
  return up.map((u, i) => {
    const d = down[i];
    if (d === 0) return 100;
    if (u === 0) return 0;
    return 100 - 100 / (1 + u / d);
  });
}

function rolling(values, length, pick) {
  return values.map((_, i) => {
    if (i < length - 1) return NaN;
    let result = values[i - length + 1];
    for (let j = i - length + 2; j <= i; j++) result = pick(result, values[j]);
    return result;
  });
}

const highest = (values, length) => rolling(values, length, Math.max);
const lowest = (values, length) => rolling(values, length, Math.min);

// ta.stoch(source, high, low, length)
function stoch(source, high, low, length) {
  const hi = highest(high, length);
  const lo = lowest(low, length);
  return source.map((value, i) => (100 * (value - lo[i])) / (hi[i] - lo[i]));
}

// Built-in "Stochastic RSI" with its defaults (3, 3, 14, 14, close).
function stochRsi(close, smoothK = 3, smoothD = 3, lengthRSI = 14, lengthStoch = 14) {
  const rsi1 = rsi(close, lengthRSI);
  const k = sma(stoch(rsi1, rsi1, rsi1, lengthStoch), smoothK);
  const d = sma(k, smoothD);
  return { k, d };
}

// Built-in "Ichimoku Cloud" (9, 26, 52, 26). Lead lines are returned
// unshifted: leadLine1[i] is drawn `displacement - 1` bars after bar i.
function ichimoku(high, low, conversionPeriods = 9, basePeriods = 26, spanBPeriods = 52) {
  const donchian = (length) => {
    const lo = lowest(low, length);
    const hi = highest(high, length);
    return lo.map((value, i) => (value + hi[i]) / 2);
  };
  const conversion = donchian(conversionPeriods);
  const base = donchian(basePeriods);
  return {
    conversion,
    base,
    leadLine1: conversion.map((value, i) => (value + base[i]) / 2),
    leadLine2: donchian(spanBPeriods),
  };
}

module.exports = { sma, rma, rsi, highest, lowest, stoch, stochRsi, ichimoku };
