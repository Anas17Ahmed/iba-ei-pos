///////////////////////////////////////////////////
//////////////////  Routes  ////////////////// //
//////////////////////////////////////////////////
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: 'templates/live-cart.html',
      controller: 'liveCartController',
    }).
    when('/live-cart', {
      templateUrl: 'templates/live-cart.html',
      controller: 'liveCartController',
    }).
    otherwise({
      redirectTo: '/'
    });
  }
]);