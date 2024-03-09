async function priceData(page) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
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
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return priceData;
  } catch (e) {
    console.log(e);
  }
}

module.exports = priceData;
