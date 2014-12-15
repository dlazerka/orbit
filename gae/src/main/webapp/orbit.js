'use strict';
// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit', [])
	/**
	 * All distances will be divided by this number so that we won't get rendering issues due to loss of precision.
	 * For example, on 50m Kerbin and Mun are visible through each other.
	 */
	.constant('GLOBAL_SCALE', 100000)
	.directive('pane', function($window) {
		var renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(
			40, // fov
			1, // aspect (will be updated from element width)
			1, // near
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
				// Couldn't make shader work :(.
				//var shader = THREE.ShaderLib['cube'];
				//var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
				//uniforms['tCube'].texture = texture;
				//var shaderMaterial = new THREE.ShaderMaterial({
				//	fragmentShader: shader.fragmentShader,
				//	vertexShader: shader.vertexShader,
				//	uniforms: uniforms
				//});

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

				scope.$watch('lookingAt', function(newVal, oldVal) {
					camera.lookAt(newVal);
				});

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
				$scope.warp = 1;
				// Distance between camera and target point.
				$scope.distance = 1;
				$scope.lookingAt = new THREE.Vector3(0, 0, 0);

				camera.position.set(0, 0, 1);

				this.getCamera = function() {
					return camera;
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
				};

				this.setDistance = function(newDistance) {
					camera.position.setLength(newDistance);
				};
			}
		};
	})
	.directive('celestial', function(GLOBAL_SCALE) {
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
				var radius = scope.equator / 2 / Math.PI / GLOBAL_SCALE;
				var orbit = parseInt(scope.orbit) / GLOBAL_SCALE;

				var geometry = new THREE.SphereGeometry(radius, 32, 32);
				var texture = THREE.ImageUtils.loadTexture('img/' + scope.name + '.jpg', null, onTextureLoaded);

				var material = new THREE.MeshBasicMaterial({
					map: texture
					//wireframe: true
				});
				var mesh = new THREE.Mesh(geometry, material);

				var position = {x: orbit, y: 0, z: 0};
				var velocity = {x: 0, y: 0, z: orbit ? -542.5: 0};

				function onTextureLoaded() {
					pane.addCelestial(mesh, position, velocity, mass);
				}
			}
		};
	})
;
