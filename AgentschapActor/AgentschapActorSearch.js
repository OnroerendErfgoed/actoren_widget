define([
	'dojo/text!./../templates/AgentschapActor/AgentschapActorSearch.html',
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

		postCreate: function() {
			console.log('..ActorSearch::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
			console.log('..ActorSearch::startup', arguments);
			this.inherited(arguments);
			this.actorController = this.actorWidget.actorController;
			this._createGrid();
		},

		_createGrid: function () {
			var columns = {
				//check: selector({label: "", selectorType: "checkbox", style: "width: 50px;"}),
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

		_filterGrid: function (evt) {
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

		_showDetail: function(actor) {
			this.actorWidget.showDetail(actor);
		},

		_emitSelectedActoren: function(evt) {
			evt.preventDefault();
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