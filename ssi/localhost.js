const express = require("express");
const cors = require("cors");
const streamData = require("./stream-data");
const streamer = require("./stream-data");
const app = express();
const path = require("path");
const port = 3000;

app.use(cors());
stockList = streamer.stockList;

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/stock", async (req, res) => {
  let stockName = req.query.stockName;
  res.send(stockList[stockName]);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
