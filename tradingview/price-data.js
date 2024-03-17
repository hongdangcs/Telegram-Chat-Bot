async function priceData(page) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    /*
    let buttonObjectTree = await page.evaluate(() => {
      let button = document.querySelector('button[data-name="object_tree"]');
      let ariaPressed = button.getAttribute("aria-pressed");
      return ariaPressed;
    });
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (buttonObjectTree == "false") {
      await page.click('button[data-name="object_tree"]');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    await page.click("#data-window");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    let priceData = await page.evaluate(() => {
      let returnData = {};
      let dataClassName = document
        .querySelector('.chart-data-window div[data-id="_seriesId"]')
        .className.split("-")[1]
        .split(" ")[0];
      let data = document.querySelectorAll(
        `.chart-data-window .item-${dataClassName}`
      );
      for (let i = 0; i < data.length; i++) {
        dataName = data[i].querySelector(".apply-overflow-tooltip").innerText;
        dataValue = data[i].querySelector("span").innerText;
        returnData[dataName] = dataValue;
      }
      return returnData;
    });
    await page.click('button[data-name="object_tree"]');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return priceData;
    */

    const priceArray = await page.evaluate(() => {
      let priceArray = [];
      const classNameSuffix = document
        .querySelector('div[data-name="legend"]')
        .className.split("-")[1]
        .split(" ")[0];
      let data = document.querySelectorAll(
        `div[data-name="legend-source-item"] .valueValue-${classNameSuffix}`
      );
      for (let i = 0; i < data.length; i++) {
        priceArray.push(data[i].innerText);
      }
      return priceArray;
    });

    const OhlcArray = await page.evaluate(() => {
      let OhlcArray = [];
      const classNameSuffix = document
        .querySelector('div[data-name="legend"]')
        .className.split("-")[1]
        .split(" ")[0];
      let data = document.querySelectorAll(
        `div[data-name="legend-series-item"] .valueValue-${classNameSuffix}`
      );
      for (let i = 0; i < data.length; i++) {
        OhlcArray.push(data[i].innerText);
      }
      return OhlcArray;
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      Volume: priceArray[0],
      Open: OhlcArray[1],
      High: OhlcArray[2],
      Low: OhlcArray[3],
      Close: OhlcArray[4],
      "Conversion Line": priceArray[2],
      "Base Line": priceArray[3],
      "Lead A": priceArray[9],
      "Lead B": priceArray[10],
      increase1plot: priceArray[11],
      increase2plot: priceArray[12],
      increase3plot: priceArray[13],
      decrease1plot: priceArray[14],
      decrease2plot: priceArray[15],
      decrease3plot: priceArray[16],
      K: priceArray[18],
      D: priceArray[19],
    };
  } catch (e) {
    console.log(e);
  }
}

module.exports = priceData;
