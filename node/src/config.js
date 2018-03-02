/* eslint-disable no-process-env */
module.exports = {
  'port': 8080,
  'sparqlEndpoint': process.env.NEWS_READER_SPARQL_ENDPOINT || 'http://localhost:3030/ds/sparql',
  'wikidataEndpoint': process.env.WIKIDATA_ENDPOINT || 'https://query.wikidata.org/sparql',
  'textIndex': process.env.NEWS_READER_TEXT_INDEX || 'http://localhost:9200/ylenews',
  'textIndexSearch': process.env.NEWS_READER_TEXT_INDEX_SEARCH || 'http://localhost:9200/ylenews/_search',
  'newsDataDir': process.env.NEWS_DATA_DIR || './yledata',
  'rdfDataDir': process.env.RDF_DATA_DIR || './data'
}
