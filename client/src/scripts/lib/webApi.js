/* global API_URL */

import Promise from 'bluebird';
import request from  'superagent';

class WebApi {

  constructor({ webApiUrl }) {
    this.webApiUrl = webApiUrl;
  }

  searchByEntity(term, uri) {
    return new Promise((resolve, reject) => {
      request.get(`${this.webApiUrl}/article`)
        .query({ entity: uri  })
        .end((err, res) => {
          if (err || !res.ok) return reject(err);
          return resolve(JSON.parse(res.text));
        });
    });
  }

  searchForEntities(term) {
    return new Promise((resolve, reject) => {
      request.get(`${this.webApiUrl}/entity`)
        .query({ term: term })
        .end((err, res) => {
          if (err || !res.ok) return reject(err);
          return resolve(JSON.parse(res.text));
        });
    });
  }

}
const webApi = new WebApi({ webApiUrl: API_URL });

export default webApi;
