// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit', [])
	.controller('PaneController', ['$scope', '$element', '$window', '$interval',
	function($scope, $element, $window, $interval) {
		$window = $($window);
		$element = $($element);

		$scope.time = 0;
		$scope.playing = null;

		$window.bind('resize', function() {
			$scope.$apply();
		});

		$scope.position = function(orbit, radius) {
			var x = Math.cos($scope.time) * orbit / $scope.zoom;
			var left = x + $element.width() / 2 - radius;

			var y = -Math.sin($scope.time) * orbit / $scope.zoom;
			var top = y + $element.height() / 2 - radius;

			return {
				left: Math.round(left) + 'px',
				top: Math.round(top) + 'px'
			};
		};

		$scope.play = function() {
			if ($scope.playing) {
				return;
			}
			// Very inefficient.
			$scope.playing = $interval(function() {
				$scope.time += 1/256;
			}, 4);
		};

		$scope.pause = function() {
			$interval.cancel($scope.playing);
			$scope.playing = null;
		};
	}])
	.directive('celestial', [function() {
		return {
			restrict: 'E',
			template:
				'<svg xmlns="http://www.w3.org/2000/svg""' +
				'       ng-attr-width="{{radius * 2}}" ng-attr-height="{{radius * 2}}">' +
				'   <circle ng-attr-cx="{{radius}}" ng-attr-cy="{{radius}}"' +
				'       stroke-width="1px"' +
			    '       style="stroke: black; vector-effect: non-scaling-stroke; fill: {{color}};"' +
			    '       ng-attr-r="{{radius - 1}}"/>' +
			    '</svg>',
			scope: {
				name: '@',
				color: '@',
				mass: '@',
				radius: '@'
			},
			link: function(scope, element, attrs) {
				scope.mass = Number(scope.mass);
				scope.radius = Number(scope.radius);
			}
		};
	}])
	.directive('onMousewheel', ['$parse', function($parse) {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				var expr = $parse(attr['onMousewheel']);

				element.bind('wheel', function(event){
					scope.$apply(function() {
						expr(scope, {
							$event: event
						});
					});
				});
			},
			controller: ['$scope', function($scope){
				var zoomTable = [1000, 750, 500, 400, 300, 200, 150, 100, 80, 50, 30, 20, 15, 12.5, 10, 8, 6]
					.map(function(a) {
						return a * 100;
					});
				$scope.zoom = zoomTable[5];

				$scope.onzoom = function($event) {
					var event = $event.originalEvent || $event; // jsFiddle puts original event into $event already.
					if (event.ctrlKey || event.metaKey || event.shiftKey) {
						return;
					}
					event.preventDefault();

					var zoomIndex = zoomTable.indexOf($scope.zoom);

					zoomIndex += event.wheelDelta / Math.abs(event.wheelDelta);
					zoomIndex = Math.max(zoomIndex, 0);
					zoomIndex = Math.min(zoomIndex, zoomTable.length - 1);

					$scope.zoom = zoomTable[zoomIndex];
				};
			}]
		};
	}])
;
