/* eslint-env node */
/* eslint-disable no-console */

const _ = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');
const SparqlApi = require('../api/lib/SparqlApi');
const config = require('../config');

const entityEndpoint = config.sparqlEndpoint;
const { wikidataEndpoint } = config;
const filePath = process.argv[2] || './wikidata-enrichments.nt'

const getUris = () => {
  return new Promise((resolve, reject) => {
    const sparqlQuery = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX schema: <http://schema.org/>

      SELECT DISTINCT ?s {
        ?s a ?t .
        FILTER(?t IN (schema:Person, schema:Organization, schema:Place))
      }
    `;

    new SparqlApi({ endpoint: entityEndpoint })
      .selectQuery(sparqlQuery)
      .then((data) => {
        if (data.results.bindings.length === 0) {
          return resolve([]);
        }

        const entities = _.map(data.results.bindings, (val) => val.s.value);

        return resolve(entities);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}

const getWikidataTriples = (uris) => {

  return new Promise((resolve, reject) => {

    const urisStr = _.map(uris, (uri) => `<${uri}>`).join('\n');

    const sparqlQuery = `
      CONSTRUCT { ?s rdfs:label ?o . ?entity ?p1 ?s . ?entity skos:related ?s . } WHERE {
          VALUES ?entity {
            ${urisStr}
          }
          ?entity ?p1 ?s .
          ?s rdfs:label|skos:prefLabel ?o .
          FILTER (LANG(?o) = 'fi')
      }
    `;

    new SparqlApi({ endpoint: wikidataEndpoint })
      .constructQuery(sparqlQuery)
      .then((triples) => {
        return resolve(triples);
      })
      .catch((err) => {
        return reject(err);
      });
  });

}

getUris().then(getWikidataTriples)
    .then((triples) => {
        fs.writeFile(filePath, triples, () => {
            console.log('wrote file ./wikidata-enrichments.ttl');
        });
    });

