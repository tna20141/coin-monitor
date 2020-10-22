const _ = require('lodash');
const fs = require('fs').promises;
const config = require('../config');
const notification = require('../notification');

const cooldownPeriod = config.notification.cooldownPeriod * 1000;

const cache = {
  checkConfig: undefined,
  lastFetchedAt: 0,
  ttl: 60000,
};

const maxPrices = {};
let sent = false;

module.exports = handler;

async function handler(data) {
  const item = _.last(data);
  if (!item) {
    return;
  }
  const checkConfig = await getCheckConfig();
  const payload = item.data;
  _.forEach(checkConfig, (symbolConfig, symbol) => {
    _check(payload, symbolConfig, symbol);
  });
}

function _check(payload, symbolConfig, symbol) {
  if (!symbolConfig.enabled) {
    maxPrices[symbol] = null;
    return;
  }
  if (!maxPrices[symbol]) {
    maxPrices[symbol] = { value: 0, basePrice: payload[symbol] };
  }
  if (maxPrices[symbol].value <= payload[symbol]) {
    maxPrices[symbol] = {
      ...maxPrices[symbol],
      value: payload[symbol],
      updatedAt: Date.now(),
    };
  }
  const stoplossThreshold = _getStoplossThreshold(maxPrices[symbol], symbolConfig);
	console.log(payload[symbol], stoplossThreshold, maxPrices.BTC);
  if (payload[symbol] <= stoplossThreshold) {
    _send(symbol, payload[symbol], stoplossThreshold, maxPrices[symbol]);
  }
}

function _getStoplossThreshold(maxPrice, symbolConfig) {
  const baseDiff = maxPrice.value - maxPrice.basePrice;
  return maxPrice.value - symbolConfig.offset - (baseDiff * symbolConfig.diffCoefficient / 100);
}

async function _send(symbol, value, threshold, maxPrice) {
  if (sent) {
    return;
  }
  sent = true;
  return notification.send(
    `${symbol} stoploss reached\n${value} (threshold: ${threshold}, max price: ${maxPrice.value})`,
  );
}

async function getCheckConfig() {
  const now = Date.now();
  if (cache.checkConfig !== undefined && cache.lastFetchedAt > (now - cache.ttl)) {
    return cache.checkConfig;
  }

  const result = JSON.parse(await fs.readFile('./handlers/trailing-stoploss.json'));
  cache.checkConfig = result ? result : null;
  cache.lastFetchedAt = now;
  return cache.checkConfig;
}
