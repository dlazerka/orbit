"use strict";
// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit', [])
	.directive('pane', function($window) {
		return {
			restrict: 'E',
			link : function(scope, element, attrs) {
				var renderer = scope.three.renderer;
				renderer.setSize(element.innerWidth(), element.innerHeight());

				$($window).bind('resize', function() {
					renderer.setSize(element.innerWidth(), element.innerHeight());
				});

				element.append(renderer.domElement);
			},
			controller: function($scope, $element, $interval) {
				$scope.time = 0;
				$scope.playing = null;


				$($window).bind('resize', function() {
					// May be already digesting if hit a breakpoint in console.
					if (!$scope.$$phase) {
						$scope.$digest();
					}
				});

				$scope.left = function(orbit) {
					var x = Math.cos($scope.time / 64) * orbit / $scope.zoom;
					var left = x + $element.innerWidth() / 2;
					return left;
				};
				$scope.top = function(orbit) {
					var y = -Math.sin($scope.time / 64) * orbit / $scope.zoom;
					var top = y + $element.innerHeight() / 2;
					return top;
				};

				$scope.play = function() {
					if ($scope.playing) {
						return;
					}
					// Very inefficient.
					$scope.playing = $interval(function() {
						$scope.time += 1 / 4;
					}, 4);
				};

				$scope.pause = function() {
					$interval.cancel($scope.playing);
					$scope.playing = null;
				};

				$scope.three = {
					scene: new THREE.Scene(),
					camera: new THREE.PerspectiveCamera(75, $element.innerWidth() / $element.innerHeight(), 0.1, 1000),
					renderer: new THREE.WebGLRenderer()
				};

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
				'       ng-attr-width="{{scaledRadius * 2}}" ng-attr-height="{{scaledRadius * 2}}">' +
				'   <circle ng-attr-cx="{{scaledRadius}}" ng-attr-cy="{{scaledRadius}}"' +
				'       stroke-width="1px"' +
			    '       style="stroke: black; vector-effect: non-scaling-stroke; fill: {{color}};"' +
			    '       ng-attr-r="{{scaledRadius - 1}}"/>' +
			    '</svg>'},
			scope: {
				name: '@',
				zoom: '&',
				color: '@',
				left: '@',
				top: '@'
			},
			link: function(scope, element, attrs, pane) {
				var mass = Number(attrs.mass);
				var radius = Number(attrs.radius);
				scope.scaledRadius = 1;

				function getZoomAndPosition(scope2) {
					return scope2.zoom() + '_' + scope.top + '_' + scope.left;
				}

				scope.$watch(getZoomAndPosition, function(value) {
					scope.scaledRadius = radius / scope.zoom();

					element.css({
						'top': Math.floor(scope.top - scope.scaledRadius) + 'px',
						'left': Math.floor(scope.left - scope.scaledRadius) + 'px'
					});
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
