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
				//camera.up.set(0, 1, 0);

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

				function renderLoop(time) {
					stats.begin();

					scope.$broadcast('frame', time);
					renderer.render(scene, camera);

					stats.end();
					$window.requestAnimationFrame(renderLoop);
				}
			},
			controller: function($scope) {
				$scope.warp = 1; // TODO
				// So that we don't need to calculate based on direction and distance every time.
				$scope.lookingAt = new THREE.Vector3(0, 0, 0);
				// Distance between camera.position and $scope.lookingAt.
				$scope.distance = 1;
				$scope.fov = camera.fov = 70;
				$scope.celestials = [];
				$scope.up = 'y';

				camera.lookAt($scope.lookingAt);
				camera.position.set(0, 0, $scope.distance);

				this.camera = camera;
				this.scene = scene;

				this.addCelestial = function(celestial) {
					$scope.celestials.push(celestial);
					scene.add(celestial.mesh);
				}
			}
		};
	})
;
