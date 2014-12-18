'use strict';
angular.module('me.lazerka.orbit')
	.directive('zoom', function() {
		return {
			restrict: 'A',
			require: '^pane',
			link: function(scope, element, attrs, pane) {
				element.bind('wheel', function(event){
					event = event.originalEvent || event;
					// Shift-key
					if (event.ctrlKey || event.metaKey || !event.shiftKey) {
						return;
					}
					event.preventDefault();

					var wheelDirac = event.wheelDelta / Math.abs(event.wheelDelta);
					scope.$apply(function() {
						scope.fov -= wheelDirac;
						pane.camera.fov = scope.fov;
						pane.camera.updateProjectionMatrix();
					});
				});
			}
		};
	})
;
