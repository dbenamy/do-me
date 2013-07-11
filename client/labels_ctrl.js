angular.module('goodoo').controller('LabelsCtrl', function($scope, storage) {
	$scope.tasks = storage.tasks; // watching storage.tasks directly doesn't work
	$scope.tags = storage.tags;
	$scope.searchStr = storage.searchStr;

	$scope.searchFor = function(tag) {
		$scope.searchStr.text = '#' + tag;
	};

	$scope.addTag = function() {
		console.log($scope.tags);
		$scope.tags.push({text: $scope.newTag});
		$scope.newTag = '';
	};
});
