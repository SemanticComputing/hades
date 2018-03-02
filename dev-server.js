'use strict';
var host = '127.0.0.1', port = 8081;
var path = require('path');
var app = require('express')();
app.use(require('express').static('dist'));
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'src/client/views/index.html')));
app.listen(port, () => console.log(`Listening on http://${host}:${port}/`));
