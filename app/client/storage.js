angular.module('do-me').service('storage', function($rootScope, $timeout) {
	// Variables:
	// $rootScope.tasks = []; // this gets created by load()
	// $rootScope.tags = []; // this gets created by load()
	// var _searchStr = {text: ''}; // it's an obj because sharing refs to a string doesn't work
	// var _selectedTask = null;
	// var _searchResults = [];

	var handleStorageErrors = function(func) {
		try {
			func();
		} catch (error) {
			console.log("Exception while writing to localStorage.");
			console.log(error);
			if (error.name === 'QuotaExceededError') {
				alert("Whoops, Do Me ran out of space and any changes weren't saved! Please email daniel@benamy.info and let me know so I can fix this.");
			} else {
				alert("Whoops, Do Me broke! Please email daniel@benamy.info and let me know so I can fix this.");
				throw(error);
			}
		}
	};

	var save = function() {
		var appData = JSON.parse(localStorage.goodoo || '{}');
		appData.tasks = $rootScope.tasks;
		appData.tags = $rootScope.tags;
		console.log("Saving:");
		console.log(appData);
		handleStorageErrors(function() {
			localStorage.goodoo = JSON.stringify(appData);
		});
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
		var appData = JSON.parse(localStorage.goodoo || '{}');
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
		console.log("Loaded:");
		console.log(appData);
		$rootScope.tasks = appData.tasks; // all tasks, done and remaining
		$rootScope.tags = appData.tags;
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
		handleStorageErrors(function() {
			var obj = JSON.parse(localStorage.goodoo);
			backupjs.backup(obj); // pass in an obj because backup.js stringifies it
		});

		var oldBackupPrefix = 'goodoo-backup-';
		angular.forEach(Object.keys(localStorage), function(key) {
			if (key.indexOf(oldBackupPrefix) === 0) {
				var dateStr = key.slice(oldBackupPrefix.length);
				var dateMs = Date.parse(dateStr);
				console.log("Found old backup with date " + (new Date(dateMs)));
				// When I'm confident that backup.js is working right, uncomment this:
				// localStorage.setItem('backupjs-' + dateMs, localStorage.getItem(key));
				// localStorage.removeItem(key);
				// console.log("Migrated " + key + " to backup.js");
			}
		});

		$timeout(backup, 1000 * 60 * 10); // 10 mins
		console.log("Back up done.");
	};
	backup();

	// Stuff exposed by the service:
	return {
		tasks: $rootScope.tasks,
		// selectedTask: _selectedTask,
		tags: $rootScope.tags,
		// searchStr: _searchStr,
		// searchResults: _searchResults,
		utcTs: utcTs,
		generateId: generateId,
		normalizeTags: normalizeTags
	};
});
