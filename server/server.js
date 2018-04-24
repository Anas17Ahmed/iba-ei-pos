const express = require('express'),
  app = require('express')(),
  server = app.listen(80),
  io = require('socket.io')(server),
  path = require('path'),
  bodyParser = require('body-parser'),
  AWSMS = require('./AWSMS');

const aws = new AWSMS();
const RECIEVE_DELAY = 5;

const transactionsQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/transactions';
const inventoryQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/inventory';
const posQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/pos';
const topic = 'arn:aws:sns:us-east-1:942443975652:POS';

// receiveInventory();
// receiveTransaction();
receivePOS();



// function receiveInventory() {
//   return aws.receiveMessage( inventoryQ , RECIEVE_DELAY).then( messages => {
//     for ( let i = 0; i < messages.length; i++ ) {
//       aws.deleteMessage( inventoryQ, messages[i].ReceiptHandle );
//     }
//     console.log('receiveMessage inventory', messages);
//     return receiveInventory();
//   });
// }

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

        console.log( 'message with invalid header', messages[i] );
      }
    }
    console.log('receiveMessage pos', messages );
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