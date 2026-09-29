async function captureChart(page) {
  await page.mouse.move(1000, 0);
  await new Promise((r) => setTimeout(r, 200));
  const chart = await page.$(".layout__area--center");
  if (!chart) {
    throw new Error("TradingView chart area not found");
  }
  await new Promise((r) => setTimeout(r, 200));
  return chart.screenshot();
}
module.exports = captureChart;
