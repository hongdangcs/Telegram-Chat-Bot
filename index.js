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
        await delay(20000);

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
        // await delay(5000);
        // await tradingviewPage.goto('https://www.tradingview.com/chart/Z2D2ibVU/');
        // await delay(5000);
        // await tradingviewPage.evaluate(() => {
        //     document.querySelector('body').lastChild.remove();
        // });

        console.log("Page loaded successfully");
    });

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function captureTradingView(chatID, imageName, symbol, time) {
    let page = await browser.newPage();
    await page.goto("https://www.tradingview.com/chart/Z2D2ibVU/?symbol=" + symbol);
    await delay(2000);
    await (await page.$$('.menu-_8r4li9v'))[2].click();
    await delay(1000);
    await (await page.$$('.item-RhC5uhZw'))[time].click();
    await delay(1000);
    (await page.$(".chart-container-border")).screenshot({path: `photo/${imageName}.png`});
    await delay(1000);
    bot.sendPhoto(chatID, `photo/${imageName}.png`, {caption: "Here we go!"});
    await page.close();
}

bot.on('message', (msg) => {

    let message = msg.text.toString();
    let Hi = "/stock";
    let symbol = ["btc", "vnindex", "euro"];
    if (symbol.includes(msg.text.toString().toLowerCase())) {

        bot.sendMessage(msg.chat.id, "Time:", {
            "reply_markup": {
                "keyboard": [[message + " 1h"], [message + " 4h"], [message + " 1 day"], [message + " 1 week"]]
            }
        });
    }

    if (message.includes("1") || message.includes("4")) {
        bot.sendMessage(msg.chat.id, "Wait me a little bit");
        let index = message.indexOf("1");
        if (message.includes("4")) index = message.indexOf("4");
        let before = message.substring(0, index - 1).toLowerCase();
        let rest = message.substring(index);
        let path, timeInterval;
        switch (before) {
            case "btc":
                path = "BITSTAMP%3ABTCUSD";
                break;
            case "vnindex":
                path = "HOSE%3AVNINDEX"
                break;
            case "euro":
                path = "FX%3AEURUSD";
                break;
            default:
                console.log(before + " default");
                break;
        }
        switch (rest) {
            case "1h":
                timeInterval = "6";
                break;
            case "4h":
                timeInterval = "9";
                break;
            case "1 day":
                timeInterval = "10";
                break;
            case "1 week":
                timeInterval = "11";
                break;
            default:
                break;
        }
        if (path != null && timeInterval != null) {
            bot.sendMessage(msg.chat.id, "path: " + path + ", time: " + timeInterval);
            let imageName = path + msg.chat.id;
            captureTradingView(msg.chat.id, imageName, path, timeInterval);
        }
        console.log(before);
        console.log(path);
        console.log(rest);
        console.log(timeInterval);
    }


    if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(msg.chat.id, "Hello dear user");
    }
});

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "Welcome", {
        "reply_markup": {
            "keyboard": [["BTC"], ["VNINDEX"], ["EURO"]]
        }
    });

});

bot.onText(/\/stock/, async (msg) => {
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

bot.onText(/\/tradingchart/, async (msg) => {
    let imageName = "tradingchart" + msg.chat.id;


    captureTradingView()
    console.log(`capture ${imageName}`);
    bot.sendPhoto(msg.chat.id, `photo/${imageName}.png`, {caption: "Here we go!"});

    console.log(imageName);
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