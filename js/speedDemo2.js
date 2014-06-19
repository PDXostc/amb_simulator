/*global TWEEN, Simulator, amblog */

/**
 * Operates vehicle speed and transmission shift properties using tween.js library in following manner:
 *
 * * Start with vehicle speed set to zero
 * * On gear 1 interate over `Cubic.Out` function from 0 to 20 for 10 seconds
 * * On gear 2 interate over `Cubic.Out` function from 20 to 40 for 10 seconds
 * * On gear 3 interate over `Cubic.Out` function from 40 to 60 for 10 seconds
 * * On gear 4 interate over `Cubic.Out` function from 60 to 100 for 10 seconds
 *
 * @module AMBSimulatorApplication
 * @class SpeedDemo2
 * 
 */

var intervalId = window.setInterval(function() {
	"use strict";
	TWEEN.update();
}, 50);

function getGearTween(gear, speedFrom, speedTo) {
	"use strict";
	return new TWEEN.Tween({
		speed : speedFrom
	}).to({
		speed : speedTo
	}, 10000).easing(TWEEN.Easing.Cubic.Out).onStart(function() {
		Simulator.set("vcan0", "TransmissionShiftPosition", gear, 0);
	}).onUpdate(function() {
		Simulator.set("vcan0", "VehicleSpeed", this.speed, 0);
	});
}

var firstGear = getGearTween("1", 0, 20);
var secondGear = getGearTween("2", 20, 40);
var thirdGear = getGearTween("3", 40, 60);
var fourthGear = getGearTween("4", 60, 100).onComplete(function() {
	"use strict";
	amblog("Done");
	window.clearInterval(intervalId);
});

firstGear.chain(secondGear.chain(thirdGear.chain(fourthGear))).start();