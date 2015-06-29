/**
 * Widget voor het zoeken naar een actor van het agentschap en uitgebreid zoeken naar actoren.
 * @module Actor/actorWidgets/ActorSearch
 */
define([
	'dojo/text!./templates/ActorSearchView.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Deferred',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
  'dijit/Menu',
  'dijit/MenuItem',
	'dgrid/Keyboard',
	'dgrid/extensions/DijitRegistry',
	'dgrid/OnDemandGrid',
	'dgrid/Selection',
    "dstore/legacy/StoreAdapter"
], function(
	template,
	declare,
	lang,
	Deferred,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Menu,
	MenuItem,
	Keyboard,
	DijitRegistry,
	OnDemandGrid,
	Selection,
    StoreAdapter
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

		actoren_updated: [],
		actoren_new: [],

		/**
		 * Standaard widget functie.
		 */
		postCreate: function() {
			console.log('..ActorSearchView::postCreate', arguments);
			this.inherited(arguments);
		},

		/**
		 * Standaard widget functie.
		 * De actorController ophalen uit de actorWidget.
		 * Aanmaken van het resultaten grid.
		 */
		startup: function () {
			console.log('..ActorSearchView::startup', arguments);
			this.inherited(arguments);
			this._createGrid();
      this._setSecurity();
		},

    _createNewActor: function(evt) {
			evt.preventDefault();
      this.actorWidget.showActorCreate();
    },

    _setSecurity: function() {
      if (!this.actorWidget.canCreateActor) {
        this.addActorLink.style.display = 'none';
      }
    },

		/**
		 * Opbouwen van grid: kolommen, store, 'on click event' en 'on dlb click event'
		 * @private
		 */
		_createGrid: function () {
      console.debug('create grid');
			var columns = {
				id: {
					label:'#',
					formatter: function (id) {
						return '<a href="#" >' + id + '</a>'
					}
				},
				naam: {
					label:'Naam',
					sortable: false
				},
				voornaam: {
					label: 'Voornaam',
					sortable: false
				},
				type: {
					label: 'Type',
					formatter: lang.hitch(this, function (type, object) {
						if (this.actoren_updated.indexOf(object.id) > -1) {
							return type['naam'] + '<span class="success label right">bewerkt</span>';
						}
						else if (this.actoren_new.indexOf(object.id) > -1) {
							return type['naam'] + '<span class="success label right">nieuw</span>';
						}
						else {
							return type['naam'];
						}
					}),
					sortable: false
				}
			};

			this._grid = new (declare([OnDemandGrid, Selection, Keyboard, DijitRegistry]))({
				selectionMode: 'single',
				collection: new StoreAdapter({objectStore: this.actorController.actorStore}),
				columns: columns,
                sort: 'naam',
				loadingMessage: 'laden...',
				noDataMessage: 'geen resultaten beschikbaar'
			}, this.gridNode);

			var contextMenu = this._createContextMenu();
      //bridge between contextMenu and grid
      this._grid.on('.dgrid-row:contextmenu', lang.hitch(this, function(evt){
       evt.preventDefault(); // prevent default browser context menu
       contextMenu.selectedGridItem = this._grid.row(evt).data;
       contextMenu._scheduleOpen(this, null, { x: evt.pageX, y: evt.pageY });
      }));

      this._grid.on(".dgrid-cell:click", lang.hitch(this, function(evt){
        evt.preventDefault();
        var cell = this._grid.cell(evt);
        if (cell.column.field == 'id' && this._grid.row(evt)) {
          var id = this._grid.row(evt).id;
          this.actorController.getActor(id).
            then(lang.hitch(this, function(actor){
              this.actorWidget.showActorDetail(actor);
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

			this._grid.on('dgrid-error', lang.hitch(this, function(evt){
				evt.preventDefault();
				this._emitError(evt)
			}));
			//this._grid.refresh();

		},

		/**
		* Maak context menu om actoren uit het grid te bekijken, toe te voegen of te bewerken indien toegelaten.
		* @returns {Menu}
		* @private
		*/
		_createContextMenu: function () {
			var contextMenu = new Menu({});

			contextMenu.addChild(new MenuItem({
				label: 'Bekijken',
				onClick: lang.hitch(this, function () {
					this.actorController.getActor(contextMenu.selectedGridItem.id).
						then(lang.hitch(this, function(actor){
							this.actorWidget.showActorDetail(actor);
						}));
				})
			}));

			if (this.actorWidget.canEditActor) {
				contextMenu.addChild(new MenuItem({
					label: 'Bewerken',
					onClick: lang.hitch(this, function () {
						this.actorController.getActor(contextMenu.selectedGridItem.id).
							then(lang.hitch(this, function(actor){
								this.actorWidget.showActorEdit(actor);
							}));
					})
				}));
			}

			contextMenu.addChild(new MenuItem({
				label: 'Toevoegen',
				onClick: lang.hitch(this, function () {
					this.actorController.getActor(contextMenu.selectedGridItem.id).
						then(lang.hitch(this, function(actor){
							this._emitActor(actor);
						}));
				})
			}));

			return contextMenu;
		},

		/**
		* Een event functie die na input in html element een filtering het grid zal toepassen.
		* De filtering gebeurt op actoren van het agentschap. De sort moet overgenomen worden vanuit elastic search
		* @param {event} evt
		* @private
		*/
		_filterGrid: function (evt) {
			evt.preventDefault();
			this.removeSort();
      /*if (this._store != 'wij') {
       this._grid.set('store', this.actorController.actorWijStore);
       this._store = 'wij';
       }*/
      //this._grid.set("store", this.actorStore);
      //this._store = 'all';
			var newValue = evt.target.value;
			if (this._timeoutId) {
				clearTimeout(this._timeoutId);
				this._timeoutId = null;
			}
			this._timeoutId = setTimeout(lang.hitch(this, function () {
				if (newValue != this._previousSearchValue) {
					this._previousSearchValue = newValue;
					if (newValue === '') {
                        this._grid.set("collection", new StoreAdapter({objectStore: this.actorController.actorStore}));
						//this._grid.refresh();
					}
					else {
						this._grid.set("collection", new StoreAdapter({objectStore: this.actorController.actorStore}).filter({"naam": newValue}));
						//this._grid.refresh();
					}
				}
			}, 30));
		},

		/**
		* Het grid zal actoren filteren worden op meegegeven query
		* @param {object} query bv {naam: 'testpersoon'}
		*/
		advSearchFilterGrid: function(filter) {
			this.removeSort();
			this.actorenFilter.value = "";
			//this._grid.set("store", this.actorStore);
			//this._store = 'all';
            this._grid.set("collection", new StoreAdapter({objectStore: this.actorController.actorStore}).filter(filter));
			//this._grid.refresh();
		},

		/**
		* Functie om sort parameter te verwijderen bij grid, belangrijk bij zoeken in elastic search
		*/
		removeSort: function() {
			this._grid.set('sort', "");
		},

		/**
		* Functie om sort parameter toe te voegen aan het grid, belangrijk bij bewerken een aanpassen
		*/
		addSort: function() {
			this._grid.set('sort', [{ attribute: 'naam' }]);
		},

		/**
		* Event refresh functie van de widget.
		* @param evt
		* @private
		*/
		_refresh: function (evt) {
			evt.preventDefault();
			this.addSort();
            this._grid.set("collection", new StoreAdapter({objectStore: this.actorController.actorStore}));
			this.actorenFilter.value = '';
			//this._grid.refresh();
		},

		/**
		* Geeft de geselecteerde actor.
		* @returns {Deferred.promise|*}
		*/
		getSelectedActor: function() {
			var deffered = new Deferred();
			for(var id in this._grid.selection){
				if(this._grid.selection[id]){
					this.actorController.getActor(id).then(
						function(actor){
							deffered.resolve(actor)
						},
						function(error) {
							deffered.reject(error);
						}
					);
				}
			}
			return deffered.promise;
		},

		/**
		* Een event functie die de geselecteerde actor in het grid meegeeft aan een private emit functie.
		* @param {Event} evt
		* @private
		*/
		_emitSelectedActoren: function(evt) {
			evt? evt.preventDefault() : null;
			this.getSelectedActor().
				then(lang.hitch(this, function(actor){
							this._emitActor(actor);
				}));
		},

		/**
		* Een event uitsturen aan de actorwidget waaraan een actor wordt meegeven.
		* @param {Object} actor
		*/
		_emitActor: function(actor) {
			this.actorWidget.emitActor(actor);
		},

		/**
		* Een event uitsturen aan de actorwidget waaraan een error wordt meegeven.
		* @param {Event} evt
		*/
		_emitError: function(evt) {
			this.actorWidget.emitError(evt);
		}

	});
});