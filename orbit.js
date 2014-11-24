"use strict";
// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit', [])
	.directive('pane', function($window) {
		var renderer = new THREE.WebGLRenderer();
		var scene = new THREE.Scene();

		return {
			restrict: 'E',
			link : function(scope, element, attrs) {
				renderer.setSize(element.innerWidth(), element.innerHeight());

				$($window).bind('resize', function() {
					renderer.setSize(element.innerWidth(), element.innerHeight());
				});

				element.append(renderer.domElement);
			},
			controller: function($scope, $element, $interval) {
				$scope.playing = null;
				$scope.warp = 1;

				$($window).bind('resize', function() {
					// May be already digesting if hit a breakpoint in console.
					if (!$scope.$$phase) {
						$scope.$digest();
					}
				});

				$scope.position = function(orbit) {
					var x = Math.cos($scope.time / 64) * orbit / $scope.zoom;
					var left = x + $element.innerWidth() / 2;

					var y = -Math.sin($scope.time / 64) * orbit / $scope.zoom;
					var top = y + $element.innerHeight() / 2;

					return {
						left: left,
						top: top
					};
				};

				$scope.play = function() {
					$scope.playing = true;
					renderLoop(0);
				};

				$scope.pause = function() {
					//$interval.cancel($scope.playing);
					$scope.playing = false;
				};

				//var camera = new THREE.OrthographicCamera(
				//	-100, 100, -100, 100, 10, 100000);
				var camera = new THREE.PerspectiveCamera(
					30, $element.innerWidth() / $element.innerHeight(), 10, 100000000);

				var celestials = [];
				var lastTime = 0;
				function renderLoop(time) {
					if (!$scope.playing) {
						return;
					}
					var dt = (time - lastTime) / 1000;
					lastTime = time;

					renderer.render(scene, camera);
					$window.requestAnimationFrame(renderLoop);

					for (var i = 0; i < celestials.length; i++) {
						var celestial = celestials[i];

						celestial.mesh.rotateY(dt * Math.PI / 10);
						for (var j = 0; j < celestials.length; j++) {
							if (j == i) continue;
							//celestial.velocity =
						}
					}
				}

				this.addCelestial = function(mesh, position, velocity, mass) {
					mesh.position.add(position);
					mesh.rotateX(Math.PI/2);
					mesh.updateMatrix();

					celestials.push({
						mesh: mesh,
						position: position,
						velocity: velocity,
						mass: mass
					});

					scene.add(mesh);
				};

				$scope.setZoom = function(zoom) {
					camera.position.z = zoom;
				};
				$scope.three = {
					scene: scene,
					camera: camera,
					renderer: renderer
				};
				$scope.play();
			}
		};
	})
	.directive('celestial', function() {
		return {
			restrict: 'E',
			require: '^pane',
			replace: true,
			scope: {
				name: '@',
				color: '@',
				equator: '@',
				orbit: '@',
				mass: '@'
			},
			link: function(scope, element, attrs, pane) {
				var mass = Number(scope.mass);
				var radius = scope.equator / 2 / Math.PI;
				var orbit = parseInt(scope.orbit);

				var geometry = new THREE.SphereGeometry(radius, 32, 32);
				var material = new THREE.MeshBasicMaterial({
					color: parseInt(scope.color, 16),
					wireframe: true
				});
				var mesh = new THREE.Mesh(geometry, material);

				var position = {x: orbit, y: 0, z: 0};
				var velocity = {x: 0, y: 0, z: orbit ? -542.5: 0};
				pane.addCelestial(mesh, position, velocity, mass);
			}
		};
	})
;
