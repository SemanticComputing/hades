/* eslint-env node */
/* eslint-disable no-console */

const _ = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');
const path = require('path');
const config = require('../config');

const dirPath = process.argv[2] || config.newsDataDir;
const outPutDir = process.argv[3] || config.rdfDataDir;
const index = config.textIndex;
const documentPrefix = `${index}/article/`;

const rdfsLabel = '<http://www.w3.org/2000/01/rdf-schema#label>';
const rdfType = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
const place = '<http://schema.org/Place>';
const person = '<http://schema.org/Person>';
const organization = '<http://schema.org/Organization>';
const subject = '<http://purl.org/dc/terms/subject>';
const wikidataUri = 'http://www.wikidata.org/entity/';

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

const parseEntities = (documentPrefix, id, data) => {
  const docUri = `<${documentPrefix}${id}>`;
  const subjectsFiltered =
    _.filter(data.subjects, (s) => !_.isEmpty(_.intersection(s.types, ["Person", "Place", "Organization"])));

  let rdf = '';

  for (const s of subjectsFiltered) {
    const uri = (_.find(s.exactMatch, (e) => _.includes(e, "wikidata:")) || '').replace("wikidata:", wikidataUri);

    if (uri) {
      let type = person;

      if (_.includes(s.types, "Place")) type = place;
      else if (_.includes(s.types, "Organization")) type = organization;

      rdf += `${docUri} ${subject} <${uri}> .\n` +
        `<${uri}> ${rdfType} ${type} .\n` +
        `<${uri}> ${rdfsLabel} "${s.title.fi}"@fi .\n`;
    }
  }

  return rdf;

}

getFilenames(dirPath)
  .then((fileNames) => {
    return Promise.map(fileNames, (fileName) => readJsonFile(dirPath, fileName)
      .then((jsonFile) => {
        return _.compact(_.map(jsonFile.data, (document) => parseEntities(documentPrefix, document.id, document)))
      }));
  }, { concurrency: 2 })
  .then((data) => {
    const rdf = _.flatten(data).join('');

    fs.writeFile(`${outPutDir}/subjects.nt`, rdf, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
      return true;
    });
  })
  .catch(console.error);
