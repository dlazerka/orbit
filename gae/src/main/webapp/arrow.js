'use strict';
angular.module('me.lazerka.orbit')
	.directive('arrow', function() {
		return {
			restrict: 'E',
			scope: { // Isolate scope.
				active: '@'
			},
			template:
				'<svg xmlns="http://www.w3.org/2000/svg" class="arrow" viewbox="0 0 40 60">' +
					'<path d="M0,0V60L40,30Z" fill="white"/>' +
				'</svg>',
			link: function(scope, element, attrs, pane) {
				scope.$observe('active', function(oldValue, newValue) {
					element.attr('fill', newValue ? 'black' : 'white');
				});
			}
		};
	})
;
