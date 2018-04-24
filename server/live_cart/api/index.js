const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const path = require('path');

module.exports = app;

// print data of server
app.get('/', function(req, res) {
  res.send('POS.');
});

app.use('/transactions', require('./transactions'));