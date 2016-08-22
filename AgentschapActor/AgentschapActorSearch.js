/**
 * Widget voor het zoeken naar een actor van het agentschap.
 * @module AgentschapActor/AgentschapActorSearch
 */
define([
  'dojo/text!./templates/AgentschapActorSearch.html',
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
  'dstore/legacy/StoreAdapter'
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

	var delay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		};
	})();

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,
    actorStore: null,
    baseUrl: null,
    _previousSearchValue:'',
    actorWidget: null,
    actorController: null,

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
        naam: {
          label:'Naam',
          sortable: true
        },
        voornaam: {
          label: 'Voornaam',
          sortable: false
        },
        type: {
          label: 'Type',
          formatter: function (type) {
            return type['naam'];
          },
          sortable: false
        }
      };

      this._grid = new (declare([OnDemandGrid, Selection, Keyboard, DijitRegistry]))({
        selectionMode: 'single',
        collection: new StoreAdapter({objectStore: this.actorController.actorWijStore}),
        sort: 'naam',
        columns: columns,
        loadingMessage: 'laden...',
        noDataMessage: 'geen resultaten beschikbaar'
      }, this.gridNode);

      var contextMenu = this._createContextMenu();

      this._grid.on(".dgrid-cell:click", lang.hitch(this, function(evt){
        evt.preventDefault();
        var cell = this._grid.cell(evt);
        if (cell.column.field == 'id' && this._grid.row(evt)) {
          var id = this._grid.row(evt).id;
          this.actorController.getActor(id).then(lang.hitch(this, function(actor){
            this._showDetail(actor);
          }));
        }
      }));
      this._grid.on(".dgrid-row:dblclick", lang.hitch(this, function(evt){
        evt.preventDefault();
        var id = this._grid.row(evt).id;
        this.actorController.getActor(id).then(lang.hitch(this, function(actor){
          this._emitActor(actor);
        }));
      }));
      //bridge between contextMenu and grid
      this._grid.on('.dgrid-row:contextmenu', lang.hitch(this, function(evt){
        evt.preventDefault(); // prevent default browser context menu
        contextMenu.selectedGridItem = this._grid.row(evt).data;
        contextMenu._scheduleOpen(this, null, { x: evt.pageX, y: evt.pageY });
      }));
      this._grid.on('dgrid-error', lang.hitch(this, function(evt){
        evt.preventDefault();
        this._emitError(evt)
      }));
    },

    /**
     * Maak context menu om actoren uit het grid te bekijken of toe te voegen.
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
            this._showDetail(actor);
          }));
        })
      }));

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
     * Een event functie die na input in html element een filtering het grid zal toepassen
     * @param {event} evt
     * @private
     */
    _filterGrid: function (evt) {
      evt.preventDefault();

	 		var newValue = evt.target.value;
			delay(lang.hitch(this, function() {
				this.removeSort();
				if (newValue === '') {
					this._grid.set({
						collection: new StoreAdapter({objectStore: this.actorController.actorWijStore})
					});
				}
				else {
					this._grid.set({
						collection: new StoreAdapter({objectStore: this.actorController.actorWijStore}).filter({'omschrijving': newValue})
					});
				}
			}, 250 ));
    },

		/**
		* Functie om sort parameter te verwijderen bij grid, belangrijk bij zoeken in elastic search
		*/
		removeSort: function() {
			this._grid.set('collection', '');
			this._grid.set('sort', '');
		},

    /**
     * Tonen van de detail widget waarbij een actor wordt meegegeven.
     * @param {Object} actor
     * @private
     */
    _showDetail: function(actor) {
      this.actorWidget.showDetail(actor);
    },

    /**
     * Event refresh functie van de widget.
     * @param evt
     * @private
     */
    _refresh: function (evt) {
      evt ? evt.preventDefault() : null;
      this._grid.set("collection", new StoreAdapter({objectStore: this.actorController.actorWijStore}));
      this.actorenFilter.value = '';
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