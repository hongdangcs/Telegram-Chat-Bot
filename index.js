const puppeteer = require("puppeteer");
const Jimp = require('jimp');
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.API;
const bot = new TelegramBot(token, {polling: true});

const symbol = new Map();
symbol.set('BTC', 'BITSTAMP%3ABTCUSD');
symbol.set('ETH', 'BITSTAMP%3AETHUSD');
symbol.set('VNINDEX', 'HOSE%3AVNINDEX');
symbol.set('HNXINDEX', 'HNX%3AHNXINDEX');
symbol.set('TESLA', 'NASDAQ%3ATSLA');


console.log("polling successfully");

let stockPage, tradingviewPage, browser;

puppeteer.launch({
    defaultViewport: {
        width: 1920,
        height: 1080,
    },
})
    .then(async (br) => {
        browser = br;
        browser = await puppeteer.launch({headless: false});
        stockPage = await browser.newPage();
        await stockPage.setViewport({width: 1920, height: 1080});
        await stockPage.goto('https://hongdangcseiu.github.io/Telegram-Chat-Bot/');
        tradingviewPage = await browser.newPage();
        await tradingviewPage.setViewport({width: 1920, height: 1080});
        await tradingviewPage.goto('https://www.tradingview.com/');
        await delay(5000);

        await (await tradingviewPage.$('.tv-header__user-menu-button--anonymous')).click();
        await delay(1000);
        await (await tradingviewPage.$$('.item-jFqVJoPk'))[1].click();
        await delay(1000);
        await (await tradingviewPage.$('.emailButton-nKAw8Hvt')).click();
        await delay(1000);
        await (await tradingviewPage.$('#id_username')).type(process.env.email);
        await (await tradingviewPage.$('#id_password')).type(process.env.password);
        await delay(1000);
        await (await tradingviewPage.$('button.button-D4RPB3ZC')).click();
        await delay(15000);

        // open pine script
        let page = await browser.newPage();
        await page.setViewport({width: 1920, height: 1080});
        await page.goto("https://www.tradingview.com/chart/Z2D2ibVU/");
        await delay(5000);
        await (await page.$('.openScriptMenu-Tg3EJPKX')).click();
        await delay(500);
        await (await page.$$('.item-jFqVJoPk'))[0].click();
        await delay(500);
        await (await page.$$('.itemInfo-_haPFgk1'))[1].click();
        await delay(5000);
        await page.close();

        console.log("Page loaded successfully");
    });

