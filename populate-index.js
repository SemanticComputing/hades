const _ = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');
const request = require('superagent');
const path = require('path');

const dirPath = process.argv[2] ? process.argv[2] : './data/';
const index = 'http://localhost:9200/ylenews';
const documentPrefix = 'http://localhost:9200/ylenews/article/';

var indexProps = {
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

createIndex(index)
  .then(() => { return getFilenames(dirPath); })
  .then((fileNames) => {
    Promise.map(fileNames, (fileName) => {
      return readJsonFile(dirPath, fileName)
    }, {concurrency :1}).then((jsonFiles) => {
      Promise.map(jsonFiles, (jsonFile) => {
        return Promise.map(jsonFile.data, (document) => {
          return indexDocument(documentPrefix, document.id, document).catch(console.error); 
        }, {concurrency: 1});
      }, {concurrency :1})
    })
})
.catch(console.error);
