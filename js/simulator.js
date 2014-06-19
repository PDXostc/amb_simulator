/*global amblog, vehicle, ScriptController*/

/**
 * @module AMBSimulatorApplication
 */

/**
 * Enclosures functionality of vehicle.js for setting signals to AMB plugin through WebSocket interface via {{#crossLink "Simulator/set:method"}}{{/crossLink}}.
 * method. For example, to request update of AMB property `TransmissionShiftPosition` to position `1`:
 *
 *     Simulator.set("vcan0", "TransmissionShiftPosition", "1", 0);
 * 
 * First parameter defines CAN bus to which CAN frame simulating setting AMB property should be set. Since `TransmissionShiftPosition` is not zoned 
 * use `0` as zone parameter which means `No zone`. In case that AMB property is zoned (e.g. `HVACTargetTemperature`) is't necessary to specify also zone 
 * (in this case left zone):
 *
 *     Simulator.set("vcan0", "HVACTargetTemperature", "1", 8);
 *
 * Zones are mapped as follows:
 *
 * * 0 - No zone
 * * 1 - Front zone
 * * 2 - Middle zone
 * * 4 - Right zone
 * * 8 - Left zone
 * * 16 - Rear zone
 * * 32 - Center zone
 * 
 * These basic zones can be combined to specify exact position by adding values together, e.g. to specify front-left zone use value 9 (1 = front, 8 = left).
 *
 * @class Simulator
 * @constructor
 */

function Simulator() {
}

/**
 * Holds AMB console jQuery object for inserting logs.
 * 
 * @property ambConsole
 * @type {JQuery}
 * @static
 * @default null
 */
Simulator.ambConsole = null;

/**
 * Signal set enclosuring function for transmitting signals into AMB plugin.
 * 
 * @method set
 * @param source {String} Target CAN bus name (e.g. `vcan0`).
 * @param property {String} AMB property name.
 * @param value {Number} New property value.
 * @param zone {Number} Property zone (see {{#crossLink "Simulator"}}{{/crossLink}}) for zones description.
 */
Simulator.set = function(source, property, value, zone) {
	"use strict";
	vehicle.set(source, [ property ], [ value ], [ zone ], amblog, amblog);
};

/**
 * Removes old logs from amblog console, leaves 200 newest. Runs in intervals
 * every 5s. Called after starting user script.
 * 
 * @method startConsoleCleaningInterval
 * @static
 */
Simulator.startConsoleCleaningInterval = function() {
	"use strict";
	var cleaninIntervalId, logCount;

	cleaninIntervalId = setInterval(function() {
		if (ScriptController.stop) {
			clearInterval(cleaninIntervalId);
		}
		logCount = $('.logItem').length;
		if (logCount > 200) {
			logCount -= 200;
			Simulator.ambConsole.find('.logItem:lt(' + logCount + ')').remove();
		}
	}, 5000);
};

/**
 * Global scope function for printing arguments into amblog console.
 * 
 * @method amblog
 * @param arguments {Array} Arguments array.
 * @static
 */
function amblog() {
	"use strict";
	var d, text, timeStamp, miliseconds;

	for ( var i = 0; i < arguments.length; i++) {
		text = '';
		d = new Date();
		miliseconds = d.getMilliseconds().toString();
		if (miliseconds.length < 3) {
			miliseconds = ('00' + miliseconds).slice(-3);
		}
		timeStamp = d.toTimeString().substr(0, 8) + '.' + miliseconds;
		if (arguments[i][0].property) {
			text = arguments[i][0].property;
		} else {
			text = arguments[i];
		}
		Simulator.ambConsole.append('<span class="logItem">' + text + '<span class="timestamp">' + timeStamp + '</span></span>');
		Simulator.ambConsole.scrollTop(Simulator.ambConsole[0].scrollHeight);
	}
}