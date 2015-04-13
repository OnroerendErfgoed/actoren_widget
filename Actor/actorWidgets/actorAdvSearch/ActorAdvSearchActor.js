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
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
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
			var querylist = [];

			var crabParams = this._crabWidget.getInput();
			['postcode', 'postbus', 'land'].forEach(function(param){
				if (crabParams.values[param]) {
					query[param] = crabParams.values[param];
				}
			});
			// bijvoorbeeld ?gemeente=143 en ?query=gemeente:Vlissingen AND straat;Hogeweg
			['gemeente', 'straat', 'huisnummer'].forEach(function(param){
				if (crabParams.ids[param + '_id']) {
					query[param] = crabParams.ids[param + '_id']
				} else if (crabParams.values[param]) {
					querylist.push(param + ':' + crabParams.values[param])
				}
			});
			if (querylist.length > 0) {
				query['query'] = querylist.join(' AND ');
			}
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
			this.type.value = "1";
			this.persid.value = "";
			this.rrn.value = "";
			this.kbo.value = "";
		}
	});
});