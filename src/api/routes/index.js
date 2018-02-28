const Router = require('express');
const entityCtrl = require('../ctrl/entityCtrl');
const articleCtrl = require('../ctrl/articleCtrl');

const router = Router()
  .use('/api/v1/entity', entityCtrl.find)
  .use('/api/v1/article', articleCtrl.find);

module.exports = router;
