angular.module('do-me').controller('SyncCtrl', function($scope, $interval, db, sync, net) {
	$scope.downloadAsFile = net.downloadAsFile;

	$scope.syncStatus = null;  // can be 'idle', 'syncing', 'error', or 'offline'
	$scope.syncLastSuccess = null; // a Date
	$scope.prettyLastSynced = '';
	
	var syncPromise = null;
	var lastSyncedPromise = null;

	var errorSyncing = function() {
		$scope.syncStatus = 'error';
	};

	var offline = function() {
		$scope.syncStatus = 'offline';
	};

	var doSync = function() {
		console.log("SyncCtrl.sync: Called.");
		if ($scope.syncStatus === 'syncing') {
			return;
		}
		$scope.syncStatus = 'syncing';
		net.downloadData(function(str) {
			sync.mergeInJson(str);
			var upload = {
				tasks: db.tasks,
				tags: db.tags
			};
			net.uploadData(JSON.stringify(upload), function() {
				$scope.syncStatus = 'idle';
				$scope.syncLastSuccess = new Date();
			}, errorSyncing, offline);
		}, errorSyncing, offline);
	};

	$scope.syncNow = function() {
		$interval.cancel(syncPromise);
		syncPromise = $interval(doSync, 30 * 1000);
		doSync();
	};

	$scope.$watch(function() { return db.tasksVersion.ref; }, $scope.syncNow);

	var updateLastSynced = function() {
		if ($scope.syncStatus === 'error') {
			$scope.prettyLastSynced = "Error!";
		} else if ($scope.syncStatus === 'offline') {
			$scope.prettyLastSynced = "Offline.";
		} else {
			$scope.prettyLastSynced = "";
		}

		if ($scope.syncLastSuccess !== null) {
			$scope.prettyLastSynced += " Last synced: " + humanized_time_span($scope.syncLastSuccess, new Date(), _timeFormats);
		}
	};

	var updateLastSyncedNow = function() {
		$interval.cancel(lastSyncedPromise);
		lastSyncedPromise = $interval(updateLastSynced, 10 * 1000);
		updateLastSynced();
	};

	$scope.$watch('syncLastSuccess', updateLastSyncedNow);

	$scope.logTasks = function() {
		console.log('tasks:');
		console.log(db.tasks);
	};

	var _timeFormats = {
		past: [
			{ ceiling: 10, text: "just now" },
			{ ceiling: 60, text: "less than a minute ago" },
			{ ceiling: 60 + 59, text: "1 minute ago" },
			{ ceiling: 60 * 59, text: "$minutes minutes ago" },
			{ ceiling: null, text: "$hours hours, $minutes minutes ago" }
		],
		future: [
			{ ceiling: null, text: "ERROR: $hours:$minutes:$seconds" }
		]
	};
});
