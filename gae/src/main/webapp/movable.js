"use strict";

/**
 * Right mouse button down: camera should 1 -- move down 2 -- rotate up.
 *      So that far background points move opposite to mouse movements.
 */
angular.module('me.lazerka.orbit')
	.directive('movable', function() {
		return {
			restrict: 'A',
			require: '^pane',
			link: function(scope, element, attr, pane) {
				var dragging = {
					which: null,
					x: null,
					y: null
				};

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

					pane.rotateCameraBy(dx, dy);
				});
			}
		};
	})
;
