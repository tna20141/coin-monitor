/* eslint-disable */

const modules = [
  'nupl',
];

function importMod(name) {
  return {
    config: require(`./${name}.json`),
    callback: require(`./${name}.js`),
    name,
  }
}


module.exports = modules.map(importMod);
