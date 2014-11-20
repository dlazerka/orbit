angular.module('me.lazerka.orbit', [])
	.controller('PaneController', function($scope) {


		$scope.kerbin = new Body('kerbin', 0, 0, 600000, 5.2915793e22);
		$scope.mun = new Body('mun', 12000000, 0, 200000, 9.7600236e20);

		$scope.bodies = [$scope.kerbin, $scope.mun];
	})
	.directive('celestial', function($parse) {
		return {
			restrict: 'E',
			template:
				'<svg xmlns="http://www.w3.org/2000/svg""' +
				'       class="celestial" ' +
				'       style="left: {{left()}}px; width: {{size() * 2}}px; height: {{size() * 2}}px;">' +
				'   <circle ng-attr-cx="{{size()}}" ng-attr-cy="{{size()}}" stroke-width="1px"' +
			    '       style="stroke: black; vector-effect: non-scaling-stroke; fill: {{color}};"' +
			    '       ng-attr-r="{{size() - 1}}"/>' +
			    '</svg>',
			scope: {
				name: '@',
				color: '@',
				mass: '@',
				radius: '@',
				distance: '@'
			},
			link: function($scope, $element, $attrs) {
				// Didn't get how to make `scope: {color: '=color'}` to work.

				$scope.size = function() {
					return $scope.radius / 1000;
				};

				$scope.left = function() {
					return $scope.distance / 100000 || 0;
				}
			}
		};
	})
	.directive('myMousewheel', function() {
		return {
			restrict: 'A',
			controller: function($scope){
				const zoomTable = [
						1/100, 1/75, 1/50, 1/40, 1/30, 1/20, 1/15, 1/10, 1/8, 1/5, 1/3, 1/2, 1/1.5, 1/1.25,
					1, 1.1, 1.3];
				$scope.zoom = zoomTable[8];

				$scope.onzoom = function($event) {
					if ($event.ctrlKey || $event.metaKey || $event.shiftKey) {
						return;
					}
					$event.preventDefault();

					var zoomIndex = zoomTable.indexOf($scope.zoom);

					zoomIndex += $event.originalEvent.wheelDelta / Math.abs($event.originalEvent.wheelDelta);
					zoomIndex = Math.max(zoomIndex, 0);
					zoomIndex = Math.min(zoomIndex, zoomTable.length - 1);

					$scope.zoom = zoomIndex;

					console.log('zoomIndex=' + zoomIndex + ', zoom=' + $scope.zoom);
				};
			}
		};
	})
;
