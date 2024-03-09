async function captureChart(page, imgName) {
  try {
    await page.mouse.move(1000, 0);
    await new Promise((r) => setTimeout(r, 800));
    await (
      await page.$(".chart-container-border")
    ).screenshot({ path: `./screenshots/${imgName}.png` });
    await new Promise((r) => setTimeout(r, 2000));
  } catch (error) {
    console.log(error);
  }
}
module.exports = captureChart;
