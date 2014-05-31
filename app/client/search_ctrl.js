angular.module('do-me').controller('SearchCtrl', function($scope, storage) {
	var TAG_REGEX = /(^|\s)[#@][^ ]+/g; // TODO DRY- move to common service or something
	
	$scope._tasks = storage.tasks; // needs to be in $scope so controller can $watch it.
	$scope.searchStr = storage.searchStr; // so other controllers can set search.
	$scope.searchTemp = ''; // working space which backs search text box so ctrl can set it to search.
	$scope.results = $scope._tasks;

	$scope.searchHandler = function(event, searchStr) {
		$scope.searchStr.text = searchStr;
		event.preventDefault(); // so "#" doesn't wind up in the url
		$('input').blur();
	};

	$scope.searchFor = function(tagStr) {
		$scope.searchStr.text = tagStr;
	};

	var search = function() {
		var criteria = parseSearch($scope.searchStr.text);
		// console.log("Searching for tasks with these criteria:");
		console.log(criteria);
		var wordRegexes = criteria.lowerWords.map(makeWordRegex);
		// console.log(wordRegexes);

		updateSelectedTagsForMobile(criteria.lowerTags);

		var arrayOfResults = [];
		angular.forEach($scope._tasks, function(task) {
			var taskHasEveryTag = criteria.lowerTags.every(function(t) {
				return task.tags.map(toLowerCase).indexOf(t) >= 0;
			});
			if (criteria.lowerTags.length > 0 && !taskHasEveryTag) {
				return;
			}
			var taskHasEveryWord = wordRegexes.every(function(regexp) {
				return task.text.match(regexp) !== null;
			});
			if (criteria.lowerWords.length > 0 && !taskHasEveryWord) {
				return;
			}
			if (criteria.done != 'include' && task.done) {
				return;
			}
			var taskIsWaiting = task.text.toLowerCase().indexOf('(waiting') === 0;
			if (criteria.waiting === 'hide' && taskIsWaiting) {
				return;
			}
			if (criteria.waiting === 'only' && !taskIsWaiting) {
				return;
			}
			arrayOfResults.push(task);
		});
		$scope.results = arrayOfResults;
	};

	$scope.$watch('_tasks', search, true); // if we change tasks (eg adding one), re-search to update what's shown.
	$scope.$watch('searchStr', search, true);
	$scope.$watch('searchStr', function() { $scope.searchTemp = $scope.searchStr.text; }, true);

	var parseSearch = function(text) {
		var toParse = text;

		var arrayOfTags = trimAndLowerEach(toParse.match(TAG_REGEX) || []);
		// console.log(arrayOfTags);
		toParse = toParse.replace(TAG_REGEX, '');

		var doneRes = extractSearchOption(toParse, 'done', 'hide');
		toParse = doneRes.newToParse;
		var done = doneRes.lowerValue.trim();

		var waitingRes = extractSearchOption(toParse, 'waiting', 'hide');
		toParse = waitingRes.newToParse;
		var waiting = waitingRes.lowerValue.trim();

		var arrayOfWords = trimAndLowerEach(toParse.split(' '));
		// console.log(arrayOfWords);

		return {
			lowerTags: arrayOfTags,
			lowerWords: arrayOfWords,
			done: done,
			waiting: waiting
		};
	};

	var trimAndLowerEach = function(arr) {
		var trimmed = arr.map(function(item) { return item.trim(); });
		var filtered = trimmed.filter(function(item) { return item.length > 0; });
		var lowered = filtered.map(toLowerCase);
		return lowered;
	};

	var updateSelectedTagsForMobile = function(lowerTags) {
		// TODO set selections
	};

	/**
	 * Resulting value will be lowercase.
	 **/
	var extractSearchOption = function(toParse, option, defaultVal) {
		var regexp = new RegExp('(^|\\W)' + escapeRegExp(option + ':') + '[^ ]+', 'i');
		// console.log(regexp);
		var match = toParse.match(regexp);
		// console.log(match);
		if (match === null) {
			match = [option + ':' + defaultVal];
		}
		return {
			newToParse: toParse.replace(regexp, ''),
			lowerValue: match[0].toLowerCase().replace(option.toLowerCase() + ':', '')
		};
	};

	var makeWordRegex = function(word) {
		return (new RegExp('(^|\\W)' + escapeRegExp(word) + '($|\\W)', 'i'));
	};

	var escapeRegExp = function(str) {
		// From http://stackoverflow.com/a/6969486/229371
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	};

	var toLowerCase = function(str) {
		return str.toLowerCase();
	};
});
