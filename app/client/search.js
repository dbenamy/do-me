angular.module('do-me').service('search', function($rootScope, storage) {
	var TAG_REGEX = /(^|\s)[#@][^ ]+/g; // TODO DRY
	
	var _tasks = storage.tasks;
	var _searchStr = {ref: ''};
	var _results = [];

	var set = function(searchStr) {
		_searchStr.ref = searchStr;
	};

	var get = function() {
		return _searchStr.ref;
	};

	var getResults = function() {
		return _results;
	};

	var search = function() {
		var criteria = parseSearch(_searchStr.ref);
		var wordRegexes = criteria.lowerWords.map(makeWordRegex);

		updateSelectedTagsForMobile(criteria.lowerTags);

		var arrayOfResults = [];
		angular.forEach(_tasks, function(task) {
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
		_results = arrayOfResults;
	};

	$rootScope.$watch(function() { return _tasks; }, search, true); // if we change tasks (eg adding one), re-search to update what's shown.
	$rootScope.$watch(function() { return _searchStr.ref; }, search);

	var parseSearch = function(text) {
		var toParse = text;

		var arrayOfTags = trimAndLowerEach(toParse.match(TAG_REGEX) || []);
		toParse = toParse.replace(TAG_REGEX, '');

		var doneRes = extractSearchOption(toParse, 'done', 'hide');
		toParse = doneRes.newToParse;
		var done = doneRes.lowerValue.trim();

		var waitingRes = extractSearchOption(toParse, 'waiting', 'hide');
		toParse = waitingRes.newToParse;
		var waiting = waitingRes.lowerValue.trim();

		var arrayOfWords = trimAndLowerEach(toParse.split(' '));

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

	return {
		searchFor: set, // TODO rename to set
		get: get,
		getResults: getResults
	};
});
