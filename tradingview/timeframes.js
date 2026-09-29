const { tradingView } = require("../configs");

const UNIT_MINUTES = { m: 1, h: 60 };

/**
 * TradingView timeframe code for a keyboard interval from configs.js.
 * The value may already be a code ("60", "240", "1D", "1W"); older configs
 * map to button labels ("1 hour"), so fall back to parsing the key.
 */
function timeframeFor(interval) {
  const value = tradingView.timeInterval[interval];
  if (/^\d+$|^\d*[DWM]$/.test(value)) return value;
  const match = /^(\d+)(m|h|D|W|M)$/.exec(interval);
  if (!match) {
    throw new Error(`Cannot map interval "${interval}" to a TradingView timeframe`);
  }
  const [, amount, unit] = match;
  return UNIT_MINUTES[unit] ? String(amount * UNIT_MINUTES[unit]) : amount + unit;
}

module.exports = timeframeFor;
