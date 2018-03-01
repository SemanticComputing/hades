const Promise = require('bluebird');
const request = require( 'superagent');
const _ = require('lodash');
const config = require('../../config'); 

class ArticleService {

  constructor(params = {}) {
    this.newsIndex = params.textIndexSearch || config.textIndexSearch;
  }

  searchByTerm(term) {
    return new Promise((resolve, reject) => {
      request.post(this.newsIndex)
        .send({
          "query": {
            "query_string": {
              "query": term
            }
          }
         })
         .end((err, res) => {
           if (err || !res.ok) return reject(err);
           return resolve( _.filter(JSON.parse(res.text).hits.hits, (hit) => { return !_.includes(hit._source.publisher.name, "svenska");}) );
         });
    });
  }


  searchByEntity(uri) {
    return new Promise((resolve, reject) => {
      const prefixed = uri.replace("http://www.wikidata.org/entity/", "wikidata:"); 
      request.post(this.newsIndex)
        .send({
          "query": {
            "match": {
              "subjects.exactMatch": prefixed 
            }
          }
         })
         .end((err, res) => {
           if (err || !res.ok) return reject(err);
           return resolve( _.filter(JSON.parse(res.text).hits.hits, (hit) => { return !_.includes(hit._source.publisher.name, "svenska");}) );
         });
    });
  }

}

module.exports = ArticleService;
