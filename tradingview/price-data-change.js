const priceData = require("./price-data");

async function priceDataChange(page) {
  let priceDataValue = await priceData(page);
  await new Promise((resolve) => setTimeout(resolve, 1200));

  let parsedPriceData = parsePriceData(priceDataValue);
  return {
    increase1: parsedPriceData.High - parsedPriceData.increase1plot,
    increase2: parsedPriceData.High - parsedPriceData.increase2plot,
    increase3: parsedPriceData.High - parsedPriceData.increase3plot,
    decrease1: parsedPriceData.High - parsedPriceData.decrease1plot,
    decrease2: parsedPriceData.High - parsedPriceData.decrease2plot,
    decrease3: parsedPriceData.High - parsedPriceData.decrease3plot,
  };
}
function parsePriceData(data) {
  let parsedData = {};

  for (let key in data) {
    let value = data[key];
    if (typeof value === "string") {
      if (value.includes("M")) {
        parsedData[key] = parseFloat(value.replace(/[^\d.-]/g, "")) * 1000000;
      } else {
        parsedData[key] = parseFloat(value.replace(/,/g, ""));
      }
    } else {
      parsedData[key] = value;
    }
  }
  return parsedData;
}

module.exports = priceDataChange;
