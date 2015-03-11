 var pos = angular.module('POS', ['ngRoute']);

///////////////////////////////////////////////////
//////////////////  Routing  ////////////////// //
//////////////////////////////////////////////////

pos.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.
          when('/', {
            templateUrl: 'templates/home.html',
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
          when('/pos', {
            templateUrl: 'templates/pos.html',
            controller: 'posController',
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
            redirectTo: '/'
          });
          
    }]);

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


///////////////////////////////////////////////////
////////////////// Directives ////////////////// //
////////////////////////////////////////////////////

pos.directive('productForm',function ($location) {
  return {
    restrict: 'E',
    scope: {
      product: '=',
      onSave: '&'
    },
    templateUrl: 'templates/directives/product-form.html',
    link: function (scope, el) {

      // highlight barcode field
      var $barcode = el.find('form').eq(0).find('input').eq(0);
      var $name = el.find('form').eq(0).find('input').eq(1);
      $barcode.select();

      scope.tabOnEnter = function ($event) {
        if ($event.keyCode === 13) {
          $name.select(); 
          $event.preventDefault();
        }
      };

      scope.save = function () {
        scope.onSave({ product: scope.product });
      };

    }
  };

});

pos.directive('addManualItem',function () {
  return {
    restrict: 'E',
    scope: {
      addItem: '&'
    },
    templateUrl: 'templates/directives/add-manual-item.html',
    link: function (scope, el) {
      
      scope.add = function () {
        scope.manualItem.name = "----";
        scope.addItem({item: scope.manualItem});
        el.find('div').eq(0).modal('hide');
        scope.manualItem = '';
      };

    }
  };

});

pos.directive('checkout',function () {
  return {
    restrict: 'E',
    scope: {
      printReceipt: '&',
      cartTotal: '='
    },
    templateUrl: 'templates/directives/checkout.html',
    link: function (scope, el) {
      
      $paymentField = el.find('form').eq(0).find('input').eq(0);
      
      scope.focusPayment = function () {
        $('#checkoutPaymentAmount').focus();
      };
      
      scope.getChangeDue = function () {
        if (scope.paymentAmount && scope.paymentAmount > scope.cartTotal) {
          var change =  parseFloat(scope.paymentAmount) - parseFloat(scope.cartTotal);
          return change;
        }
        else 
          return 0;
      };

      scope.print = function () {
        if (scope.cartTotal > scope.paymentAmount) return;

        var paymentAmount = angular.copy(scope.paymentAmount);

        scope.previousCartInfo = {
          total: angular.copy(scope.cartTotal),
          paymentAmount: paymentAmount,
        };

        scope.printReceipt({ payment: paymentAmount });
        scope.transactionComplete = true;
      };

      scope.closeModal = function () {
        el.find('div').eq(0).modal('hide');
        delete scope.paymentAmount;
      };

    }
  };

});

/////////////////////////////////////////////////////
////////////////// Controllers ////////////////// //
////////////////////////////////////////////////////

pos.controller('body', function ($scope) {
});

// Inventory Section

pos.controller('inventoryController', function ($scope, $location, Inventory) {

  // get and set inventory
  Inventory.getProducts().then(function (products) {
    $scope.inventory = angular.copy(products);
  });

  // go to edit page
  $scope.editProduct = function (productId) {
    $location.path('/inventory/product/' + productId);
  };

});

pos.controller('newProductController', function ($scope, $location, $route, Inventory) {
  
  $scope.addMultipleProducts = false;

  $scope.createProduct = function (product) {
    
    Inventory.createProduct($scope.newProduct).then(function (product) {

      if ($scope.addMultipleProducts) refreshForm();
      else $location.path('/inventory');
      
    });

  };

  var refreshForm = function () {
    $scope.newProuct = {};
  };

});

pos.controller('editProductController', function ($scope, $location, $routeParams, Inventory) {
    
  // get and set inventory
  Inventory.getProduct($routeParams.productId).then(function (product) {
    $scope.product = angular.copy(product);
  });

  $scope.saveProduct = function (product) {
    
    Inventory.updateProduct(product).then(function (updatedProduct) {
      console.log('updated!');
    });

    $location.path('/inventory');
  };

  $scope.deleteProduct = function () {
    Inventory.removeProduct($scope.product._id).then(function () {
      $location.path('/inventory');
    });
  };

});

