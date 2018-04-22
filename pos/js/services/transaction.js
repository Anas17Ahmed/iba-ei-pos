app.service('Transactions', ['$http', function($http, Inventory) {
  
  var transactionApiUrl = '/api/transactions/';
  this.getAll = function() {
    var url = transactionApiUrl + 'all';
    return $http.get(url).then(function(res) {
      return res.data;
    });
  };
  
  this.get = function(limit) {
    var url = transactionApiUrl + 'limit';
    return $http.get(url, {
      params: {
        limit: limit
      }
    }).then(function(res) {
      return res.data;
    });
  };
  
  this.getTotalForDay = function(date) {
    var url = transactionApiUrl + 'day-total';
    return $http.get(url, {
      params: {
        date: date
      }
    }).then(function(res) {
      return res.data;
    });
  };
  
  this.getOne = function(transactionId) {
    var url = transactionApiUrl + transactionId;
    return $http.get(url).then(function(res) {
      return res.data;
    });
  };
  
  this.add = function(transaction) {
    return $http.post(transactionApiUrl + 'new', transaction).then(function(res) {
      return res.data;
    });
  };

}]);