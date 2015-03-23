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
	'dgrid/Selection',
	'dgrid/selector'
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
	Selection,
	selector
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
		_store: null,

		postCreate: function() {
			console.log('..ActorSearch::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
			console.log('..ActorSearch::startup', arguments);
			this.inherited(arguments);
			this.actorController = this.actorWidget.actorController;
			this._createGrid();
			this._store = 'wij';
		},

		_createGrid: function () {
			var columns = {
				check: selector({label: "", selectorType: "checkbox", style: "width: 50px;"}),
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
				store: this.actorController.actorWijStore,
				columns: columns,
				sort: [
					{ attribute: 'naam' }
				],
				loadingMessage: 'laden...',
				noDataMessage: 'geen resultaten beschikbaar'
			}, this.gridNode);

			this._grid.on(".dgrid-cell:click", lang.hitch(this, function(evt){
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
				var id = this._grid.row(evt).id;
				this.actorController.getActor(id).
					then(lang.hitch(this, function(actor){
						this._emitActor(actor);
					}));
			}));
			this._grid.refresh();

		},

		_filterGrid: function (evt) {
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

		AdvSearchFilterGrid: function(query) {
			this.actorenFilter.value = "";
			this._grid.set("store", this.actorController.actorStore);
			this._store = 'all';
			this._grid.set("query", query);
			this._grid.refresh();
		},

		_showDetail: function(actor) {
			this.actorWidget.showDetail(actor);
		},

		_showCreate: function() {
			this.actorWidget.showCreate();
		},

		_showActorSearch: function() {
			this.actorWidget.showActorSearch();
		},

		_showVKBOSearch: function() {
			this.actorWidget.showVKBOSearch();
		},

		_showVKBPSearch: function() {
			this.actorWidget.showVKBPSearch();
		},

		_emitSelectedActoren: function() {
			for(var id in this._grid.selection){
				if(this._grid.selection[id]){
					this.actorController.getActor(id).
						then(lang.hitch(this, function(actor){
							this._emitActor(actor);
						}));
				}
			}
		},

		_emitActor: function(actor) {
			this.actorWidget.emitActor(actor);
		}

	});
});