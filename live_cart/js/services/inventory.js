app.service('Inventory', ['$http', function ($http) {

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