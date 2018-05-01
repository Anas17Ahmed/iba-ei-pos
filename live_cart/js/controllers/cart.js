app.controller('liveCartController', function ($scope, Transactions, Settings) {
  
  $scope.recentTransactions = [];

  var getTransactionsData = function ( cart ) {

    Transactions.get(10).then(function (transactions) {
      var mergedList = _.map(transactions, function(item) {
        return _.extend(item, _.findWhere(cart, { _id: item._id }));
      });
      $scope.recentTransactions = _.sortBy(mergedList, 'date').reverse();
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