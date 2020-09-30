const fetch = require('./fetch');
const storage = require('./storage');
const handlers = require('./handlers');
const config = require('./config');
const { init } = require('./db');

init()
  .then(() => {
    setInterval(async () => {
      try {
        const now = Date.now();
        const result = await fetch();
        await storage.save(now, result);
        const data = await storage.getAll();
        handlers.forEach(handler => {
          handler(data);
        });
      } catch (error) {
        console.log('[ERROR] fetching data', error);
      }
    }, config.fetchInterval);
  });
