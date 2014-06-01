angular.module('do-me').controller('TasksCtrl', function($scope, storage) {
	var _tasks = storage.tasks;
	$scope.editing = {text: null}; // Tags & desc of task being edited (for desktop), or null if not editing.
	// var selectedTask = storage.selectedTask; // TODO see if i can figure out how to make this always set right on shortcut or click and then have this controller use only this and not cursor.
	$scope.newTask = ''; // backs new task input. TODO rename to taskText
	$scope.selectedProject = ''; // only used on mobile
	$scope.selectedContext = ''; // only used on mobile

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
