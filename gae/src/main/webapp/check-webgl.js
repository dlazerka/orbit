'use strict';
angular.module('me.lazerka.orbit')
/**
 * Logic taken from get.webgl.org.
 */
	.directive('checkWebgl', function($window) {
		return {
			link: function(scope, element, attr) {
				// Browser has no idea what WebGL is.
				scope.browserSupports = !!$window['WebGLRenderingContext'];

				var canvas = $window.document.createElement('canvas');
				//element.append(canvas);
				// Browser could not initialize WebGL. User probably needs to
				// update their drivers or get a new browser.
				scope.canvasOk = !!canvas.getContext("webgl");
			}
		};
	})
;
