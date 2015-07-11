angular.module('do-me').controller('MessageCtrl', function($scope, db) {
	$scope.tasksVersion = db.tasksVersion;
	_prevTasks = JSON.parse(JSON.stringify(db.tasks));

	var notifyIfTaskFinished = function() {
		var newTasksById = tasksById(db.tasks);
		angular.forEach(_prevTasks, function(oldTask) {
			var newTask = newTasksById[oldTask.id];
			if (!oldTask.done && newTask && newTask.done) {
				dhtmlx.message("Finished: " + oldTask.text);
			}
		});
		_prevTasks = JSON.parse(JSON.stringify(db.tasks));
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
