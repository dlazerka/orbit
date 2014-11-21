angular.module('me.lazerka.orbit', [])
	.controller('PaneController', function($scope, $element, $window) {

		$scope.time = 0;

		angular.element($window).bind('resize', {}, function() {
			$scope.$apply();
		});

		$scope.position = function(radius) {
			var x = Math.cos($scope.time) * radius / $scope.zoom;
			var left = x + $element.width() / 2;

			var y = Math.sin($scope.time) * radius / $scope.zoom;
			var top = y + $element.height() / 2;

			return {
				left: left + 'px',
				top: top + 'px'
			};
		};
	})
	.directive('celestial', function($parse) {
		return {
			restrict: 'E',
			template:
				'<svg xmlns="http://www.w3.org/2000/svg""' +
				'       class="celestial" ' +
				'       style="width: {{size() * 2}}px; height: {{size() * 2}}px;' +
				'' +
				'       ">' +
				'   <circle ng-attr-cx="{{size()}}" ng-attr-cy="{{size()}}" stroke-width="1px"' +
			    '       style="stroke: black; vector-effect: non-scaling-stroke; fill: {{color}};"' +
			    '       ng-attr-r="{{size()}}"/>' +
			    '</svg>',
			scope: {
				name: '@',
				color: '@',
				mass: '@',
				radius: '@'
			},
			link: function($scope, $element, $attrs) {
				// Didn't get how to make `scope: {color: '=color'}` to work.

				$scope.size = function() {
					return Math.floor($scope.radius);
				};
			}
		};
	})
	.directive('myMousewheel', function($parse) {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				var expr = $parse(attr['myMousewheel']);

				element.bind('wheel', function(event){
					scope.$apply(function() {
						expr(scope, {
							$event: event
						});
					});
				});
			},
			controller: function($scope){
				var zoomTable = [
						1000, 750, 500, 400, 300, 200, 150, 100, 80, 50, 30, 20, 15, 12.5, 10, 8, 6];
				zoomTable = zoomTable.map(function(a) {return a * 100});
				$scope.zoom = zoomTable[5];

				$scope.onzoom = function($event) {
					if ($event.ctrlKey || $event.metaKey || $event.shiftKey) {
						return;
					}
					$event.preventDefault();

					var zoomIndex = zoomTable.indexOf($scope.zoom);

					zoomIndex += $event.originalEvent.wheelDelta / Math.abs($event.originalEvent.wheelDelta);
					zoomIndex = Math.max(zoomIndex, 0);
					zoomIndex = Math.min(zoomIndex, zoomTable.length - 1);

					$scope.zoom = zoomTable[zoomIndex];

					console.log('zoomIndex=' + zoomIndex + ', zoom=' + $scope.zoom);
				};
			}
		};
	})
	/*
	.directive('resize', function ($window) {
		return function (scope, element) {
			var w = angular.element($window);
			scope.getWindowDimensions = function () {
				return { 'h': w.height(), 'w': w.width() };
			};
			scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
				scope.windowHeight = newValue.h;
				scope.windowWidth = newValue.w;

				scope.style = function () {
					return {
						'height': (newValue.h - 100) + 'px',
						'width': (newValue.w - 100) + 'px'
					};
				};

			}, true);

			w.bind('resize', function () {
				scope.$apply();
			});
		}
	})
	*/
;
