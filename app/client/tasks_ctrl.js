angular.module('do-me').controller('TasksCtrl', function($scope, storage) {
	var TAG_REGEX = /(^|\s)[#@][^ ]+/g; // TODO DRY- move to common service or something

	$scope.tasks = storage.tasks;
	$scope.taskNextId = 0;
	$scope.cursor = 0; // index of cursor position with 0 being the top task in the results
	$scope.editing = false; // true if the task pointed to by the cursor is being edited
	$scope.editTaskText = {}; // key: cursor position, val: what's in the edit box. shit doesn't work right using the same variable for all edit inputs
	$scope.newTask = ''; // backs new task input
	$scope.selectedProject = ''; // only used on mobile
	$scope.selectedContext = ''; // only used on mobile

	$scope.addTask = function() {
		var tags = $scope.parseTags($scope.newTask);
		if ($scope.selectedProject.length > 0) {
			tags.push($scope.selectedProject);
		}
		if ($scope.selectedContext.length > 0) {
			tags.push($scope.selectedContext);
		}
		var text = $scope.newTask.replace(TAG_REGEX, '').trim();
		console.log("New text is: " + text);

		if (text !== "") {
			$scope.tasks.push({
				id: storage.generateId(),
				text: text,
				tags: tags,
				done: false,
				updated_at: storage.utcTs()
			});
			if (window.do_me.mobile === true) {
				history.back();
			}
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
		console.log($scope.editTaskText[$scope.cursor]);
		$('input.edit' + $scope.cursor).focus();
	};

	$scope.updateTask = function() {
		updatedTaskDesc = $scope.editTaskText[$scope.cursor];
		console.log("Updating task using: " + updatedTaskDesc);
		var task = $scope.getCurrentTask();
		var newTags = $scope.parseTags(updatedTaskDesc);
		var newText = updatedTaskDesc.replace(TAG_REGEX, '').trim();

		if (newText !== "") {
			console.log(newText);
			task.tags = newTags;
			task.text = newText;
			task.updated_at = storage.utcTs();
			$scope.editing = false;
			// console.log($scope.tasks);
			if (window.do_me.mobile === true) {
				history.back();
			}
		} else {
			console.log("Whoops, can't update empty field");
		}
	};

	$scope.finishTask = function() {
		var task = $scope.getCurrentTask();
		task.done = true;
		task.updated_at = storage.utcTs();
		if (window.do_me.mobile === true) {
			history.back();
		}
	};

	$scope.parseTags = function(text) {
		var arrayOfTags = text.match(TAG_REGEX) || [];
		console.log(arrayOfTags);
		arrayOfTags = arrayOfTags.map(function(tag, i) {
			return tag.trim();
		});
		console.log(arrayOfTags);
		return arrayOfTags;
	};

	$scope.updatedTask = function(task) {
		task.updated_at = storage.utcTs();
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
		} else if ($scope.cursor >= $scope.results.length && $scope.cursor > 0) {
			$scope.cursor = $scope.results.length - 1;
		}
	};
	$scope.$watch('results', $scope.makeCursorOk, true);
	$scope.$watch('cursor', $scope.makeCursorOk);

	// Returns task that cursor points to
	$scope.getCurrentTask = function() {
		return $scope.results[$scope.cursor];
	};

	$scope.logTasks = function() {
		console.log('$scope tasks:');
		console.log($scope.tasks);
	};

	// jqNewTaskInput = $('#new-task-input');
	// jqNewTaskInput.on('focus', function() {
	// 	console.log(jqNewTaskInput);
	// 	// console.log(jqNewTaskInput.value);
	// 	// if (jqNewTaskInput.value === '') {
	// 		// jqNewTaskInput.value = $scope.searchStr;
	// 	console.log($scope.newTask);
	// 	if ($scope.newTask == '') { // TODO ===
	// 		$scope.newTask = $scope.searchStr.text; // TODO parsed tags
	// 	}
	// });

	// $scope.autocompleteTaskTags = function(event) {
	// 	var allTags = [];
	// 	angular.forEach(storage.tags, function(tag) {
	// 		if (tag.deleted === false) {
	// 			allTags.push(tag.text);
	// 		}
	// 	});
	// 	console.log("All tags:");
	// 	console.log(allTags);

	// 	// TODO newTask is winding up as undefined on mobile version only.
	// 	console.log($scope.newTask);

	// 	// TODO new plan- only autocomplete on desktop. search for exists widget and see if i can use it or grab some code.
	// 	// $('#new-task-input').
	// 	// var newTags = $scope.parseTags($scope.newTask);
	// 	// angular.forEach(newTags, function(newTag) {
	// 	// 	angular.forEach(allTags, function(availableTag))
	// 	// 	if (allTags[tag]) {
	// 	// 		console.log(tag + ' exists.');
	// 	// 	}
	// 	// });
	// };
	// $scope.$watch('newTask', $scope.autocompleteTaskTags);
});
