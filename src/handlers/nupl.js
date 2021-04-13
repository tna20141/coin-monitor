const fp = require('lodash/fp');
const _ = require('lodash');
const fs = require('fs').promises;
const request = require('request');

const notification = require('../notification');

async function callback() {
  const config = await JSON.parse(await fs.readFile(`${__dirname}/nupl.json`));
  const nupl = await getNupl();
  if (nupl > config.nuplThreshold) {
    maybeNotify(nupl);
  }
}

function getNupl() {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      json: true,
      url: 'https://www.lookintobitcoin.com/django_plotly_dash/app/unrealised_profit_loss/_dash-layout',
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      return resolve(fp.compose(
        fp.last,
        fp.get('y'),
        fp.find(item => item.name === 'Relative Unrealised Profit/Loss'),
        fp.get('props.children.0.props.figure.data'),
      )(body));
    });
  });
}

async function maybeNotify(nupl) {
  notification.send(`NUPL value is ${_.round(nupl, 3)}`);
}

module.exports = callback;
