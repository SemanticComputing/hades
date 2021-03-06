/* eslint-env node */
/* eslint-disable no-console */

const _ = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');
const ProgressBar = require('progress');
const config = require('../config');
const { getFilenames, readJsonFile, clearFilePath, writeToStream } = require('./fs-utils');

const dirPath = process.argv[2] || config.newsDataDir;
const outputDir = process.argv[3] || config.rdfDataDir;
const outputFile = `${outputDir}/subjects.nt`;
const index = config.textIndex;
const documentPrefix = `${index}/article/`;

const rdfsLabel = '<http://www.w3.org/2000/01/rdf-schema#label>';
const rdfType = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
const place = '<http://schema.org/Place>';
const person = '<http://schema.org/Person>';
const organization = '<http://schema.org/Organization>';
const subject = '<http://purl.org/dc/terms/subject>';
const wikidataUri = 'http://www.wikidata.org/entity/';

const constructEntityRdf = (s, docUri) => {
  const uri = (_.find(s.exactMatch, (e) => _.includes(e, "wikidata:")) || '').replace("wikidata:", wikidataUri);

  if (uri) {
    let type = person;

    if (_.includes(s.types, "Place")) type = place;
    else if (_.includes(s.types, "Organization")) type = organization;

    let rdf = `${docUri} ${subject} <${uri}> .\n` +
      `<${uri}> ${rdfType} ${type} .\n`;

    if (s.title.fi) {
      rdf += `<${uri}> ${rdfsLabel} "${s.title.fi.replace(/"/g, '\\"')}"@fi .\n`;
    }

    return rdf;
  }
  return '';
};

const parseEntities = (documentPrefix, id, data) => {
  const docUri = `<${documentPrefix}${id}>`;
  const subjectsFiltered =
    _.filter(data.subjects, (s) => !_.isEmpty(_.intersection(s.types, ["Person", "Place", "Organization"])));

  let rdf = '';

  for (const s of subjectsFiltered) {
    rdf += constructEntityRdf(s, docUri);
  }

  return rdf;
}

const constructAll = () => {
  clearFilePath(outputFile).then(() => {
    const outputStream = fs.createWriteStream(outputFile, {
      flags: 'a',
      highWaterMark: 10485760
    });

    outputStream.on('error', (err) => {
      throw err;
    });

    let bar; // eslint-disable-line init-declarations

    getFilenames(dirPath)
      .then((fileNames) => {
        bar = new ProgressBar('[:bar] :current/:total :percent ETA: :eta Elapsed: :elapsed', { total: fileNames.length });
        return fileNames;
      })
      .then((fileNames) => {
        return Promise.map(fileNames, (fileName) => readJsonFile(dirPath, fileName)
          .then((jsonFile) => {
            return Promise.all(_.map(jsonFile.data, (document) => {
              return writeToStream(outputStream, parseEntities(documentPrefix, document.id, document));
            }));
          })
          .then(() => bar.tick()), { concurrency: 2 });
      })
      .then(() => {
        outputStream.end();
        console.log("Done!");
      })
      .catch(console.error);
  });
}

constructAll();
