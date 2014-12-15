'use strict';
angular.module('me.lazerka.orbit')
	.directive('zoomable', function(GLOBAL_SCALE, smooth) {
		var distances = [500, 350, 250, 200, 150, 100, 75, 50, 35, 25, 15, 10, 7.5, 6.25, 5, 4, 3, 2.5, 2, 1.75, 1.5]
			.map(function(a) {
				return a * 100000;
			});
		return {
			restrict: 'A',
			require: '^pane',
			link: function(scope, element, attrs, pane) {
				scope.distance = distances[6];

				// Set initial distance;
				pane.setDistance(scope.distance / GLOBAL_SCALE);

				var currentQueue = 0;

				element.bind('wheel', function(event){
					event = event.originalEvent || event; // jsFiddle puts original event into $event already.
					if (event.ctrlKey || event.metaKey || event.shiftKey) {
						return;
					}
					event.preventDefault();

					var wheelDirac = event.wheelDelta / Math.abs(event.wheelDelta);

					var zoomIndex = distances.indexOf(scope.distance);
					if (zoomIndex == -1) {
						zoomIndex = 0;
						while(scope.distance < distances[zoomIndex]) {
							zoomIndex++;
						}
						if (wheelDirac < 0) {
							zoomIndex--;
						}
					}
					zoomIndex += wheelDirac;
					// Prevent going over the boundaries.
					if (zoomIndex < 0 || zoomIndex >= distances.length) {
						return;
					}

					var oldDistance = scope.distance;
					var newDistance = distances[zoomIndex];

					// Make dollying smooth.
					function dolly(smoothed) {
						scope.distance = Math.round(oldDistance + (newDistance - oldDistance) * smoothed);
						pane.setDistance(scope.distance / GLOBAL_SCALE);
					}

					smooth.enqueue(dolly, 'zoomable', 200);
				});
			}
		};
	})
;