async function getChartInfor(chatID, page) {
    let priceList = await page.$$('.valueValue-l31H9iuA');
    let nowK = await page.evaluate(el => el.textContent, priceList[20]);
    let nowD = await page.evaluate(el => el.textContent, priceList[21]);
    let nowConversion = await page.evaluate(el => el.textContent, priceList[11]);
    let nowBase = await page.evaluate(el => el.textContent, priceList[12]);
    let nowLeadingA = await page.evaluate(el => el.textContent, priceList[18]);
    let nowLeadingB = await page.evaluate(el => el.textContent, priceList[19]);
    let nowClose = await page.evaluate(el => el.textContent, priceList[4]);

    // await page.mouse.click(220, 717);

    // delete old value
    await (await page.$$('.view-line'))[1].click();
    await page.keyboard.down('ShiftLeft');
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowDown');
        await delay(50);
    }
    await page.keyboard.up('ShiftLeft');
    await page.keyboard.press('Delete');

    // insert new value
    page.type('.view-lines', `\nnowK = ${nowK}\nnowD= ${nowD}\nnowConversion = ${nowConversion}\nnowBase = ${nowBase}\nnowLeadA = ${nowLeadingA}\nnowLeadB = ${nowLeadingB}\nnowClose = ${nowClose}\n`);
    await delay(3000);

    // run pine script
    await (await page.$$('.addToChartButton-YIGGCRdR'))[2].click();
    await delay(5000);

    const price = await page.$$('.valueValue-l31H9iuA');
    let in1 = await page.evaluate(el => el.textContent, price[22]);
    let in2 = await page.evaluate(el => el.textContent, price[23]);
    let in3 = await page.evaluate(el => el.textContent, price[24]);
    let de1 = await page.evaluate(el => el.textContent, price[25]);
    let de2 = await page.evaluate(el => el.textContent, price[26]);
    let de3 = await page.evaluate(el => el.textContent, price[27]);

    in1 = Number(in1);
    in2 = Number(in2);
    in3 = Number(in3);
    de1 = Number(de1);
    de2 = Number(de2);
    de3 = Number(de3);
    let sum = de1 + in1;

    await bot.sendMessage(chatID,
        'Depend on chart in the past, there are ' + sum + ' times that have the same pattern. \n' +
        'After 1 period, ' + (in1 > de1 ? (100 * in1 / (in1 + de1)).toFixed(2) + '% chance of going up(' + in1 + '/' + sum + ') \n' : (100 * de1 / (in1 + de1)).toFixed(2) + '% chance of going down(' + de1 + '/' + sum + ') \n') +
        'After 2 periods, ' + (in2 > de2 ? (100 * in2 / (in2 + de2)).toFixed(2) + '% chance of going up(' + in2 + '/' + sum + ') \n' : (100 * de2 / (in2 + de2)).toFixed(2) + '% chance of going down(' + de2 + '/' + sum + ') \n') +
        'After 3 periods, ' + (in3 > de3 ? (100 * in3 / (in3 + de3)).toFixed(2) + '% chance of going up(' + in3 + '/' + sum + ') \n' : (100 * de3 / (in3 + de3)).toFixed(2) + '% chance of going down(' + de3 + '/' + sum + ') \n')
    );
}

async function captureTradingView(chatID, imageName, _symbol, time) {
    let page = await browser.newPage();
    try {
        // open browser tab
        await page.setViewport({width: 1920, height: 1080});
        await page.goto("https://www.tradingview.com/chart/Z2D2ibVU/?symbol=" + _symbol);
        await delay(1000);
        await chooseTime(page, time);
        page.evaluate("document.querySelector('body').lastChild.remove();");
        await delay(1000);

        // take screenshot
        const chartElement = await page.$(".chart-container-border");
        await delay(1000);
        await chartElement.screenshot({path: `photo/${imageName}.png`});
        await delay(2000);
        await bot.sendPhoto(chatID, `photo/${imageName}.png`, {caption: ""});
        await getChartInfor(chatID, page);

    } catch (e) {
        await bot.sendMessage(chatID, 'Try again!\nThere is an error: ' + e.message);
    }
    await page.close();
}

async function captureTradingViewAllTime(chatId, imageName, _symbol) {
    let page = await browser.newPage();
    try {
        await page.setViewport({width: 1920, height: 1080});
        await page.goto("https://www.tradingview.com/chart/Z2D2ibVU/?symbol=" + _symbol);
        await delay(1000);

        await chooseTime(page, 6);
        page.evaluate("document.querySelector('body').lastChild.remove();");

        (await page.$(".chart-container-border")).screenshot({path: `photo/6${imageName}.png`});
        await delay(1000);

        const image1 = await Jimp.read(`photo/6${imageName}.png`);
        await chooseTime(page, 9);
        page.evaluate("document.querySelector('body').lastChild.remove();");
        (await page.$(".chart-container-border")).screenshot({path: `photo/9${imageName}.png`});
        await delay(1000);

        const image2 = await Jimp.read(`photo/9${imageName}.png`);

        await chooseTime(page, 10);
        page.evaluate("document.querySelector('body').lastChild.remove();");
        (await page.$(".chart-container-border")).screenshot({path: `photo/10${imageName}.png`});
        await delay(1000);

        const image3 = await Jimp.read(`photo/10${imageName}.png`);

        await chooseTime(page, 11);
        page.evaluate("document.querySelector('body').lastChild.remove();");
        (await page.$(".chart-container-border")).screenshot({path: `photo/11${imageName}.png`});
        await delay(1000);

        const image4 = await Jimp.read(`photo/11${imageName}.png`);

        const mergedImage = new Jimp(image1.bitmap.width, image1.bitmap.height + image2.bitmap.height);

        mergedImage.composite(image1, 0, 0);
        mergedImage.composite(image2, 0, image1.bitmap.height);

        const mergedImage2 = new Jimp(image3.bitmap.width, image3.bitmap.height + image4.bitmap.height);

        mergedImage2.composite(image3, 0, 0);
        mergedImage2.composite(image4, 0, image3.bitmap.height);

        mergedImage.write(`photo/1${imageName}.jpg`);
        mergedImage2.write(`photo/2${imageName}.jpg`);
        await delay(3000);

        bot.sendPhoto(chatId, `photo/1${imageName}.jpg`, {caption: "Here we go!"});
        bot.sendPhoto(chatId, `photo/2${imageName}.jpg`, {caption: "Here we go!"});
    } catch (e) {
        bot.sendMessage(chatId, 'Try again!\nThere is an error: ' + e.message);
    }
    await page.close();
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome!", {
        "reply_markup": {
            "keyboard": [["/TradingViewChart"], ["/Stock"]]
        }
    });
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "Type /start to start using the bot");
});

