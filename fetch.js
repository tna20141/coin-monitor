const fp = require('lodash/fp');
const _ = require('lodash');
const request = require('request');

const coins = ['BTC', 'ETH'];

function fetch() {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      json: true,
      url: `https://production.api.coindesk.com/v2/price/ticker?assets=${fp.join(',', coins)}`,
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      return fp.compose(
        resolve,
        fp.mapValues(num => _.round(num, 2)),
        fp.mapValues('ohlc.c'),
        fp.get('data'),
      )(body);
    });
  });
}
module.exports = fetch;
