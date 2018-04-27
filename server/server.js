const express = require('express'),
  app = require('express')(),
  server = app.listen(80),
  io = require('socket.io')(server),
  path = require('path'),
  bodyParser = require('body-parser'),
  AWSMS = require('./AWSMS');

const aws = new AWSMS();
const RECIEVE_DELAY = 5;


const invalidMessage = 'https://sqs.us-east-1.amazonaws.com/942443975652/invalid-message.fifo';
const transactionsQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/transactions.fifo';
const inventoryQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/inventory.fifo';
const posQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/pos.fifo';
const deadQ = 'https://sqs.us-east-1.amazonaws.com/942443975652/dead-letter.fifo';
const topic = 'arn:aws:sns:us-east-1:942443975652:POS';

receiveDead();
receiveInvalid();
receivePOS();

function receiveDead() {
  return aws.receiveMessage( deadQ , RECIEVE_DELAY).then( messages => {
    for ( let i = 0; i < messages.length; i++ ) {
      aws.deleteMessage( inventoryQ, messages[i].ReceiptHandle );
    }
    console.log('receiveMessage deadQs', messages);
    return receiveInventory();
  });
}

function receiveInvalid() {
  return aws.receiveMessage( invalidMessage , RECIEVE_DELAY).then( messages => {
    for ( let i = 0; i < messages.length; i++ ) {
      aws.deleteMessage( inventoryQ, messages[i].ReceiptHandle );
    }
    console.log('invalidMessage', messages);
    return receiveInventory();
  });
}


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