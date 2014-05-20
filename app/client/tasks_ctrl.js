// angular.module('do-me').directive('repeatDone', function() {
// 		return function(scope, element, attrs) {
// 			if (scope.$last) {
// 				console.log('trace1');
// 				$(element).parent().trigger('create');
// 			}
// 		};
// 	});


// angular.module('do-me').config(function($locationProvider) { $locationProvider.html5Mode(false); });

angular.module('do-me').controller('TasksCtrl', function($scope, storage) {
	var TAG_REGEX = /(^|\s)[#@][^ ]+/g;
	
	// Data / models that have to do with this controller
	$scope.tasks = storage.tasks;
	$scope.searchStr = storage.searchStr;
	$scope.searchTemp = ''; // working space which backs search text box.
	$scope.results = $scope.tasks; // results of search. ie, what to show.
	$scope.taskNextId = 0;
	$scope.cursor = 0; // index of cursor position with 0 being the top task in the results
	$scope.editing = false; // true if the task pointed to by the cursor is being edited
	$scope.editTaskText = {}; // key: cursor position, val: what's in the edit box. shit doesn't work right using the same variable for all edit inputs
	$scope.newTask = ''; // backs new task input
	$scope.selectedProject = ''; // only used on mobile
	$scope.selectedContext = ''; // only used on mobile

	$scope.addTask = function() {
		var tags = $scope.parseTags($scope.newTask);
		if ($scope.selectedProject.length > 0) {
			tags.push($scope.selectedProject);
		}
		if ($scope.selectedContext.length > 0) {
			tags.push($scope.selectedContext);
		}
		var text = $.trim($scope.newTask.replace(TAG_REGEX, ''));
		console.log("New text is: " + text);

		if (text !== "") {
			$scope.tasks.push({
				id: storage.generateId(),
				text: text,
				tags: tags,
				done: false,
				updated_at: storage.utcTs()
			});
			if ($.mobile) {
				history.back();
			}
		} else {
			alert("Whoops, can't add an empty task.");
		}

		$scope.newTask = '';
	};

	$scope.editTask = function(index) {
		$scope.cursor = index; // have to overwrite cursor because a click can trigger this
		$scope.editing = true;
		var task = $scope.getCurrentTask();
		$scope.editTaskText[$scope.cursor] = task.tags.concat([task.text]).join(' ');
		console.log($scope.editTaskText[$scope.cursor]);
		$('input.edit' + $scope.cursor).focus();
	};

	$scope.updateTask = function() {
		updatedTaskDesc = $scope.editTaskText[$scope.cursor];
		console.log("Updating task using: " + updatedTaskDesc);
		var task = $scope.getCurrentTask();
		var newTags = $scope.parseTags(updatedTaskDesc);
		var newText = $.trim(updatedTaskDesc.replace(TAG_REGEX, ''));

		if (newText !== "") {
			console.log(newText);
			task.tags = newTags;
			task.text = newText;
			task.updated_at = storage.utcTs();
			$scope.editing = false;
			// console.log($scope.tasks);
			if ($.mobile) {
				history.back();
			}
		} else {
			console.log("Whoops, can't update empty field");
		}
	};

	$scope.finishTask = function() {
		var task = $scope.getCurrentTask();
		task.done = true;
		task.updated_at = storage.utcTs();
		if ($.mobile) {
			history.back();
		}
	};

	$scope.parseTags = function(text) {
		var arrayOfTags = text.match(TAG_REGEX) || [];
		console.log(arrayOfTags);
		arrayOfTags = $.map(arrayOfTags, function(tag, i) {
			return $.trim(tag);
		});
		console.log(arrayOfTags);
		return arrayOfTags;
	};

	$scope.updatedTask = function(task) {
		task.updated_at = storage.utcTs();
	};

	$scope.search = function() {
		var criteria = parseSearch($scope.searchStr.text);
		// console.log("Searching for tasks with these criteria:");
		console.log(criteria);
		var wordRegexes = $.map(criteria.lowerWords, makeWordRegex);
		// console.log(wordRegexes);

		updateSelectedTagsForMobile(criteria.lowerTags);

		var arrayOfResults = [];
		angular.forEach($scope.tasks, function(task) {
			var taskHasEveryTag = criteria.lowerTags.every(function(t) {
				return $.map(task.tags, toLowerCase).indexOf(t) >= 0;
			})
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

	var toLowerCase = function(str) {
		return str.toLowerCase();
	};

	var makeWordRegex = function(word) {
		return (new RegExp('(^|\\W)' + escapeRegExp(word) + '($|\\W)', 'i'));
	};

	var escapeRegExp = function(str) {
		// From http://stackoverflow.com/a/6969486/229371
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	var parseSearch = function(text) {
		var toParse = text;

		var arrayOfTags = trimAndLowerEach(toParse.match(TAG_REGEX) || []);
		// console.log(arrayOfTags);
		toParse = toParse.replace(TAG_REGEX, '');

		var doneRes = extractSearchOption(toParse, 'done', 'hide');
		toParse = doneRes.newToParse;
		var done = $.trim(doneRes.lowerValue);

		var waitingRes = extractSearchOption(toParse, 'waiting', 'hide');
		toParse = waitingRes.newToParse;
		var waiting = $.trim(waitingRes.lowerValue);

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
		var trimmed = $.map(arr, function(item) { return $.trim(item); });
		var filtered = $.grep(trimmed, function(item) { return item.length > 0; });
		var lowered = $.map(filtered, toLowerCase);
		return lowered;
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

	$scope.$watch('tasks', $scope.search, true); // if we change tasks (eg adding one), re-search to update what's shown.
	$scope.$watch('searchStr', $scope.search, true);
	$scope.$watch('searchStr', function() { $scope.searchTemp = $scope.searchStr.text; }, true);

	$scope.searchHandler = function(event, searchStr) {
		$scope.searchStr.text = searchStr;
		event.preventDefault(); // so "#" doesn't wind up in the url
		$('input').blur();
	};

	$scope.linkify = function(text) {
		var STOP_CLICK_PROPAGATION = 'onclick="var event = arguments[0] || window.event; event.stopPropagation();"';

		var URL_REGEX = /(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?/gi;
		var urlLinked = text.replace(URL_REGEX, function(url, protocol, host, port, path, filename, ext, query, fragment) {
			var urlWithProtocol = url;
			if (typeof(protocol) === 'undefined') {
				urlWithProtocol = 'http://' + url;
			}
			return '<a href="' + urlWithProtocol + '" ' + STOP_CLICK_PROPAGATION + '>' + url + '</a>';
		});

		var PHONE_REGEX = /(1[ -.])?\(?[0-9]{3}\)?[ -.]?[0-9]{3}[ -.]?[0-9]{4}/gi;
		return urlLinked.replace(PHONE_REGEX, function(number) {
			return '<a href="tel:' + number + '" ' + STOP_CLICK_PROPAGATION + '>' + number + '</a>';
		});
	};

	var updateSelectedTagsForMobile = function(lowerTags) {
		// TODO set selections
	};

	// Keyboard Shortcuts
	//
	// In theory these shouldn't be in the controller, but it's so much easier to deal with moving the cursor with them
	// here that what the hell.

	// Allow keymaster to process escape while in inputs
	key.filter = function(event) {
		var tagName = (event.target || event.srcElement).tagName;
		if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
			if (event.which == 27) { // esc
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	};

	var shortcut = function(keys, func) {
		key(keys, function() {
			var ret;
			$scope.$apply(function() {
				if (!$scope.editing) {
					ret = func();
				}
			});
			return ret;
		});
	};

	shortcut('/', function() {
		$('input.search').focus().select();
		return false; // stop the event so the character doesn't go into text box
	});

	shortcut('a, n, t', function() {
		$('input.new-task').focus().select();
		return false; // stop the event so the character doesn't go into text box
	});

	shortcut('escape', function() {
		$('input').blur();
	});

	shortcut('j', function() {
		$scope.cursor += 1;
	});

	shortcut('k', function() {
		$scope.cursor -= 1;
	});

	shortcut('c, f', function() {
		var task = $scope.getCurrentTask();
		task.done = true;
		$scope.updatedTask(task);
	});

	shortcut('o, enter', function() {
		$scope.editTask($scope.cursor);
	});

	$scope.makeCursorOk = function() {
		if ($scope.cursor < 0) {
			$scope.cursor = 0;
		} else if ($scope.cursor >= $scope.results.length && $scope.cursor > 0) {
			$scope.cursor = $scope.results.length - 1;
		}
	};
	$scope.$watch('results', $scope.makeCursorOk, true);
	$scope.$watch('cursor', $scope.makeCursorOk);

	// Returns task that cursor points to
	$scope.getCurrentTask = function() {
		return $scope.results[$scope.cursor];
	};

	$scope.logTasks = function() {
		console.log('$scope tasks:');
		console.log($scope.tasks);
	};

	// jqNewTaskInput = $('#new-task-input');
	// jqNewTaskInput.on('focus', function() {
	// 	console.log(jqNewTaskInput);
	// 	// console.log(jqNewTaskInput.value);
	// 	// if (jqNewTaskInput.value === '') {
	// 		// jqNewTaskInput.value = $scope.searchStr;
	// 	console.log($scope.newTask);
	// 	if ($scope.newTask == '') { // TODO ===
	// 		$scope.newTask = $scope.searchStr.text; // TODO parsed tags
	// 	}
	// });

	// $scope.autocompleteTaskTags = function(event) {
	// 	var allTags = [];
	// 	angular.forEach(storage.tags, function(tag) {
	// 		if (tag.deleted === false) {
	// 			allTags.push(tag.text);
	// 		}
	// 	});
	// 	console.log("All tags:");
	// 	console.log(allTags);

	// 	// TODO newTask is winding up as undefined on mobile version only.
	// 	console.log($scope.newTask);

	// 	// TODO new plan- only autocomplete on desktop. search for exists widget and see if i can use it or grab some code.
	// 	// $('#new-task-input').
	// 	// var newTags = $scope.parseTags($scope.newTask);
	// 	// angular.forEach(newTags, function(newTag) {
	// 	// 	angular.forEach(allTags, function(availableTag))
	// 	// 	if (allTags[tag]) {
	// 	// 		console.log(tag + ' exists.');
	// 	// 	}
	// 	// });
	// };
	// $scope.$watch('newTask', $scope.autocompleteTaskTags);
});

// TODO move to controller
function showShortcuts() {
	var overlay = document.getElementById('overlay');
	var shortcuts = document.getElementById('shortcuts');
	overlay.style.opacity = 0.8;
	if(overlay.style.display == "block"){
		overlay.style.display = "none";
		shortcuts.style.display = "none";
	} else {
		overlay.style.display = "block";
		shortcuts.style.display = "block";
	}
}
