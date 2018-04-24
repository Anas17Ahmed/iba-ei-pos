var express = require('express'),
app 		= require('express')(),
server 		= app.listen(82),
path 		= require('path'),
bodyParser 	= require('body-parser'),
publicPath 	= '/../inventory/',
liveCart

console.log('Inventory')
console.log('Server started')

app.use(express.static(path.resolve(__dirname + publicPath)))
app.use(express.static(path.resolve(__dirname + '/../bower_components')))

app.get('/', function (req, res) {
	res.sendFile(path.resolve(__dirname, publicPath, 'index.html'))
})

app.use('/api', require('./api'))