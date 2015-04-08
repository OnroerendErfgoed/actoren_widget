/**
 * Widget voor het zoeken naar een actor van het agentschap en uitgebreid zoeken naar actoren.
 * @module Actor/actorWidgets/ActorSearch
 */
define([
	'dojo/text!./templates/ActorSearch.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dgrid/Keyboard',
	'dgrid/extensions/DijitRegistry',
	'dgrid/OnDemandGrid',
	'dgrid/Selection'
], function(
	template,
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Keyboard,
	DijitRegistry,
	OnDemandGrid,
	Selection
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actorStore: null,
		baseUrl: null,
		_previousSearchValue:'',
		actorWidget: null,
		actorController: null,
		_store: 'all',

		/**
		 * Standaard widget functie.
		 */
		postCreate: function() {
			console.log('..ActorSearch::postCreate', arguments);
			this.inherited(arguments);
		},

		/**
		 * Standaard widget functie.
		 * De actorController ophalen uit de actorWidget.
		 * Aanmaken van het resultaten grid.
		 */
		startup: function () {
			console.log('..ActorSearch::startup', arguments);
			this.inherited(arguments);
			this.actorController = this.actorWidget.actorController;
			this._createGrid();
		},

		/**
		 * Opbouwen van grid: kolommen, store, 'on click event' en 'on dlb click event'
		 * @private
		 */
		_createGrid: function () {
			var columns = {
				id: {
					label:'#',
					formatter: function (id) {
						return '<a href="#" >' + id + '</a>'
					}
				},
				naam: 'Naam',
				voornaam: {
					label: 'Voornaam',
					sortable: false
				},
				type: {
					label: 'Type',
					formatter: function (type) {
						return type['naam'];
					}
				}
			};

			this._grid = new (declare([OnDemandGrid, Selection, Keyboard, DijitRegistry]))({
				selectionMode: 'single',
				store: this.actorController.actorStore,
				columns: columns,
				sort: [
					{ attribute: 'naam' }
				],
				loadingMessage: 'laden...',
				noDataMessage: 'geen resultaten beschikbaar'
			}, this.gridNode);

			this._grid.on(".dgrid-cell:click", lang.hitch(this, function(evt){
				evt.preventDefault();
				var cell = this._grid.cell(evt);
				if (cell.column.field == 'id') {
					var id = this._grid.row(evt).id;
					this.actorController.getActor(id).
						then(lang.hitch(this, function(actor){
							this._showDetail(actor);
						}));
				}


			}));
			this._grid.on(".dgrid-row:dblclick", lang.hitch(this, function(evt){
				evt.preventDefault();
				var id = this._grid.row(evt).id;
				this.actorController.getActor(id).
					then(lang.hitch(this, function(actor){
						this._emitActor(actor);
					}));
			}));
			this._grid.refresh();

		},

		/**
		 * Een event functie die na input in html element een filtering het grid zal toepassen.
		 * De filtering gebeurt op actoren van het agentschap. De sort moet overgenomen worden vanuit elastic search
		 * @param {event} evt
		 * @private
		 */
		_filterGrid: function (evt) {
			evt.preventDefault();
			this._grid.set('sort', []);
			if (this._store != 'wij') {
				this._grid.set('store', this.actorController.actorWijStore);
				this._store = 'wij';
			}
			var newValue = evt.target.value;
			if (this._timeoutId) {
				clearTimeout(this._timeoutId);
				this._timeoutId = null;
			}
			this._timeoutId = setTimeout(lang.hitch(this, function () {
				if (newValue != this._previousSearchValue) {
					this._previousSearchValue = newValue;
					if (newValue === '') {
						this._grid.set("query", {});
						this._grid.refresh();
					}
					else {
						this._grid.set("query", {"omschrijving": newValue});
						this._grid.refresh();
					}
				}
			}, 30));
		},

		/**
		 * Het grid zal actoren filteren worden op meegegeven query
		 * @param {object} query bv {naam: 'testpersoon'}
		 */
		AdvSearchFilterGrid: function(query) {
			this.actorenFilter.value = "";
			this._grid.set("store", this.actorController.actorStore);
			this._store = 'all';
			this._grid.set("query", query);
			this._grid.refresh();
		},

		/**
		 * Tonen van de detail widget waarbij een actor wordt meegegeven.
		 * @param {Object} actor
		 * @private
		 */
		_showDetail: function(actor) {
			this._grid.set('sort', [{ attribute: 'naam' }]);
			this.actorWidget.showDetail(actor);
		},

		/**
		 * Event functie waarbij de uitgebreide actor zoek widget getoond wordt.
		 * @param {Event} evt
		 * @private
		 */
		_showActorSearch: function(evt) {
			evt? evt.preventDefault() : null;
			this._grid.set('sort', [{ attribute: 'naam' }]);
			this.actorWidget.showActorSearch();
		},

		/**
		 * Event functie waarbij de uitgebreide vkbo zoek widget getoond wordt.
		 * @param {Event} evt
		 * @private
		 */
		_showVKBOSearch: function(evt) {
			evt.preventDefault();
			this.actorWidget.showVKBOSearch();
		},

		/**
		 * Event functie waarbij de uitgebreide vkbp zoek widget getoond wordt.
		 * @param {Event} evt
		 * @private
		 */
		_showVKBPSearch: function(evt) {
			evt.preventDefault();
			this.actorWidget.showVKBPSearch();
		},

		/**
		 * Event refresh functie van de widget.
		 * @param evt
		 * @private
		 */
		_refresh: function (evt) {
			evt.preventDefault();
			this._grid.set("store", this.actorController.actorStore);
			this.actorenFilter.value = '';
			this._grid.refresh();
		},

		/**
		 * Een event functie die de geselecteerde actor in het grid meegeeft aan een private emit functie.
		 * @param {Event} evt
		 * @private
		 */
		_emitSelectedActoren: function(evt) {
			evt? evt.preventDefault() : null;
			for(var id in this._grid.selection){
				if(this._grid.selection[id]){
					this.actorController.getActor(id).
						then(lang.hitch(this, function(actor){
							this._emitActor(actor);
						}));
				}
			}
		},

		/**
		 * Een event uitsturen aan de actorwidget waaraan een actor wordt meegeven.
		 * @param {Object} actor
		 */
		_emitActor: function(actor) {
			this.actorWidget.emitActor(actor);
		}

	});
});