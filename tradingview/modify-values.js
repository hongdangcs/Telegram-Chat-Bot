const priceData = require("./price-data");
const priceDataChange = require("./price-data-change");

async function modify(page) {
  try {
    await new Promise((r) => setTimeout(r, 1000));
    let priceDataValue = await priceData(page);
    await new Promise((r) => setTimeout(r, 1000));

    let buttonCoordinates = await getCoordinates(
      page,
      'div[data-name="legend-source-item"] div[data-name="legend-source-title"]'
    );
    await new Promise((r) => setTimeout(r, 300));
    await page.mouse.move(buttonCoordinates.x, buttonCoordinates.y);
    await new Promise((r) => setTimeout(r, 300));
    let settingButtonCoordinates = await getCoordinates(
      page,
      'div[data-name="legend-source-item"] button[data-name="legend-settings-action"]'
    );
    await new Promise((r) => setTimeout(r, 300));
    await page.mouse.click(
      settingButtonCoordinates.x,
      settingButtonCoordinates.y
    );

    await new Promise((r) => setTimeout(r, 300));
    let inputs = await page.$$(
      'div[data-name="indicator-properties-dialog"] input'
    );
    await new Promise((r) => setTimeout(r, 300));

    await typing(inputs[0], priceDataValue.K);
    await typing(inputs[1], priceDataValue.D);
    await typing(inputs[2], priceDataValue["Conversion Line"]);
    await typing(inputs[3], priceDataValue["Base Line"]);
    await typing(inputs[4], priceDataValue["Lead A"]);
    await typing(inputs[5], priceDataValue["Lead B"]);
    await typing(inputs[6], priceDataValue.Close);
    await new Promise((r) => setTimeout(r, 500));
    await page.click('button[data-name="submit-button"]');
    await new Promise((r) => setTimeout(r, 5000));
    let priceChange = await priceDataChange(page);
    console.log("price change:");
    console.log(priceChange);
    return priceChange;
  } catch (e) {
    console.log(e);
  }
}

async function getCoordinates(page, selector) {
  let buttonCoordinates = await page.evaluate((selector) => {
    let button = document.querySelectorAll(selector)[1].getBoundingClientRect();
    return {
      x: button.x + button.width / 2,
      y: button.y + button.height / 2,
    };
  }, selector);
  return buttonCoordinates;
}

async function typing(inputElement, value) {
  await inputElement.type(value);
  await new Promise((r) => setTimeout(r, 150));
}

module.exports = modify;
