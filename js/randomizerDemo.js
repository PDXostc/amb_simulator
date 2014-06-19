/*global Simulator, TWEEN */

/**
 * Script operates all indicators that are present in Dashboard application:
 *
 * * Vehicle speed similar as {{#crossLink "SpeedDemo2"}}speedDemo2{{/crossLink}}
 * * Transmission gear similar as {{#crossLink "SpeedDemo2"}}speedDemo2{{/crossLink}}
 * * Battery status same as {{#crossLink "BatteryDemo"}}batteryDemo{{/crossLink}}
 * * Exterior brightness same as {{#crossLink "BatteryDemo"}}batteryDemo{{/crossLink}}
 * * Head, parking lights
 * * Front wheel radius
 * * Child lock status
 * * Exterior temperature
 * * Tire pressure same as {{#crossLink "TirePressureDemo"}}tirePressureDemo{{/crossLink}}
 *
 * @module AMBSimulatorApplication
 * @class RandomizerDemo
 */

setInterval(function() {
	"use strict";
	TWEEN.update();
}, 200);

//gear & speed
var neutralGear, firstGear, secondGear, thirdGear, fourthGear;

function getGearTween(time, gear, speedFrom, speedTo) {
	"use strict";
	return new TWEEN.Tween({
		speed : speedFrom
	}).to({
		speed : speedTo
	}, time).onStart(function() {
		Simulator.set("vcan0", "TransmissionShiftPosition", gear, 0);
	}).onUpdate(function() {
		Simulator.set("vcan0", "VehicleSpeed", this.speed, 0);
	});
}
neutralGear = getGearTween(3000, "0", 0, 0).onComplete(function() {
	"use strict";
	firstGear = getGearTween(2000, "1", 0, 20);
	secondGear = getGearTween(3000, "2", 20, 40);
	thirdGear = getGearTween(4000, "3", 40, 60);
	fourthGear = getGearTween(5000, "4", 60, 100).onComplete(function() {
		firstGear = getGearTween(2000, "1", 20, 0);
		secondGear = getGearTween(3000, "2", 40, 20);
		thirdGear = getGearTween(4000, "3", 60, 40);
		fourthGear = getGearTween(5000, "4", 100, 60);
		fourthGear.chain(thirdGear.chain(secondGear.chain(firstGear.chain(neutralGear)))).start();
	});

	firstGear.chain(secondGear.chain(thirdGear.chain(fourthGear))).start();
});

neutralGear.start();

// battery level && exterior Brightness
var batteryStatus, exteriorBrightness, headLights, parkingLights;

batteryStatus = new TWEEN.Tween({
	battery : 100
}).to({
	battery : 0
}, 10000).easing(TWEEN.Easing.Cubic.Out).onUpdate(function() {
	"use strict";
	Simulator.set("vcan0", "BatteryStatus", this.battery, 0);
}).repeat('Infinity').yoyo(true).start();

exteriorBrightness = new TWEEN.Tween({
	brightness : 5000
}).to({
	brightness : 0
}, 10000).onUpdate(function() {
	"use strict";
	if (this.brightness < 2000 && !headLights) {
		headLights = true;
		parkingLights = true;
		Simulator.set("vcan0", "LightHead", headLights, 0);
		Simulator.set("vcan0", "LightParking", parkingLights, 0);
	} else if (this.brightness >= 2000 && headLights) {
		headLights = false;
		parkingLights = false;
		Simulator.set("vcan0", "LightHead", headLights, 0);
		Simulator.set("vcan0", "LightParking", parkingLights, 0);
	}
	Simulator.set("vcan0", "ExteriorBrightness", this.brightness, 0);
}).repeat('Infinity').yoyo(true).start();

// front wheel radius
var frontWheelRadius;

frontWheelRadius = new TWEEN.Tween({
	radius : 1
}).to({
	radius : 359
}, 5000).onUpdate(function() {
	"use strict";
	Simulator.set("vcan0", "SteeringWheelAngle", this.radius, 0);
}).repeat('Infinity').yoyo(true).start();

// head lights, parking lights, childlock, exterior temperature, weather
var childLock, extTemp, rand;

parkingLights = false;
childLock = false;
extTemp = 30;
function setRandomValues() {
	"use strict";
	rand = Math.random();
	if (!headLights) {
		parkingLights = !parkingLights;
		Simulator.set("vcan0", "LightParking", parkingLights, 0);
	}
	extTemp = Math.floor(rand * 7) + (extTemp - 3);
	extTemp = (extTemp < -21)? -21 : extTemp;
	extTemp = (extTemp > 45)? 45 : extTemp;
	Simulator.set("vcan0", "ExteriorTemperature", extTemp, 0);
	Simulator.set("vcan0", "InteriorTemperature", extTemp+10, 0);
	Simulator.set("vcan0", "Weather", Math.floor(rand * 3), 0);
	childLock = !childLock;
	Simulator.set("vcan0", "ChildLockStatus", childLock, 0);
	setTimeout(setRandomValues, Math.floor(rand * 9500) + 500);
}
setRandomValues();

//tire 
var tirePressure;

tirePressure = new TWEEN.Tween({
	pressure: 0
}).to({
	pressure: 3
}, 5000).easing(TWEEN.Easing.Cubic.InOut).onUpdate(function() {
	"use strict";
	Simulator.set("vcan0", "TirePressureLeftFront", this.pressure, 0);
	Simulator.set("vcan0", "TirePressureRightFront", this.pressure, 0);
	Simulator.set("vcan0", "TirePressureLeftRear", this.pressure, 0);
	Simulator.set("vcan0", "TirePressureRightRear", this.pressure, 0);
}).repeat('Infinity').yoyo(true).start();