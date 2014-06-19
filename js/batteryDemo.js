/*global Simulator, TWEEN*/

/** 
 * Script operates battery level and exterior brightness in parallel using Tween.js as well as setting day/night mode based on brightness level.
 * Battery status is eased over `Cubic.InOut` function during 50 seconds interval while exterior brightness is iterated over linear function
 * from 5000 lux to 0 lux. Brightness over 2000 lux is identified day mode and bightness below 2000 lux is identified as night mode.
 *
 * @module AMBSimulatorApplication
 * @class BatteryDemo
 */

var intervalID, batteryStatus, exteriorBrightness, nightMode, simulationLength;

simulationLength = 50000;

nightMode = false;
Simulator.set("vcan0", "NightMode", nightMode, 0);

intervalID = setInterval(function() {
	"use strict";
	TWEEN.update();
}, 50);

batteryStatus = new TWEEN.Tween({
	battery : 100
});
batteryStatus.to({
	battery : 0
}, simulationLength);
batteryStatus.easing(TWEEN.Easing.Cubic.InOut);
batteryStatus.onUpdate(function() {
	"use strict";
	Simulator.set("vcan0", "BatteryStatus", this.battery, 0);
});

exteriorBrightness = new TWEEN.Tween({
	brightness : 5000
});
exteriorBrightness.to({
	brightness : 0
}, simulationLength);
exteriorBrightness.onUpdate(function() {
	"use strict";
	Simulator.set("vcan0", "ExteriorBrightness", this.brightness, 0);
	if (this.brightness < 2000 && !nightMode) {
		nightMode = true;
		Simulator.set("vcan0", "NightMode", nightMode, 0);
	}
});
exteriorBrightness.onComplete(function() {
	"use strict";
	clearInterval(intervalID);
});

batteryStatus.start();
exteriorBrightness.start();