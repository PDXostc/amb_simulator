/*global ScriptController*/

/** 
 * @module AMBSimulatorApplication
 */

/**
 * Controller which copies demo scripts from application package to scripts folder during application startup. List of scripts
 * which should be copied are specified by {{#crossLink "DemoScriptsController/demoScriptsList:property"}}{{/crossLink}} property.
 * 
 * ** Demo scripts files in filesystem will be overwritten at each application startup! **
 * 
 * @class DemoScriptsController
 * @constructor
 */
function DemoScriptsController() {}

/**
 * List of known demo scripts packaged with application.
 * 
 * @property demoScriptsList
 * @type {Array}
 * @static
 */
DemoScriptsController.demoScriptsList = [ 'speedDemo', 'speedDemo2', 'lightsDemo', 'batteryDemo', 'randomizerDemo', 'tirePresureDemo' ];

/**
 * Calls resolveFS on demo scripts directory.
 * 
 * @method checkDemoScripts
 * @static
 */
DemoScriptsController.checkDemoScripts = function() {
	"use strict";
	ScriptController.resolveFS(function(dir) {
		for ( var i = 0; i < DemoScriptsController.demoScriptsList.length; i++) {
			DemoScriptsController.readAndWrite(dir, DemoScriptsController.demoScriptsList[i]);
		}
	});
};

/**
 * Reads demo scripts from app dir and copy them into specified scripts dir.
 * 
 * @method readAndWrite
 * @param dir {tizen.File} Reference to directory into which script should be copied.
 * @param fileName {String} File name which should be copied 
 * @static
 */
DemoScriptsController.readAndWrite = function(dir, fileName) {
	"use strict";
	$.get('./js/' + fileName + '.js', function(data) {
		var file;

		try {
			file = dir.resolve(fileName + '.config');
		} catch (e) {
			if (e.name === 'NotFoundError') {
				file = dir.createFile(fileName + '.config');
			}
		}
		if (file) {
			file.openStream('w', function(fs) {
				fs.write(data);
				fs.close();
			}, ScriptController.error, 'UTF-8');
		}
	});
};