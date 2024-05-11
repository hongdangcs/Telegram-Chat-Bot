const { ssi } = require("../configs");
const client = require("../ssi-fcdata");
const axios = require("axios");
const getAccessToken = require("./get-access-token");

const EventEmitter = require("events");

let todayDate = getTodayDate();

class StockListStreamer extends EventEmitter {
  constructor() {
    super();
    this.stockList = {};
    this.abnormalStocks = [];
  }

  async streamData() {
    let token = "Bearer " + (await getAccessToken());
    axios.interceptors.request.use(function (axios_config) {
      axios_config.headers.Authorization = token;
      return axios_config;
    });

    client.initStream({
      url: ssi.HubUrl,
      token: token,
    });
    client.bind(client.events.onData, (message) => {
      try {
        let parsedObject = JSON.parse(message);
        let parsedContent = JSON.parse(parsedObject.Content);
        if (parsedContent.Symbol) {
          if (parsedContent.TradingDate !== todayDate) {
            todayDate = getTodayDate();
            removeOldDayData(this.stockList, parsedContent, todayDate);
          }
          modifyStockList(this.stockList, parsedContent, todayDate);
          this.emit("stockAdded", parsedContent.Symbol);
          detectStock(this.abnormalStocks, parsedContent);
          this.emit("stockListUpdated", this.stockList);
          this.emit("abnormalStocksUpdated", this.abnormalStocks);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });
    client.bind(client.events.onConnected, function () {
      client.switchChannel("X-QUOTE:ALL");
    });
    client.start();
  }
}

async function removeOldDayData(stockList, parsedContent, todayDate) {
  if (!stockList[parsedContent.Symbol]) return;
  for (let i = 0; i < stockList[parsedContent.Symbol].length; i++) {
    let stock = stockList[parsedContent.Symbol][i];
    if (stock.TradingDate !== todayDate) {
      stockList[parsedContent.Symbol].splice(i, 1);
      i--;
    }
  }
}

async function detectStock(abnormalStocks, parsedContent) {
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
    if (highestBid / secondHighestBid > stockRaito) {
      abnormalStocks.push(parsedContent);
    }
    if (highestAsk / secondHighestAsk > stockRaito) {
      abnormalStocks.push(parsedContent);
    }
  }
}

async function modifyStockList(stockList, parsedContent, todayDate) {
  if (parsedContent.TradingDate !== todayDate) {
    return;
  }
  if (!stockList[parsedContent.Symbol]) {
    stockList[parsedContent.Symbol] = [];
  }

  let currentTime = new Date().toLocaleTimeString("en-US", { hour12: false });

  for (let i = 0; i < stockList[parsedContent.Symbol].length; i++) {
    if (
      minutesCalculator(currentTime) -
        minutesCalculator(stockList[parsedContent.Symbol][i].Time) >
      5
    ) {
      stockList[parsedContent.Symbol].splice(i, 1);
      i--;
    }
  }

  stockList[parsedContent.Symbol].push(parsedContent);
}

function minutesCalculator(time) {
  return parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
}

function getTodayDate() {
  return new Date()
    .toLocaleDateString("en-GB")
    .split("T")[0]
    .split("-")
    .reverse()
    .join("/");
}

const streamer = new StockListStreamer();
streamer.streamData();

module.exports = streamer;
