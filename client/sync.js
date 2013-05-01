angular.module('goodoo').service('sync', function (storage) {

	var mergeServerData = function(str) {
		var json = {version: 1, tasks: []}; //, tags: []};
		if (str !== '') { // First download before anything's been uploaded.
			json = JSON.parse(str);
		}
		var version = json.version || 1;
		if (version !== 1) {
			alert("Goo Doo has been updated and can't sync ");
		}
		_mergeTasks(storage.tasks, json.tasks);
		// _mergeTags(data.tags, json.tags);
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
		var serverTasksById = _tasksById(serverTasks);
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

	var _tasksById = function(tasks) {
		var res = {};
		$.each(tasks, function(i, task) {
			res[task.id] = task;
		});
		return res;
	};

	// /**
	//  * Merges serverTags into clientTags, modifying clientTags.
	//  */
	// _mergeTags = function(clientTags, serverTags) {
	// 	console.log('Merging tags:');
	// 	console.log(clientTags);
	// 	console.log(serverTags);
	// 	var serverTagsByName = {};
	// 	$.each(serverTags, function(i, tag) {
	// 		serverTagsByName[tag.name] = tag;
	// 	});
	// 	clientTags.each(function(tag) {
	// 		if (tag.get('name') in serverTagsByName) {
	// 			var serverTag = serverTagsByName[tag.get('name')];
	// 			delete serverTagsByName[tag.get('name')];
	// 			if (serverTag.updated_at > tag.get('updated_at')) {
	// 				tag.set(serverTag);
	// 			}
	// 		}
	// 	});
	// 	$.each(serverTagsByName, function(name, tag) {
	// 		clientTags.add(tag, {silent: true});
	// 	});
	// 	clientTags.trigger('add');
	// 	console.log('Merged. New tags:');
	// 	console.log(clientTags);
	// };

	return {
		mergeServerData: mergeServerData
	};
});
