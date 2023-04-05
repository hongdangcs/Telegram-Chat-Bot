const puppeteer = require("puppeteer");

const TelegramBot = require('node-telegram-bot-api');
const token = '6089682648:AAG37t-DrYV3tF0nimU52SCcYjrtF5LbiZg';
const bot = new TelegramBot(token, {polling: true});

console.log("polling successfully");

let stockPage, tradingviewPage, browser;

async function executeScripts(page, scripts) {
    for (const script of scripts) {
        await page.evaluate(script);
    }
}

puppeteer.launch({
    defaultViewport: {
        width: 1920,
        height: 1080,
    },
})
    .then(async (br) => {
        browser = br;
        //browser = await puppeteer.launch({headless: false});
        stockPage = await browser.newPage();
        await stockPage.goto('file://C:\\Users\\Education\\PycharmProjects\\Telegram-Chat-Bot\\Stock\\index.html');
        tradingviewPage = await browser.newPage();
        await tradingviewPage.goto('https://www.tradingview.com/');
        await delay(60000);

        await (await tradingviewPage.$('.tv-header__user-menu-button--anonymous')).click();
        await delay(5000);
        await (await tradingviewPage.$$('.item-RhC5uhZw.item-TZ2SJ2fG'))[1].click();
        await delay(5000);
        await (await tradingviewPage.$('.tv-signin-dialog__toggle-email')).click();
        await delay(5000);
        const input = await tradingviewPage.$$('.tv-control-material-input');
        await input[0].type('hongdang2k1@gmail.com');
        await input[1].type('mzx9Z$3HAbP#c!k');

        await delay(1000);
        await (await tradingviewPage.$$('.tv-button'))[1].click();
        await delay(5000);
        await tradingviewPage.goto('https://www.tradingview.com/chart/Z2D2ibVU/');
        await delay(5000);
        await tradingviewPage.evaluate(() => {
            document.querySelector('body').lastChild.remove();
        });

        console.log("Page loaded successfully");
    });

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

bot.on('message', (msg) => {

    let Hi = "hi";
    if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(msg.chat.id, "Hello dear user");
    }
});

bot.onText(/\/start/, async (msg) => {
    let imageName = "Stock" + msg.chat.id;

    try {
        await stockPage.waitForSelector('body');
        await stockPage.screenshot({path: `photo/${imageName}.png`});
        console.log(`capture ${imageName}`);
        bot.sendPhoto(msg.chat.id, `photo/${imageName}.png`, {caption: "Here we go! \nThis is just a caption."});

        console.log(imageName);
    } catch (error) {
        console.error(error);
    }
});

bot.onText(/\/tradingview/, async (msg) => {
    let imageName = "tradingview" + msg.chat.id;

    try {
        (await tradingviewPage.$(".chart-container-border")).screenshot({path: `photo/${imageName}.png`});
        console.log(`capture ${imageName}`);
        bot.sendPhoto(msg.chat.id, `photo/${imageName}.png`, {caption: "Here we go!"});

        console.log(imageName);
    } catch (error) {
        console.error(error);
    }
});

bot.onText(/\/sendpic/, (msg) => {
    bot.sendPhoto(msg.chat.id, "photo/webpage.png", {caption: "Here we go ! \nThis is just a caption "});
    console.log(msg.chat.id);
});

process.on('SIGINT', () => {
    console.log("Closing browser...");
    browser.close();
    process.exit();
});