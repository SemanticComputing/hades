module.exports = {
  'port': 8080,
  'sparqlEndpoint': process.env.NEWS_READER_SPARQL_ENDPOINT || 'http://localhost:3030/ds/sparql',
  'wikidataEndpoint': process.env.WIKIDATA_ENDPOINT || 'https://query.wikidata.org/sparql',
  'textIndexSearch': process.env.NEWS_READER_TEXT_INDEX_SEARCH || 'http://localhost:9200/ylenews/_search',
}
