"use strict";
// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit')
	.directive('onZoom', function() {
		var zoomTable = [1000, 750, 500, 400, 300, 200, 150, 100, 80, 50, 30, 20, 15, 12.5, 10, 8, 6]
			.map(function(a) {
				return a * 100000;
			});
		return {
			restrict: 'A',
			scope: {
				'onZoom': '&'
			},
			link: function(scope, element, attr) {
				var zoom = zoomTable[8];

				// Set initial zoom;
				scope.onZoom()(zoom);

				element.bind('wheel', function(event){
					event = event.originalEvent || event; // jsFiddle puts original event into $event already.
					if (event.ctrlKey || event.metaKey || event.shiftKey) {
						return;
					}
					event.preventDefault();

					var zoomIndex = zoomTable.indexOf(zoom);

					zoomIndex += event.wheelDelta / Math.abs(event.wheelDelta);
					zoomIndex = Math.max(zoomIndex, 0);
					zoomIndex = Math.min(zoomIndex, zoomTable.length - 1);

					zoom = zoomTable[zoomIndex];

					scope.$apply(function() {
						scope.onZoom()(zoom);
					});
				});
			}
		};
	})
;
