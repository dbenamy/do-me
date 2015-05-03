angular.module('do-me').controller('MessageCtrl', function($scope, storage) {
	$scope.tasksVersion = storage.tasksVersion;
	_prevTasks = JSON.parse(JSON.stringify(storage.tasks));

	var notifyIfTaskFinished = function() {
		var newTasksById = tasksById(storage.tasks);
		angular.forEach(_prevTasks, function(oldTask) {
			var newTask = newTasksById[oldTask.id];
			if (!oldTask.done && newTask && newTask.done) {
				dhtmlx.message("Finished: " + oldTask.text);
			}
		});
		_prevTasks = JSON.parse(JSON.stringify(storage.tasks));
	};

	$scope.$watch('tasksVersion', notifyIfTaskFinished, true);

	// TODO dedupe w sync.js
	var tasksById = function(tasks) {
		var res = {};
		angular.forEach(tasks, function(task, i) {
			res[task.id] = task;
		});
		return res;
	};

});
