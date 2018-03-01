const Promise = require('bluebird');
const request = require( 'superagent');
const _ = require('lodash');
const config = require('../../config'); 
const endpoint = config.sparqlEndpoint;
const sparqlApi = new (require('./SparqlApi'))({ endpoint });

class EntityService {

  constructor(params = {}) {
  }

  searchForEntities(queryTerm) {
    return new Promise((resolve, reject) => {
      const sparqlQuery = `
        PREFIX text: <http://jena.apache.org/text#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

        SELECT DISTINCT *
        WHERE {
          ?subject1 text:query (rdfs:label '${queryTerm}*') .
          ?subject1 ^skos:related? ?subject . 
          ?subject a ?type .
          ?subject rdfs:label ?label .
        }
      `;

      return sparqlApi.selectQuery(sparqlQuery)
        .then((data) => {
          if (data.results.bindings.length === 0)
            return resolve([]);

          const entities = _.map(data.results.bindings, (val, key) => {
            return {
              uri: val.subject.value,
              type: val.type.value,
              label: val.label.value,
            };
          });

          return resolve(entities);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
}

module.exports = EntityService;
