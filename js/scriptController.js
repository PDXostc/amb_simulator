/* global editor, TWEEN, Simulator */

/**
 * @module AMBSimulatorApplication
 */

/**
 * Controller handles property library logic and loading and storing of scripts to file system through [Tizen Filesystem API](https://developer.tizen.org/dev-guide/2.2.1/org.tizen.web.device.apireference/tizen/filesystem.html). 
 * Scripts are stored in `/home/app` directory and scripts packaged with application are deployed to this folder after application 
 * startup overwriting any existing files with same names by {{#crossLink "DemoScriptsController"}}{{/crossLink}} class.
 * 
 * @class ScriptController
 * @constructor
 */
function ScriptController() {
}

/**
 * State indicates if user wants save or load script.
 * 
 * @property state
 * @type {String}
 * @static
 * @default null
 */
ScriptController.state = null;

/**
 * State variable for controlling user scripts evaluation, detects if stop
 * script button was pressed.
 * 
 * @property stop
 * @type {Boolean}
 * @static
 * @default true
 */
ScriptController.stop = true;

/**
 * State variable for controlling user scripts evaluation, detects if script
 * evaluation is running;
 * 
 * @property running
 * @type {Boolean}
 * @static
 * @default false
 */
ScriptController.running = false;

/**
 * Initialize library component for loading/saving script.
 * 
 * @method initializeLibrary
 * @static
 */
ScriptController.initializeLibrary = function() {
	"use strict";
	$('#properties').library('setAlphabetVisible', false);
	$('#properties').library('clearContent');
	$('#properties').off();
	$('#tabsWrapperID').empty();

	$('#properties').library('setSectionTitle', 'Scripts managment');
	$('#properties').library('setGridBtnDisabled', true);
	$('#properties').library('setListBtnDisabled', true);
	$('#properties').library('setSearchBtnDisabled', true);
	$('#properties').library('setContentDelegate', 'templates/propertiesListDelegate.html');
	$('#properties').library('closeSubpanel');
};

/**
 * Callback for load button click.
 * 
 * @method loadScript
 */
ScriptController.loadScript = function() {
	"use strict";
	ScriptController.state = 'load';
	ScriptController.initializeLibrary();

	$('#properties').library('tabMenuTemplateCompile', {
		Tabs : [ {
			text : 'Load script',
			selected : true
		} ]
	});

	ScriptController.resolveFS(ScriptController.fsResolved);
};

/**
 * Resolves filesystem for scripts directory.
 * 
 * @method loadScript
 * @param resolvedCallback {Function} Callback for filesystem resolving.
 * @private
 */
ScriptController.resolveFS = function(resolvedCallback) {
	"use strict";
	tizen.filesystem.resolve("/home/app", resolvedCallback, ScriptController.error);
};

/**
 * Callback for resolved scripts directory.
 * 
 * @method fsResolved
 * @param dir {Object} Resolved scripts directory object.
 * @private
 */
ScriptController.fsResolved = function(dir) {
	"use strict";
	dir.listFiles(ScriptController.dirListSuccess, ScriptController.error);
};

/**
 * Callback for directory listing. Render file list into library component.
 * 
 * @method dirListSuccess
 * @param {Array} Array of listed files.
 * @private
 */
ScriptController.dirListSuccess = function(files) {
	"use strict";
	files = files.filter(function(fileItem) {
		return (new RegExp(/\.(config)$/i).test(fileItem.name) && fileItem.isFile);
	});
	for ( var i = 0; i < files.length; i++) {
		files[i].visibleName = files[i].name.slice(0, -7);
	}
	$('#properties').library('setContentDelegate', 'templates/propertiesListDelegate.html');
	$('#properties').library('contentTemplateCompile', files, '', function() {
		if (ScriptController.state === 'load') {
			$('#libraryContent').find('.contactElement').on('click', function() {
				ScriptController.openFile(files[$(this).attr('data-index')]);
			});
		} else if (ScriptController.state === 'save') {
			$('#libraryContent').find('.contactElement').on('click', function() {
				$('#fileNameInput').val(files[$(this).attr('data-index')].visibleName);
			});
		}
		$('#properties').library('updateContentHeight');
		$('#properties').library('showPage');
	});
};

