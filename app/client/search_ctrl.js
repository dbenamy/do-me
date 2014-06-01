angular.module('do-me').controller('SearchCtrl', function($scope, search, storage) {
	$scope.searchInput = '';
	$scope.getResults = search.getResults;

	$scope.$watch(search.get, function(searchStr) { $scope.searchInput = searchStr; });

	$scope.searchHandler = function(event, searchStr) {
		$scope.searchFor(searchStr);
		event.preventDefault(); // so "#" doesn't wind up in the url
		$('input').blur();
		console.log(search.get());
	};

	$scope.searchFor = function(searchStr) {
		console.log(searchStr);
		if (searchStr === undefined) {
			searchStr = ''; // It gets set to undefined when an empty textbox is submitted.
		}
		search.searchFor(searchStr);
	};
});
