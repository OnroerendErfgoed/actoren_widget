/**
 * Widget om een actor uitgebreid op te zoeken.
 * @module Actor/actorWidgets/actorAdvSearch/ActorAdvSearchVKBP
 */
define([
	'dojo/text!./templates/ActorAdvSearchVKBP.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'../CrabWidget'
], function(
	template,
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	CrabWidget
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		searchWidget: null,

		/**
		 * Widget om een actor uitgebreid op te zoeken.
		 * @module Actor/actorWidgets/actorAdvSearch/ActorAdvSearchVKBO
		 */
		postCreate: function() {
			console.log('...ActorAdvSearchVKBO::postCreate', arguments);
			this.inherited(arguments);
		},

		/**
		 * Standaard widget functie.
		 * Opstarten CrabWidget.
		 */
		startup: function () {
			console.log('...ActorAdvSearchVKBO::startup', arguments);
			this.inherited(arguments);
			this._setCrabWidget();
		},

		/**
		 * CrabWidget opstarten.
		 * @private
		 */
		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

		/**
		 * Een event functie waarbij een query wordt samengesteld afhankelijk van ingevulde parameters.
		 * Het grid in de zoek widget wordt gefilterd aan de hand van deze query en de zoek widget wordt geopend.
		 * todo: wachten op vkbp search endpoint
		 * @param {event} evt
		 * @private
		 */
		_findVKBP: function(evt) {
			evt? evt.preventDefault() : null;
			var query = this._getSearchParams();
			this._filterGrid(query);
			this._openSearch();
			this._reset();
		},

		/**
		 * Ophalen van de ingevoerde gegevens om actoren op te zoeken.
		 * @returns {Object}
		 * @private
		 */
		_getSearchParams: function() {
			var query = {'type': 1};
			var searchParams = [
				'naam',
				'persid',
				'rrn'
			];
			searchParams.forEach(lang.hitch(this, function(param) {
				if (this[param].value) {
					query[param] = this[param].value;
				}
			}));
			var crabParams = this._crabWidget.getInput().values;
			Object.keys(crabParams).forEach(function(param){
				if(crabParams[param]) {
					query[param] = crabParams[param];
				}
			});
			return query;
		},

		/**
		 * Filter van het grid in de zoek widget aan de hand van een query. Deze wordt toegepast op de store van het grid.
		 * @param query
		 * @private
		 */
		_filterGrid: function (query) {
			this.actorWidget._actorSearch.AdvSearchFilterGrid(query);
		},

		/**
		 * Event functie waarbij de zoek widget geopend wordt.
		 * @param {Event} evt
		 * @private
		 */
		_openSearch: function(evt) {
			evt? evt.preventDefault() : null;
			this.actorWidget.showSearch();
			this._reset();
		},

		/**
		 * Reset functie van deze widget.
		 * @private
		 */
		_reset: function(){
			this.naam.value = "";
			this._crabWidget.resetValues();
			this.persid.value = "";
			this.rrn.value = "";
		}
	});
});