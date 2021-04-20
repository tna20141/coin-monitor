const notification = require('../notification');

async function callback() {
  notification.send('Bot is running.');
}

module.exports = callback;
