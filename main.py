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

fireant_driver = webdriver.Chrome(options=chrome_options)
fireant_driver.get("https://fireant.vn/charts")
time.sleep(5)
fireant_driver.execute_script("document.querySelector('div.bp3-overlay').parentElement.remove();")
fireant_driver.execute_script("document.getElementById('header-toolbar-symbol-search').click();")
time.sleep(2)
print("opened browser")

#document.querySelectorAll('.bp3-overlay')[1].parentElement.remove();
#document.querySelectorAll('li.bp3-tab')[11].click();
#document.querySelectorAll('#header-toolbar-fullscreen')[0].click();
#document.querySelectorAll('.button-1SoiPS-f.apply-common-tooltip')[1].click();
#document.querySelectorAll('.item-2IihgTnv')[12].click();

def captureStock(imageName):
    stock_driver.get_screenshot_as_file("./photo/" + imageName + ".png")
    print("Capture: " + imageName)

def captureFireant(imageName):
    fireant_driver.get_screenshot_as_file("./photo/" + imageName + ".png")
    print("Capture: " + imageName)

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

@bot.message_handler(commands=['fireant'])
def stock_image(message):
    photoName = str(message.chat.id);
    captureFireant(photoName)
    stock_photo = open("photo/" + photoName + ".png", 'rb');
    bot.send_photo(message.chat.id, stock_photo);



@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Sorry, I can't understand you! /help")
    print(message.chat.id)


bot.infinity_polling()


def cleanup():
    print("Cleaning up...")
    print("Driver quitting...")
    stock_driver.quit()


atexit.register(cleanup)
