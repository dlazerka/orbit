"use strict";
// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit', [])
	.directive('pane', function($window) {
		var renderer = new THREE.WebGLRenderer({alpha: true});
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(
			30, // fov
			1, // aspect
			10, // near
			100000000 // far
		);

		return {
			restrict: 'E',
			link : function(scope, element, attrs) {
				renderer.setSize(element.innerWidth(), element.innerHeight());
				camera.aspect = element.innerWidth() / element.innerHeight();
				camera.updateProjectionMatrix();

				$($window).bind('resize', function() {
					renderer.setSize(element.innerWidth(), element.innerHeight());
					camera.aspect = element.innerWidth() / element.innerHeight();
					camera.updateProjectionMatrix();
				});

				element.append(renderer.domElement);
			},
			controller: function($scope, $element, $interval) {
				$scope.playing = null;
				$scope.warp = 1;

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
