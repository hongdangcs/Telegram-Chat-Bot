const axios = require("axios");

async function get_tradingview_urls() {
  let urlMap = new Map();
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://scanner.tradingview.com/vietnam/scan",
    headers: {},
  };

  await axios
    .request(config)
    .then((response) => {
      let data = response.data;
      let stocks = data.data;
      for (let stock of stocks) {
        let symbol = stock.s.split(":");
        let url = `https://www.tradingview.com/chart/?symbol=${symbol[0]}%3A${symbol[1]}`;
        urlMap.set(symbol[1], url);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  return urlMap;
}

module.exports = get_tradingview_urls;
