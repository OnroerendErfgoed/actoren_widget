/**
 * Widget om een actor uitgebreid op te zoeken.
 * @module Actor/actorWidgets/actorAdvSearch/ActorAdvSearchActor
 */
define([
	'dojo/text!./templates/ActorAdvSearchActor.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'../CrabWidget',
	"dojo/dom-construct"
], function(
	template,
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	CrabWidget,
	domConstruct
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		crabWidget: null,
		actorWidget: null,
		actorAdvancedSearch : null,

		/**
		 * Standaard widget functie.
		 */
		postCreate: function() {
			this.inherited(arguments);
			console.log('...ActorAdvSearchActor::postCreate', arguments);
		},

		/**
		 * Standaard widget functie.
		 * Opstarten CrabWidget.
		 */
		startup: function () {
			this.inherited(arguments);
			console.log('...ActorAdvSearchActor::startup', arguments);
			this._setCrabWidget();
		},

		/**
		 * CrabWidget opstarten.
		 * @private
		 */
		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController, actorWidget: this.actorWidget}, this.crabWidget);
			this._setSelectLists();
		},

		/**
		 * Selectielijsten aanvullen met opties
		 * @private
		 */
		_setSelectLists: function(){
			this.actorWidget.typeLists.actorTypes.forEach(lang.hitch(this, function(type){
				domConstruct.place('<option value="' + type.id + '">' + type.naam + '</option>', this.type);
			}));
			domConstruct.place('<option value="" disabled selected>Selecteer Actortype</option>', this.type);
		},

		/**
		 * Een event functie waarbij een query wordt samengesteld afhankelijk van ingevulde parameters.
		 * Het grid in de zoek widget wordt gefilterd aan de hand van deze query en de zoek widget wordt geopend.
		 * @param {event} evt
		 * @private
		 */
		_findActoren: function(evt) {
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
			var query = {};
			var searchParams = [
				'naam',
				'voornaam',
				'email',
				'telefoon',
				'type',
				'persid',
				'rrn',
				'kbo'
			];
			searchParams.forEach(lang.hitch(this, function(param) {
				if (this[param].value) {
					query[param] = this[param].value;
				}
			}));

			var crabParams = this._crabWidget.getInputValues();
			['postcode', 'subadres', 'land'].forEach(function(param){
				if (crabParams.values[param]) {
					query[param] = crabParams.values[param];
				}
			});
			// bijvoorbeeld ?gemeente=143 en ?gemeente_naam=Rotterdam
			['gemeente', 'straat', 'huisnummer'].forEach(function(param){
				if (crabParams.ids[param + '_id']) {
					query[param] = crabParams.ids[param + '_id']
				} else if (crabParams.values[param]) {
					if (param === 'huisnummer') {
						query[param + '_label'] = crabParams.values[param]
					} else {
						query[param + '_naam'] = crabParams.values[param]
					}
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
			this.actorWidget._actorSearch.removeSort();
			this.actorAdvancedSearch._showSearch();
			this._reset();
		},

		/**
		 * Event functie waarbij de widget geopend wordt om een actor aan te maken.
		 * @param {Event} evt
		 * @private
		 */
		_showActorCreate: function(evt) {
			evt.preventDefault();
			this.actorWidget._actorSearch.addSort();
			this.actorAdvancedSearch._showActorCreate();
		},

		/**
		 * Reset functie van deze widget.
		 * @private
		 */
		_reset: function(){
			this.naam.value = '';
			this.voornaam.value = '';
			this.email.value=  '';
			this.telefoon.value = '';
			this._crabWidget.resetValues();
			this.type.value = "";
			this.persid.value = "";
			this.rrn.value = "";
			this.kbo.value = "";
		}
	});
});