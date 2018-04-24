app.controller('liveCartController', function ($scope, Transactions, Settings) {
  
  $scope.recentTransactions = [];

  var getTransactionsData = function () {
    Transactions.get(10).then(function (transactions) {
      $scope.recentTransactions = _.sortBy(transactions, 'date').reverse();
    });

    Transactions.getTotalForDay().then(function (dayTotal) {
      $scope.dayTotal = dayTotal.total;
    });
  };

  // tell the server the page was loaded.
  // the server will them emit update-live-cart-display
  window.socket.emit('live-cart-page-loaded', { forreal: true });

  // update the live cart and recent transactions
  window.socket.on('update-live-cart-display', function (liveCart) {
    $scope.liveCart = liveCart;
    getTransactionsData();
    $scope.$digest();
  });

});