const express = require('express'),
  app = require('express')(),
  server = app.listen(80),
  io = require('socket.io')(server),
  path = require('path'),
  bodyParser = require('body-parser'),
  AWSMS = require('./AWSMS');

const aws = new AWSMS();
const RECIEVE_DELAY = 5;
const LARGE_DELAY = 60;
const MEDIUM_DELAY = 20;

const topic = 'arn:aws:sns:us-east-1:942443975652:POS';

const deadQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/dead';
const invalidQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/invalid';

const posQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/pos';
const inventoryQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/inventory';
const transactionsQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/transactions';

// receiveInvalid();
// receiveDead();
receivePOS();


function receiveInvalid() {
  return aws.receiveMessage( invalidQ , MEDIUM_DELAY).then( messages => {
    console.log('invalid messages', messages);
    return receiveInvalid();
  });
}

function receiveDead() {
  return aws.receiveMessage( deadQ , MEDIUM_DELAY).then( messages => {
    console.log('Dead letter messages', messages);
    return receiveDead();
  });
}

// function receiveTransaction() {
//   return aws.receiveMessage( transactionsQ, RECIEVE_DELAY ).then( messages => {
//     for ( let i = 0; i < messages.length; i++ ) {
//       aws.deleteMessage( transactionsQ, messages[i].ReceiptHandle );
//     }
//     console.log('receiveMessage transactions', messages);
//     return receiveTransaction();
//   });
// }

function receivePOS() {
  return aws.receiveMessage( posQ, RECIEVE_DELAY ).then( messages => {
    
    for ( let i = 0; i < messages.length; i++ ) {

      aws.deleteMessage( posQ, messages[i].ReceiptHandle );
      
      if ( messages[i].Body.header == 'inventory' ) {
        
        aws.sendMessage( inventoryQ, messages[i].Body );

      } else if ( messages[i].Body.header == 'transactions' ) {

        aws.sendMessage( transactionsQ, messages[i].Body );

      } else {
        aws.sendMessage( invalidQ, messages[i].Body );        
        console.log( 'message with invalid header', messages[i] );
      }
    }
    console.log('posQ messages', messages );
    return receivePOS();
  });
}


console.log('Messaging Server started')

// Websocket logic for Live Cart
io.on('connection', function(socket) {

  let liveCart;

  socket.on('cart-transaction-complete', function() {
    socket.broadcast.emit('update-live-cart-display', {})
  })
  // upon page load, give user current cart
  socket.on('live-cart-page-loaded', function() {
    socket.emit('update-live-cart-display', liveCart)
  })
  // upon connecting, make client update live cart
  socket.emit('update-live-cart-display', liveCart)
  // when the cart data is updated by the POS
  socket.on('update-live-cart', function(cartData) {
    // keep track of it
    liveCart = cartData
    // broadcast updated live cart to all websocket clients
    socket.broadcast.emit('update-live-cart-display', liveCart)
  })
})