var app = angular.module('Transaction', [
  'ngRoute', 
  'ngAnimate',
  'lr.upload',
  'ui.odometer',
]);


///////////////////////////////////////////////////
////////////////// Socket.io ////////////////// //
//////////////////////////////////////////////////

// var serverAddress;
// console.log('serverAddress', window.location.host)
// if (window.location.host === 'pos.dev')
//   serverAddress = 'http://pos.dev'
// else
//   serverAddress = 'http://pos.afaqtariq.com:8080';

var socket = io.connect(window.location.host);


/////////////////////////////////////////////////////
////////////////// Controllers ////////////////// //
////////////////////////////////////////////////////

app.controller('body', function ($scope, $location, Settings) {
  
  
  Settings.get().then(function (settings) {
    $scope.settings = settings;
  });

});