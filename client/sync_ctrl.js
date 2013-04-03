angular.module('goodoo').controller('SyncCtrl', function($scope, sync) {
	$scope.sync = sync.sync; // sync function
	$scope.syncStatus = sync.status;
	$scope.downloadAsFile = sync.downloadAsFile;
});
