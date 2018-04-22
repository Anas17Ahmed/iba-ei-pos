///////////////////////////////////////////////////
//////////////////  Routes  ////////////////// //
//////////////////////////////////////////////////
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: 'templates/inventory.html',
      controller: 'inventoryController',
    }).
    when('/inventory', {
      templateUrl: 'templates/inventory.html',
      controller: 'inventoryController',
    }).
    when('/inventory/create-product', {
      templateUrl: 'templates/inventory/create-product.html',
      controller: 'newProductController',
    }).
    when('/inventory/product/:productId', {
      templateUrl: 'templates/inventory/edit-product.html',
      controller: 'editProductController',
    }).
    otherwise({
      redirectTo: '/'
    });
  }
]);