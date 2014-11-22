// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit', [])
	.directive('pane', function($window) {
		return {
			restrict: 'E',
			link : function(scope, element, attrs) {

				var renderer = new THREE.WebGLRenderer();
				renderer.setSize(element.innerWidth(), element.innerHeight());
				element.append(renderer.domElement);

				$($window).bind('resize', function() {
					renderer.setSize(element.innerWidth(), element.innerHeight());
				});

				scope.three = {
					scene: new THREE.Scene(),
					camera: new THREE.PerspectiveCamera(75, element.innerWidth() / element.innerHeight(), 0.1, 1000),
					renderer: renderer
				};
			},
			controller: function($scope, $element, $interval) {
				$scope.time = 0;
				$scope.playing = null;

				$($window).bind('resize', function() {
					$scope.$apply();
				});

				$scope.left = function(orbit) {
					var x = Math.cos($scope.time) * orbit / $scope.zoom;
					var left = x + $element.innerWidth() / 2;
					return left;
				};
				$scope.top = function(orbit) {
					var y = -Math.sin($scope.time) * orbit / $scope.zoom;
					var top = y + $element.innerHeight() / 2;
					return top;
				};

				$scope.play = function() {
					if ($scope.playing) {
						return;
					}
					// Very inefficient.
					$scope.playing = $interval(function() {
						$scope.time += 1 / 256;
					}, 4);
				};

				$scope.pause = function() {
					$interval.cancel($scope.playing);
					$scope.playing = null;
				};

				$scope.zoom2 = function() {
					console.log(arguments);
				}
			}
		};
	})
	.directive('celestial', function() {
		return {
			restrict: 'E',
			require: '^pane',
			replace: true,
			template: function() {
				return '<svg xmlns="http://www.w3.org/2000/svg" class="celestial"' +
				'       ng-attr-width="{{radius * 2}}" ng-attr-height="{{radius * 2}}">' +
				'   <circle ng-attr-cx="{{radius}}" ng-attr-cy="{{radius}}"' +
				'       stroke-width="1px"' +
			    '       style="stroke: black; vector-effect: non-scaling-stroke; fill: {{color}};"' +
			    '       ng-attr-r="{{radius - 1}}"/>' +
			    '</svg>'},
			scope: {
				name: '@',
				zoom: '@',
				color: '@',
				mass: '@',
				radius: '@',
				left: '@',
				top: '@'
			},
			link: function(scope, element, attrs, pane) {
				scope.mass = Number(scope.mass);
				scope.radius = Number(scope.radius);

				scope.$watch('zoom', function(value) {
					scope.radius = attrs.radius / value;
					element.css('top', Math.floor(scope.top - scope.radius) + 'px');
					element.css('left', Math.floor(scope.left - scope.radius) + 'px');
				});
				scope.$watch('top', function(value) {
					element.css('top', Math.floor(value - scope.radius) + 'px');
				});
				scope.$watch('left', function(value) {
					element.css('left', Math.floor(value - scope.radius) + 'px');
				});
			}
		};
	})
	.directive('onMousewheel', function($parse) {
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
			controller: function($scope){
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
			}
		};
	})
;
