/*global Simulator, async */

/**
 * Script operates head lights, parking lights and child lock status using async.js library in following sequence:
 * 
 * * wait for 2 seconds
 * * turn on head lights and wait 1 second
 * * turn on parking lights and wait 1 second
 * * turn on child locks and wait 1 second
 * * turn off head lights and wait 1 second
 * * turn off parking lights and wait 1 second
 * * turn off child locks and wait 1 second
 *
 * @module AMBSimulatorApplication
 * @class LightsDemo
 */

var properties = [ "LightHead", "LightParking", "ChildLockStatus" ];

async.series([ function(startTimeout) {
	"use strict";
	window.setTimeout(startTimeout, 2000);
}, function(turnOnCallback) {
	"use strict";
	async.eachSeries(properties, function(item, cb) {
		Simulator.set("vcan0", item, true, 0);
		window.setTimeout(cb, 1000);
	}, turnOnCallback);
}, function(turnOffCallback) {
	"use strict";
	async.eachSeries(properties, function(item, cb) {
		Simulator.set("vcan0", item, false, 0);
		window.setTimeout(cb, 1000);
	}, turnOffCallback);
} ]);