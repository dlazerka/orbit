'use strict';
angular.module('me.lazerka.orbit', [])
	/**
	 * All distances will be divided by this number so that we won't get rendering issues due to loss of precision.
	 * For example, on 50,000,000m Kerbin and Mun are visible through each other.
	 * Also, space box corners become visible.
	 */
	.constant('GLOBAL_SCALE', 1000000)
;