/**
 * Opens and read file from file system and place it's content into editor.
 * 
 * @method openFile
 * @param files {Object} File to read.
 * @private
 */
ScriptController.openFile = function(file) {
	"use strict";
	if (file && !file.isDirectory) {
		file.readAsText(function(text) {
			$('#textArea').val(text);
			$('#properties').library('hidePage');
		}, ScriptController.error);
	}
};

/**
 * Callback for save script button.
 * 
 * @method saveScript
 */
ScriptController.saveScript = function() {
	"use strict";
	ScriptController.state = 'save';
	ScriptController.initializeLibrary();
	$('#properties').library('tabMenuTemplateCompile', {
		Tabs : [ {
			text : 'Save script',
			selected : true
		} ]
	});
	$('#properties').library('setSubpanelContentDelegate', 'templates/fileSaveSubPanelDelegate.html');
	$('#properties').library('subpanelContentTemplateCompile', {}, function() {
		$('#saveButton').on('click', function() {
			ScriptController.saveFile();
		});
	});

	ScriptController.resolveFS(ScriptController.fsResolved);
};

/**
 * Saves file into scripts directory.
 * 
 * @method saveFile
 * @private
 */
ScriptController.saveFile = function() {
	"use strict";
	ScriptController.resolveFS(function(dir) {
		var file, fileName, fileExists;

		fileExists = true;
		fileName = $('#fileNameInput').val() + '.config';
		try {
			file = dir.resolve(fileName);
		} catch (e) {
			if (e.name === 'NotFoundError') {
				file = dir.createFile(fileName);
				fileExists = false;
			}
		}
		if (fileExists) {
			var answer = confirm('Selected file name: ' + fileName + ' already exist!\nDo you want to replace it?');
			if (!answer) {
				return;
			}
		}
		if (file) {
			file.openStream('w', function(fs) {
				fs.write($('#textArea').val());
				fs.close();
			}, ScriptController.error, 'UTF-8');

			$('#properties').library('hidePage');
		}
	});
};

/**
 * Callback for run script button. Runs script using eval function. Also
 * provides logic for script evaluation controlling (stop script evaluation).
 * Stop script evaluation is limited to clearing timers used in user script, stopping running Tweens and async.js tasks. It
 * can't break infinitive loops or synchronous calls to external services.
 * 
 * @method runScript
 * @static
 */
ScriptController.runScript = function() {
	"use strict";
	var script;

	ScriptController.stop = !ScriptController.stop;
	if (!ScriptController.stop && !ScriptController.running) {
		if (editor) {
			script = editor.getValue();
		}
		if ($('#textArea').val()) {
			script = $('#textArea').val();
		}
		if (script) {
			setInterval(function() {
				if (ScriptController.stop) {
					var tmTsHiId, intHiId, i;

					TWEEN.removeAll();
					tmTsHiId = setTimeout(function() {
					}, 1000);
					for (i = 0; i <= tmTsHiId; i++) {
						clearTimeout(i);
					}

					intHiId = setInterval(function() {
					}, 1000);
					for (i = 0; i <= intHiId; i++) {
						clearInterval(i);
					}
					$('#runConfigButton').find('.buttonText').text('run script');
					ScriptController.running = false;
				}
			}, 1000);
			$('#runConfigButton').find('.buttonText').text('stop script');
			ScriptController.running = true;
			Simulator.startConsoleCleaningInterval();
			/* jshint evil: true */
			try {
				eval(script);
			}
			catch (ex) {
				amblog(ex);
			}
			/* jshint evil: false */
		}
	}
};

/**
 * Callback for ScriptController errors.
 * 
 * @method error
 * @param err
 *            {Object} Error message object.
 * @static
 */
ScriptController.error = function(err) {
	"use strict";
	/* global amblog */
	// console.error("Error: " + err.message);
	// alert('Error: ' + err.message);
	amblog('Error: ' + err.message);
};