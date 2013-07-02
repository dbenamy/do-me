angular.module('goodoo').service('storage', function($rootScope, $timeout) {
	// Variables:
	$rootScope.tasks = [];
	$rootScope.searchStr = {text: ''};

	if (!('goodoo' in localStorage)) {
		localStorage.goodoo = JSON.stringify({});
	}

	var saveTasks = function() {
		console.log("Saving tasks:");
		console.log($rootScope.tasks);
		var gooDooData = JSON.parse(localStorage.goodoo);
		gooDooData.tasks = $rootScope.tasks;
		localStorage.goodoo = JSON.stringify(gooDooData);
	};

	var loadTasks = function() {
		var gooDooData = JSON.parse(localStorage.goodoo);
		if (gooDooData.tasks) {
			console.log("Reading tasks from local storage:");
			console.log(gooDooData.tasks);
			return gooDooData.tasks;
		} else {
			return [];
		}
	};

	// Tasks variable is in this service and not the GooDoo controller so the sync module can also access it.
	$rootScope.tasks = loadTasks(); // all tasks, done and remaining

	$rootScope.$watch('tasks', saveTasks, true);

	$rootScope.$watch('searchStr', function() {
		console.log($rootScope.searchStr);
	});

	var backup = function() {
		console.log("Backing up Goo Doo data.");
		localStorage['goodoo-backup-' + (new Date())] = localStorage.goodoo;
		$timeout(backup, 1000 * 60 * 10); // 10 mins
		console.log("Back up done.");
	};
	backup();

	// Stuff exposed by the service:
	return {
		tasks: $rootScope.tasks,
		searchStr: $rootScope.searchStr
	};
});
