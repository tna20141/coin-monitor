const request = require('request');
const config = require('./config');

function send(message) {
  return new Promise((resolve, reject) => {
    request({
      method: 'post',
      url: 'https://exp.host/--/api/v2/push/send',
      json: true,
      body: {
        to: config.notification.mobileToken,
        title: message,
        body: '',
      },
    }, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

module.exports = {
  send,
};
