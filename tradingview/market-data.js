const TradingView = require("@mathieuc/tradingview");
const { tradingView } = require("../configs");

// Same history depth TradingView loads on a chart, so the similarity search
// sees roughly the same bars the Pine script used to.
const BAR_COUNT = 5000;
const FETCH_TIMEOUT_MS = 20000;
// Bars barely change between taps; reuse them across users and intervals.
const CACHE_TTL_MS = 30000;

const cache = new Map();
let client;
let useLogin = Boolean(tradingView.login && tradingView.login.sessionid);

// One websocket is shared by every request and replaced once it drops.
function getClient() {
  if (client && !client.closed) {
    return client;
  }
  const { sessionid, sessionid_sign } = tradingView.login || {};
  const current = new TradingView.Client(
    useLogin ? { token: sessionid, signature: sessionid_sign } : {}
  );
  current.closed = false;
  current.pending = new Set();
  const close = (reason) => {
    if (current.closed) return;
    current.closed = true;
    current.pending.forEach((fail) => fail(new Error(reason)));
    current.end();
  };
  current.onDisconnected(() => close("TradingView connection closed"));
  current.onError((...messages) => {
    const text = messages.join(" ");
    if (text.startsWith("Credentials error")) {
      // Expired session cookies should not take charts down; public data
      // works without logging in.
      console.error("TradingView login failed, continuing without login");
      useLogin = false;
    } else {
      console.error("TradingView error:", text);
    }
    close(text);
  });
  client = current;
  return client;
}

function loadBars(symbol, timeframe) {
  const activeClient = getClient();
  return new Promise((resolve, reject) => {
    const chart = new activeClient.Session.Chart();
    let settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      activeClient.pending.delete(fail);
      chart.delete();
      if (error) reject(error);
      else resolve(result);
    };
    const fail = (error) => finish(error);
    const timer = setTimeout(
      () => fail(new Error(`Timed out loading ${symbol} ${timeframe}`)),
      FETCH_TIMEOUT_MS
    );
    activeClient.pending.add(fail);

    chart.onError((...messages) => fail(new Error(messages.join(" "))));
    chart.onUpdate((changes) => {
      if (!changes.includes("$prices")) return;
      const periods = chart.periods; // newest first
      if (periods.length === 0) return;
      finish(null, {
        symbol,
        timeframe,
        info: chart.infos,
        bars: periods.reverse().map((p) => ({
          time: p.time,
          open: p.open,
          high: p.max,
          low: p.min,
          close: p.close,
          volume: p.volume,
        })),
      });
    });
    chart.setMarket(symbol, { timeframe, range: BAR_COUNT });
  });
}

/**
 * Loads up to BAR_COUNT bars, oldest first, for a TradingView symbol such
 * as "HOSE:FPT" and a timeframe such as "60", "240", "1D" or "1W".
 * @returns {Promise<{symbol: string, timeframe: string, info: object,
 *   bars: {time: number, open: number, high: number, low: number,
 *   close: number, volume: number}[]}>}
 */
function fetchBars(symbol, timeframe) {
  const key = `${symbol}|${timeframe}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.promise;
  }
  for (const [cachedKey, entry] of cache) {
    if (entry.expires <= Date.now()) cache.delete(cachedKey);
  }
  const promise = loadBars(symbol, timeframe);
  cache.set(key, { promise, expires: Date.now() + CACHE_TTL_MS });
  promise.catch(() => cache.delete(key));
  return promise;
}

function close() {
  if (client) client.end();
}

module.exports = { fetchBars, close };
