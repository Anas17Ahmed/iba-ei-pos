///////////////////////////////////////////////////
//////////////////  Routes  ////////////////// //
//////////////////////////////////////////////////
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: 'templates/pos.html',
      controller: 'posController',
    }).
    when('/pos', {
      templateUrl: 'templates/pos.html',
      controller: 'posController',
    }).
    otherwise({
      redirectTo: '/'
    });
  }
]);