let todayDate = getTodayDate();

class StockListStreamer extends EventEmitter {
  constructor() {
    super();
    this.stockList = {};
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
          modifyStockList(this.stockList, parsedContent, todayDate);
          this.emit("stockAdded", parsedContent.Symbol);
          this.emit("stockListUpdated", this.stockList);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });
    client.start();
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
