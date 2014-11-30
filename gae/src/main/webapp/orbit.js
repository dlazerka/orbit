"use strict";
// $(foo) is done for jsFiddle, it has problems loading jQuery right.
angular.module('me.lazerka.orbit', [])
	/**
	 * All distances will be divided by this number so that we won't get rendering issues due to loss of precision.
	 * For example, on 50m Kerbin and Mun are visible through each other.
	 */
	.constant('GLOBAL_SCALE', 100000)
	.directive('pane', function($window, GLOBAL_SCALE) {
		var renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(
			70, // fov
			1, // aspect (will be updated from element width)
			1, // near
			100000 // far
		);

		function initBackground() {
			var texture = THREE.ImageUtils.loadTextureCube([
				'img/space/-x.jpg',
				'img/space/x.jpg',
				'img/space/y.jpg',
				'img/space/-y.jpg',
				'img/space/z.jpg',
				'img/space/-z.jpg'
			], null, render);

			// Couldn't make shader work :(.
			//var shader = THREE.ShaderLib["cube"];
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
		}
		initBackground();

		//var camera = new THREE.CubeCamera(10, 100000000, 1024);

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
				scope.up = 'y';
				camera.up.set(0, 1, 0);
				scope.$watch('up', function(newVal, oldVal) {
					if (newVal) {
						camera.up.set(0, 0, 0);
						camera.up[newVal] = 1;
						console.log('camera.up now ' + camera.up.toArray());

						var eps = 1 / 0xffffffff;
						var cross = camera.position.clone().cross(camera.up);
						if (cross.length() < eps) {
							console.log('camera.up matches with camera.z, moving a little');
							var axis = new THREE.Vector3(Math.SQRT1_2, Math.SQRT1_2, 0);
							camera.position.applyAxisAngle(axis, eps);
							console.log('camera.position now ' + camera.position.toArray());
						}
					}

					camera.lookAt(new THREE.Vector3(0,0,0));
					render();
				});

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

				camera.position.set(0, 0, 1);

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
					// Already normalized, because `mouse` is normalized.

					// Those will prevent 'flipping' when `eye` vector comes too close to `up` vector.
					// If angle between vec1 and vec2 > 90, then flipping occurred.
					var vec1 = new THREE.Vector3();
					vec1.crossVectors(camera.up, camera.position);

					// Apply the changes.
					camera.position.applyAxisAngle(axis, -angle);

					// If camera.up is not locked by user, then rotate it too.
					if (!$scope.up) {
						camera.up.applyAxisAngle(axis, -angle);
					}

					var vec2 = new THREE.Vector3();
					vec2.crossVectors(camera.up, camera.position);

					// `Flip` occurred.
					if (vec1.dot(vec2) < 0) {
						// Put position back.
						camera.position.copy(eye);
						// Move only along mouse.x
						up.copy(camera.up).multiplyScalar(mouse.x).normalize();
						camera.position.applyAxisAngle(up, -angle);

						//console.log("flip prevented");
					}

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

				this.setDistance = function(newDistance) {
					$scope.distance = newDistance * GLOBAL_SCALE;
					camera.position.setLength(newDistance);
					render();
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

				var geometry = new THREE.SphereGeometry(radius, 38, 38);
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
