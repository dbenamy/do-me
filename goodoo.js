function GooDooCtrl($scope) {
	if (!('goodoo' in localStorage)) {
		localStorage.goodoo = JSON.stringify({});
	}

	saveTasks = function(tasks) {
		var gooDooData = JSON.parse(localStorage.goodoo);
		gooDooData.tasks = tasks;
		localStorage.goodoo = JSON.stringify(gooDooData);
	};

	loadTasks = function() {
		var gooDooData = JSON.parse(localStorage.goodoo);
		if (gooDooData.tasks) {
			console.log("reading tasks from local storage");
			return gooDooData.tasks;
		} else {
			console.log("loading default dummy tasks");
			return [
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
		}
	};

	$scope.tasks = loadTasks();

	$scope.addTask = function() {
		var tagRegex = /#[^ ]+ +/g;
		var tags = $scope.newTask.match(tagRegex) || [];
		tags = $.map(tags, function(tag, i) {
			return $.trim(tag);
		});
		var text = $scope.newTask.replace(tagRegex, '');

		$scope.tasks.push({
			tags: tags,
			text: text,
			done: false
		});
		console.log("should writo to local storage: " + JSON.stringify($scope.tasks));
		saveTasks($scope.tasks);

		$scope.newTask = '';
	};
}
