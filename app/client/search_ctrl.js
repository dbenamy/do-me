angular.module('do-me').controller('SearchCtrl', ['$scope', 'search', function($scope, search) {
	$scope.searchInput = '';
	$scope.getResults = search.getResults;

	$scope.$watch(search.get, function(searchStr) { $scope.searchInput = searchStr; });

	$scope.searchHandler = function(event, searchStr) {
		if (searchStr === undefined) {
			searchStr = ''; // It gets set to undefined when an empty textbox is submitted.
		}
		search.searchFor(searchStr);
		event.preventDefault(); // so "#" doesn't wind up in the url
		document.querySelector('.search').blur();
	};
}]);
