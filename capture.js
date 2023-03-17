const captureScreenshot = require('./puppeteer-capture-stock');

captureScreenshot();
delay(5000).then(r => captureScreenshot());

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
