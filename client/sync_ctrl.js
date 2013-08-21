angular.module('goodoo').controller('SyncCtrl', function($scope, $timeout, storage, sync, net) {
	$scope.tasks = storage.tasks; // watching storage.tasks directly doesn't work

	$scope.downloadAsFile = net.downloadAsFile;

	$scope.syncStatus = null;  // can be 'idle', 'syncing', 'error', or 'offline'
	$scope.syncLastSuccess = null; // a Date
	$scope.prettyLastSynced = '';
	
	var syncTimer = null;
	var prettyLastSyncedTimer = null;

	var errorSyncing = function() {
		$scope.syncStatus = 'error';
		syncTimer = $timeout($scope.sync, 30000);
	};

	var offline = function() {
		$scope.syncStatus = 'offline';
		syncTimer = $timeout($scope.sync, 30000);
	};

	$scope.sync = function() {
		console.log("sync() called.");
		if ($scope.syncStatus === 'syncing') {
			return;
		}
		$timeout.cancel(syncTimer);
		$scope.syncStatus = 'syncing';
		net.downloadData(function(str) {
			sync.mergeServerData(str);
			var upload = {
				tasks: storage.tasks,
				tags: storage.tags
			};
			net.uploadData(JSON.stringify(upload), function() {
				$scope.syncStatus = 'idle';
				$scope.syncLastSuccess = new Date();
				syncTimer = $timeout($scope.sync, 30000);
			}, errorSyncing, offline);
		}, errorSyncing, offline);
	};

	$scope.$watch('tasks', $scope.sync, true);

	var updatePrettyLastSynced = function() {
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
		
		$timeout.cancel(prettyLastSyncedTimer);
		prettyLastSyncedTimer = $timeout(updatePrettyLastSynced, 10 * 1000);
	};

	$scope.$watch('syncLastSuccess', updatePrettyLastSynced);

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
