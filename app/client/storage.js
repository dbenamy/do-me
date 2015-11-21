angular.module('do-me').service('storage', ['$rootScope', '$interval', '$localForage', 'db', 'sync', function($rootScope, $interval, $localForage, db, sync) {
	var _didFirstLoad = false;

	var _handleStorageErrors = function(error) {
		console.log("Exception while accessing storage.");
		console.log(error);
		alert("Whoops, Do Me broke! Please email daniel@benamy.info and let me know so I can fix this.");
		throw(error);
	};

	var _save = function() {
		console.log("storage._save: Called.");
		if (!_didFirstLoad) {
			console.log("storage._save: Not saving (locally) because we haven't finished loading yet.");
			// TODO add check that if this happens more than 10s from load, explode
			return;
		}
		console.log("storage._save: Saving.");
		$localForage.getItem('do-me').then(function(loadedData) {
			console.log("storage._save: Merging existing data and saving:");
			// Don't clobber any other attributes from loadedData for forwards compatibility.
			var newData = loadedData || {};
			newData.tasks = db.tasks;
			newData.tags = db.tags;
			console.log(newData);
			return $localForage.setItem('do-me', newData);
		}).then(function() {
			console.log("storage._save: Removing old data from localStorage.");
			localStorage.removeItem('goodoo');
		}).catch(_handleStorageErrors);
	};

	$rootScope.$watch(function() { return db.tasksVersion.ref; }, _save);
	$rootScope.$watch(function() { return db.tags; }, _save, true);

	var _load = function() {
		console.log("storage._load: Called.");
		var loadedData = {};

		// Temporarily load from local storage too until I migrate to local forage.
		var lsLoadedData = JSON.parse(localStorage.goodoo || '{}');
		angular.extend(loadedData, lsLoadedData);

		$localForage.getItem('do-me').then(function(lfLoadedData) {
			console.log("storage.load: got load callback");
			angular.extend(loadedData, lfLoadedData || {});
			// Update existing array objects since other code already has refs
			// to it before this promise runs.
			// $rootScope.tasks.push.apply($rootScope.tasks, data.tasks); // all tasks, done and remaining
			// $rootScope.tasksVersion.ref++;
			// $rootScope.tags.push.apply($rootScope.tags, data.tags);
			sync.mergeInData(loadedData);
			_didFirstLoad = true;
		}).catch(_handleStorageErrors);
	};
	_load();

	var _backup = function() {
		console.log("Backing up Do Me data with backup.js.");
		backupjs.backup({tasks: db.tasks, tags: db.tags}).then(function() {
			console.log("Back up done.");
		}).catch(_handleStorageErrors);
	};
	_backup(); // TODO do first run after data is loaded
	$interval(_backup, 1000 * 60 * 10); // 10 mins
}]);
