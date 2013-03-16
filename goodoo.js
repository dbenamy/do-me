function GooDooCtrl($scope) {
	$scope.tasks = [
		{
			tags: ['#@Computer', '#Goo-Doo'],
			text: "A task with 2 tags",
			done: false
		},
		{
			tags: [],
			text: "A task with no tags",
			done: false
		}
	];

	$scope.addTask = function() {
		var tagRegex = /#[^ ]+ +/g;
		var tags = $scope.newTask.match(tagRegex);
		tags = $.map(tags, function(tag, i) {
			return $.trim(tag);
		});
		var text = $scope.newTask.replace(tagRegex, '');

		$scope.tasks.push({
			tags: tags,
			text: text,
			done:false
		});
		$scope.newTask = '';
	};
}
