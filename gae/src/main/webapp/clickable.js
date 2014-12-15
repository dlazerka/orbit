'use strict';

/**
 * Click on a celestial to set new camera.lookAt.
 */
angular.module('me.lazerka.orbit')
	.directive('clickable', function() {
		return {
			restrict: 'A',
			require: '^pane',
			link: function(scope, element, attr, pane) {
				function shouldHandle(event) {
					return event.which == 1
						&& event.target.nodeName == 'CANVAS'
						&& !event.ctrlKey
						&& !event.metaKey
						&& !event.shiftKey
						;
				}

				element.on('click', 'canvas', function(event) {
					if (!shouldHandle(event)) return;
					event.preventDefault();

					// TODO
					//new THREE.Raycaster()
				});
			}
		};
	})
;
