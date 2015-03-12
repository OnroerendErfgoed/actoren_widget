define([
  'dojo/text!./templates/ActorSearch.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  "dojo/store/Memory",
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/extensions/DijitRegistry'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Memory,
  OnDemandGrid,
  Keyboard,
  DijitRegistry
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-search',
    widgetsInTemplate: true,
	actorStore: null,

    postCreate: function() {
      console.log('..ActorSearch::postCreate', arguments);
      this.inherited(arguments);

	  this.actorStore = new Memory({
		data: [
		  {id:1, naam:'testNaam', voornaam:'testVoornaam', adres: 'testAdres', emails: ['testEmail@test.be']},
		  {id:1, naam:'testNaam2', voornaam:'testVoornaam2', adres: 'testAdres2', emails: ['testEmail2@test.be']}
		]
	  });
	  this._createGrid();
    },

    startup: function () {
	  console.log('..ActorSearch::startup', arguments);
      this.inherited(arguments);
	  this._createGrid();
    },

	_createGrid: function () {
	  var columns = [
		{id:"id", label:"#", field:"id"},
		{id:"voornaam", label:"Voornaam", field:"voornaam"},
		{id:"naam", label:"Naam", field:"naam"},
		{id:"adres", label:"Adres", field:"adres"},
		{
		  id: "mail", label: "Mail", field: "emails",
		  formatter: function (emails) {
			return emails.join('; ');
		  }
		}
	  ];
      this._grid = new (declare([OnDemandGrid, Keyboard, DijitRegistry]))({
        store: this.actorStore,
        columns: columns,
        sort: [
          { attribute: 'naam' }
        ],
        noDataMessage: 'geen resultaten beschikbaar'
      }, this.gridNode);

      this._grid.refresh();
      this._grid.resize();

	  return this._grid;
	},

    _filterGrid: function (evt) {
      var newValue = evt.target.actorenFilter.value;
	  //this._grid.set("query", {query: "*" + newValue + "*"});
	  this._grid.set("query", {naam: newValue });
	  this._grid.refresh();
    },

    _sortGrid: function (evt) {
      var newValue = evt.target.value;
	  this._grid.set("sort", [{ attribute: newValue}]);
	  this._grid.refresh();
    }

  });
});