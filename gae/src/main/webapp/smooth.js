'use strict';
angular.module('me.lazerka.orbit')
	.factory('smooth', function($timeout) {
		// Map of queue names to queue counter.
		var queues = {};

		function run(callback, d, queue, expectedCounter) {
			if (expectedCounter != queues[queue]) {
				// Superseded by another execution.
				return;
			}

			// Cubic Bezier of ((0, 0), (1, 0), (0, 1), (1, 1)), y-coordinate.
			var smoothed = THREE.Shape.Utils.b3(d, 0, 0, 1, 1);
			callback(smoothed);
		}

		/**
		 * Makes something to happen `ticksNum` times over course of `durationMs`.
		 * Callback will be called with one number [0, 1] how much of the task is done.
		 *
		 * Subsequent calls will cancel all scheduled runs for given `queue`.
		 * @param callback {Function}
		 * @param queue {String} queue name.
		 * @param durationMs {Number}
		 * @param suppressDigest {Boolean?} whether to disable Angular dirty-checks on each call, default false.
		 */
		function enqueue(callback, queue, durationMs, suppressDigest) {
			if (durationMs <= 20) {
				throw new Error('durationMs must be more than 20ms');
			}
			var ticksNum = Math.ceil(durationMs / 20);

			queues[queue] = queues[queue] || 0;
			queues[queue]++;

			// <= to
			for (var tick = 1; tick <= ticksNum ; tick++) {
				var d = tick / ticksNum;
				var f = run.bind(this, callback, d, queue, queues[queue]);
				$timeout(f, d * durationMs, !suppressDigest);
			}
		}

		return {
			enqueue: enqueue
		}
	})
;
