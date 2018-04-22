// POS Section
app.controller('posController', function ($scope, $location, Inventory, Transactions) {

  $scope.barcode = '';

  // get and set inventory
  Inventory.getProducts().then(function (products) {
    $scope.inventory = angular.copy(products);
    window.localStorage.setItem( 'inventory', JSON.stringify($scope.inventory) );
  });
  
  function barcodeHandler (e) {
      
      $scope.barcodeNotFoundError = false;

      // if enter is pressed
      if (e.which === 13) {
        
        // if the barcode accumulated so far is valid, add product to cart
        if ($scope.isValidProduct($scope.barcode)) $scope.addProductToCart($scope.barcode);
        else 
          console.log('invalid barcode: ' + $scope.barcode);
          // $scope.barcodeNotFoundError = true;

        $scope.barcode = '';
        $scope.$digest();
      } 
      else {
        $scope.barcode += String.fromCharCode(e.which);
      }

  }

  $(document).on('keypress', barcodeHandler);

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

  var productAlreadyInCart = function (barcode) {
    var product = _.find($scope.cart.products, { barcode: barcode.toString() });
    
    if (product) {
      product.quantity = product.quantity + 1;
      $scope.updateCartTotals();
    }

    return product;
  };

  $scope.addProductToCart = function (barcode) {
    
    if (productAlreadyInCart(barcode)) return;
    else {
      var product = angular.copy(_.find($scope.inventory, { barcode: barcode.toString() }));
      product = $scope.cleanProduct(product);
      product.quantity = 1;
      addProductAndUpdateCart(product);
    }
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
    window.socket.emit('update-live-cart', $scope.cart);
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

      window.socket.emit('cart-transaction-complete', {});

      // clear cart and start fresh
      startFreshCart();
      
    });

    $scope.refreshInventory();
  };

  $scope.addQuantity = function (product) {
    product.quantity = parseInt(product.quantity) + 1;
    $scope.updateCartTotals();
  };

  $scope.removeQuantity = function (product) {
    if (parseInt(product.quantity) > 1) {
      product.quantity = parseInt(product.quantity) - 1;
      $scope.updateCartTotals();
    }
  };

});
