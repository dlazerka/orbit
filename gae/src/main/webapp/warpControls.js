'use strict';
angular.module('me.lazerka.orbit')
	.factory('warpWatchActive', function() {
		return function(scope, element, newValue) {
			scope.$watch('active', function(newValue, oldValue) {
				var isActive = newValue === 'true';
				$('path', element).attr('fill', isActive ? 'black' : 'white');
				element.toggleClass('active', isActive);
			});
		}
	})
	.directive('warpPlay', function(warpWatchActive) {
		return {
			restrict: 'A',
			scope: { // Isolate scope.
				active: '@'
			},
			template:
				'<svg xmlns="http://www.w3.org/2000/svg" class="play" viewbox="0 0 40 60">' +
					'<path d="M0,0V60L40,30Z"/>' +
				'</svg>'
			,
			link: function(scope, element, attrs) {
				warpWatchActive(scope, element);
			}
		};
	})
	.directive('warpPause', function(warpWatchActive) {
		return {
			restrict: 'A',
			scope: { // Isolate scope.
				active: '@'
			},
			template:
				'<svg xmlns="http://www.w3.org/2000/svg" class="pause" viewBox="0 0 60 60">' +
					'<path d="M0,0V60H20V0Z"/>' +
					'<path d="M40,0V60H60V0Z"/>' +
				'</svg>',
			link: function(scope, element, attrs) {
				warpWatchActive(scope, element);
			}
		};
	})

;
