window.doMe = {mobile: true};

angular.module('do-me', ['ngTouch', 'mobile-angular-ui', 'LocalForageModule']);

angular.module('do-me').controller('PageCtrl', ['$scope', function($scope) {
  $scope.page = {};
  $scope.page.ref = 'show-tags';
}]);
