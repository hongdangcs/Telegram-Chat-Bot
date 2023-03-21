import Constants as key
import telebot
import os

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver import ActionChains
import atexit
import time

chrome_options = Options()
#chrome_options.add_argument("--headless")
chrome_options.add_argument("--window-size=1920,1080")
stock_driver = webdriver.Chrome(options=chrome_options)
stock_driver.get("file:///C:/Users/Education/PycharmProjects/Telegram-Chat-Bot/Stock/index.html")

# def configDriver(driver, i):
#     driver.execute_script("document.querySelectorAll('.bp3-overlay')[1].parentElement.remove();")
#     time.sleep(5)
#     driver.execute_script("document.querySelectorAll('li.bp3-tab')[11].click();")
#     time.sleep(120)
#     driver.execute_script("window.document.all[window.document.all.length-3].children")
#     time.sleep(2)
#     driver.execute_script("window.document.all[window.document.all.length-1].contentDocument.querySelectorAll('.toolbar-LZaMRgb9 .button-1SoiPS-f')[0].click();")
#     time.sleep(2)
#     driver.execute_script("window.document.all[window.document.all.length-1].contentDocument.querySelectorAll('.menuBox-g78rwseC .item-2IihgTnv')["+str(i)+"].click();")
#
# fireant_driver = webdriver.Chrome(options=chrome_options)
# fireant_driver.get("https://fireant.vn/dashboard/content/symbols/VNINDEX")
# time.sleep(2)
# configDriver(fireant_driver, 2)

#
# fireant_driver2 = webdriver.Chrome(options=chrome_options)
# fireant_driver2.get("https://fireant.vn/dashboard/content/symbols/VNINDEX")
#
# fireant_driver3 = webdriver.Chrome(options=chrome_options)
# fireant_driver3.get("https://fireant.vn/dashboard/content/symbols/VNINDEX")

js_query = [
    "document.querySelector('.tv-header__user-menu-button--anonymous').click()",
    "document.querySelectorAll('.item-RhC5uhZw.item-TZ2SJ2fG')[1].click()",
    "document.querySelector('.tv-signin-dialog__toggle-email').click()",

    "document.querySelectorAll('.tv-control-material-input')[0].value = 'hongdang2k1@gmail.com'",
    "document.querySelectorAll('.tv-control-material-input')[1].value = 'hongdango4qifa'",
    "document.querySelectorAll('.tv-button')[1].click()",
]


def config_tradingview(driver, timeControl):
    for line in js_query:
        driver.execute_script(line)
        time.sleep(1)

    driver.get("https://www.tradingview.com/chart/Z2D2ibVU/")
    driver.execute_script("document.querySelector('body').lastChild.remove();")


tradingview_driver = webdriver.Chrome(options=chrome_options)
tradingview_driver.get("https://www.tradingview.com/")
config_tradingview(tradingview_driver, 1)

print("browser opened")


def captureStock(imageName):
    stock_driver.get_screenshot_as_file("./photo/" + imageName + ".png")
    print("Capture: " + imageName)


# def captureFireant(imageName):
#     chart = fireant_driver.find_element(By.CSS_SELECTOR, '.bp3-card.bp3-elevation-0.sc-futMm.eOzSuM');
#     chart.screenshot("./photo/" + imageName + ".png")
#     print("Capture: " + imageName)

bot = telebot.TeleBot(key.API_KEY)


@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "/help for help")


@bot.message_handler(commands=['stock'])
def stock_image(message):
    photoName = str(message.chat.id);
    captureStock(photoName)
    stock_photo = open("photo/" + photoName + ".png", 'rb');
    bot.send_photo(message.chat.id, stock_photo);

def captureTradingView(imageName):
    chart = tradingview_driver.find_element(By.CSS_SELECTOR, '.chart-container');
    chart.screenshot("./photo/" + imageName + ".png")
    print("Capture: " + imageName)


# @bot.message_handler(commands=['fireant'])
# def stock_image(message):
#     photoName = str(message.chat.id);
#     captureFireant(photoName)
#     stock_photo = open("photo/" + photoName + ".png", 'rb');
#     bot.send_photo(message.chat.id, stock_photo);

@bot.message_handler(commands=['tradingview'])
def stock_image(message):
    photoName = str(message.chat.id);
    captureTradingView(photoName)
    tradingview_photo = open("photo/" + photoName + ".png", 'rb');
    bot.send_photo(message.chat.id, tradingview_photo);


@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Sorry, I can't understand you! /help")
    print(message.chat.id)


bot.infinity_polling()


def cleanup():
    print("Cleaning up...")
    print("Driver quitting...")
    stock_driver.quit()
    tradingview_driver.quit()


atexit.register(cleanup)
