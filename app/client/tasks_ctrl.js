angular.module('do-me').controller('TasksCtrl', function($sce, $scope, search, db, storage, tasks) {
	// This doesn't actually use the storage service but something needs to load it.
	
	$scope.getResults = search.getResults; // Import into scope so tempate get use it.

	$scope.cursor = 0; // Index of cursor position with 0 being the top task in the results. Also used on mobile to store which task being edited.
	// TODO try replacing this with a simple $scope.editTask = ''
	$scope.editing = {
		text: null, // Tags & desc of task being edited, or null if not editing.
		waiting: null
	};
	$scope.newTask = {ref: ''};
	$scope.selectedProject = {ref: ''}; // only used on mobile
	$scope.selectedContext = {ref: ''}; // only used on mobile

	$scope.$watch('newTask', function() { console.log($scope.newTask.ref); }, true);

	$scope.addTask = function() {
		var error = tasks.add({
			text: $scope.newTask.ref,
			project: $scope.selectedProject.ref,
			context: $scope.selectedContext.ref
		});
		if (error === null) {
			$scope.newTask.ref = '';
		} else {
			alert(error);
		}
	};

	$scope.editTask = function(index) {
		if (!window.doMe.mobile && $scope.editing.text !== null) {
			// Another task is already being edited.
			return;
		}
		$scope.cursor = index; // have to update cursor because a click can trigger this
		var task = _getCurrentTask();
		$scope.editing.text = task.tags.concat([task.text]).join(' ');
		if (window.doMe.mobile) {
			$scope.editing.waiting = task.waiting;
		} else if (task.waiting) {
			$scope.editing.text = "(waiting for " + task.waiting + ") " + $scope.editing.text;
		}
		// TODO wrap in "if desktop" and fix:
		// document.querySelector('input.edit' + $scope.cursor).focus();
	};

	// On desktop, this handles text, tags, and waiting. On mobile, only text
	// and tags (for now).
	$scope.updateTask = function() {
		var fields = tasks.parseTextTask($scope.editing.text);
		if ($scope.editing.waiting) {
			fields.waiting = $scope.editing.waiting;
		}
		var error = tasks.update({
			task: _getCurrentTask(),
			text: fields.text,
			tags: fields.tags,
			waiting: fields.waiting
		});
		if (error === null) {
			$scope.editing.text = null;
			$scope.editing.waiting = null;
		} else {
			alert(error);
		}
	};

	$scope.finishTask = function() {
		var error = tasks.update({
			task: _getCurrentTask(),
			done: true
		});
		if (error === null) {
			$scope.editing.text = null;
			$scope.editing.waiting = null;
		} else {
			alert(error);
		}
	};

	// Only used on mobile. Desktop wait is done by parsing the text field in updateTask.
	$scope.waitTask = function() {
		var error = tasks.update({
			task: _getCurrentTask(),
			waiting: $scope.editing.waiting || 'reply'
		});
		if (error === null) {
			$scope.editing.text = null;
			$scope.editing.waiting = null;
		} else {
			alert(error);
		}
	};

	// TODO This should maybe go away
	$scope.updatedTask = function(task) {
		// Needed to update the timestamp
		tasks.update({
			task: task
		});
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
		var phoneLinked = urlLinked.replace(PHONE_REGEX, function(number) {
			return '<a href="tel:' + number + '" ' + STOP_CLICK_PROPAGATION + '>' + number + '</a>';
		});

		return $sce.trustAsHtml(phoneLinked);
	};

	var _getCurrentTask = function() {
		return $scope.getResults()[$scope.cursor];
	};

	var _makeCursorOk = function() {
		var results = $scope.getResults();
		if ($scope.cursor < 0) {
			$scope.cursor = 0;
		} else if ($scope.cursor >= results.length && $scope.cursor > 0) {
			$scope.cursor = results.length - 1;
		}
	};
	$scope.$watch($scope.getResults, _makeCursorOk, true);
	$scope.$watch('cursor', _makeCursorOk);


	// Keyboard Shortcuts
	// They don't (all) quite belong in this controller but it's a convinient place to put them.

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
				if (!$scope.editing.text) {
					ret = func();
				}
			});
			return ret;
		});
	};

	shortcut('/', function() {
		var elem = document.querySelector('input.search');
		elem.focus();
		elem.select();
		return false; // stop the event so the character doesn't go into text box
	});

	shortcut('a, n, t', function() {
		var elem = document.querySelector('input.new-task');
		elem.focus();
		elem.select();
		return false; // stop the event so the character doesn't go into text box
	});

	shortcut('escape', function() {
		angular.forEach(document.querySelectorAll('input'), function(elem) {
			elem.blur();
		});
	});

	shortcut('j', function() {
		$scope.cursor += 1;
	});

	shortcut('k', function() {
		$scope.cursor -= 1;
	});

	shortcut('c, f', function() {
		tasks.update({task: _getCurrentTask(), done: true});
	});

	shortcut('o, enter', function() {
		$scope.editTask($scope.cursor);
	});

	
	// Old code playing with autocompleting tags:

	// jqNewTaskInput = $('#new-task-input');
	// jqNewTaskInput.on('focus', function() {
	// 	console.log(jqNewTaskInput);
	// 	// console.log(jqNewTaskInput.value);
	// 	// if (jqNewTaskInput.value === '') {
	// 		// jqNewTaskInput.value = $scope.searchStr;
	// 	console.log($scope.newTask.ref);
	// 	if ($scope.newTask.ref == '') { // TODO ===
	// 		$scope.newTask.ref = $scope.searchStr.text; // TODO parsed tags
	// 	}
	// });

	// $scope.autocompleteTaskTags = function(event) {
	// 	var allTags = [];
	// 	angular.forEach(db.tags, function(tag) {
	// 		if (tag.deleted === false) {
	// 			allTags.push(tag.text);
	// 		}
	// 	});
	// 	console.log("All tags:");
	// 	console.log(allTags);

	// 	// TODO newTask is winding up as undefined on mobile version only.
	// 	console.log($scope.newTask.ref);

	// 	// TODO new plan- only autocomplete on desktop. search for exists widget and see if i can use it or grab some code.
	// 	// $('#new-task-input').
	// 	// var newTags = $scope.parseTags($scope.newTask.ref);
	// 	// angular.forEach(newTags, function(newTag) {
	// 	// 	angular.forEach(allTags, function(availableTag))
	// 	// 	if (allTags[tag]) {
	// 	// 		console.log(tag + ' exists.');
	// 	// 	}
	// 	// });
	// };
	// $scope.$watch('newTask', $scope.autocompleteTaskTags);
});
