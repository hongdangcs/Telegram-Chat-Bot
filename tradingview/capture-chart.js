async function captureChart(page, imgName) {
  try {
    await page.mouse.move(1000, 0);
    await new Promise((r) => setTimeout(r, 200));
    const chart = await page.$(".layout__area--center");
    await new Promise((r) => setTimeout(r, 200));
    await chart.screenshot({ path: `./screenshots/${imgName}.png` });
    await new Promise((r) => setTimeout(r, 2000));
  } catch (error) {
    console.log(error);
  }
}
module.exports = captureChart;
