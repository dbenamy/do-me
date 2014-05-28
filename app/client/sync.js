angular.module('do-me').service('sync', function (storage) {

	var mergeServerData = function(str) {
		var serverData = {};
		if (str !== '') { // First download before anything's been uploaded.
			serverData = JSON.parse(str);
		}
		var tasks = serverData.tasks || [];
		var tags = serverData.tags || [];
		storage.normalizeTags(tags);
		_mergeTasks(storage.tasks, tasks);
		_mergeTags(storage.tags, tags);
	};

	/**
	 * Merges serverTasks into clientTasks, modifying clientTasks
	 * clientTasks should be the array of tasks in the app.
	 * serverTasks should be the array of tasks downloaded from the server.
	 */
	var _mergeTasks = function(clientTasks, serverTasks) {
		// console.log('Merging tasks:');
		// console.log(clientTasks);
		// console.log(serverTasks);
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
				}
			}
		});
		// Anything left in serverTasksById doesn't exist in clientTasks and
		// should be added to the result.
		angular.forEach(serverTasksById, function(serverTask, id) {
			clientTasks.push(serverTask);
		});
		// console.log('Merged. New tasks:');
		// console.log(clientTasks);
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
	_mergeTags = function(clientTags, serverTags) {
		console.log('Merging tags:');
		console.log(clientTags);
		console.log(serverTags);
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
		console.log('Merged. New tags:');
		console.log(clientTags);
	};

	return {
		mergeServerData: mergeServerData
	};
});
