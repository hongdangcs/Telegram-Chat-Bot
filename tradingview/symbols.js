const axios = require("axios");
const { tradingView } = require("../configs");

// Accepts either "HOSE:FPT" or a chart URL such as
// "https://www.tradingview.com/chart/?symbol=HOSE%3AFPT" (older configs).
function toSymbol(value) {
  if (!value.includes("://")) return value;
  return new URL(value).searchParams.get("symbol");
}

async function scanVietnamSymbols() {
  try {
    const response = await axios.get("https://scanner.tradingview.com/vietnam/scan");
    return response.data.data.map((stock) => stock.s);
  } catch (error) {
    console.log("TradingView scanner failed:", error.message);
    return [];
  }
}

/**
 * Ticker -> TradingView symbol ("FPT" -> "HOSE:FPT"), sorted by ticker.
 * Stocks listed in configs.js stay available if the scanner is down and
 * take precedence over scanned ones with the same ticker.
 */
async function loadSymbols() {
  const symbols = new Map();
  for (const symbol of await scanVietnamSymbols()) {
    symbols.set(symbol.split(":")[1], symbol);
  }
  // configs.js keys are the names users type ("/s ltc" for BYBIT:LTCUSDT).
  for (const [ticker, value] of Object.entries(tradingView.stock || {})) {
    const symbol = toSymbol(value);
    if (/^[^:]+:[^:]+$/.test(symbol || "")) {
      symbols.set(ticker.toUpperCase(), symbol);
    } else {
      console.log(`Skipping stock ${ticker} in configs.js: "${value}" is not EXCHANGE:SYMBOL`);
    }
  }
  return new Map([...symbols].sort(([a], [b]) => a.localeCompare(b)));
}

module.exports = { loadSymbols, toSymbol };
