const handlers = require('./handlers');
const config = require('./config');
const { init } = require('./db');

init()
  .then(() => {
    handlers.forEach(handler => {
      setInterval(async () => {
        try {
          await handler.callback();
        } catch (error) {
          console.log(`[ERROR] ${handler.name}`, { error, time: new Date() });
        }
      }, handler.config.interval || config.interval);
    });
  });
