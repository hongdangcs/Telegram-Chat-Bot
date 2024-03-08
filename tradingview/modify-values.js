async function modify(page) {
  await page.goto("https://www.tradingview.com/chart/Z2D2ibVU/");
  await new Promise((r) => setTimeout(r, 7000));
  let buttonCoordinates = await page.evaluate(() => {
    let button = document
      .querySelectorAll(
        'div[data-name="legend-source-item"] div[data-name="legend-source-title"]'
      )[1]
      .getBoundingClientRect();
    return {
      x: button.x + button.width / 2,
      y: button.y + button.height / 2,
    };
  });
  await new Promise((r) => setTimeout(r, 7000));
  await page.mouse.move(buttonCoordinates.x, buttonCoordinates.y);
}

module.exports = modify;
