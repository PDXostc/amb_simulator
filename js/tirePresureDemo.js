/*global Simulator, TWEEN*/

/** 
 * Script operates tires pressure level in parallel for all for tires using Tween.js.
 * Tires pressure  is eased over `Cubic.InOut` function during 5 seconds interval, 
 * repeated in infinite mode through Tween().repeat('Infinity') from 0 bar to 3 bar.
 *
 * @module AMBSimulatorApplication
 * @class TirePressureDemo
 */

var tirePressure;

setInterval(function() {
	"use strict";
	TWEEN.update();
}, 200);

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