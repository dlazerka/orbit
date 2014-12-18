'use strict';
angular.module('me.lazerka.orbit')
	.directive('dolly', function(GLOBAL_SCALE, smooth) {
		var distances = [500, 350, 250, 200, 150, 100, 75, 50, 35, 25, 15, 10, 7.5, 6.25, 5, 4, 3, 2.5, 2, 1.75, 1.5]
			.map(function(a) {
				return a * 100000;
			});
		return {
			restrict: 'A',
			require: '^pane',
			link: function(scope, element, attrs, pane) {
				// Set initial distance;
				scope.distance = distances[6];

				scope.$watch('distance', function(distance) {
					pane.camera.position
						.sub(scope.lookingAt)
						.setLength(distance / GLOBAL_SCALE)
						.add(scope.lookingAt)
					;
				});

				element.bind('wheel', function(event){
					event = event.originalEvent || event;
					if (event.ctrlKey || event.metaKey || event.shiftKey) {
						return;
					}
					event.preventDefault();

					var wheelDirac = event.wheelDelta / Math.abs(event.wheelDelta);

					var i = distances.indexOf(scope.distance);
					if (i == -1) {
						i = 0;
						while(scope.distance < distances[i]) {
							i++;
						}
						if (wheelDirac < 0) {
							i--;
						}
					}
					i += wheelDirac;
					// Prevent going over the boundaries.
					if (i < 0 || i >= distances.length) {
						return;
					}

					var oldDistance = scope.distance;
					var newDistance = distances[i];

					// Make dollying smooth.
					function dolly(smoothed) {
						scope.distance = Math.round(oldDistance + (newDistance - oldDistance) * smoothed);
					}

					smooth.enqueue(dolly, 'dolly', 200);
				});
			}
		};
	})
;
