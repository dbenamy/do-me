angular.module('do-me').controller('DesktopTaskListCtrl', function($scope, search, storage, tasks) {
	$scope.getResults = search.getResults; // Import into scope so tempate get use it.
	$scope.linkify = tasks.linkify;

	$scope.cursor = 0; // Index of cursor position with 0 being the top task in the results.
	$scope.editing = {
		text: null // Tags & desc of task being edited (for desktop), or null if not editing.
	};
	$scope.newTask = '';

	$scope.addTask = function() {
		var error = tasks.add({
			text: $scope.newTask
		});
		if (error === null) {
			$scope.newTask = '';
		} else {
			alert(error);
		}
	};

	$scope.editTask = function(index) {
		if ($scope.editing.text !== null) {
			return;
		}
		$scope.cursor = index; // have to overwrite cursor because a click can trigger this
		var task = _getCurrentTask();
		$scope.editing.text = task.tags.concat([task.text]).join(' ');
		$('input.edit' + $scope.cursor).focus();
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
		var task = _getCurrentTask();
		task.done = true;
		task.updated_at = storage.utcTs();
	});

	shortcut('o, enter', function() {
		$scope.editTask($scope.cursor);
	});
});
