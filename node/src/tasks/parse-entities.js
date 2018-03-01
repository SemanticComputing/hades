const _ = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');
const request = require('superagent');
const path = require('path');

const dirPath = process.argv[2] ? process.argv[2] : './data/';
const index = 'http://localhost:9200/ylenews';
const documentPrefix = 'http://localhost:9200/ylenews/article/';

var rdf = '';

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
  const docUri = '<'+documentPrefix+id+'>'; 
  const rdfsLabel = '<http://www.w3.org/2000/01/rdf-schema#label>';
  const rdfType = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
  const place = '<http://schema.org/Place>';
  const person = '<http://schema.org/Person>';
  const organization = '<http://schema.org/Organization>';
  const subject = '<http://purl.org/dc/terms/subject>';
  const wikidataUri = 'http://www.wikidata.org/entity/';
  const subjectsFiltered = _.filter(data.subjects, (s) => {
    return _.includes(s.types, "Person") || _.includes(s.types, "Place") || _.includes(s.types, "Organization");  
  });
  _.map(subjectsFiltered, (s) => {
    try {
      const uri = _.filter(s.exactMatch, (e) => _.includes(e, "wikidata:"))[0].replace("wikidata:", wikidataUri);
      let type = person;
      if ( _.includes(s.types, "Place") ) type = place;
      else if ( _.includes(s.types, "Organization") ) type = organization;
      const label = s.title.fi;
      rdf += docUri + ' ' + subject + ' <' + uri + '> .\n'; 
      rdf += '<' + uri + '> ' + rdfType + ' ' + type + ' .\n'; 
      rdf += '<' + uri + '> ' + rdfsLabel + ' "' + label + '"@fi .\n'; 
    } catch(e) {}
  });

}

return getFilenames(dirPath)
  .then((fileNames) => {
    return Promise.map(fileNames, (fileName) => {
      return readJsonFile(dirPath, fileName).then((jsonFile) => {
        return _.each(jsonFile.data, (document) => {
          parseEntities(documentPrefix, document.id, document)
        })
      })
    }, {concurrency :5})
  })
  .then(() => {
    fs.writeFile("./subjects.nt", rdf, function(err) {
      if (err) {
          return console.log(err);
      }

      console.log("The file was saved!");
    }); 
  }) 
.catch(console.error);