// POS Section
pos.controller('posController', function ($scope, $location, Inventory, Transactions) {

  $scope.barcode = '';

  $(document).on('keypress', function (e) {
      
      $scope.barcodeNotFoundError = false;

      // if enter is pressed
      if (e.which === 13) {
        
        // if the barcode accumulated so far is valid, add product to cart
        if ($scope.isValidProduct($scope.barcode)) $scope.addProductToCart($scope.barcode);
        else $scope.barcodeNotFoundError = true;

        $scope.barcode = '';
        $scope.$digest();
      } 
      else {
        $scope.barcode += String.fromCharCode(e.which);
      }

  });

  var rawCart = {
    products: [],
    total: 0,
    total_tax: 0,
  };

  var startCart = function () {
    var cartJSON = localStorage.getItem('cart');

    if (cartJSON) {
      $scope.cart = JSON.parse(cartJSON);
    }
    else {
      $scope.cart = angular.copy(rawCart);
    }

  };

  var startFreshCart = function () {
      localStorage.removeItem('cart');
      $scope.cart = angular.copy(rawCart);
      $scope.updateCartTotals();
      $('#barcode').focus();
  };

  $scope.refreshInventory = function () {
    Inventory.getProducts().then(function (products) {
      $scope.inventory = angular.copy(products);
      $scope.inventoryLastUpdated = new Date();
    });
  };

  $scope.refreshInventory();

  startCart();
  
  var addProductAndUpdateCart = function (product) {
    $scope.cart.products = $scope.cart.products.concat([product]);
    $scope.updateCartTotals();
    $scope.barcode = '';
  };

  $scope.cleanProduct = function (product) {
    product.cart_item_id = $scope.cart.products.length + 1;

    if (product.food) product.tax_percent = 0;
    else product.tax_percent = .08 ;

    delete product.quantity_on_hand;
    delete product.food;
    return product;
  };

  $scope.addProductToCart = function (barcode) {
    var product = angular.copy(_.find($scope.inventory, { barcode: barcode.toString() }));
    product = $scope.cleanProduct(product);
    product.quantity = 1;
    addProductAndUpdateCart(product);
  };

  $scope.addManualItem = function (product) {
    product.quantity = 1;
    product = $scope.cleanProduct(product)
    addProductAndUpdateCart(product);
  };

  $scope.removeProductFromCart = function (productIndex) {
    $scope.cart.products.remove(productIndex);
    $scope.updateCartTotals();
  };

  $scope.isValidProduct = function (barcode) {
    return _.find($scope.inventory, { barcode: barcode.toString() });
  };

  var updateCartInLocalStorage = function () {
    var cartJSON = JSON.stringify($scope.cart);
    localStorage.setItem('cart', cartJSON);
  };

  $scope.updateCartTotals = function () {
    $scope.cart.total = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat( product.price * product.quantity );
      var weightedTax = parseFloat( weightedPrice * product.tax_percent );
      var weightedPricePlusTax = weightedPrice + weightedTax;
      return total + weightedPricePlusTax;
    }, 0);

    $scope.cart.total_tax = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat( product.price * product.quantity );
      var weightedTax = parseFloat( weightedPrice * product.tax_percent );
      return total + weightedTax;
    }, 0);

    updateCartInLocalStorage();
  };

  $scope.printReceipt = function (payment) {
    // print receipt
    var cart = angular.copy($scope.cart);
    cart.payment = angular.copy(payment);
    cart.date = new Date();

    // save to database
    Transactions.add(cart).then(function (res) {

      // clear cart and start fresh
      startFreshCart();
      
    });

    $scope.refreshInventory();
  };

});

pos.controller('transactionsController', function ($scope, $location, Transactions) {
    
  Transactions.getAll().then(function (transactions) {
    $scope.transactions = angular.copy(transactions);
  });

});

pos.controller('viewTransactionController', function ($scope, $routeParams, Transactions) {
  
  var transactionId = $routeParams.transactionId;

  Transactions.getOne(transactionId).then(function (transaction) {
    $scope.transaction = angular.copy(transaction);
  });

});
