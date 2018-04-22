///////////////////////////////////////////////////
//////////////////  Services  ////////////////// //
////////////////////////////////////////////////////

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

app.service('Settings', ['$http', function ($http) {

    var settingsFile = 'settings.json';

    this.get = function () {
      return $http.get(settingsFile).then(function (res) {
        return res.data;
      });
    }

}]);