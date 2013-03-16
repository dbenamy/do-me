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
			console.log("Reading tasks from local storage:");
			console.log(gooDooData.tasks);
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

	$scope.tasks = loadTasks(); // all tasks, done and remaining

	$scope.$watch('tasks', saveTasks, true);


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

		$scope.newTask = '';
	};


	$scope.remaining = function() {
		var arrayOfRemainingTasks = [];
		angular.forEach($scope.tasks, function(todo) {
			if (todo.done === false) {
				arrayOfRemainingTasks.push(todo);
			}
		});
		return arrayOfRemainingTasks;
	};

}








