'use strict';

/**
 * Click on a celestial to set new camera.lookAt.
 */
angular.module('me.lazerka.orbit')
	.directive('select', function(smooth) {
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

					angular.forEach(scope.celestials, function(celestial) {
						var intersection = raycaster.intersectObject(celestial.mesh);
						if (intersection.length) {
							select(celestial);
						}
					});

					function select(celestial) {
						var newLookingAt = celestial.mesh.position;

						var oldLookingAt = scope.lookingAt.clone();
						console.log('Looking at ' + newLookingAt.toArray());

						function moveLookingAt(delta, deltaPrev) {
							scope.lookingAt
								.copy(oldLookingAt)
								.lerp(newLookingAt, delta);
							camera.position
								.add(newLookingAt.clone().sub(oldLookingAt).multiplyScalar(delta - deltaPrev));
						}

						smooth.enqueue(moveLookingAt, 'select', 250);
					}
				});
			}
		};
	})
;
