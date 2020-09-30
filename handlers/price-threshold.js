const _ = require('lodash');
const config = require('../config');
const notification = require('../notification');
const { find, add } = require('../db');

const cooldownPeriod = config.notification.cooldownPeriod * 1000;

const cache = {
  checkConfig: null,
  lastFetchedAt: 0,
  ttl: 60000,
};

// const checkConfig = {
//   upper: {
//     BTC: 10000,
//     ETH: 300,
//   },
//   lower: {
//     BTC: 15000,
//     ETH: 300,
//   },
// };

module.exports = handler;

async function handler(data) {
  const item = _.last(data);
  if (!item) {
    return;
  }
  const checkConfig = await getCheckConfig();
  const payload = item.data;
  _.forEach(checkConfig, (typeConfig, type) => {
    _.forEach(typeConfig, (value, symbol) => {
      _check(payload, type, symbol, value);
    });
  });
}

function _check(payload, type, symbol, value) {
  const _typeConf = type === 'upper'
    ? { comparison: _.gt, eventName: 'PRICE_THRESHOLD_UPPER_REACHED' }
    : { comparison: _.lt, eventName: 'PRICE_THRESHOLD_LOWER_REACHED' };
  if (payload[symbol] && _typeConf.comparison(payload[symbol], value)) {
    _send(_typeConf.eventName, { actual: payload[symbol], threshold: value, symbol });
  }
}

async function _send(eventName, data) {
  const now = Date.now();
  const sentEvent = await find('events', {
    name: eventName,
    'data.threshold': data.threshold,
    'data.symbol': data.symbol,
    createdAt: { $gt: now - cooldownPeriod },
  });
  if (sentEvent.length) {
    return;
  }
  add('events', {
    name: eventName,
    data: {
      symbol: data.symbol,
      value: data.actual,
      threshold: data.threshold,
    },
    createdAt: now,
  });
  return notification.send(`${data.symbol} ${data.actual}`);
}

async function getCheckConfig() {
  const now = Date.now();
  if (cache.checkConfig && cache.lastFetchedAt > (now - cache.ttl)) {
    return cache.checkConfig;
  }

  const result = await _.first(find('config', { name: 'PRICE_THRESHOLD' }));
  cache.checkConfig = result.data;
  cache.lastFetchedAt = now;
  return cache.checkConfig;
}