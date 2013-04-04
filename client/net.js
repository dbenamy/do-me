angular.module('goodoo').service('net', function() {
	var lastSavedVersion = null;

	downloadData = function(success) {
		console.log("Downloading.");
		$.getJSON('/api/storage', function(result) {
			if (result.status === 'NEED_LOGIN') {
				window.location = result.url;
				return;
			} else if (result.status !== 'OK') {
				alert('Error loading from server: ' + result.status);
				return;
			}
			console.log("Downloaded: " + JSON.stringify(result));
			lastSavedVersion = result.version;
			success(result.text);
		});
	};

	uploadData = function(str, success) {
		var args = {
			text: str,
			lastSavedVersion: lastSavedVersion
		};
		console.log('Uploading: ' + JSON.stringify(args));
		$.post('/api/storage', args, function(result) {
			console.log('Response: ' + result);
			result = JSON.parse(result);
			if (result.status === 'NEED_LOGIN') {
				window.location = result.url;
				return;
			} else if (result.status !== 'OK') {
				alert('Error saving to server: ' + result.status);
				return;
			}
			lastSavedVersion = result.lastSavedVersion;
			console.log('Saved.');
			success();
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
