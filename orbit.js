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
					updateTime(time);
					render();

					if (!$scope.playing) {
						return;
					}
					$window.requestAnimationFrame(renderLoop);
				}

				$scope.pause = function() {
					//$interval.cancel($scope.playing);
					$scope.playing = false;
				};


				// Orbital controls: roll is always zero. I.e. camera.up==(0,1,0);
				this.rotateCameraBy = function(dx, dy) {
					stats.begin();
					var up = new THREE.Vector3();
					up.copy(camera.up);

					var axis = new THREE.Vector3();
					axis.copy(up).setLength(dx);
					axis.add(up.cross(camera.position).setLength(dy));
					// z not needed as we keep roll zero.
					axis.normalize();

					var angle = Math.sqrt(dx*dx+dy*dy) / 300;

					var quaternion = new THREE.Quaternion();
					quaternion.setFromAxisAngle(axis, -angle);
					camera.position.applyQuaternion(quaternion);

					console.log(camera.up);

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
