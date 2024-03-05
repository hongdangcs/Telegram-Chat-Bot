const puppeteer = require('puppeteer');

puppeteer.launch({
    defaultViewport: {
        width: 1920,
        height: 1080,
    },
})
    .then(async (br) => {
        browser = br;
        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();
        await page.goto('https://hongdangcseiu.github.io/Telegram-Chat-Bot/');

        await page.mouse.wheel({deltaY: 1500});
        console.log('hello');

    });
