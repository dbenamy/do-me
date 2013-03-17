// Keyboard Shortcuts

// Allow keymaster to process escape while in inputs
key.filter = function(event) {
	var tagName = (event.target || event.srcElement).tagName;
	if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
		if (event.which == 27) { // esc
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
};

key('/', function() {
	$('input.search').focus();
	return false;
});

key('a, c, n', function() {
	$('input.new-task').focus();
	return false;
});

key('escape', function() {
	$('input').blur();
	return false;
});

function GooDooCtrl($scope) {
	if (!('goodoo' in localStorage)) {
		localStorage.goodoo = JSON.stringify({});
	}

	$scope.TAG_REGEX = /#[^ ]+ */g;

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
	$scope.results = $scope.tasks; // can include done and remaining tasks

	$scope.$watch('tasks', saveTasks, true);

	$scope.updateKillTaskClass = function() {
		console.log('update kill task class');
		if ($scope.done().length > 0) {
			console.log('there are done tasks');
			document.getElementById("kill-task").className = "";
		} else {
			console.log('there are no done tasks');
			document.getElementById("kill-task").className = "hide";
		}
	};

	$scope.$watch('tasks', $scope.updateKillTaskClass, true);

	$scope.addTask = function() {
		var tags = $scope.parseTags($scope.newTask);
		var text = $scope.newTask.replace($scope.TAG_REGEX, '');

		if (text !== "") {
			$scope.tasks.push({
				tags: tags,
				text: text,
				done: false
			});
		} else {
			console.log("woops, can't add empty field");
		}

		$scope.newTask = '';
	};

	$scope.parseTags = function(text) {
		var arrayOfTags = text.match($scope.TAG_REGEX) || [];
		arrayOfTags = $.map(arrayOfTags, function(tag, i) {
			return $.trim(tag);
		});
		return arrayOfTags;
	};

	$scope.search = function() {
		// At app load, it's undefined until we type something in the search box.
		if (typeof($scope.searchString) === 'undefined') {
			$scope.searchString = "";
		}

		var searchTags = $scope.parseTags($scope.searchString);
		console.log("Searching for tasks with all these tags:");
		console.log(searchTags);
		if ($scope.searchString === "") {
			$scope.results = $scope.tasks;
		} else {
			var arrayOfResults = [];
			angular.forEach($scope.tasks, function(task) {
				if (task.done === false && $scope.taskHasTags(task, searchTags)) {
					arrayOfResults.push(task);
				}
			});
			$scope.results = arrayOfResults;
		}
	};

	$scope.$watch('tasks', $scope.search, true); // if we change tasks (eg adding one), re-search to update what's shown.

	$scope.taskHasTags = function(task, tags) {
		var taskHasAllTags = true;
		angular.forEach(tags, function(tag) {
			if (task.tags.indexOf(tag) === -1) {
				taskHasAllTags = false;
			}
		});
		return taskHasAllTags;
	};

	$scope.remaining = function() {
		var arrayOfRemainingTasks = [];
		angular.forEach($scope.results, function(todo) {
			if (todo.done === false) {
				arrayOfRemainingTasks.push(todo);
			}
		});
		return arrayOfRemainingTasks;
	};
	
	$scope.done = function() {
		var arrayOfDoneTasks = [];
		angular.forEach($scope.results, function(todo) {
			if (todo.done === true) {
				arrayOfDoneTasks.push(todo);
			}
		});
		return arrayOfDoneTasks;
	};
	
	$scope.killTasks = function() {
		$scope.tasks = $scope.remaining();
	};

}






