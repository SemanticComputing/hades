const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes');
const config = require('../config');

const app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

//app.use(cors({exposedHeaders: config.corsHeaders}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());

app.use('/', routes);

app.server.listen(process.env.PORT || config.port);

console.log(`Started on port ${app.server.address().port}`);

module.exports = app;
