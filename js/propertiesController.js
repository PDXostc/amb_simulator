/*global amblog, vehicle*/

/**
 * @module AMBSimulatorApplication
 */

/**
 * Controller handles property library logic showing available AMB properties {{#crossLink "PropertiesController/getSignalsSpecification:method"}} retrieved from AMB plugin over WebSockets interface{{/crossLink}}. 
 * Property browser allows to browse and search through available AMB properties and provides UI for defining values for {{#crossLink "Simulator/set:method"}}{{/crossLink}} method.  
 * 
 * @class PropertiesController
 * @constructor
 */
function PropertiesController() {
}

/**
 * Holds properties mapping table after it's retrieved.
 * 
 * @property signalsSpecification
 * @type {Object}
 * @static
 * @default null
 */
PropertiesController.signalsSpecification = null;

/**
 * Holds currently opened source of properties.
 * 
 * @property CurrentSourceSignals
 * @type {Object}
 * @static
 * @default null
 */
PropertiesController.CurrentSourceSignals = null;

/**
 * Holds currently opened property detail.
 * 
 * @property currentOpenedPropertyDetail
 * @type {Object}
 * @static
 * @default null
 */
PropertiesController.currentOpenedPropertyDetail = null;

/**
 * Initialize library component for displaying properties list.
 * 
 * @method initializeLibrary
 * @static
 */
PropertiesController.initializeLibrary = function() {
	"use strict";
	$('#properties').library('clearContent');
	$('#properties').off();

	$('#properties').library('setSectionTitle', 'AMB PROPERTY LIBRARY');
	$('#properties').library('setGridBtnDisabled', true);
	$('#properties').library('setListBtnDisabled', false);
	$('#properties').library('setSearchBtnDisabled', false);
	$('#properties').library('setLeftTabIndex', 1);

	$('#properties').on('eventClick_SearchViewBtn', function(e, data) {
		$('#properties').library('showSubpanel');
	});
	$('#properties').on('eventClick_ListViewBtn', function(e, data) {
		$('#searchInput').val('');
		$('#properties').library('closeSubpanel');
		PropertiesController.renderTabContent(0);
	});
	$('#properties').on('eventClick_menuItemBtn', function(e, data) {
		PropertiesController.renderTabContent(data.Index);
	});
	PropertiesController.signalSpecificationLoaded();

	$('#properties').library('tabMenuTemplateCompile', {
		Tabs : [ {
			text : 'Properties',
			selected : true
		} ]
	});

	$('#properties').library('setSubpanelContentDelegate', 'templates/searchSubPanelDelegate.html');
	$('#properties').library('subpanelContentTemplateCompile', {}, function() {
		$('#searchInput').on('input', PropertiesController.signalFilter);
		$('#properties').library('closeSubpanel', function() {
			$('#properties').library("showPage");
		});
	});
};

/**
 * Success callback method for vehicle API init.
 * 
 * @method wsStart
 * @param msg {String} WebSocket init message.
 * @static
 */
PropertiesController.wsStart = function(msg) {
	"use strict";
	PropertiesController.getSignalsSpecification(PropertiesController.signalSpecificationLoaded);
};

/**
 * Error callback method for vehicle API init.
 * 
 * @method wsError
 * @param msg {String} WebSockets error message.
 * @static
 */
PropertiesController.wsError = function(msg) {
	"use strict";
	amblog(msg);
};

/**
 * Gets properties mapping tabel from AMB plugin.
 * 
 * @method getSignalsSpecification
 * @param sucessCallback {Function} Sucess callback for getting properties mapping table.
 * @static
 */
