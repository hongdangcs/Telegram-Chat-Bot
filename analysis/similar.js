// Port of the "Similar" section of tradingviewscripts.txt. It finds past bars
// whose Ichimoku and Stochastic RSI state matches the latest bar and counts
// whether price was higher 1, 2 and 3 bars after each match.
const { stochRsi, ichimoku } = require("./indicators");

const DISPLACEMENT = 26;

function computeIndicators(bars) {
  const high = bars.map((bar) => bar.high);
  const low = bars.map((bar) => bar.low);
  const close = bars.map((bar) => bar.close);
  return { close, ...ichimoku(high, low), ...stochRsi(close) };
}

// The values the bot used to read from the chart legend and type into the
// script's inputs. The cloud at bar i was computed DISPLACEMENT - 1 bars earlier.
function currentState(indicators) {
  const last = indicators.close.length - 1;
  const cloudIndex = last - (DISPLACEMENT - 1);
  return {
    k: indicators.k[last],
    d: indicators.d[last],
    conversion: indicators.conversion[last],
    base: indicators.base[last],
    leadA: cloudIndex >= 0 ? indicators.leadLine1[cloudIndex] : NaN,
    leadB: cloudIndex >= 0 ? indicators.leadLine2[cloudIndex] : NaN,
    close: indicators.close[last],
  };
}

function matchesCloud(current, close, leadA, leadB) {
  if (current.close > current.leadA && current.close > current.leadB) {
    return close > leadA && close > leadB;
  }
  if (current.close < current.leadA && current.close < current.leadB) {
    return close < leadA && close < leadB;
  }
  return (close < leadA && close > leadB) || (close > leadA && close < leadB);
}

/**
 * Same bar-by-bar loop as the Pine script. `highlighted` are the bars the
 * script painted orange (similarLine == high), which /similar steps through.
 */
function countSimilar(indicators, current) {
  const { close, conversion, base, leadLine1, leadLine2, k, d } = indicators;
  const counts = { increase1: 0, increase2: 0, increase3: 0, decrease1: 0, decrease2: 0, decrease3: 0 };
  const highlighted = [];
  let closeArray = [];
  let closeToCompare = 0;

  for (let i = 0; i < close.length; i++) {
    closeArray.push(close[i]);

    const similarKD = current.k > current.d ? k[i] > d[i] : k[i] < d[i];
    const similarKRange =
      current.k < 20 ? k[i] < 20 : current.k > 80 ? k[i] > 80 : k[i] >= 20 && k[i] <= 80;
    const similarCB =
      current.conversion > current.base ? conversion[i] > base[i] : conversion[i] < base[i];
    // Pine: array.size(leadAArray) > displacement, with one value pushed per bar.
    const availableCloud = i + 1 > DISPLACEMENT;
    const cloudIndex = i + 1 - DISPLACEMENT;
    const similarCloud =
      availableCloud &&
      matchesCloud(current, close[i], leadLine1[cloudIndex], leadLine2[cloudIndex]);

    if (similarCloud && similarCB && similarKD && similarKRange && current.close !== 0) {
      if (closeToCompare !== 0 && closeArray.length >= 3) {
        highlighted.push(i);
        for (let n = 1; n <= 3; n++) {
          if (closeToCompare > closeArray[n - 1]) counts[`decrease${n}`]++;
          else counts[`increase${n}`]++;
        }
      }
      closeToCompare = close[i];
      closeArray = [];
    }
  }
  return { counts, highlighted };
}

function analyzeSimilarPatterns(bars) {
  const indicators = computeIndicators(bars);
  const current = currentState(indicators);
  return { indicators, current, ...countSimilar(indicators, current) };
}

module.exports = { analyzeSimilarPatterns, computeIndicators, currentState, countSimilar, DISPLACEMENT };
