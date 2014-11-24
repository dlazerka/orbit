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
				});

				element.prepend(renderer.domElement);

				render(0);
			},
			controller: function($scope) {
				$scope.playing = null;
				$scope.warp = 1;

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

				this.rotateCameraBy = function(dx, dy) {
					var pos = camera.position;
					pos.x -= dx*10000;
					pos.y += dy*10000;

					console.log('camera new position: ' + pos.x + '\t' + pos.y + '\t' + pos.x);

					//camera.up = new THREE.Vector3(0,1,0);
					camera.lookAt(new THREE.Vector3(0,0,0));
					render();
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

				this.setZoom = function(zoom) {
					camera.position.z = zoom;
					render();
				};
				$scope.three = {
					scene: scene,
					camera: camera,
					renderer: renderer
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
