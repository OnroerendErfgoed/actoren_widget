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

	_gemeenteCombobox: null,
	_gemeenteStore:null,
	_gemeenteId:null,

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
		  this._gemeenteStore = new Memory({data: gemeenten});
		  this._gemeenteCombobox = new ComboBox({
			store: this._gemeenteStore,
			hasDownArrow: false,
			searchAttr: "naam",
			required: false,
			placeholder: "gemeente",
			style: "width: 175px;"
		  }, this.gemeenteCrab);
		}));
	  this.gemeente.style.display="none";
	},

	_changeGemeenten: function() {
	  if (this.land.value != 'BE') {
		this.gemeenteCrabNode.style.display="none";
		this.gemeente.style.display="block";
		this._gemeenteCombobox.set("value", '');
	  }
	  else {
		this.gemeente.style.display="none";
		this.gemeenteCrabNode.style.display="block";
		this.gemeente.value='';
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
	  var comboboxen = [{
		combobox: this._gemeenteCombobox,
		parameter: 'gemeente'
	  }];
	  comboboxen.forEach(lang.hitch(this, function(object) {
		if (object.combobox.value) {
		  query[object.parameter] = object.combobox.value;
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