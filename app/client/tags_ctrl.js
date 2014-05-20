angular.module('do-me').controller('TagsCtrl', function($scope, storage) {
	$scope.tasks = storage.tasks; // watching storage.tasks directly doesn't work
	$scope.tags = storage.tags;
	$scope.searchStr = storage.searchStr;

	$scope.searchFor = function(tagStr) {
		$scope.searchStr.text = tagStr;
	};

	$scope.presentTags = function() {
		return $scope.tags.filter(function(tag) {
			return !tag.deleted;
		});
	};

	$scope.contexts = function() {
		return $scope.presentTags().filter(function(tag) {
			return tag.text[0] === '@';
		});
	};

	$scope.projects = function() {
		return $scope.presentTags().filter(function(tag) {
			return tag.text[0] === '#';
		});
	};

	$scope.addTag = function() {
		console.log($scope.tags);
		// TODO if it exists and is deleted, undelete it
		$scope.tags.push({
			text: $scope.newTag,
			deleted: false,
			lastUpdated: storage.utcTs()
		});
		$scope.newTag = '';
	};

	$scope.deleteTag = function(tag) {
		console.log("Deleting tag:");
		console.log(tag);
		tag.deleted = true;
		tag.lastUpdated = storage.utcTs();
	};
});
