var app = angular.module('Inventory', [
  'ngRoute', 
  'ngAnimate',
  'lr.upload',
  'ui.odometer',
]);


///////////////////////////////////////////////////
////////////////// Socket.io ////////////////// //
//////////////////////////////////////////////////

// var socket = io.connect(window.location.hostname);


/////////////////////////////////////////////////////
////////////////// Controllers ////////////////// //
////////////////////////////////////////////////////

app.controller('body', function ($scope, $location, Settings) {
  
  
  Settings.get().then(function (settings) {
    $scope.settings = settings;
  });

});