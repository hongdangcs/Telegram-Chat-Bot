const puppeteer = require("puppeteer");
const fs = require('fs');
const args = process.argv.slice(2);
puppeteer
    .launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    })
    .then(async (browser) => {
        const page = await browser.newPage();

        await page.goto('file://C:\\Users\\Education\\PycharmProjects\\Telegram-Chat-Bot\\Stock\\index.html');
        await delay(5000);
        await page.screenshot({path: "photo/entire-page.png"});

        await page.goto("https://fireant.vn/home/content/symbols/VNINDEX");
        await delay(200);


        const selector = await page.$$(".bp3-dialog-close-button");
        await selector[1].click();
        await delay(100);

        const tab = await page.$$(".sc-eqKtKx .bp3-tab");
        await tab[5].click();
        console.log(tab.length);
        await delay(2000);

                /*
                const selector2 = ".bp3-portal";
                await page.evaluate(`document.querySelector("${selector2}").remove()`);
        */

        await page.screenshot({path: "photo/fireant-page.png"});
        /*
        await delay(250);
        await page.mouse.click(228, 21)
        await delay(500);

        await page.mouse.click(310, 387)
        await delay(500);

        const element = await page.waitForSelector('div > .chart-container');
        await element.screenshot({path: "photo/" + args[1] + ".png"});

        const inner_currency = await page.$eval('.currency-qqt8UV2f', element => element.innerHTML);

        const inner_price_html = await page.$eval('.buttonText-_W8EGxGy', element => element.innerHTML);

        let inner_price = inner_price_html.replace('<span class=\"highlight-vZ7uMuW4 growing-vZ7uMuW4\">', '');
        inner_price = inner_price.replace('</span>', '');

        let price = inner_price + inner_currency;

        fs.writeFileSync(args[1] + 'price.txt', price);
        console.log(price);

         */
        await browser.close();
    });

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}