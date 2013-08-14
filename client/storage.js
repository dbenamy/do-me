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

	var nextId = 0;
	var generateId = function() {
		// The timestamp is the basis of the unique id. The nextId counter is in case the clock shifts for daylight
		// savings, a time correction, etc. The random number is added just in case somehow tasks are created at the
		// same time, with the same nextId, on two different clients.
		return sprintf('%s-%s-%s', Date.now(), nextId++, Math.round(Math.random() * 1000));
	};

	var load = function() {
		var gooDooData = JSON.parse(localStorage.goodoo || '{}');
		if (!gooDooData.tasks) {
			gooDooData.tasks = [
				{
					id: 'sample-1',
					tags: ['#@Computer', '#BuyInsurance'],
					text: "Get quotes on http://www.ehealthinsurance.com",
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
			gooDooData.tags = [ // missing attributes will get added in normalizeTags
				{text: '@Phone'},
				{text: '@Computer'},
				{text: 'UnpackBoxes'},
				{text: 'BuyInsurance'}
			];
		}
		normalizeTags(gooDooData.tags);
		console.log("Loaded:");
		console.log(gooDooData);
		$rootScope.tasks = gooDooData.tasks; // all tasks, done and remaining
		$rootScope.tags = gooDooData.tags;
	};

	var normalizeTags = function(tags) {
		angular.forEach(tags, function(tag) {
			if (!('id' in tag)) { // TODO i think there's something safer than not in
				tag.id = generateId();
			}
			if (!('deleted' in tag)) {
				tag.deleted = false;
			}
			if (!('lastUpdated' in tag)) {
				tag.lastUpdated = utcTs();
			}
		});
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
		utcTs: utcTs,
		generateId: generateId,
		normalizeTags: normalizeTags
	};
});
