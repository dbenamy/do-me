angular.module('goodoo').controller('MessageCtrl', function($scope, storage) {
	$scope.tasks = storage.tasks; // watching storage.tasks directly doesn't work

	var notifyIfTaskFinished = function(newTasks, oldTasks) {
		console.log(newTasks);
		var newTasksById = tasksById(newTasks);
		angular.forEach(oldTasks, function(oldTask) {
			var newTask = newTasksById[oldTask.id];
			if (!oldTask.done && newTask && newTask.done) {
				dhtmlx.message("Finished: " + oldTask.text);
			}
		});
	};

	$scope.$watch('tasks', notifyIfTaskFinished, true);

	// TODO dedupe w sync.js
	var tasksById = function(tasks) {
		var res = {};
		$.each(tasks, function(i, task) {
			res[task.id] = task;
		});
		return res;
	};

});
