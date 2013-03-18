window.gd = window.gd || {};


gd.utcTs = function() {
	var now = new Date();
	return Date.UTC(
			now.getUTCFullYear(), now.getUTCMonth(),
			now.getUTCDate(), now.getUTCHours(),
			now.getUTCMinutes(), now.getUTCSeconds()
	) / 1000;
};


gd.taskNextId = 0;
gd.generateTaskId = function() {
	// The date is to avoid conflicts when using 2 clients, the random
	// number is to try to avoid conflicts if edits ARE made at the
	// same time, and the nextId counter is used to prevent conflicts
	// between tasks created right after each other on one client.
	return sprintf('%s-%s-%s', Date.now(), gd.taskNextId++, Math.round(Math.random() * 1000));
};

gd.GooDooCtrl = function($scope) {
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
					id: gd.generateTaskId(),
					tags: ['#@Computer', '#Goo-Doo'],
					text: "A task with 2 tags",
					done: false,
					updated_at: gd.utcTs()
				},
				{
					id: gd.generateTaskId(),
					tags: [],
					text: "A task with no tags",
					done: false,
					updated_at: gd.utcTs()
				}
			];
		}
	};

	$scope.tasks = loadTasks(); // all tasks, done and remaining
	$scope.results = $scope.tasks; // can include done and remaining tasks
	$scope.cursor = 0; // index of cursor position with 0 being the top task in the results

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
				id: gd.generateTaskId(),
				text: text,
				tags: tags,
				done: false,
				updated_at: gd.utcTs()
			});
		} else {
			console.log("woops, can't add empty field");
		}

		$scope.newTask = '';
	};

	$scope.updateTask = function(taskId) {
		var task = $.grep($scope.tasks, function(t) { return t.id === taskId; })[0];
		console.log('edit task text: ' + task.editText);
		var newTags = $scope.parseTags(task.editText);
		var newText = task.editText.replace($scope.TAG_REGEX, '');

		if (newText !== "") {
			console.log(newText);
			task.tags = newTags;
			task.text = newText;
			task.updated_at = gd.utcTs();
			$('#show-task-'+taskId).removeClass("hide");
			$('#edit-task-'+taskId).addClass("hide");
			console.log(task);
			console.log($scope.tasks);
		} else {
			console.log("Whoops, can't update empty field");
		}


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

		$('input').blur();
	};

	$scope.$watch('tasks', $scope.search, true); // if we change tasks (eg adding one), re-search to update what's shown.

	$scope.taskHasTags = function(task, searchTags) {
		var taskHasAllTags = true;
		angular.forEach(searchTags, function(searchTag) {
			if (task.tags.indexOf(searchTag) === -1) {
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

	$scope.editTask = function(taskId) {
		var task = $.grep($scope.tasks, function(t) { return t.id === taskId; })[0];
		// $scope.editTaskText = task.tags.join(' ') + " " + task.text;
		task.editText = task.tags.join(' ') + " " + task.text;
		$('.show-task').removeClass("hide");
		$('.edit-task').addClass("hide");
		$('#show-task-'+taskId).addClass("hide");
		$('#edit-task-'+taskId).removeClass("hide");
	};

	$scope.searchForTag = function(event, tag) {
		$scope.searchString = tag;
		$scope.search();
		event.preventDefault(); // so "#" doesn't wind up in the url
	};

	// Keyboard Shortcuts
	//
	// In theory these shouldn't be in the controller, but it's so much easier to deal with moving the cursor with them
	// here that what the hell.

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
		$('input.search').focus().select();
		return false;
	});

	key('a, c, n', function() {
		$('input.new-task').focus().select();
		return false;
	});

	key('escape', function() {
		$('input').blur();
		return false;
	});

	key('j', function() {
		$scope.$apply(function() {
			$scope.cursor += 1;
		});
	});

	key('k', function() {
		$scope.$apply(function() {
			$scope.cursor -= 1;
		});
	});

	$scope.makeCursorOk = function() {
		if ($scope.cursor < 0) {
			$scope.cursor = 0;
		} else if ($scope.cursor >= $scope.remaining().length && $scope.cursor > 0) {
			$scope.cursor = $scope.remaining().length - 1;
		}
	};
	$scope.$watch('results', $scope.makeCursorOk, true);
	$scope.$watch('cursor', $scope.makeCursorOk);
};
