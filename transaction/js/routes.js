///////////////////////////////////////////////////
//////////////////  Routes  ////////////////// //
//////////////////////////////////////////////////
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: 'templates/transactions.html',
      controller: 'transactionsController',
    }).
    when('/transactions', {
      templateUrl: 'templates/transactions.html',
      controller: 'transactionsController',
    }).
    when('/transaction/:transactionId', {
      templateUrl: 'templates/view-transaction.html',
      controller: 'viewTransactionController',
    }).
    otherwise({
      redirectTo: '/transactions'
    });
  }
]);