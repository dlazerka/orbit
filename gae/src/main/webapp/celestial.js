'use strict';
angular.module('me.lazerka.orbit')
	.directive('celestial', function(GLOBAL_SCALE) {
		return {
			restrict: 'E',
			require: '^pane',
			scope: {}, // Isolate scope.
			link: function(scope, element, attrs, pane) {
				scope.textureUrl = attrs.textureUrl;
				scope.mass = Number(attrs.mass);
				scope.radius = Number(attrs.equator) / 2 / Math.PI / GLOBAL_SCALE;
				scope.orbit = Number(attrs.orbit) / GLOBAL_SCALE;
				scope.orbitalVelocity = Number(attrs.orbitalVelocity) / GLOBAL_SCALE;
				scope.rotationPeriod = Number(attrs.rotationPeriod);

				var geometry = new THREE.SphereGeometry(scope.radius, 32, 32);
				var texture = THREE.ImageUtils.loadTexture(scope.textureUrl, null, null);

				var material = new THREE.MeshBasicMaterial({
					map: texture
					//wireframe: true
				});
				var mesh = new THREE.Mesh(geometry, material);
				mesh.position.copy({x: scope.orbit, y: 0, z: 0});

				var yAxis = new THREE.Vector3(0, 1, 0);
				var oldPosition = new THREE.Vector3();
				var onFrame = function(time, dt) {
					var dtS = pane.getWarp() * time / 10000;

					// Rotate texture.
					var rotationAngle = dtS * 2 * Math.PI / scope.rotationPeriod;
					mesh.rotateOnAxis(yAxis, rotationAngle);

					// Move on orbit.
					if (scope.orbitalVelocity) {
						oldPosition.copy(mesh.position);

						var orbitalAngle = dtS * scope.orbitalVelocity / scope.orbit;
						//mesh.position.set($scope.orbit, 0, 0);
						mesh.position.applyAxisAngle(yAxis, orbitalAngle);

						if (pane.getLookingAt().mesh === mesh) {
							pane.camera.position.sub(oldPosition.sub(mesh.position));
							pane.camera.updateProjectionMatrix();
						}
					}
				};

				var celestial = {
					mesh: mesh,
					textureUrl: scope.textureUrl,
					onFrame : onFrame
				};

				pane.addCelestial(celestial);
			}
		}
	})
;
