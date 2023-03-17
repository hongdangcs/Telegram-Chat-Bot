const captureScreenshot = require('./puppeteer-capture-stock');
const args = process.argv.slice(2);
let imageName = args[0];
captureScreenshot(imageName);
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
