define([
  'dojo/text!./templates/ActorSearch.html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/request',
  'dojo/Deferred',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  "dojo/store/Observable",
  "dojo/store/JsonRest",
  'dgrid/Keyboard',
  'dgrid/extensions/DijitRegistry',
  'dgrid/OnDemandGrid',
  'dgrid/Selection',
  'dgrid/selector'
], function(
  template,
  declare,
  lang,
  request,
  Deferred,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Observable,
  JsonRest,
  Keyboard,
  DijitRegistry,
  OnDemandGrid,
  Selection,
  selector
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

	templateString: template,
	baseClass: 'actor-search',
	widgetsInTemplate: true,
	actorStore: null,
	baseUrl: null,
	_previousSearchValue:'',
	actorWidget: null,

	postCreate: function() {
	  console.log('..ActorSearch::postCreate', arguments);
	  this.inherited(arguments);
	  this.actorStore = new Observable(new JsonRest({
		target: this.baseUrl + '/actoren/wij',
		sortParam: 'sort',
		idProperty:'id',
		headers: {
            "X-Requested-With": "",
            "Content-Type": "application/json"
        }
	  }));
	},

	startup: function () {
	  console.log('..ActorSearch::startup', arguments);
	  this.inherited(arguments);
	  this._createGrid();
	},

	_createGrid: function () {
	  var columns = {
		check: selector({label: "", selectorType: "checkbox"}),
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
		store: this.actorStore,
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
		  this._getActor(id).
			then(lang.hitch(this, function(actor){
			  this._showDetail(actor);
			}));
		}


	  }));
	  this._grid.on(".dgrid-row:dblclick", lang.hitch(this, function(evt){
		var id = this._grid.row(evt).id;
		this._getActor(id).
		  then(lang.hitch(this, function(actor){
			this._emitActor(actor);
		  }));
	  }));
	  this._grid.refresh();

	},

	_getActor: function(id) {
	  var deferred = new Deferred();
	  request(this.baseUrl + '/actoren/' + id, {
		headers: {
		  'Accept': 'application/json',
		  'Content-Type': 'application/json'
		}
	  }).then(lang.hitch(this, function(actor){
		deferred.resolve(JSON.parse(actor));
	  }));
	  return deferred.promise;
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

	_showAdvancedSearch: function () {
	  this.actorWidget.showAdvancedSearch();
	},

	_emitSelectedActoren: function() {
	  for(var id in this._grid.selection){
		if(this._grid.selection[id]){
		  this._getActor(id).
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