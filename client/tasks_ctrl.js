angular.module('goodoo').controller('TasksCtrl', function($scope, storage) {
	$scope.utcTs = function() {
		var now = new Date();
		return Date.UTC(
				now.getUTCFullYear(), now.getUTCMonth(),
				now.getUTCDate(), now.getUTCHours(),
				now.getUTCMinutes(), now.getUTCSeconds()
		) / 1000;
	};

	$scope.TAG_REGEX = /(^|\s)#[^ ]+ */g;
	$scope.SAMPLE_TASKS = [
		{
			id: 'sample-1',
			tags: ['#@Computer', '#GooDoo'],
			text: "A task with 2 tags",
			done: false,
			updated_at: $scope.utcTs()
		},
		{
			id: 'sample-2',
			tags: [],
			text: "A task with no tags",
			done: false,
			updated_at: $scope.utcTs()
		}
	];

	// Data / models that have to do with this controller
	$scope.tasks = storage.tasks;
	$scope.results = $scope.tasks; // results of search. includes done and remaining tasks.
	$scope.taskNextId = 0;
	$scope.cursor = 0; // index of cursor position with 0 being the top task in the results
	$scope.editing = false; // true if the task pointed to by the cursor is being edited
	$scope.editTaskText = {}; // key: cursor position, val: what's in the edit box. shit doesn't work right using the same variable for all edit inputs

	var generateTaskId = function() {
		// The timestamp is the basis of the unique id. The nextId counter is in case the clock shifts for daylight
		// savings, a time correction, etc. The random number is added just in case somehow tasks are created at the
		// same time, with the same nextId, on two different clients.
		return sprintf('%s-%s-%s', Date.now(), $scope.taskNextId++, Math.round(Math.random() * 1000));
	};

	$scope.addTask = function() {
		var tags = $scope.parseTags($scope.newTask);
		var text = $.trim($scope.newTask.replace($scope.TAG_REGEX, ''));
		console.log("New text is: " + text);

		if (text !== "") {
			$scope.tasks.push({
				id: generateTaskId(),
				text: text,
				tags: tags,
				done: false,
				updated_at: $scope.utcTs()
			});
		} else {
			alert("Whoops, can't add an empty task.");
		}

		$scope.newTask = '';
	};

	$scope.editTask = function(index) {
		$scope.cursor = index; // have to overwrite cursor because a click can trigger this
		$scope.editing = true;
		var task = $scope.getCurrentTask();
		$scope.editTaskText[$scope.cursor] = task.tags.concat([task.text]).join(' ');
		$('input.edit' + $scope.cursor).focus();
	};

	$scope.updateTask = function() {
		updatedTaskDesc = $scope.editTaskText[$scope.cursor];
		console.log("Updating task using: " + updatedTaskDesc);
		var task = $scope.getCurrentTask();
		var newTags = $scope.parseTags(updatedTaskDesc);
		var newText = $.trim(updatedTaskDesc.replace($scope.TAG_REGEX, ''));

		if (newText !== "") {
			console.log(newText);
			task.tags = newTags;
			task.text = newText;
			task.updated_at = $scope.utcTs();
			$scope.editing = false;
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

	$scope.updatedTask = function(task) {
		task.updated_at = $scope.utcTs();
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

	$scope.searchForTag = function(event, tag) {
		$scope.searchString = tag;
		$scope.search();
		event.preventDefault(); // so "#" doesn't wind up in the url
	};

	$scope.linkify = function(text) {
		var STOP_CLICK_PROPAGATION = 'onclick="var event = arguments[0] || window.event; event.stopPropagation();"';

		var URL_REGEX = /(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?/gi;
		var urlLinked = text.replace(URL_REGEX, function(url, protocol, host, port, path, filename, ext, query, fragment) {
			var urlWithProtocol = url;
			if (typeof(protocol) === 'undefined') {
				urlWithProtocol = 'http://' + url;
			}
			return '<a href="' + urlWithProtocol + '" ' + STOP_CLICK_PROPAGATION + '>' + url + '</a>';
		});

		var PHONE_REGEX = /(1[ -.])?\(?[0-9]{3}\)?[ -.]?[0-9]{3}[ -.]?[0-9]{4}/gi;
		return urlLinked.replace(PHONE_REGEX, function(number) {
			return '<a href="tel:' + number + '" ' + STOP_CLICK_PROPAGATION + '>' + number + '</a>';
		});
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

	var shortcut = function(keys, func) {
		key(keys, function() {
			var ret;
			$scope.$apply(function() {
				if (!$scope.editing) {
					ret = func();
				}
			});
			return ret;
		});
	};

	shortcut('/', function() {
		$('input.search').focus().select();
		return false; // stop the event so the character doesn't go into text box
	});

	shortcut('a, n, t', function() {
		$('input.new-task').focus().select();
		return false; // stop the event so the character doesn't go into text box
	});

	shortcut('escape', function() {
		$('input').blur();
	});

	shortcut('j', function() {
		$scope.cursor += 1;
	});

	shortcut('k', function() {
		$scope.cursor -= 1;
	});

	shortcut('c, f', function() {
		var task = $scope.getCurrentTask();
		task.done = true;
		$scope.updatedTask(task);
	});

	shortcut('o, enter', function() {
		$scope.editTask($scope.cursor);
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

	// Returns task that cursor points to
	$scope.getCurrentTask = function() {
		return $scope.remaining()[$scope.cursor];
	};

	$scope.logTasks = function() {
		console.log('$scope tasks:');
		console.log($scope.tasks);
	};
});

// TODO move to controller
function showShortcuts() {
	var overlay = document.getElementById('overlay');
	var shortcuts = document.getElementById('shortcuts');
	overlay.style.opacity = 0.8;
	if(overlay.style.display == "block"){
		overlay.style.display = "none";
		shortcuts.style.display = "none";
	} else {
		overlay.style.display = "block";
		shortcuts.style.display = "block";
	}
}
