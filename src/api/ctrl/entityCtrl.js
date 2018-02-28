const entityService = new (require('../lib/EntityService'))();

const entityCtrl = {

  find: (req, res, next) => {
    let promise;
    if (req.query.term) {
      promise = entityService.searchForEntities(req.query.term)
    } else {
      return res.send(400);
    }
    return promise.then((data) => res.json(data))
      .catch((err) => {
        console.log(err);
        return res.send(500);
      });
  }

};

module.exports = entityCtrl;
