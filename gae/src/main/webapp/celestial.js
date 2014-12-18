'use strict';
angular.module('me.lazerka.orbit')
	.directive('celestial', function(GLOBAL_SCALE) {
		return {
			restrict: 'E',
			require: '^pane',
			scope: {
				textureUrl: '@',
				equator: '@',
				orbit: '@',
				mass: '@'
			},
			link: function(scope, element, attrs, pane) {
				var mass = Number(scope.mass);
				var radius = scope.equator / 2 / Math.PI / GLOBAL_SCALE;
				var orbit = parseInt(scope.orbit) / GLOBAL_SCALE;

				var geometry = new THREE.SphereGeometry(radius, 32, 32);
				var texture = THREE.ImageUtils.loadTexture(scope.textureUrl, null, onTextureLoaded);

				var material = new THREE.MeshBasicMaterial({
					map: texture
					//wireframe: true
				});
				var mesh = new THREE.Mesh(geometry, material);

				var position = {x: orbit, y: 0, z: 0};
				var velocity = {x: 0, y: 0, z: orbit ? -542.5: 0};

				function onTextureLoaded() {
					mesh.position.copy(position);

					var celestial = {
						mesh: mesh,
						velocity: velocity,
						mass: mass,
						textureUrl: scope.textureUrl
					};

					pane.addCelestial(celestial);
				}

				var yAxis = new THREE.Vector3(0, 1, 0);
				//var angle = 1 / 400;
				var angle = 0;
				scope.$on('frame', function(event) {
					mesh.rotateY(angle);
					if (orbit) {
						mesh.position.applyAxisAngle(yAxis, angle);
					}
				});
			}
		};
	})
;
