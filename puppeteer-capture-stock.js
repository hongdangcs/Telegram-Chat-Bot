/* const puppeteer = require("puppeteer");
const fs = require('fs');
const args = process.argv.slice(2);
let browserPromise;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
    console.log("open browser");
  }

  return browserPromise;
}

async function captureScreenshot() {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.goto('file://C:\\Users\\Education\\PycharmProjects\\Telegram-Chat-Bot\\Stock\\index.html');
  await delay(5000);
  await page.screenshot({path: "photo/entire-page.png"});
  console.log("done");
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = captureScreenshot();

 */
const puppeteer = require("puppeteer");
const fs = require('fs');

const WEBSITE_URL = 'file://C:\\\\Users\\\\Education\\\\PycharmProjects\\\\Telegram-Chat-Bot\\\\Stock\\\\index.html';

let browser = null;
let page = null;

async function launchBrowser() {
    browser = await puppeteer.launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
    console.log("open browser");
}

async function openPage() {
    page = await browser.newPage();
    await page.goto(WEBSITE_URL);
    console.log("open page");
}

async function captureScreenshot() {
    if (!browser) {
        await launchBrowser();
      delay(5000);
    }
    if(!page){
      await openPage();
      delay(5000);
    }

    await page.screenshot({path: "photo/webpage.png"});
    console.log("take Screen shot");
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = captureScreenshot;
