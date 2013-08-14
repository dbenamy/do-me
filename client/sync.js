angular.module('goodoo').service('sync', function (storage) {

	var mergeServerData = function(str) {
		var json = {};
		if (str !== '') { // First download before anything's been uploaded.
			json = JSON.parse(str);
		}
		var tasks = json.tasks || [];
		var tags = json.tags || [];
		_mergeTasks(storage.tasks, tasks);
		_mergeTags(storage.tags, storage.normalizeTags(tags));
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
		$.each(clientTasks, function(i, task) {
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
		$.each(serverTasksById, function(id, serverTask) {
			clientTasks.push(serverTask);
		});
		// console.log('Merged. New tasks:');
		// console.log(clientTasks);
	};

	var _objsById = function(objs) {
		var res = {};
		$.each(objs, function(i, obj) {
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
		$.each(clientTags, function(i, tag) {
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
		$.each(serverTagsById, function(id, tag) {
			clientTags.push(tag);
		});
		console.log('Merged. New tags:');
		console.log(clientTags);
	};

	return {
		mergeServerData: mergeServerData
	};
});
