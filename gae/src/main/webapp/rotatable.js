'use strict';

/**
 * Handles rotation of camera around scope.lookingAt point, and also changing gimbal axis (camera.up).
 *
 * Right mouse button down: camera should 1 -- move down 2 -- rotate up.
 *      So that far background points move opposite to mouse movements.
 */
angular.module('me.lazerka.orbit')
	.directive('rotatable', function(smooth) {
		return {
			restrict: 'A',
			require: '^pane',
			link: function(scope, element, attr, pane) {
				var dragging = {
					which: null,
					x: null,
					y: null
				};
				var camera = pane.getCamera();

				scope.$watch('up', function(newVal, oldVal) {
					if (!newVal || newVal == oldVal) {
						return;
					}

					var oldUp = camera.up.clone();
					var newUp = new THREE.Vector3(0, 0, 0);
					newUp[newVal] = 1;

					smooth.enqueue(rotateGimbal, 'rotateGimbal', 600, true);

					function rotateGimbal(t) {
						camera.up.copy(oldUp)
							.lerp(newUp, t)
							.normalize();
						console.log('camera.up now ' + camera.up.toArray());

						if (t == 1) {
							var eps = 1 / 0xffffffff;
							var cross = camera.position.clone().cross(camera.up);
							if (cross.length() < eps) {
								console.log('camera.up matches camera.position, moving position a little.');

								// Random axis, to not match camera.position.
								var axis = oldUp.cross(newUp);
								camera.position.applyAxisAngle(axis, eps);
								console.log('camera.position now ' + camera.position.toArray());
							}
						}

						camera.lookAt(scope.lookingAt);
					}
				});

				/**
				 * Orbital controls: roll is always zero. I.e. camera.up==(0,1,0);
				 */
				function rotateCameraBy(dx, dy) {
					var mouse = new THREE.Vector2(dx, dy);
					var angle = mouse.length() / 300;
					mouse.normalize();

					// Always (0, 1, 0) actually, but code below doesn't depend on it.
					var up = new THREE.Vector3();
					up.copy(camera.up);

					var eye = new THREE.Vector3();
					eye.copy(camera.position);

					var axis = new THREE.Vector3();
					axis.copy(up).setLength(mouse.x);
					axis.add(up.cross(eye).setLength(mouse.y));
					//axis.add(eye.setLength(mouse.z)); // z is not needed.
					// axis is already normalized, because `mouse` is normalized.

					// Apply the changes.
					camera.position.applyAxisAngle(axis, -angle);

					// If camera.up is not locked by user, then rotate it too.
					if (!scope.up) {
						camera.up.applyAxisAngle(axis, -angle);
					}

					// Those will detect 'flip' when `eye` vector comes on the other side of `up` vector.
					// If angle between vec1 and vec2 > 90, then `flip` occurred.
					var vec1 = camera.up.clone().cross(eye);
					var vec2 = camera.up.clone().cross(camera.position);
					// `Flip` occurred.
					if (vec1.dot(vec2) < 0) {
						camera.up.negate();
						console.log('flip');
					}

					// We could also record the `flipped` state, and invert dx, then it would be very much like
					// Blender does, just we need to clear the `flipped` bit once mouse button is released.

					camera.lookAt(scope.lookingAt);
				}

				function shouldHandle(event) {
					return event.which == 3
						&& event.target.nodeName == 'CANVAS'
						&& !event.ctrlKey
						&& !event.metaKey
						&& !event.shiftKey
						;
				}
				function stopDragging(event) {
					dragging.which = null;
					dragging.x = null;
					dragging.y = null;
					//console.log('stop drag ' + event.target.nodeName + ' ' + event.eventPhase);
				}

				element.on('contextmenu', function(event) {
					if (shouldHandle(event)) {
						event.preventDefault();
					}
				});
				element.on('mousedown', function(event) {
					if (!shouldHandle(event)) return;
					event.preventDefault();

					//console.log('start drag ' + event.target.nodeName + ' ' + event.eventPhase);

					dragging.which = event.which;
					dragging.x = event.offsetX;
					dragging.y = event.offsetY;
				});

				element.on('mouseup', 'canvas', function(event) {
					if (!shouldHandle(event)) return;
					event.preventDefault();
					stopDragging(event);
				});
				element.on('mousemove', function(event) {
					if (!shouldHandle(event)) {
						if (dragging.which) stopDragging(event);
						return;
					}
					event.preventDefault();
					//console.log('MOVE ' + event.target.nodeName + ' ' + event.eventPhase);

					var dx = event.offsetX - dragging.x;
					var dy = event.offsetY - dragging.y;
					dragging.x = event.offsetX;
					dragging.y = event.offsetY;

					rotateCameraBy(dx, dy);
				});
			}
		};
	})
;
