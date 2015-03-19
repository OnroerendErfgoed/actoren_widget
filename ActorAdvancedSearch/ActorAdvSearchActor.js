define([
  'dojo/text!./../templates/ActorAdvancedSearch/ActorAdvSearchActor.html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/store/Memory',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/form/ComboBox'
], function(
  template,
  declare,
  lang,
  Memory,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  ComboBox
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

	templateString: template,
	baseClass: 'actor-widget',
	widgetsInTemplate: true,
	searchWidget: null,

	postCreate: function() {
	  console.log('...ActorAdvSearchActor::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('...ActorAdvSearchActor::startup', arguments);
	  this._getGemeenten();

	},

	_getGemeenten: function() {
	  this.searchWidget.crabController.getGeementen().
		then(lang.hitch(this, function(gemeenten){
		  console.log(gemeenten);
		  var gemeentenSelect = new ComboBox({
			store: new Memory({data: gemeenten}),
			hasDownArrow: false,
			searchAttr: "naam",
			autoComplete: false,
			required: false,
			placeholder: "gemeente",
			style: "width: 175px;"
		  }, this.gemeente);
		}));

	},

	_changeGemeenten: function() {
	  if (this.land.value == 'BE') {
		console.log(this.lang.value);


	  }

	},

	_findActoren: function() {
	  var query = this._getSearchParams();
	  this._filterGrid(query);
	  this._showSearch();
	},

	_getSearchParams: function() {
	  var query = {'organisatie': this.searchWidget.erfgoed_id};
	  var searchParams = [
		'naam',
		'voornaam',
		'email',
		'telefoon',
		'straat',
		'nummer',
		'postbus',
		'gemeente',
		'land',
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
	  return query;
	},

	_filterGrid: function (query) {
	  this.searchWidget.actorSearch.AdvSearchFilterGrid(query);
	},

	_showSearch: function() {
	  this.searchWidget._showSearch();
	},

	_showVKBOSearch: function() {
	  this.searchWidget.showVKBOSearch();
	},

	_showVKBPSearch: function() {
	  this.searchWidget.showVKBPSearch();
	}
  });
});