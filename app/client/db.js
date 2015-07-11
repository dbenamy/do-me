angular.module('do-me').service('db', function($rootScope) {
	// Variables: TODO make them function variables instead of rootScope
	// $rootScope.tasks = [];
	// $rootScope.tags = [];
	// $rootScope.tasksVersion = {ref: 0}; // used for cheap watching of task changes. has to be an object so users can copy reference and watch it.
	var tasks = [];
	var tags = [];
	var tasksVersion = {ref: 0}; // used for cheap watching of task changes. has to be an object so users can copy reference and watch it.

	var utcTs = function() {
		var now = new Date();
		return Date.UTC(
				now.getUTCFullYear(), now.getUTCMonth(),
				now.getUTCDate(), now.getUTCHours(),
				now.getUTCMinutes(), now.getUTCSeconds()
		) / 1000;
	};

	var _nextId = 0;
	var generateId = function() {
		// The timestamp is the basis of the unique id. The _nextId counter is in case the clock shifts for daylight
		// savings, a time correction, etc. The random number is added just in case somehow tasks are created at the
		// same time, with the same _nextId, on two different clients.
		return sprintf('%s-%s-%s', Date.now(), _nextId++, Math.round(Math.random() * 1000));
	};

	// var migrate = function(appData) {
	// 	// TODO how do i figure out if we want demo data? maybe need special case first-run path at the app level.
	// 	// if (!appData.tasks) {
	// 	// 	appData.tasks = [
	// 	// 		{
	// 	// 			id: 'sample-1',
	// 	// 			tags: ['#@Computer', '#BuyInsurance'],
	// 	// 			text: "Get quotes on http://www.ehealthinsurance.com",
	// 	// 			done: false,
	// 	// 			updated_at: utcTs()
	// 	// 		},
	// 	// 		{
	// 	// 			id: 'sample-2',
	// 	// 			tags: [],
	// 	// 			text: "A task with no tags",
	// 	// 			done: false,
	// 	// 			updated_at: utcTs()
	// 	// 		}
	// 	// 	];
	// 	// }
	// 	// if (!appData.tags) {
	// 	// 	appData.tags = [ // missing attributes will get added in normalizeTags
	// 	// 		{text: '@Phone'},
	// 	// 		{text: '@Computer'},
	// 	// 		{text: 'UnpackBoxes'},
	// 	// 		{text: 'BuyInsurance'}
	// 	// 	];
	// 	// }
	// 	normalizeTags(appData.tags);
	// };

	var normalizeTags = function(tags) {
		angular.forEach(tags, function(tag) {
			if (!('id' in tag)) { // TODO i think there's something safer than not in
				tag.id = generateId();
			}
			if (!('deleted' in tag)) {
				tag.deleted = false;
			}
			if (!('lastUpdated' in tag)) {
				tag.lastUpdated = utcTs();
			}
			if (!('text' in tag)) {
				tag.text = 'Corrupted tag';
			}
			// Convert tags without leading '#' or '@'
			if (tag.text[0] !== '#' && tag.text[0] !== '@') {
				tag.text = '#' + tag.text;
			}
		});
	};

	// Stuff exposed by the service:
	return {
		tasks: tasks,
		tasksVersion: tasksVersion,
		tags: tags,
		utcTs: utcTs,
		generateId: generateId,
		normalizeTags: normalizeTags
	};
});
