const express = require("express");
const cors = require("cors");
const streamData = require("./stream-data");
const streamer = require("./stream-data");
const app = express();
const path = require("path");
const port = 3000;

app.use(cors());
stockList = streamer.stockList;
abnormalStocks = streamer.abnormalStocks;

app.get("/", async (req, res) => {
  res.send(stockList);
});

app.get("/stock", async (req, res) => {
  let stock = req.query.stock;
  res.send(stockList[stock]);
});

app.get("/abnormal", async (req, res) => {
  res.send(abnormalStocks);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
