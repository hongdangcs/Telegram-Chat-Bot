const { ssi } = require("../configs");
const client = require("../ssi-fcdata");
const axios = require("axios");
const getAccessToken = require("./get-access-token");

const EventEmitter = require("events");

class StockListStreamer extends EventEmitter {
  constructor() {
    super();
    this.stockList = [];
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
          this.stockList.push(parsedContent.Symbol);
          this.emit("stockAdded", parsedContent.Symbol); // Emit an event
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

const streamer = new StockListStreamer();
streamer.streamData();

module.exports = streamer;
