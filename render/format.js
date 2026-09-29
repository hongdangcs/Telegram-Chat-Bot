const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

// TradingView's pricescale is 10^decimals (1 for VND stocks, 100 for 2dp).
function priceDecimals(info) {
  const scale = (info && info.pricescale) || 1;
  return Math.max(0, Math.round(Math.log10(scale)));
}

function formatPrice(value, info) {
  const decimals = priceDecimals(info);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercent(value) {
  return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
}

const isIntraday = (timeframe) => /^\d+$/.test(timeframe);

/**
 * Formats a bar's UNIX time (seconds) in the exchange's time zone:
 * intraday "29/09/2026 14:00", daily "29/09/2026", weekly/monthly "09/2026".
 * `short` drops the year for intraday axis labels.
 */
function formatTime(time, timeframe, info, short = false) {
  const parts = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: (info && info.timezone) || DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date(time * 1000))
    .forEach((part) => (parts[part.type] = part.value));

  if (isIntraday(timeframe)) {
    const date = short ? `${parts.day}/${parts.month}` : `${parts.day}/${parts.month}/${parts.year}`;
    return `${date} ${parts.hour}:${parts.minute}`;
  }
  if (/[WM]$/.test(timeframe)) return `${parts.month}/${parts.year}`;
  return `${parts.day}/${parts.month}/${parts.year}`;
}

module.exports = { formatPrice, formatPercent, formatTime, priceDecimals };
