async function createPage(browser) {
  const page = await browser.newPage();
  return page;
}

async function closePage(page) {
  await page.close();
}

module.exports = { createPage, closePage };
