const express = require('express'),
  app = require('express')(),
  server = app.listen(83),
  path = require('path'),
  bodyParser = require('body-parser'),
  rootPath = path.resolve(__dirname, '..', '..'),
  publicPath = path.resolve(rootPath, 'transaction');

console.log('Transaction Server started')

app.use(express.static(publicPath));
app.use(express.static(path.resolve(rootPath, 'bower_components')));
app.get('/', function(req, res) {
  res.sendFile(path.resolve(publicPath, 'index.html'));
});
app.use('/api', require('./api'));