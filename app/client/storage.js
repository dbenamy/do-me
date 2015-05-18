angular.module('do-me').service('storage', function($rootScope, $timeout, $localForage) {
	// Variables: TODO make them function variables instead of rootScope
	$rootScope.tasks = [];
	$rootScope.tags = [];
	$rootScope.tasksVersion = {ref: 0}; // used for cheap watching of task changes. has to be an object so users can copy reference and watch it.

	var handleStorageErrors = function(error) {
		console.log("Exception while accessing storage.");
		console.log(error);
		alert("Whoops, Do Me broke! Please email daniel@benamy.info and let me know so I can fix this.");
		throw(error);
	};

	var save = function() {
		console.log("Saving.");
		$localForage.getItem('do-me').then(function(existingData) {
			console.log("Merging existing data and saving:");
			var data = existingData || {};
			data.tasks = $rootScope.tasks;
			data.tags = $rootScope.tags;
			console.log(data);
			return $localForage.setItem('do-me', data);
		}).then(function() {
			console.log("Removing old data from localStorage.");
			localStorage.removeItem('goodoo');
		}).catch(handleStorageErrors);
	};

	$rootScope.$watch('tasksVersion', save, true);
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
		var data = {};

		// Temporarily load from local storage too until I migrate to local forage.
		var loadedData = JSON.parse(localStorage.goodoo || '{}');
		angular.extend(data, loadedData);

		$localForage.getItem('do-me').then(function(loadedData) {
			angular.extend(data, loadedData || {});
			migrateDb(data);
			// Update existing array objects since other code already has refs
			// to it before this promise runs.
			$rootScope.tasks.push.apply($rootScope.tasks, data.tasks); // all tasks, done and remaining
			$rootScope.tasksVersion.ref++;
			$rootScope.tags.push.apply($rootScope.tags, data.tags);
		}).catch(handleStorageErrors);
	};

	var migrateDb = function(appData) {
		if (!appData.tasks) {
			appData.tasks = [
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
		if (!appData.tags) {
			appData.tags = [ // missing attributes will get added in normalizeTags
				{text: '@Phone'},
				{text: '@Computer'},
				{text: 'UnpackBoxes'},
				{text: 'BuyInsurance'}
			];
		}
		normalizeTags(appData.tags);
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
			if (!('text' in tag)) {
				tag.text = 'Corrupted tag';
			}
			// Convert tags without leading '#' or '@'
			if (tag.text[0] !== '#' && tag.text[0] !== '@') {
				tag.text = '#' + tag.text;
			}
		});
	};

	load();

	var backup = function() {
		console.log("Backing up Do Me data with backup.js.");
		backupjs.backup({tasks: $rootScope.tasks, tags: $rootScope.tags}).then(function() {
			console.log("Back up done.");
		}).catch(handleStorageErrors);
		$timeout(backup, 1000 * 60 * 10); // 10 mins
	};
	backup();

	// Stuff exposed by the service:
	return {
		tasks: $rootScope.tasks,
		tasksVersion: $rootScope.tasksVersion,
		tags: $rootScope.tags,
		utcTs: utcTs,
		generateId: generateId,
		normalizeTags: normalizeTags
	};
});
