import Constants as key
import telebot
import os

bot = telebot.TeleBot(key.API_KEY)

@bot.message_handler(commands=['start'])
def send_welcome(message):
	bot.reply_to(message, "/help for help")

@bot.message_handler(func=lambda message: True)
def echo_all(message):
	bot.reply_to(message, "Sorry, I can't understand you! /help")
	print(message.chat.id)

bot.infinity_polling()