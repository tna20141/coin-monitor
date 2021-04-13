const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

let conn = null;

function init() {
  // TODO: retry?
  return new Promise((resolve, reject) => {
    // Use connect method to connect to the server
    MongoClient.connect(config.db.url, { useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.log('[ERROR] connecting to db', error);
        return reject(error);
      }
      console.log('[INFO] connected successfully to server');
      conn = client.db(config.db.database);
      return resolve();
    });
  });
}

function find(collection, filter) {
  return new Promise((resolve, reject) => {
    conn.collection(collection).find(filter).toArray((error, docs) => {
      if (error) {
        return reject(error);
      }
      return resolve(docs);
    });
  });
}

function add(collection, items) {
  return new Promise((resolve, reject) => {
    conn.collection(collection).insertMany(_.castArray(items), (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

module.exports = {
  init,
  conn,
  find,
  add,
};
