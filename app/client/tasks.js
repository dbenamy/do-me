angular.module('do-me').service('tasks', function(storage) {
	var TAG_REGEX = /(^|\s)[#@][^ ]+/g; // TODO DRY in search- move to common service or something

	var _tasks = storage.tasks;
	
	var add = function(args) {
		var text = args.text;
		var project = args.project || '';
		var context = args.context || '';

		var tags = _parseTags(text);
		if (project.length > 0) {
			tags.push(project);
		}
		if (context.length > 0) {
			tags.push(context);
		}
		text = text.replace(TAG_REGEX, '').trim();
		console.log("New text is: " + text);
		if (text === "") {
			return "Whoops, can't add a blank task.";
		}

		_tasks.push({
			id: storage.generateId(),
			text: text,
			tags: tags,
			done: false,
			updated_at: storage.utcTs()
		});
		return null;
	};

	var update = function(args) {
		console.log("Updating task using: " + args.text);
		var task = args.task;
		var newTags = _parseTags(args.text);
		var newText = args.text.replace(TAG_REGEX, '').trim();

		if (newText === "") {
			return "Whoops, can't set text to blank.";
		}
		console.log(newText);
		task.tags = newTags;
		task.text = newText;
		task.updated_at = storage.utcTs();
		return null;
	};

	var linkify = function(text) {
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

	_parseTags = function(text) {
		var arrayOfTags = text.match(TAG_REGEX) || [];
		console.log(arrayOfTags);
		arrayOfTags = arrayOfTags.map(function(tag, i) {
			return tag.trim();
		});
		console.log(arrayOfTags);
		return arrayOfTags;
	};

	return {
		linkify: linkify,
		add: add,
		update: update
	};
});
