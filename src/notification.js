const request = require('request');
const config = require('./config');

function send(message) {
  return new Promise((resolve, reject) => {
    request({
      method: 'post',
      url: `https://api.telegram.org/bot${config.notification.telegramBotToken}/sendMessage`,
      json: true,
      body: {
        text: message,
        chat_id: config.notification.telegramChatId,
      },
    }, (error, response, body) => {
      if (error || !body.ok) {
        return reject(error);
      }
      return resolve(body.result);
    });
  });
}

module.exports = {
  send,
};
