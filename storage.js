angular.module('storage', []).factory('storage', function () {
	if (!('goodoo' in localStorage)) {
		localStorage.goodoo = JSON.stringify({});
	}

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
			return [];
		}
	};

	// Functions exposed by the service:
	return {
		saveTasks: saveTasks,
		loadTasks: loadTasks
	};
});
