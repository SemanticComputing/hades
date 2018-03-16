/* Promisified fs-related functions used in the scripts */

const fs = require('fs');
const path = require('path');

const getFilenames = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, fileNames) => {
      if (err) {
        return reject(err);
      }
      return resolve(fileNames);
    })
  });
}

const readJsonFile = (dirPath, fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dirPath, fileName), 'utf-8', (err, content) => {
      if (err) {
        return reject(err);
      }
      return resolve(JSON.parse(content));
    });
  });
}

const clearFilePath = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.rename(filePath, `${filePath}.old`, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File not found, that's fine
          return resolve(false);
        }
        return reject(err);
      }
      return resolve(true);
    });
  });
}

const writeToStream = (stream, content) => {
  return new Promise((resolve) => {
    if (!content) return resolve(true);

    if (stream.write(content)) {
      return process.nextTick(() => resolve(true));
    }
    return stream.once('drain', () => resolve(true));
  });
}

module.exports = {
  clearFilePath,
  getFilenames,
  writeToStream,
  readJsonFile
};
