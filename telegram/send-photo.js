// Sends an in-memory PNG (e.g. a Puppeteer screenshot buffer) so no temp
// file has to be written, waited on, and cleaned up afterwards.
function sendPhoto(bot, chatId, image, options = {}) {
  return bot.sendPhoto(chatId, image, options, {
    filename: "chart.png",
    contentType: "image/png",
  });
}

module.exports = sendPhoto;
