///////////////////////////////////////////////////
//////////////////  Services  ////////////////// //
////////////////////////////////////////////////////

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

pos.service('Inventory', ['$http', function ($http) {

    var apiInventoryAddress = '/api/inventory';

    this.getProducts = function () {
        return $http.get(apiInventoryAddress + '/products').then(function (res) {
          return res.data;
        });
    };

    this.getProduct = function (productId) {
        var url = apiInventoryAddress + '/product/' + productId;
        return $http.get(url).then(function (res) {
          return res.data;
        });
    };

    this.updateProduct = function (product) {
        return $http.put(apiInventoryAddress + '/product', product).then(function (res) {
          return res.data;
        });
    };

    this.decrementQuantity = function (productId, quantity) {
      return $http.put(apiInventoryAddress + '/product', product).then(function (res) {
          return res.data;
        });
    };

    this.createProduct = function (newProduct) {
        return $http.post(apiInventoryAddress + '/product', newProduct).then(function (res) {
          return res.data;
        });
    };

    this.removeProduct = function (productId) {
        return $http.delete(apiInventoryAddress + '/product/' + productId).then(function (res) {
          return res.data;
        });
    };

}]);

pos.service('Transactions', ['$http', function ($http, Inventory) {

    var transactionApiUrl = '/api/transactions/';

    this.getAll = function () {
        var url = transactionApiUrl + 'all';

        return $http.get(url).then(function (res) {
          return res.data;
        });
    };

    this.getOne = function (transactionId) {
        var url = transactionApiUrl + transactionId;

        return $http.get(url).then(function (res) {
          return res.data;
        });
    };

    this.add = function (transaction) {
        return $http.post(transactionApiUrl + 'new', transaction).then(function (res) {
          return res.data;
        });
    };

}]);

pos.service('LiveCart', ['$http', function ($http, Inventory) {

    var liveCartApi = '/api/live-cart';

    this.update = function (cart) {
        return $http.post(liveCartApi, cart).then(function (res) {
          return res.data;
        });
    };

}]);