bot.onText(/\/Stock/, async (msg) => {
    let imageName = "Stock" + msg.chat.id;
    try {
        await stockPage.waitForSelector('body');
        await stockPage.screenshot({path: `photo/${imageName}.png`});
        console.log(`capture ${imageName}`);
        bot.sendPhoto(msg.chat.id, `photo/${imageName}.png`, {caption: ""});
        console.log(imageName);
    } catch (error) {
        await bot.sendMessage(msg.chat.id, "Error, please try again");
    }
});

bot.onText(/\/TradingViewChart/, (msg) => {
    bot.sendMessage(msg.chat.id, "Choose your symbol:", {
        "reply_markup": {
            "keyboard": Array.from(symbol.keys()).map((key) => [key])
        }
    });
});

bot.onText(/\/sendpic/, (msg) => {
    bot.sendPhoto(msg.chat.id, "photo/webpage.png", {caption: "Here we go ! \nThis is just a caption "});
    console.log(msg.chat.id);
});

bot.on('message', (msg) => {
    let message = msg.text.toString().toUpperCase();
    if (symbol.has(message)) {
        bot.sendMessage(msg.chat.id, "Choose your time:", {
            "reply_markup": {
                "keyboard": [[message + ' 1h'], [message + ' 4h'], [message + ' 1D'], [message + ' 1W'], [message + ' ALL']]
            }
        });
    }
    if (message.includes(' ')) {
        let messagePeriod = message.split(' ')[1];
        let messageSymbol = message.split(' ')[0];
        let time = messagePeriod === '1H' ? 6 : messagePeriod === '4H' ? 9 : messagePeriod === '1D' ? 10 : messagePeriod === '1W' ? 11 : false;
        if (symbol.has(messageSymbol)) {
            if (time) {
                bot.sendMessage(msg.chat.id, "Please wait...");
                captureTradingView(msg.chat.id, `${msg.chat.id}_${messageSymbol}_${time}`, symbol.get(messageSymbol), time);
            }
            if (messagePeriod == 'ALL') {
                bot.sendMessage(msg.chat.id, "Please wait...");
                captureTradingViewAllTime(msg.chat.id, `${msg.chat.id}_${messageSymbol}_all`, symbol.get(messageSymbol))
            }
        }
    }
});

async function chooseTime(page, time) {
    await (await page.$$('.value-gwXludjS'))[2].click();
    await delay(1000);
    await (await page.$$('.labelRow-jFqVJoPk'))[time].click();
    await delay(1000);
    await page.mouse.click(1000, 15);
    await delay(100);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

process.on('SIGINT', () => {
    console.log("Closing browser...");
    browser.close();
    process.exit();
});