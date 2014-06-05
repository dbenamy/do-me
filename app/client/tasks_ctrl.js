angular.module('do-me').controller('TasksCtrl', function($scope, search, storage, tasks) {
	$scope.getResults = search.getResults; // Import into scope so tempate get use it.
	$scope.linkify = tasks.linkify;

	$scope.cursor = 0; // Index of cursor position with 0 being the top task in the results. Used on mobile to store which task being edited.
	// TODO try replacing this with a simple $scope.editTask = ''
	$scope.editing = {
		text: null // Tags & desc of task being edited, or null if not editing.
	};
	$scope.newTask = '';
	$scope.selectedProject = {ref: ''}; // only used on mobile
	$scope.selectedContext = {ref: ''}; // only used on mobile

	$scope.addTask = function() {
		var error = tasks.add({
			text: $scope.newTask,
			project: $scope.selectedProject.ref,
			context: $scope.selectedContext.ref
		});
		if (error === null) {
			$scope.newTask = '';
		} else {
			alert(error);
		}
	};

	$scope.editTask = function(index) {
		if ($scope.editing.text !== null) { // TODO && desktop
			return;
		}
		$scope.cursor = index; // have to overwrite cursor because a click can trigger this
		var task = _getCurrentTask();
		$scope.editing.text = task.tags.concat([task.text]).join(' ');
		// TODO wrap in "if desktop":
		document.querySelector('input.edit' + $scope.cursor).focus();
	};

	$scope.updateTask = function() {
		var error = tasks.update({
			task: _getCurrentTask(),
			text: $scope.editing.text
		});
		if (error === null) {
			$scope.editing.text = null;
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
		} else {
			alert(error);
		}
	};

	$scope.updatedTask = function(task) {
		// Needed to update the timestamp
		tasks.update({
			task: task
		});
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
		var task = _getCurrentTask();
		task.done = true;
		task.updated_at = storage.utcTs();
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
