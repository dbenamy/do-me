window.addEventListener('load', function(e) {
	window.applicationCache.addEventListener('updateready', function(e) {
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
			// Browser downloaded a new app cache.
			// Swap it in and reload the page to get the new hotness.
			window.applicationCache.swapCache();
			if (confirm("A new version of this site is available. Load it?")) {
				window.location.reload();
			} else {
				alert("Things may not work properly until you reload the page.");
			}
		}
	}, false);
}, false);

var checkForUpdate = function() {
	// From https://coderwall.com/p/eanm4q
	if (navigator.onLine) {
		if (window.applicationCache.status != window.applicationCache.UNCACHED) {
			console.log("Checking for cache update.");
			window.applicationCache.update();
		}
	}
};

// The browser will check for updates when the page loads. This will check again every half hour in case there are
// long lived instances of the app that would otherwise not see updates for a while.
setInterval(applicationCache.update, 30 * 60 * 1000);
