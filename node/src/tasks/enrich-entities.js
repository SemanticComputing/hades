/* eslint-env node */
/* eslint-disable no-console */

const _ = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');
const SparqlApi = require('../api/lib/SparqlApi');
const ProgressBar = require('progress');
const config = require('../config');
const { clearFilePath, writeToStream } = require('./fs-utils');

const entityEndpoint = config.sparqlEndpoint;
const { wikidataEndpoint, wikidataUriChunkSize } = config;
const filePath = `${process.argv[2] || config.rdfDataDir}/enrichments.ttl`;

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

clearFilePath(filePath)
  .then(() => getUris())
  .then((uris) => {
    const outputStream = fs.createWriteStream(filePath, {
      flags: 'a',
      highWaterMark: 10485760
    });

    outputStream.on('error', (err) => {
      throw err;
    });

    const chunks = _.chunk(uris, wikidataUriChunkSize);

    console.log(`${uris.length} URIs, processing in ${chunks.length} chunks, chunk size ${wikidataUriChunkSize}`);

    const bar = new ProgressBar('[:bar] :current/:total :percent ETA: :eta Elapsed: :elapsed', { total: chunks.length });

    return Promise.map(chunks, (chunk) => getWikidataTriples(chunk)
      .then((triples) => writeToStream(outputStream, triples))
      .then(() => bar.tick()), { concurrency: 5 })
    .then(() => {
      outputStream.end();
      console.log(`wrote file ${filePath}`);
    });
  });
