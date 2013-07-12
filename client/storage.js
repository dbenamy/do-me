angular.module('goodoo').service('storage', function($rootScope, $timeout) {
	// Variables:
	// $rootScope.tasks = []; // this gets created by load()
	// $rootScope.tags = []; // this gets created by load()
	$rootScope.searchStr = {text: ''}; // it's an obj because sharing refs to a string doesn't work

	var save = function() {
		var gooDooData = JSON.parse(localStorage.goodoo || '{}');
		gooDooData.tasks = $rootScope.tasks;
		gooDooData.tags = $rootScope.tags;
		console.log("Saving:");
		console.log(gooDooData);
		localStorage.goodoo = JSON.stringify(gooDooData);
	};

	$rootScope.$watch('tasks', save, true);
	$rootScope.$watch('tags', save, true);

	var utcTs = function() {
		var now = new Date();
		return Date.UTC(
				now.getUTCFullYear(), now.getUTCMonth(),
				now.getUTCDate(), now.getUTCHours(),
				now.getUTCMinutes(), now.getUTCSeconds()
		) / 1000;
	};

	var load = function() {
		var gooDooData = JSON.parse(localStorage.goodoo || '{}');
		if (!gooDooData.tasks) {
			gooDooData.tasks = [
				{
					id: 'sample-1',
					tags: ['#@Computer', '#GooDoo'],
					text: "A task with 2 tags",
					done: false,
					updated_at: utcTs()
				},
				{
					id: 'sample-2',
					tags: [],
					text: "A task with no tags",
					done: false,
					updated_at: utcTs()
				}
			];
		}
		if (!gooDooData.tags) {
			gooDooData.tags = [
				{text: '@Phone'},
				{text: 'GooDoo'},
				{text: '@Computer'}
			];
		}
		console.log("Loaded:");
		console.log(gooDooData);
		$rootScope.tasks = gooDooData.tasks; // all tasks, done and remaining
		$rootScope.tags = gooDooData.tags;
	};

	load();

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
		tags: $rootScope.tags,
		searchStr: $rootScope.searchStr,
		utcTs: utcTs
	};
});
