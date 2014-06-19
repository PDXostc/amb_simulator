/*global Simulator*/

/**
 * Operates vehicle speed and transmission shift properties in following manner:
 *
 * * Start with vehicle speed set to zero
 * * Add 5 mph to speed each 1 second
 * * Change transmission shift position base on speed:
 *    * Gear 1 - speed within interval 0 and 20
 *    * Gear 2 - speed within interval 20 and 40
 *    * Gear 3 - speed within interval 40 and 60
 *    * Gear 4 - speed over 60
 *
 * @module AMBSimulatorApplication
 * @class SpeedDemo
 */

var speed, rpm, gear, interval;

speed = 0;

interval = setInterval(function() {
	"use strict";
	if (speed < 200) {
		speed += 5;
	} else {
		clearInterval(interval);
	}

	Simulator.set("vcan0", "VehicleSpeed", speed, 0);

	if (speed <= 20) {
		gear = 1;
	} else if (speed > 20 && speed <= 40) {
		gear = 2;
	} else if (speed > 40 && speed <= 60) {
		gear = 3;
	} else if (speed > 60) {
		gear = 4;
	}

	Simulator.set("vcan0", "TransmissionShiftPosition", gear, 0);

}, 1000);