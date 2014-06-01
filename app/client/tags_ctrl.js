angular.module('do-me').controller('TagsCtrl', function($scope, search, storage) {
	var _tags = storage.tags;

	$scope.searchFor = search.searchFor;

	// TODO make this a scope var instead of a function so if the tags change from sync, UI redraws.
	$scope.presentTags = function() {
		return _tags.filter(function(tag) {
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
		console.log(_tags);
		// TODO if it exists and is deleted, undelete it
		_tags.push({
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

	// $scope.searchFor = function(searchStr) {
	// 	search.searchStr.text = searchStr;
	// };
});
