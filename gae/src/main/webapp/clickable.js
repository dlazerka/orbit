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
				var camera = pane.camera;

				function shouldHandle(event) {
					return event.which == 1
						&& event.target.nodeName == 'CANVAS'
						&& !event.ctrlKey
						&& !event.metaKey
						&& !event.shiftKey
						;
				}

				function getChildren() {
					var children = [];
					angular.forEach(pane.scene.children, function(child) {
						if (child.myData) {
							children.push(child);
						}
					});
					return children;
				}

				element.on('click', 'canvas', function(event) {
					if (!shouldHandle(event)) return;
					event.preventDefault();

					var raycaster = new THREE.Raycaster();
					var mouse = new THREE.Vector3(0, 0, 0.5);
					mouse.x = 2 * event.offsetX / event.target.width - 1;
					mouse.y = -2 * event.offsetY / event.target.height + 1;

					var vector = mouse
						.unproject(camera)
						.sub(camera.position)
						.normalize();
					raycaster.set(camera.position, vector);
					var intersects = raycaster.intersectObjects(getChildren());

					if (intersects.length) {
						var mesh = intersects[0].object;
						pane.lookAt(mesh.position);
					}
				});
			}
		};
	})
;
