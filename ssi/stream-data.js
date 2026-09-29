const { ssi } = require("../configs");
const client = require("../ssi-fcdata");
const getAccessToken = require("./get-access-token");

const EventEmitter = require("events");

const CHANNEL = "X-QUOTE:ALL";
// SSI access tokens expire after 8 hours.
const TOKEN_REFRESH_MS = 7 * 60 * 60 * 1000;
const WATCHDOG_MS = 60 * 1000;
// The bundled SignalR client only retries on ECONNRESET; in these states it
// has stopped for good and has to be restarted.
const STOPPED_STATES = [
  "disconnected",
  "connectFailed",
  "errorOccured",
  "bindingError",
  "retryingFailed",
];
const SNAPSHOT_WINDOW_MINUTES = 5;
const MAX_ABNORMAL_STOCKS = 500;

class StockListStreamer extends EventEmitter {
  constructor() {
    super();
    this.stockList = {};
    this.abnormalStocks = [];
  }

  async streamData() {
    if (!ssi.consumerID || !ssi.consumerSecret) {
      console.log("SSI credentials are not set; Market Depth is disabled");
      return;
    }
    let token;
    try {
      token = await getAccessToken();
    } catch (error) {
      console.error("SSI login failed, retrying in 60s:", error.message);
      setTimeout(() => this.streamData(), WATCHDOG_MS);
      return;
    }
    console.log("get access token successful");

    client.initStream({
      url: ssi.HubUrl,
      token: token,
    });
    client.bind(client.events.onData, (message) => this.handleMessage(message));
    client.bind(client.events.onConnected, () => client.switchChannel(CHANNEL));
    client.bind(client.events.onReconnected, () =>
      client.switchChannel(CHANNEL)
    );
    client.start();

    setInterval(() => this.refreshToken(), TOKEN_REFRESH_MS);
    setInterval(async () => {
      if (STOPPED_STATES.includes(client.getState())) {
        console.log(`SSI stream ${client.getState()}, restarting`);
        await this.refreshToken();
        client.start();
      }
    }, WATCHDOG_MS);
  }

  async refreshToken() {
    try {
      client.setToken(await getAccessToken());
    } catch (error) {
      console.error("SSI token refresh failed:", error.message);
    }
  }

  handleMessage(message) {
    try {
      let parsedObject = JSON.parse(message);
      let parsedContent = JSON.parse(parsedObject.Content);
      if (parsedContent.Symbol) {
        modifyStockList(this.stockList, parsedContent);
        this.emit("stockAdded", parsedContent.Symbol);
        detectStock(this.abnormalStocks, parsedContent);
        this.emit("stockListUpdated", this.stockList);
        this.emit("abnormalStocksUpdated", this.abnormalStocks);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }
}

function detectStock(abnormalStocks, parsedContent) {
  let highestBid = 0;
  let secondHighestBid = 0;
  let highestAsk = 0;
  let secondHighestAsk = 0;
  const stockRaito = ssi.stockRaito;

  for (let i = 1; i <= 10; i++) {
    let bid = parsedContent["BidVol" + i];
    let ask = parsedContent["AskVol" + i];
    if (bid > highestBid) {
      secondHighestBid = highestBid;
      highestBid = bid;
    } else if (bid > secondHighestBid) {
      secondHighestBid = bid;
    }
    if (ask > highestAsk) {
      secondHighestAsk = highestAsk;
      highestAsk = ask;
    } else if (ask > secondHighestAsk) {
      secondHighestAsk = ask;
    }
  }
  if (secondHighestAsk !== 0 && secondHighestBid !== 0) {
    if (
      highestBid / secondHighestBid > stockRaito ||
      highestAsk / secondHighestAsk > stockRaito
    ) {
      abnormalStocks.push(parsedContent);
      if (abnormalStocks.length > MAX_ABNORMAL_STOCKS) {
        abnormalStocks.shift();
      }
    }
  }
}

// Keeps only the snapshots from the same trading day and the last
// SNAPSHOT_WINDOW_MINUTES before the newest one.
function modifyStockList(stockList, parsedContent) {
  const newestMinute = minutesCalculator(parsedContent.Time);
  const snapshots = (stockList[parsedContent.Symbol] || []).filter(
    (snapshot) =>
      snapshot.TradingDate === parsedContent.TradingDate &&
      newestMinute - minutesCalculator(snapshot.Time) <= SNAPSHOT_WINDOW_MINUTES
  );
  snapshots.push(parsedContent);
  stockList[parsedContent.Symbol] = snapshots;
}

function minutesCalculator(time) {
  return parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
}

const streamer = new StockListStreamer();
streamer.streamData();

module.exports = streamer;
