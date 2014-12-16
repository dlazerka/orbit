'use strict';
angular.module('me.lazerka.orbit')
	/**
	 * Makes something to happen several times (every 20ms) over the course of `durationMs`.
	 * Callback will be called with just one number [0, 1] -- how much of the task is done.
	 *
	 * Subsequent calls will cancel all scheduled runs for given `queue`.
	 *
	 * @param callback {Function}
	 * @param queue {String} queue name.
	 * @param durationMs {Number}
	 * @param suppressDigest {Boolean?} whether to disable Angular dirty-checks on each call, default false.
	 */
	.factory('smooth', function($timeout) {
		// Map of queue names to queue counter.
		var queues = {};

		// 4ms minimum per HTML5 spec.
		var BETWEEN_MS = 20;

		function run(callback, tick, ticksNum, queue, expectedCounter) {
			if (expectedCounter != queues[queue]) {
				// Superseded by another execution.
				return;
			}

			// Cubic Bezier of ((0, 0), (1, 0), (0, 1), (1, 1)), y-coordinate.
			var delta = THREE.Shape.Utils.b3(tick / ticksNum, 0, 0, 1, 1);
			var deltaPrev = THREE.Shape.Utils.b3((tick - 1) / ticksNum, 0, 0, 1, 1);
			callback(delta, deltaPrev);
		}

		return {
			enqueue: function (callback, queue, durationMs, suppressDigest) {
				if (durationMs <= BETWEEN_MS) {
					throw new Error('durationMs must be more than 20ms');
				}

				var ticksNum = Math.ceil(durationMs / BETWEEN_MS);

				queues[queue] = queues[queue] || 0;
				queues[queue]++;

				for (var tick = 1; tick <= ticksNum ; tick++) {
					var f = run.bind(this, callback, tick, ticksNum, queue, queues[queue]);
					$timeout(f, durationMs * tick / ticksNum, !suppressDigest);
				}
			}
		}
	})
;
