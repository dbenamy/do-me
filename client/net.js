angular.module('goodoo').service('net', function($http) {
	var HTTP_TIMEOUT_MS	= 5 * 1000;

	var lastSavedVersion = null;

	// This doesn't belong here but I don't know how to put it in index.html and make it run.
	// console.log = function(data) {
	// 	if (typeof data === 'string') {
	// 		$http.post('/api/log', data);
	// 	} else {
	// 		$http.post('/api/log', angular.toJson(data, true));
	// 	}
	// };

	downloadData = function(success, error, offline) {
		// console.log("Downloading.");
		var req = $http.get('/api/storage', {timeout: HTTP_TIMEOUT_MS});
		req.success(function(data, status, headers, config) {
			if (data.status === 'NEED_LOGIN') {
				window.location = data.url;
				return;
			} else if (data.status !== 'OK') {
				alert('Error loading from server: ' + data.status);
				return;
			}
			// console.log("Downloaded: " + angular.toJson(data));
			// console.log("Downloaded status: " + data.status);
			// console.log("Downloaded version: " + data.version);
			// console.log("Downloaded text: " + angular.toJson(angular.fromJson(data.text), true));
			lastSavedVersion = data.version;
			success(data.text);
		});
		req.error(function(data, status, headers, config) {
			console.log("Error downloading data from server. We might be offline. Details:");
			console.log(data);
			console.log(status);
			console.log(headers);
			console.log(config);
			if (status === 0) {
				offline();
			} else {
				error();
			}
		});
	};

	uploadData = function(str, success, error, offline) {
		// console.log('Uploading text: ' + angular.toJson(angular.fromJson(str), true));
		// console.log('Uploading lastSavedVersion: ' + lastSavedVersion);
		var args = {
			text: str,
			lastSavedVersion: lastSavedVersion
		};
		// console.log('Uploading: ' + angular.toJson(args));
		var req = $http.post('/api/storage', angular.toJson(args), {timeout: HTTP_TIMEOUT_MS});
		req.success(function(data, status, headers, config) {
			// console.log('Response:');
			// console.log(data);
			if (data.status === 'NEED_LOGIN') {
				window.location = data.url;
				return;
			} else if (data.status !== 'OK') {
				alert('Error saving to server: ' + data.status);
				return;
			}
			lastSavedVersion = data.lastSavedVersion;
			console.log('Saved.');
			success();
		});
		req.error(function(data, status, headers, config) {
			console.log("Error uploading data to server. We might be offline. Details:");
			console.log(data);
			console.log(status);
			console.log(headers);
			console.log(config);
			if (status === 0) {
				offline();
			} else {
				error();
			}
		});
	};

	downloadAsFile = function() {
		// From http://stackoverflow.com/questions/3749231/download-file-using-javascript-jquery
		var iframe;
		iframe = document.getElementById("hiddenDownloader");
		if (iframe === null) {
			iframe = document.createElement('iframe');
			iframe.id = "hiddenDownloader";
			iframe.style.visibility = 'hidden';
			document.body.appendChild(iframe);
		}
		iframe.src = '/api/storage?forceDownload=true';
	};

	return {
		downloadData: downloadData,
		uploadData: uploadData,
		downloadAsFile: downloadAsFile
	};
});
