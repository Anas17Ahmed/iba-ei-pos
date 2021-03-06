const app = require('express')();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const path = require('path')
const Inventory = require('./inventory');

const AWSMS = require('./../../AWSMS');
const aws = new AWSMS();
const transactionsQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/transactions';
const posQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/pos';

const deadQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/dead';
const topic = 'arn:aws:sns:us-east-1:942443975652:POS';
const LARGE_DELAY = 30;

app.use(bodyParser.json());

module.exports = app;

// Database stuff
const  Transactions = new Datastore({ 
	filename: path.resolve( __dirname + '/../databases/transactions.db.json' ), 
	autoload: true 
});

app.get('/', function (req, res) {
	res.send('Transactions API')
});

// GET all transactions
app.get('/all', function (req, res) {

	Transactions.find({}, function (err, docs) {
		res.send(docs)
	})
});

// GET all transactions
app.get('/limit', function (req, res) {

	var limit = parseInt(req.query.limit, 10)
	if (!limit) limit = 5

	Transactions.find({}).limit(limit).sort({ date: -1 }).exec(function (err, docs) {
	  res.send(docs)
	})
})

// GET total sales for the current day
app.get('/day-total', function (req, res) {

	// if date is provided
	if (req.query.date) {
		startDate = new Date(req.query.date)
		startDate.setHours(0,0,0,0)

		endDate = new Date(req.query.date)
		endDate.setHours(23,59,59,999)
	}
	else {

		// beginning of current day
		var startDate = new Date()
		startDate.setHours(0,0,0,0)

		// end of current day
		var endDate = new Date()
		endDate.setHours(23,59,59,999)	
	}


	Transactions.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {
		
		var result = {
			date: startDate
		}

		if (docs) {

			var total = docs.reduce(function (p, c) {
				return p + c.total
			}, 0.00)

			result.total = parseFloat(parseFloat(total).toFixed(2))

			res.send(result)
		}
		else {
			result.total = 0
			res.send(result)
		}
	})	
})

// GET transactions for date
app.get('/by-date', function (req, res) {
	
	var startDate = new Date(2015, 2, 15)
	startDate.setHours(0,0,0,0)

	var endDate = new Date(2015, 2, 15)
	endDate.setHours(23,59,59,999)

	Transactions.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {
		if (docs)
			res.send(docs)
	})
})

// Add new transaction
app.post('/new', function (req, res) {

	var newTransaction = req.body
	
	Transactions.insert(newTransaction, function (err, transaction) {
		if (err) 
			res.status(500).send(err)
		else {
			res.sendStatus(200)
			Inventory.decrementInventory(transaction.products)
			aws.sendMessage( posQ/*transactionsQ*/, {
				'header': 'transactions',
				'body': transaction
			})
			.catch( err => { console.log('publish transaction error', err) })
			.then( result => {
				console.log( 'transaction published', result );
				setTimeout( function AfterTimeout() {
					return aws.receiveMessage( transactionsQ , 0).then( messages => {
						console.log( 'inventory messages', messages );
						for (var i = 0; i < messages.length; i++) {
							if ( messages[i].Attributes.ApproximateReceiveCount <= 1 ) 
								aws.sendMessage( deadQ, messages[i].Body );
						}
				  });
				}, LARGE_DELAY * 1000);
			});
		} 
	})
})

// GET single transaction
app.get('/:transactionId', function (req, res) {

	Transactions.find({ _id: req.params.transactionId }, function (err, doc) {
		if (doc)
			res.send(doc[0])
	})
})

