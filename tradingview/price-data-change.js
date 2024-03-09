const priceData = require("./price-data");

async function priceDataChange(page) {
  let priceDataValue = await priceData(page);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    increase1: +priceDataValue.High - +priceDataValue.increase1plot,
    increase2: +priceDataValue.High - +priceDataValue.increase2plot,
    increase3: +priceDataValue.High - +priceDataValue.increase3plot,
    decrease1: +priceDataValue.High - +priceDataValue.decrease1plot,
    decrease2: +priceDataValue.High - +priceDataValue.decrease2plot,
    decrease3: +priceDataValue.High - +priceDataValue.decrease3plot,
  };
}

module.exports = priceDataChange;
