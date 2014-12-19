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
				var celestial = {
					mesh: mesh,
					textureUrl: scope.textureUrl
				};

				pane.addCelestial(celestial);

				var yAxis = new THREE.Vector3(0, 1, 0);
				var oldPosition = new THREE.Vector3();
				scope.$on('frame', function(event, time) {
					var timeS = pane.getWarp() * time / 1000;

					// Rotate texture.
					var rotationAngle = timeS * 2*Math.PI / scope.rotationPeriod;
					mesh.setRotationFromAxisAngle(yAxis, rotationAngle);

					// Move on orbit.
					if (scope.orbitalVelocity) {
						oldPosition.copy(mesh.position);

						var orbitalAngle = timeS * scope.orbitalVelocity / scope.orbit;
						mesh.position.set(scope.orbit, 0, 0);
						mesh.position.applyAxisAngle(yAxis, orbitalAngle);

						if (pane.getLookingAt().mesh === mesh) {
							pane.camera.position.sub(oldPosition.sub(mesh.position));
							pane.camera.updateProjectionMatrix();
						}
					}
				});
			}
		};
	})
;
