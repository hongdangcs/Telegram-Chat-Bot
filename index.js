const puppeteer = require("puppeteer");
const Jimp = require('jimp');
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.API;
const bot = new TelegramBot(token, {polling: true});

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
        //browser = await puppeteer.launch({headless: false});
        stockPage = await browser.newPage();
        await stockPage.goto('file://C:\\Users\\Education\\PycharmProjects\\Telegram-Chat-Bot\\Stock\\index.html');
        tradingviewPage = await browser.newPage();
        await tradingviewPage.goto('https://www.tradingview.com/');
        await delay(20000);

        await (await tradingviewPage.$('.tv-header__user-menu-button--anonymous')).click();
        await delay(5000);
        await (await tradingviewPage.$$('.item-jFqVJoPk'))[1].click();
        await delay(5000);
        await (await tradingviewPage.$('.tv-signin-dialog__toggle-email')).click();
        await delay(5000);
        const input = await tradingviewPage.$$('.tv-control-material-input');
        await input[0].type(process.env.email);
        await input[1].type(process.env.password);

        await delay(1000);
        await (await tradingviewPage.$$('.tv-button'))[1].click();

        console.log("Page loaded successfully");
    });

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function captureTradingView(chatID, imageName, symbol, time) {
    let page = await browser.newPage();
    await page.goto("https://www.tradingview.com/chart/Z2D2ibVU/?symbol=" + symbol);
    await delay(500);
    //await page.mouse.click(270, 21);
    await (await page.$$('.value-gwXludjS'))[2].click();
    await delay(500);
    await (await page.$$('.labelRow-jFqVJoPk'))[time].click();
    await delay(500);
    page.evaluate("document.querySelector('body').lastChild.remove();");
    (await page.$(".chart-container-border")).screenshot({path: `photo/${imageName}.png`});
    await delay(500);

    await stockPage.screenshot({path: 'photo/Stock' + chatID + '.png'});

    const image1 = await Jimp.read('photo/Stock' + chatID + '.png');
    const image2 = await Jimp.read(`photo/${imageName}.png`);
    image1.resize(image2.bitmap.width, image2.bitmap.height);
    const mergedImage = new Jimp(image1.bitmap.width, image1.bitmap.height + image2.bitmap.height);

    mergedImage.composite(image1, 0, 0);
    mergedImage.composite(image2, 0, image1.bitmap.height);
    mergedImage.write('photo/merged' + chatID + '.png');

    //bot.sendPhoto(chatID, `photo/${imageName}.png`, {caption: "Here we go!"});
    bot.sendPhoto(chatID, `photo/merged${chatID}.png`, {caption: "Here we go!"});
    await page.close();
}

async function captureTradingViewAllTime(imageName, chatId){
    let page = await browser.newPage();
    await page.goto("https://www.tradingview.com/chart/Z2D2ibVU/?symbol=HOSE%3AVNINDEX");
    await delay(500);

    await (await page.$$('.value-gwXludjS'))[2].click();
    await delay(500);
    await (await page.$$('.labelRow-jFqVJoPk'))[6].click();
    await delay(500);
    page.evaluate("document.querySelector('body').lastChild.remove();");
    (await page.$(".chart-container-border")).screenshot({path: `photo/6${imageName}.png`});
    await delay(500);

    const image1 = await Jimp.read(`photo/6${imageName}.png`);
    Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
        .then(font => {
            image1.print(font, image1.bitmap.width-250, image1.bitmap.height-80, "VNI 1h")
            return image1
        }).then(image1 => {
        return image1.write(`photo/6${imageName}.png`)
    })

    await (await page.$$('.value-gwXludjS'))[2].click();
    await delay(500);
    await (await page.$$('.labelRow-jFqVJoPk'))[9].click();
    await delay(500);
    page.evaluate("document.querySelector('body').lastChild.remove();");
    (await page.$(".chart-container-border")).screenshot({path: `photo/9${imageName}.png`});
    await delay(500);

    const image2 = await Jimp.read(`photo/9${imageName}.png`);
    Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
        .then(font => {
            image2.print(font, image2.bitmap.width-250, image2.bitmap.height-80, "VNI 4h")
            return image2
        }).then(image2 => {
        return image2.write(`photo/9${imageName}.png`)
    })

    await (await page.$$('.value-gwXludjS'))[2].click();
    await delay(500);
    await (await page.$$('.labelRow-jFqVJoPk'))[10].click();
    await delay(500);
    page.evaluate("document.querySelector('body').lastChild.remove();");
    (await page.$(".chart-container-border")).screenshot({path: `photo/10${imageName}.png`});
    await delay(500);

    const image3 = await Jimp.read(`photo/10${imageName}.png`);
    Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
        .then(font => {
            image3.print(font, image3.bitmap.width-250, image3.bitmap.height-80, "VNI 1d")
            return image3
        }).then(image3 => {
        return image3.write(`photo/10${imageName}.png`)
    })

    await (await page.$$('.value-gwXludjS'))[2].click();
    await delay(500);
    await (await page.$$('.labelRow-jFqVJoPk'))[11].click();
    await delay(500);
    page.evaluate("document.querySelector('body').lastChild.remove();");
    (await page.$(".chart-container-border")).screenshot({path: `photo/11${imageName}.png`});
    await delay(500);

    const image4 = await Jimp.read(`photo/11${imageName}.png`);
    Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
        .then(font => {
            image4.print(font, image4.bitmap.width-250, image4.bitmap.height-80, "VNI 1w")
            return image4
        }).then(image4 => {
        return image4.write(`photo/11${imageName}.png`)
    })

        const mergedImage = new Jimp(image1.bitmap.width, image1.bitmap.height + image2.bitmap.height);

    mergedImage.composite(image1, 0, 0);
    mergedImage.composite(image2, 0, image1.bitmap.height);

        const mergedImage2 = new Jimp(image3.bitmap.width, image3.bitmap.height + image4.bitmap.height);

    mergedImage2.composite(image3, 0, 0);
    mergedImage2.composite(image4, 0, image3.bitmap.height);

    mergedImage.write(`photo/1${imageName}.jpg`);
    mergedImage2.write(`photo/2${imageName}.jpg`);

    bot.sendPhoto(chatId, `photo/1${imageName}.jpg`, {caption: "Here we go!"});
    bot.sendPhoto(chatId, `photo/2${imageName}.jpg`, {caption: "Here we go!"});

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

bot.onText(/\/VNall/, async (msg) => {
    let imageName = "VNall" + msg.chat.id;

    await captureTradingViewAllTime(imageName, msg.chat.id);

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