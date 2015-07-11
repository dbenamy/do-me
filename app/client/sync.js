// TODO I might want to merge this into the db service
angular.module('do-me').service('sync', function (db) {

	var mergeInJson = function(str) {
		var serverData = {};
		if (str !== '') { // First download before anything's been uploaded.
			serverData = JSON.parse(str);
		}
		mergeInData(serverData);
	};

	var mergeInData = function(newAppData) {
		var tasks = newAppData.tasks || [];
		var tags = newAppData.tags || [];
		db.normalizeTags(tags);
		_mergeTasks(db.tasks, tasks);
		_mergeTags(db.tags, tags);
	};

	/**
	 * Merges serverTasks into clientTasks, modifying clientTasks
	 * clientTasks should be the array of tasks in the app.
	 * serverTasks should be the array of tasks downloaded from the server.
	 */
	var _mergeTasks = function(clientTasks, serverTasks) {
		var changedClient = false;
		// _log('Merging tasks:');
		// _log(clientTasks);
		// _log(serverTasks);
		var serverTasksById = _objsById(serverTasks);
		angular.forEach(clientTasks, function(task, i) {
			if (task.id in serverTasksById) {
				var serverTask = serverTasksById[task.id];
				delete serverTasksById[task.id];
				// Skip fancy merging for now and just use all data from most recently updated.
				// $.each(['text', 'done'], function(id, field) {
				// 	if (serverTask[field].updated_at > task[field].updated_at) {
				// 		task[field] = serverTask[field];
				// 	}
				// });
				// var tags = task.get('tags');
				// $.each(tags, function(tag, info) {
				// 	if (tag in serverTask.tags) {
				// 		if (serverTask.tags[tag].updated_at > info.updated_at) {
				// 			tags[tag] = serverTask.tags[tag];
				// 		}
				// 		delete serverTask.tags[tag];
				// 	}
				// });
				// // Any tags left in serverTask.tags don't exist in (client) task and
				// // should be added.
				// $.each(serverTask.tags, function(tag, info) {
				// 	tags[tag] = info;
				// });
				// task.set({tags: tags});
				if (serverTask.updated_at >= task.updated_at) {
					task.text = serverTask.text;
					task.tags = serverTask.tags;
					task.done = serverTask.done;
					task.updated_at = serverTask.updated_at;
					changedClient = true;
				}
			}
		});
		// Anything left in serverTasksById doesn't exist in clientTasks and
		// should be added to the result.
		angular.forEach(serverTasksById, function(serverTask, id) {
			clientTasks.push(serverTask);
			changedClient = true;
		});
		// _log('Merged. New tasks:');
		// _log(clientTasks);
		if (changedClient) {
			db.tasksVersion.ref++;
		}
	};

	var _objsById = function(objs) {
		var res = {};
		angular.forEach(objs, function(obj, i) {
			res[obj.id] = obj;
		});
		return res;
	};

	/**
	 * Merges serverTags into clientTags, modifying clientTags.
	 */
	var _mergeTags = function(clientTags, serverTags) {
		_log('Merging tags:');
		_log(clientTags);
		_log(serverTags);
		var serverTagsById = _objsById(serverTags);
		angular.forEach(clientTags, function(tag, i) {
			if (tag.id in serverTagsById) {
				var serverTag = serverTagsById[tag.id];
				delete serverTagsById[tag.id];
				if (serverTag.lastUpdated >= tag.lastUpdated) {
					tag.text = serverTag.text;
					tag.deleted = serverTag.deleted;
					tag.lastUpdated = serverTag.lastUpdated;
				}
			}
		});
		angular.forEach(serverTagsById, function(tag, id) {
			clientTags.push(tag);
		});
		_log('Merged. New tags:');
		_log(clientTags);
	};

	var _log = function(thing) {
		// console.log(thing);
	};

	return {
		mergeInJson: mergeInJson,
		mergeInData: mergeInData
	};
});
