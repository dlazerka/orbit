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

		var lastTime = 0;
		var celestials = [];

		var stats = new Stats();
		stats.setMode(1);

		function render() {
			renderer.render(scene, camera);
		}
		function updateTime(time) {
			var dt = (time - lastTime) / 1000;
			lastTime = time;

			for (var i = 0; i < celestials.length; i++) {
				var celestial = celestials[i];

				celestial.mesh.rotateY(dt * Math.PI / 10);
				/*
				 for (var j = 0; j < celestials.length; j++) {
				 if (j == i) continue;
				 //celestial.velocity =
				 }
				 */
			}
		}

		return {
			restrict: 'E',
			link : function(scope, element, attrs) {
				renderer.setSize(element.innerWidth(), element.innerHeight());
				camera.aspect = element.innerWidth() / element.innerHeight();
				camera.updateProjectionMatrix();

				$($window).on('resize', function() {
					renderer.setSize(element.innerWidth(), element.innerHeight());
					camera.aspect = element.innerWidth() / element.innerHeight();
					camera.updateProjectionMatrix();
					render();
				});

				element.prepend(renderer.domElement);

				$('.stats', element).append(stats.domElement);

				render(0);
			},
			controller: function($scope) {
				$scope.playing = null;
				$scope.warp = 1;
				// Distance between camera and target point.
				$scope.distance = 1;
				camera.position.z = 1;

				$scope.play = function() {
					$scope.playing = true;
					renderLoop(0);
				};
				function renderLoop(time) {
					stats.begin();
					updateTime(time);
					render();

					if (!$scope.playing) {
						return;
					}
					stats.end();
					$window.requestAnimationFrame(renderLoop);
				}

				$scope.pause = function() {
					//$interval.cancel($scope.playing);
					$scope.playing = false;
				};


				/**
				 * Orbital controls: roll is always zero. I.e. camera.up==(0,1,0);
				 */
				this.rotateCameraBy = function(dx, dy) {
					stats.begin();

					var mouse = new THREE.Vector2(dx, dy);
					var angle = mouse.length() / 300;
					mouse.normalize();

					// Always (0, 1, 0) actually, but code below doesn't depend on it.
					var up = new THREE.Vector3();
					up.copy(camera.up);

					var eye = new THREE.Vector3();
					eye.copy(camera.position);

					var axis = new THREE.Vector3();
					axis.copy(up).setLength(mouse.x);
					axis.add(up.cross(eye).setLength(mouse.y));
					//axis.add(eye.setLength(mouse.z)); // z is not needed as we keep roll zero.

					// Those will prevent 'flipping' when `eye` vector comes too close to `up` vector.
					// If angle between vec1 and vec2 > 90, then flipping occurred.
					var vec1 = new THREE.Vector3();
					vec1.crossVectors(camera.up, camera.position);

					// Apply the changes.
					camera.position.applyAxisAngle(axis, -angle);

					var vec2 = new THREE.Vector3();
					vec2.crossVectors(camera.up, camera.position);

					// `Flip` occurred.
					if (vec1.dot(vec2) < 0) {
						// Put position back.
						camera.position.copy(eye);
						//console.log("flip prevented");
					}

					camera.lookAt(new THREE.Vector3(0,0,0));
					render();
					stats.end();
				};

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
					render();
				};

				this.setDistance = function(newDistance) {
					$scope.distance = newDistance;
					camera.position.setLength(newDistance);
					render();
				};
			}
		};
	})
	.directive('celestial', function() {
		return {
			restrict: 'E',
			require: '^pane',
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
				var texture = THREE.ImageUtils.loadTexture('img/kerbin.jpg');
				var material = new THREE.MeshBasicMaterial({
					color: parseInt(scope.color, 16),
					map: texture
					//wireframe: true
				});
				var mesh = new THREE.Mesh(geometry, material);

				var position = {x: orbit, y: 0, z: 0};
				var velocity = {x: 0, y: 0, z: orbit ? -542.5: 0};
				pane.addCelestial(mesh, position, velocity, mass);
			}
		};
	})
;
