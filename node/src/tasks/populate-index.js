/* eslint-env node */
/* eslint-disable no-console */

const fs = require('fs');
const Promise = require('bluebird');
const request = require('superagent');
const _ = require('lodash');
const path = require('path');
const config = require('../config');
const ProgressBar = require('progress');

const dirPath = process.argv[2] || config.newsDataDir;
const index = config.textIndex;
const documentPrefix = `${index}/article/`;

const indexProps = {
    "settings" : {
        "analysis" : {
            "analyzer" : {
              "default": {
                "tokenizer": "finnish",
                "filter": ["lowercase", "voikkoFilter"]
              }
            },
            "filter": {
              "voikkoFilter": {
                "type": "voikko"
              }
            }
        }
    }
};

const createIndex = (index, indexProps) => {
  return new Promise((resolve, reject) => {
    request.put(index)
      .send(indexProps)
      .end((err, res) => {
        if (err || !res.ok) return reject(err);
        return resolve(res);
      });
  });
};

const getFilenames = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, function(err, fileNames) {
      if (err) {
        return reject(err);
      }
      return resolve(fileNames);
    })
  });
}

const readJsonFile = (dirPath, fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dirPath, fileName), 'utf-8', function(err, content) {
      if (err) {
        return reject(err);
      }
      return resolve(JSON.parse(content));
    });
  });
}

const indexDocument = (documentPrefix, id, data) => {
  return new Promise((resolve, reject) => {
    request.put(documentPrefix + id)
      .send(data)
      .end((err, res) => {
        if (err || !res.ok) return reject(err);
        return resolve(res);
      });
  });
}

const indexAll = () => {
  let bar; // eslint-disable-line init-declarations

  createIndex(index, indexProps)
    .then(() => getFilenames(dirPath))
    .then((fileNames) => {
      bar = new ProgressBar('[:bar] :current/:total :percent ETA: :eta Elapsed: :elapsed', { total: fileNames.length });
      return fileNames;
    })
    .then((fileNames) => Promise.map(
      fileNames, (fileName) => readJsonFile(dirPath, fileName)
      .then((jsonFile) => Promise.map(jsonFile.data, (document) => indexDocument(documentPrefix, document.id, document)
        .then(() => true)
        .catch((err) => {
          bar.interrupt(`Failed to index ${document.id} (${err.status})`);
          return false;
        }), { concurrency: 8 })
        .then((res) => {
          bar.tick();
          return res;
        })),
      { concurrency: 2 }
    ))
    .then((res) => {
      const flattenedRes = _.flatten(res);
      const successCount = _.compact(flattenedRes).length;

      console.log(`${successCount}/${flattenedRes.length} documents succesfully indexed.`)
    })
    .catch(console.error);
};

indexAll();
