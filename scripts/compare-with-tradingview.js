// Checks the Node port against TradingView itself, using the TradingView
// session from configs.js:
//   node scripts/compare-with-tradingview.js HOSE:FPT 1h
// 1. Stochastic RSI and Ichimoku values vs TradingView's built-in indicators.
// 2. If tradingviewscripts.txt is saved in your Pine Editor, runs it with the
//    current values as inputs and compares its up/down counts with Node's.
const TradingView = require("@mathieuc/tradingview");
const { tradingView } = require("../configs");
const timeframeFor = require("../tradingview/timeframes");
const { computeIndicators, currentState, countSimilar } = require("../analysis/similar");

const [symbol = "HOSE:FPT", interval = "1h"] = process.argv.slice(2);
const timeframe = tradingView.timeInterval[interval] ? timeframeFor(interval) : interval;
const { sessionid, sessionid_sign } = tradingView.login || {};
if (!sessionid) {
  console.error("Set tradingView.login.sessionid and sessionid_sign in configs.js");
  process.exit(1);
}
const describe = (messages) =>
  messages.map((m) => (typeof m === "object" ? JSON.stringify(m) : m)).join(" ");

const client = new TradingView.Client({ token: sessionid, signature: sessionid_sign });
client.onError((...messages) => {
  console.error(describe(messages));
  process.exit(1);
});

// One study per chart session: free plans allow very few studies per chart.
function runStudy(indicator) {
  return new Promise((resolve, reject) => {
    const chart = new client.Session.Chart();
    const timer = setTimeout(() => fail(`Timed out running ${indicator.description}`), 60000);
    let barsLoaded = false;
    let settled = false;
    chart.setMarket(symbol, { timeframe, range: 5000 });
    const study = new chart.Study(indicator);
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      chart.delete();
      if (error) reject(error);
      else resolve(result);
    };
    const fail = (...messages) => finish(new Error(describe(messages)));
    const tryResolve = () => {
      if (!barsLoaded || study.periods.length === 0) return;
      finish(null, {
        bars: chart.periods.reverse().map((p) => ({
          time: p.time,
          open: p.open,
          high: p.max,
          low: p.min,
          close: p.close,
        })),
        values: new Map(study.periods.map((row) => [row.$time, row])),
      });
    };
    chart.onError(fail);
    study.onError(fail);
    chart.onUpdate((changes) => {
      if (changes.includes("$prices") && chart.periods.length) {
        barsLoaded = true;
        tryResolve();
      }
    });
    study.onUpdate(tryResolve);
  });
}

function compareSeries(name, nodeValues, run, plot) {
  let compared = 0;
  let maxError = 0;
  let naMismatch = 0;
  run.bars.forEach((bar, i) => {
    const row = run.values.get(bar.time);
    const tv = row ? row[plot] : undefined;
    const tvValid = typeof tv === "number" && Number.isFinite(tv) && Math.abs(tv) < 1e90;
    if (Number.isFinite(nodeValues[i]) !== tvValid) {
      naMismatch++;
      return;
    }
    if (!tvValid) return;
    compared++;
    maxError = Math.max(maxError, Math.abs(nodeValues[i] - tv) / Math.max(1, Math.abs(tv)));
  });
  const ok = maxError < 1e-6 && naMismatch === 0;
  console.log(
    `${ok ? "MATCH" : "DIFF "} ${name.padEnd(16)} bars=${compared} maxRelError=${maxError.toExponential(1)} naMismatch=${naMismatch}`
  );
  return ok;
}

(async () => {
  console.log(`${symbol} ${timeframe}`);
  let ok = true;

  const stoch = await runStudy(await TradingView.getIndicator("STD;Stochastic_RSI"));
  const stochNode = computeIndicators(stoch.bars);
  ok = compareSeries("Stoch RSI K", stochNode.k, stoch, "K") && ok;
  ok = compareSeries("Stoch RSI D", stochNode.d, stoch, "D") && ok;

  const ichimoku = await runStudy(await TradingView.getIndicator("STD;Ichimoku%1Cloud"));
  const ichimokuNode = computeIndicators(ichimoku.bars);
  ok = compareSeries("Conversion Line", ichimokuNode.conversion, ichimoku, "Conversion_Line") && ok;
  ok = compareSeries("Base Line", ichimokuNode.base, ichimoku, "Base_Line") && ok;
  ok = compareSeries("Leading Span A", ichimokuNode.leadLine1, ichimoku, "Leading_Span_A") && ok;
  ok = compareSeries("Leading Span B", ichimokuNode.leadLine2, ichimoku, "Leading_Span_B") && ok;

  const saved = (await TradingView.getPrivateIndicators(sessionid, sessionid_sign)).find(
    (script) => script.source && script.source.includes("increase1plot")
  );
  if (!saved) {
    console.log("tradingviewscripts.txt is not saved in your Pine Editor; skipped the count comparison.");
  } else {
    const pine = await saved.get();
    const current = currentState(ichimokuNode);
    const inputs = {
      Current_K: current.k,
      Current_D: current.d,
      Current_Conversion: current.conversion,
      Current_Base: current.base,
      Current_LeadA: current.leadA,
      Current_LeadB: current.leadB,
      Current_Close: current.close,
    };
    for (const [input, value] of Object.entries(inputs)) pine.setOption(input, value);
    const run = await runStudy(pine);

    // The script reports each count as `high - count` on the last bar.
    const lastBar = run.bars[run.bars.length - 1];
    const lastRow = run.values.get(lastBar.time);
    const nodeCounts = countSimilar(computeIndicators(run.bars), current).counts;
    for (const key of Object.keys(nodeCounts)) {
      const pineCount = Math.round(lastBar.high - lastRow[`${key}plot`]);
      const match = pineCount === nodeCounts[key];
      ok = match && ok;
      console.log(`${match ? "MATCH" : "DIFF "} ${key.padEnd(16)} pine=${pineCount} node=${nodeCounts[key]}`);
    }
  }

  client.end();
  console.log(ok ? "Node port matches TradingView" : "Differences found");
  process.exit(ok ? 0 : 1);
})().catch((error) => {
  console.error(error.message);
  client.end();
  process.exit(1);
});
