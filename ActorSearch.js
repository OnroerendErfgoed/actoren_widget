define([
  'dojo/text!./templates/ActorSearch.html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  "dgrid/extensions/Pagination",
  "dojo/store/Observable",
  "dojo/store/JsonRest",
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
  Pagination,
  Observable,
  JsonRest,
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

    postCreate: function() {
      console.log('..ActorSearch::postCreate', arguments);
      this.inherited(arguments);
	  this.actorStore = new Observable(new JsonRest({
		target: this.baseUrl + '/actoren/wij',
		//target: this.baseUrl + '/actoren',
		sortParam: 'sort',
		idProperty:'id'
	  }));
	},

    startup: function () {
	  console.log('..ActorSearch::startup', arguments);
      this.inherited(arguments);
	  this._createGrid();
	  this._grid.on( 'dgrid-refresh-complete' , function (event) {
		console.log(event);
	  });

    },

	_createGrid: function () {
	  var columns = {
		check: selector({label: "", selectorType: "checkbox"}),
		id: '#',
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

      this._grid = new (declare([OnDemandGrid, Selection, Pagination]))({
        store: this.actorStore,
        columns: columns,
		pagingLinks: 1,
		pagingTextBox: true,
		firstLastArrows: true,
        sort: [
          { attribute: 'id' }
        ],
		loadingMessage: 'laden...',
        noDataMessage: 'geen resultaten beschikbaar'
      }, this.gridNode);


	  return this._grid;
	},

    _filterGrid: function (evt) {
      var newValue = evt.target.value;
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }
      this._timeoutId = setTimeout(lang.hitch(this, function() {
		if (newValue === '') {
		  this._grid.setQuery({});
		  this._grid.refresh()
		}
		else {
		  this._grid.set("query", {"query":newValue});
		  this._grid.refresh();
		}
      }, 30));
    }

  });
});