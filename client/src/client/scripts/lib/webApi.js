import Promise from 'bluebird';
import request from  'superagent';
import _ from 'lodash';

class WebApi {

  constructor(params = {}) {
    this.webApiUrl = 'http://localhost:8080/api/v1/'
  }
  

  searchByEntity(term, uri) {
    return new Promise((resolve, reject) => {
      request.get(this.webApiUrl+'article')
        .query({ entity: uri  })
         .end((err, res) => {
           if (err || !res.ok) return reject(err);
           return resolve(JSON.parse(res.text));
         });
    });
  }

  searchForEntities(term) {
    return new Promise((resolve, reject) => {
      request.get(this.webApiUrl+'entity')
        .query({ term: term })
         .end((err, res) => {
           if (err || !res.ok) return reject(err);
           return resolve(JSON.parse(res.text));
         });
    });
  }

}

const webApi = new WebApi();

export default webApi;