PropertiesController.getSignalsSpecification = function(sucessCallback) {
	"use strict";
	if (vehicle) {
		PropertiesController.signalsSpecification = null;

		vehicle.get([ 'MappingTable' ], 0, function(response) {
			try {
				response.value = response.value.replace(/'/g, '\"');
				PropertiesController.signalsSpecification = PropertiesController.translateMappingTable(JSON.parse(response.value));
			} catch (e) {
				console.log(e);
			}
			if (PropertiesController.signalsSpecification) {
				sucessCallback();
			}
		}, function(error) {
			console.log(error);
		});
	}
};

/**
 * Process obtained mapping table and merge properties with more than one zone into
 * one property and then merge all sources into one.
 * 
 * @method translateMappingTable
 * @param mappingTable {String} Obtained mapping table in JSON format.
 * @static
 */
PropertiesController.translateMappingTable = function(mappingTable) {
	"use strict";
	var testObject, i, j;

	for ( i = 0; i < mappingTable.sources.length; i++) {
		testObject = {};
		for ( j = 0; j < mappingTable.sources[i].signals.length; j++) {
			if (!testObject[mappingTable.sources[i].signals[j].name]) {
				if (!mappingTable.sources[i].signals[j].hasZones) {
					mappingTable.sources[i].signals[j].hasZones = [];
				}
				mappingTable.sources[i].signals[j].hasZones.push(mappingTable.sources[i].signals[j].zone);
				testObject[mappingTable.sources[i].signals[j].name] = mappingTable.sources[i].signals[j];
			} else {
				testObject[mappingTable.sources[i].signals[j].name].hasZones.push(mappingTable.sources[i].signals[j].zone);
				mappingTable.sources[i].signals.splice(j, 1);
				j--;
			}
		}
	}

	// merge sources properties
	for ( i = 1; i < mappingTable.sources.length; i++) {
		for ( j = 0; j < mappingTable.sources[i].signals.length; j++) {
			var exists = false;

			for ( var k = 0; k < mappingTable.sources[0].signals.length; k++) {
				if (mappingTable.sources[0].signals[k].name === mappingTable.sources[i].signals[j].name) {
					exists = true;
					break;
				}
			}
			if (!exists) {
				mappingTable.sources[0].signals.push(mappingTable.sources[i].signals[j]);
			}
			mappingTable.sources[i].signals.splice(j, 1);
			j--;
		}
	}

	//sorts merged array
	mappingTable.sources[0].signals.sort(PropertiesController.propertyCompare);
	return mappingTable;
};

/**
 * Callback for method {{#crossLink "PropertiesController/getSignalsSpecification:method"}}{{/crossLink}}.
 * 
 * @method signalSpecificationLoaded
 * @static
 */
PropertiesController.signalSpecificationLoaded = function() {
	"use strict";
	PropertiesController.renderTabContent(0);
};

/**
 * Fills properties list in library component from {{#crossLink "PropertiesController/signalsSpecification:property"}}{{/crossLink}}.
 * 
 * @method renderTabContent
 * @param index {Number} Index of source.
 * @param filteredModel {Object} Model to render in library list.
 * @static
 */
PropertiesController.renderTabContent = function(index, filteredModel) {
	"use strict";

	PropertiesController.CurrentSourceSignals = (filteredModel) ? filteredModel
			: PropertiesController.signalsSpecification.sources[index].signals;
	$('#properties').library("setContentDelegate", "templates/propertiesListDelegate.html");
	$('#properties').library("contentTemplateCompile", PropertiesController.CurrentSourceSignals, "ambPropertiesContentGrid", function() {
		$('#libraryContent').find('.contactElement').on('click', PropertiesController.openPropertyDetail);
		$('#properties').library('updateContentHeight');
	});
};

/**
 * Opens signal generator view in library component.
 * 
 * @method openPropertyDetail
 * @static
 */
PropertiesController.openPropertyDetail = function() {
	"use strict";
	PropertiesController.currentOpenedPropertyDetail = PropertiesController.CurrentSourceSignals[$(this).attr('data-index')];
	$('#properties').library('clickOnListViewBtn');
	$('#properties').library("setContentDelegate", "templates/signalGeneratorDelegate.html");
	$('#properties').library("contentTemplateCompile", PropertiesController.currentOpenedPropertyDetail,
			'detail fontSizeSmall fontColorNormal', PropertiesController.propertyDetailCompilationDone);
};

/**
 * Callback after signal generator view compilation is done. Creates proper signal
 * generator view and registers buttons events.
 * 
 * @method propertyDetailCompilationDone
 * @static
 */
PropertiesController.propertyDetailCompilationDone = function() {
	"use strict";

	$('#properties').library('setSearchBtnDisabled', true);

	if (PropertiesController.currentOpenedPropertyDetail.hasZones &&
			PropertiesController.currentOpenedPropertyDetail.hasZones !== 0 &&
			PropertiesController.currentOpenedPropertyDetail.hasZones !== [] &&
			PropertiesController.currentOpenedPropertyDetail.hasZones !== [ 0 ])
	{
		$('.zone').on('click', function() {
			var dataValue;

			$('.zone').removeClass('bgColorLight');
			dataValue = $(this).attr('data-value');
			switch (dataValue) {
			case '0':
				break;
			case '8':
				$('[data-value="9"], [data-value="10"], [data-value="24"]').addClass('bgColorLight');
				break;
			case '32':
				$('[data-value="33"], [data-value="34"], [data-value="48"]').addClass('bgColorLight');
				break;
			case '4':
				$('[data-value="5"], [data-value="6"], [data-value="20"]').addClass('bgColorLight');
				break;
			case '1':
				$('[data-value="9"], [data-value="33"], [data-value="5"]').addClass('bgColorLight');
				break;
			case '2':
				$('[data-value="10"], [data-value="34"], [data-value="6"]').addClass('bgColorLight');
				break;
			case '16':
				$('[data-value="24"], [data-value="48"], [data-value="20"]').addClass('bgColorLight');
				break;
			default:
				$(this).addClass('bgColorLight');
				break;
			}
			$('#signalText').find('#zone').text(dataValue);
		});
	}

	$('.libraryContent').find('#source').text('"' + $('.libraryContent').find('#propertySourceInput').val() + '"');
	$('.libraryContent').find('#property').text('"' + PropertiesController.currentOpenedPropertyDetail.name + '"');

	$('.libraryContent').find('#propertySourceInput').on('input', function() {
		$('.libraryContent').find('#source').text('"' + $(this).val() + '"');
	});

	$('.libraryContent').find('#propertyValueInput').on('input', function() {
		var value, target;

		target = $('.libraryContent').find('#value');
		try {
			value = parseInt($(this).val(), 10);
		} catch (e) {
			// $(this).addClass('wrongValue');
			target.text('0');
		}
		if (value + 1) {
			target.text(value);
			// $(this).removeClass('wrongValue');
		} else {
			$(this).addClass('wrongValue');
			target.text('0');
		}
	});

	$('.libraryContent').find('#addScriptBtn').on(
			'click',
			function() {
				$('#textArea').val(
						$('#textArea').val() + '\n\n' + $('.libraryContent').find('#signalText').text().replace(/(\r\n|\n|\r|\t)/gm, ""));
				$('#properties').library('hidePage');
			});

	$('.libraryContent').find('#backBtn').on('click', function() {
		PropertiesController.renderTabContent(0);
		$('#properties').library('setSearchBtnDisabled', false);
	});
};

/**
 * Provides filtering functionality for property list in library component.
 * 
 * @method signalFilter
 * @static
 */
PropertiesController.signalFilter = function() {
	"use strict";

	var index, value, filteredModel;

	value = $(this).val().toLowerCase();
	index = 0;
	if (value !== '') {
		filteredModel = PropertiesController.signalsSpecification.sources[index].signals.filter(function(item) {
			return new RegExp(value, 'g').test(item.name.toLowerCase());
		});
	} else {
		filteredModel = PropertiesController.signalsSpecification.sources[index].signals;
	}
	PropertiesController.renderTabContent(index, filteredModel);
};

/**
 * Comparsion function for property array sorting by property name.
 * 
 * @method propertyCompare
 * @param a {Object} First property object to comparsion.
 * @param b {Object} Second property object to comparsion.
 * @static
 */
PropertiesController.propertyCompare = function(a, b) {
	"use strict";
	if (a.name.toLowerCase() < b.name.toLowerCase()) {
		return -1;
	}
	if (a.name.toLowerCase() > b.name.toLowerCase()) {
		return 1;
	}
	return 0;
};