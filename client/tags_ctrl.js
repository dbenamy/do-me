angular.module('goodoo').controller('TagsCtrl', function($scope, storage) {
	$scope.tasks = storage.tasks; // watching storage.tasks directly doesn't work
	$scope.tags = storage.tags;
	$scope.searchStr = storage.searchStr;

	$scope.searchFor = function(tagStr) {
		if (tagStr.length > 0) {
			tagStr = '#' + tagStr;
		}
		$scope.searchStr.text = tagStr;
	};

	$scope.presentTags = function() {
		var present = [];
		angular.forEach($scope.tags, function(tag) {
			if (!tag.deleted) {
				present.push(tag);
			}
		});
		return present;
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
