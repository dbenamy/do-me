angular.module('do-me').service('tasks', function(db) {
	var TAG_REGEX = /(^|\s)[#@][^ ]+/g; // TODO DRY in search- move to common service or something
	var WAITING_REGEX = /^\(waiting for ([^\)]+)\)/gi;

	var exports = {};
	
	exports.add = function(args) {
		var text = args.text;
		var project = args.project || '';
		var context = args.context || '';

		var tags = parseTags(text);
		if (project.length > 0) {
			tags.push(project);
		}
		if (context.length > 0) {
			tags.push(context);
		}
		text = text.replace(TAG_REGEX, '').trim();
		if (text === "") {
			return "Whoops, can't add a blank task.";
		}

		db.tasks.push({
			id: db.generateId(),
			text: text,
			tags: tags,
			done: false,
			updated_at: db.utcTs()
		});
		db.tasksVersion.ref++;
		return null;
	};

	exports.parseTextTask = function(text) {
		var tags = parseTags(text);
		var waiting = parseWaiting(text);
		var newText = text.replace(TAG_REGEX, '').replace(WAITING_REGEX, '').trim();
		return {
			text: newText,
			tags: tags,
			waiting: waiting
		};
	};

	exports.update = function(args) {
		var task = args.task;
		var text = ('text' in args ? args.text : task.text);
		var done = ('done' in args ? args.done : task.done);
		var waiting = ('waiting' in args ? args.waiting : task.waiting);
		var tags = ('tags' in args ? args.tags : (task.tags));
		if (text === "") {
			return "Whoops, can't set text to blank.";
		}

		task.waiting = waiting;
		task.tags = tags;
		task.text = text;
		task.done = done;
		task.updated_at = db.utcTs();
		db.tasksVersion.ref++;
		return null;
	};

	var parseWaiting = function(text) {
		var match = WAITING_REGEX.exec(text);
		if (match === null) {
			return '';
		}
		return match[1].trim();
	};

	var parseTags = function(text) {
		var arrayOfTags = text.match(TAG_REGEX) || [];
		arrayOfTags = arrayOfTags.map(function(tag, i) {
			return tag.trim();
		});
		return arrayOfTags;
	};

	return exports;
});
