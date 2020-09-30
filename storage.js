const LinkedList = require('linked-list');

const config = require('./config');

// TODO: save to db maybe?

const list = new LinkedList();
const keepPeriod = config.storage.keepPeriod * 1000;

function save(timestamp, data) {
  const item = new LinkedList.Item();
  item.timestamp = timestamp;
  item.data = data;
  list.append(item);

  const removeThreshold = Date.now() - keepPeriod;
  while (list.head && list.head.timestamp < removeThreshold) {
    list.head.detach();
  }
}

function getAll() {
  return list.toArray().map(item => ({ timestamp: item.timestamp, data: item.data }));
}

module.exports = {
  save,
  getAll,
};
