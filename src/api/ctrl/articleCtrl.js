const articleService = new (require('../lib/ArticleService'))();

const articleCtrl = {

  find: (req, res, next) => {
    let promise;
    if (req.query.entity) {
      promise = articleService.searchByEntity(req.query.entity)
    } else if (req.query.term) {
      promise = articleService.searchByTerm(req.query.term)
    } else {
      return res.sendStatus(400);
    }
    return promise.then((data) => res.json(data))
      .catch((err) => {
        console.log(err);
        return res.sendStatus(500);
      });
  }

};

module.exports = articleCtrl;
