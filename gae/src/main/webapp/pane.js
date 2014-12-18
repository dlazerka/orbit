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
				var material = new THREE.MeshBasicMaterial({envMap: texture});
				// Dunno why but here must be at least one negative in order to work.
				var box = new THREE.BoxGeometry(-100000, -100000, -100000);
				scene.add(new THREE.Mesh(box, material));
			});
		}
		initBackground();

		var lastTime = 0;
		var celestials = [];

		var stats = new Stats();
		stats.setMode(1);

		// TODO celestial movement
		function updateTime(time) {
			var dt = (time - lastTime) / 1000;
			lastTime = time;

			for (var i = 0; i < celestials.length; i++) {
				var celestial = celestials[i];
				celestial.mesh.rotateY(dt * Math.PI / 10);
			}
		}

		function renderLoop(time) {
			stats.begin();
			//updateTime(time);
			THREE.AnimationHandler.update(time);
			renderer.render(scene, camera);

			stats.end();
			$window.requestAnimationFrame(renderLoop);
		}

		return {
			restrict: 'E',
			link : function(scope, element, attrs) {
				scope.up = 'y';
				camera.up.set(0, 1, 0);

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
			},
			controller: function($scope) {
				$scope.warp = 1; // TODO
				// So that we don't need to calculate based on direction and distance every time.
				$scope.lookingAt = new THREE.Vector3(0, 0, 0);
				// Distance between camera.position and $scope.lookingAt.
				$scope.distance = 1;
				$scope.fov = camera.fov = 70;

				camera.lookAt($scope.lookingAt);
				camera.position.set(0, 0, $scope.distance);

				$scope.$watch('fov', function(newValue, oldValue) {
					camera.fov = newValue;
					camera.updateProjectionMatrix();
				});

				$scope.$watch('distance', function(newDistance) {
					camera.position
						.sub($scope.lookingAt)
						.setLength(newDistance / GLOBAL_SCALE)
						.add($scope.lookingAt)
					;
				});

				this.camera = camera;
				this.scene = scene;
			}
		};
	})
;
