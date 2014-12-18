'use strict';
angular.module('me.lazerka.orbit')
	.directive('zoom', function(GLOBAL_SCALE, smooth) {
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

					scope.$apply(function() {
						scope.fov -= Math.round(event.wheelDelta / 24);
					});
				});
			}
		};
	})
;
