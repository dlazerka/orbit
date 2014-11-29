"use strict";
angular.module('me.lazerka.orbit')
	.directive('zoomable', function() {
		var distances = [500, 400, 300, 200, 150, 100, 80, 50, 30, 20, 15, 12.5, 10, 8, 6, 5, 4]
			.map(function(a) {
				return a * 100000;
			});
		return {
			restrict: 'A',
			require: '^pane',
			link: function(scope, element, attrs, pane) {
				var distance = distances[6];

				// Set initial distance;
				pane.setDistance(distance);

				element.bind('wheel', function(event){
					event = event.originalEvent || event; // jsFiddle puts original event into $event already.
					if (event.ctrlKey || event.metaKey || event.shiftKey) {
						return;
					}
					event.preventDefault();

					var zoomIndex = distances.indexOf(distance);

					zoomIndex += event.wheelDelta / Math.abs(event.wheelDelta);
					zoomIndex = Math.max(zoomIndex, 0);
					zoomIndex = Math.min(zoomIndex, distances.length - 1);

					distance = distances[zoomIndex];

					pane.setDistance(distance);
					scope.$digest();
				});
			}
		};
	})
;
