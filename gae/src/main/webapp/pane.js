'use strict';
angular.module('me.lazerka.orbit')
	.directive('pane', function($window, GLOBAL_SCALE) {
		var renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(
			40, // fov
			1, // aspect (will be updated from element width)
			1/0xffff, // near
			100000 // far
		);

		function initBackground() {
			THREE.ImageUtils.loadTextureCube([
				'img/space/-x.jpg',
				'img/space/x.jpg',
				'img/space/y.jpg',
				'img/space/-y.jpg',
				'img/space/z.jpg',
				'img/space/-z.jpg'
			], null, function(texture) {
				var material = new THREE.MeshBasicMaterial({
					envMap: texture,
					side: THREE.BackSide
				});
				var box = new THREE.BoxGeometry(100000, 100000, 100000);
				scene.add(new THREE.Mesh(box, material));
			});
		}
		initBackground();

		var lastTime = 0;

		var stats = new Stats();
		stats.setMode(1);

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

				$('.stats', element).append(stats.domElement);

				renderLoop(0);

				var oldTime = 0;
				var dt;
				function renderLoop(time) {
					stats.begin();

					dt = time - oldTime;
					oldTime = time;

					for (var i = 0; i < scope.celestials.length; i++) {
						scope.celestials[i].onFrame(time, dt);
					}
					//scope.$broadcast('frame', time, dt);
					renderer.render(scene, camera);

					stats.end();
					$window.requestAnimationFrame(renderLoop);
				}
			},
			controller: function($scope) {
				$scope.warp = 1;
				// Celestial. So that we don't need to calculate based on direction and distance every time.
				$scope.lookingAt = null;
				// Distance between camera.position and $scope.lookingAt.
				$scope.distance = 1;
				$scope.fov = camera.fov = 70;
				$scope.celestials = [];
				$scope.up = 'y';

				camera.position.set(0, 0, $scope.distance);

				this.camera = camera;
				this.scene = scene;

				this.addCelestial = function(celestial) {
					$scope.celestials.push(celestial);
					scene.add(celestial.mesh);

					// Look at celestial at (0, 0, 0).
					if (celestial.mesh.position.length() == 0) {
						$scope.lookingAt = celestial;
						camera.lookAt($scope.lookingAt.mesh.position);
					}
				};
				this.getLookingAt = function() {
					return $scope.lookingAt;
				};
				this.getWarp = function() {
					return $scope.warp;
				};
			}
		};
	})
;
