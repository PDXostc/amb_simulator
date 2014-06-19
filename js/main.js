/*global Vehicle, PropertiesController, ScriptController, DemoScriptsController, Simulator, Bootstrap, ace */

/**
 * AMB Simulator application provides access to environment allowing users to simulate updates of AMB emulator over virtual CAN bus. Application provides 
 * [ACE editor](http://ace.c9.io/) to create or update scripts, allows {{#crossLink "ScriptController/saveScript:method"}}saving{{/crossLink}} and 
 * {{#crossLink "ScriptController/loadScript:method"}}loading{{/crossLink}} existing scripts and browser of available AMB properties. 
 *
 * AMB Simulator allows users to send requests to special [AMB generator plugin](../../native/group__cangenplugin.html)
 * over [WebSockets](http://www.w3.org/TR/websockets/) interface which are then translated into custom CAN frames and sent
 * over specified CAN bus. [AMB generator plugin](../../native/group__cangenplugin.html) also acts as AMB source plugin which listens on all CAN buses 
 * and tries to identify custom CAN frames. Such CAN frames are then processed by [AMB simulator plugin](../../native/group__cansimplugin.html)
 * and properties identified by custom CAN frames are send back to AMB as updates of AMB properties. This allows to send request
 * for AMB property update from AMB simulator and process updates in other application like {{#crossLink "DashboardApplication"}}{{/crossLink}}.
 * 
 * Simulated environment uses JavaScript `eval()` function which includes following libraries:
 *
 * * {{#crossLink "Simulator"}}{{/crossLink}} - interface for Simulator functionality in AMB (for sample code see script [speedDemo.js](../files/applications_ambsimulator_js_speedDemo.js.html))
 * * [async.js](https://github.com/caolan/async) - simplifies asynchronouse operations with Javascript (for sample code see script [lightsDemo.js](../files/applications_ambsimulator_js_lightsDemo.js.html))
 * * [Tween.js](https://github.com/sole/tween.js/) - provides values for various mathematical functions in defined time 
 * (for sample code see script [speedDemo2.js](../files/applications_ambsimulator_js_speedDemo2.js.html) or [batteryDemo.js](../files/applications_ambsimulator_js_batteryDemo.js.html))
 * * [tizen.vehicle API](https://raw.github.com/otcshare/automotive-message-broker/master/docs/amb.idl)
 * * {{#crossLink "Simulator/amblog:method"}}{{/crossLink}} - provides console for logging events occured during script execution 
 *
 * To add additional libraries into environment add links into `<head>` section of application `index.html` file.
 *
 * Due to nature of asynchronous Javascript callback there is no way how to detect if script really finished AMB Simulator provides option to 
 * {{#crossLink "ScriptController/runScript:method"}}Stop script{{/crossLink}}. This method should be updated in case that additional libraries and require 
 * additional commands to stop running asychronous tasks.
 *
 * All demo scripts outlined above are running for limited amount of iterations and then finished. It's possible to write script running forever 
 * (for sample code see script [randomizerDemo.js](../files/applications_ambsimulator_js_randomizerDemo.js.html)) which must be terminated using
 * Stop script function. 
 *
 * Hover and click on elements in images below to navigate to components of AMB Simulator application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/amb.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/TopBarIcons.html" alt="top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/BottomPanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="573,1,644,76" href="../modules/Settings.html" alt="Settings" title="Settings" />
 *     <area  shape="rect" coords="6,87,134,128" alt="Load script" title="Load script" target="_self" href="../classes/ScriptController.html#method_loadScript"     >
 *     <area  shape="rect" coords="146,85,274,126" alt="Save script" title="Save script" target="_self" href="../classes/ScriptController.html#method_saveScript"     >
 *     <area  shape="rect" coords="286,87,414,128" alt="Run script" title="Run script" target="_self" href="../classes/ScriptController.html#method_runScript"     >
 *     <area  shape="rect" coords="494,84,648,126" alt="AMB properties library" title="AMB properties library" target="_self" href="../classes/PropertiesController.html"     >
 *     <area  shape="rect" coords="0,134,648,802" alt="Simulator editor" title="Simulator editor" target="_self" href="../classes/Simulator.html"     >
 *     <area  shape="rect" coords="0,829,647,991" alt="AMB logger" title="AMB logger" target="_self" href="../classes/Simulator.html#method_amblog"     >
 *  </map>
 * </img>
 *
 * @module AMBSimulatorApplication
 * @main AMBSimulatorApplication
 * @class AMBSimulator
 */

/**
 * Holds [ACE editor](http://ace.c9.io/) object.
 * 
 * @property editor
 * @type {Object}
 * @static
 * @default null
 */
var editor = null;

/**
 * Holds vehicle API object for comunication with AMB plugin through web sockets.
 * 
 * @property vehicle
 * @type {Object}
 * @static
 * @default null
 */
var vehicle = null;

/**
 * Initialize application components and register button events.
 * 
 * @method init
 * @static
 */
function init() {
	"use strict";
	console.log("init() called");

	DemoScriptsController.checkDemoScripts();

	$('#bottomPanel').bottomPanel('init');
	$("#topBarIcons").topBarIconsPlugin('init');

	$('#properties').library("init");
	$('#properties').library('setAlphabetVisible', false);

	$("#libraryButton").click(function() {
		PropertiesController.initializeLibrary();
	});

	$('#loadConfigButton').on('click', function() {
		ScriptController.loadScript();
	});

	$('#saveConfigButton').on('click', function() {
		ScriptController.saveScript();
	});

	$('#runConfigButton').on('click', function() {
		ScriptController.runScript();
	});

	$('#clearConsoleBtn').on('click', function() {
		$('#ambConsole').empty();
	});

	//Simulator init
	Simulator.ambConsole = $('#ambConsole');

	// editor init - not used due to TIVI-2181
	// editor = ace.edit("textArea");
	// editor.setTheme("ace/theme/ambiance");
	// editor.getSession().setMode("ace/mode/javascript");

	// vehicle init
	vehicle = new Vehicle(PropertiesController.wsStart, PropertiesController.wsError, "ws://localhost:23001");
}

$(document).ready(function() {
	"use strict";

	var bootstrap = new Bootstrap(function(status) {
		init();
	});
});