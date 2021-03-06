angular.module('do-me').controller('TagsCtrl', ['$scope', 'search', 'db', function($scope, search, db) {
	var _tags = db.tags;

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
			lastUpdated: db.utcTs()
		});
		$scope.newTag = '';
	};

	$scope.deleteTag = function(tag) {
		console.log("Deleting tag:");
		console.log(tag);
		tag.deleted = true;
		tag.lastUpdated = db.utcTs();
	};
}]);
