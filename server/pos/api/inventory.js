const app	= require('express')();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const async = require('async');
const path = require('path');

const AWSMS = require('./../../AWSMS');
const aws = new AWSMS();
const inventoryQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/inventory';
const invalidQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/invalid';
const RECIEVE_DELAY = 5;

app.use(bodyParser.json())

module.exports = app

// Database stuff
const inventoryDB = new Datastore({ 
	filename: path.resolve( __dirname + '/../databases/inventory.db.json' ), 
	autoload: true 
})

receiveInventory();
function receiveInventory() {
  return aws.receiveMessage( inventoryQ , RECIEVE_DELAY).then( messages => {
    
    for ( let i = 0; i < messages.length; i++ ) {
    	let msg = JSON.parse( messages[i].Body.Message ); 
    	if ( msg.header == 'inventory' ) {
    		console.log('messages[i].Attributes.ApproximateReceiveCount', messages[i].Attributes.ApproximateReceiveCount);
    		if ( messages[i].Attributes.ApproximateReceiveCount <= 1 ) {
    			inventoryDB.insert( msg.body , function (err, product) {
						if (err) 
							console.log('sqs product error', err);
						else 
							console.log('sqs product', product);
					});
    		}
    	} else {
    		aws.deleteMessage( inventoryQ, messages[i].ReceiptHandle );
    		aws.sendMessage( invalidQ, messages[i].Body );
    	}
    }
    
    console.log('receiveMessage inventory', messages);
    
    return receiveInventory();
  });
}

// GET inventory
app.get('/', function (req, res) {
	res.send('Inventory API')
})

// GET a product from inventory by _id
app.get('/product/:productId', function (req, res) {
	
	if (!req.params.productId) {
		res.status(500).send('ID field is required.')
	}
	else {
		inventoryDB.findOne({_id: req.params.productId }, function (err, product) {
			res.send(product)
		});
	}

})

// GET all inventory items
app.get('/products', function (req, res) {

	inventoryDB.find({}, function (err, docs) {
		res.send(docs)
	})
})

// Create inventory product
app.post('/product', function (req, res) {

	var newProduct = req.body
	
	inventoryDB.insert(newProduct, function (err, product) {
		if (err) 
			res.status(500).send(err)
		else 
			res.send(product)
	})
})

app.delete('/product/:productId', function (req, res) {
	
	inventoryDB.remove({ _id: req.params.productId }, function (err, numRemoved) {
		if (err) 
			res.status(500).send(err)
		else 
			res.sendStatus(200)
	})
})

// Update inventory product
app.put('/product', function (req, res) {

	var productId = req.body._id
	
	inventoryDB.update({ _id: productId }, req.body, {}, function (err, numReplaced, product) {
		
		if (err) 
			res.status(500).send(err)
		else
			res.sendStatus(200)
		
	});

})

app.decrementInventory = function (products) {

	async.eachSeries(products, function (transactionProduct, callback) {
		
		inventoryDB.findOne({_id: transactionProduct._id }, function (err, product) {
			
			// catch manually added items (don't exist in inventory)
			if (!product || !product.quantity_on_hand) {
				callback();
			}

			else {
				product.quantity_on_hand = parseInt(product.quantity_on_hand) - parseInt(transactionProduct.quantity)
				inventoryDB.update({ _id: product._id }, product, {}, callback)
			}

		});

	});
};