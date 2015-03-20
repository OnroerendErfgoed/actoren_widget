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
	_straatCombobox: null,

	postCreate: function() {
	  console.log('...ActorAdvSearchActor::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('...ActorAdvSearchActor::startup', arguments);
	  this.inherited(arguments);
	  this._setGemeenten();
	  this.postcodeCrab.style.display="none";
	  this._setStraten();
	},

	_setGemeenten: function() {
	  this.searchWidget.crabController.getGeementen().
		then(lang.hitch(this, function(gemeenten){
		  this._gemeenteCombobox = new ComboBox({
			store: new Memory({data: gemeenten}),
			hasDownArrow: false,
			searchAttr: "naam",
			autoComplete: false,
			required: false,
			placeholder: "gemeente",
			class: "input-label-right search-combobox",
			style: "width: 60%;",
			onChange: lang.hitch(this, function() {
			  //moet eerst nog op dev-geo.onroerenderfgoed.be
			  // this._changePostcodes()
			  this._changeStraten();
			})
		  }, this.gemeenteCrab);
		}));
	  this.gemeente.style.display="none";
	},

	_setStraten: function() {
	  this._straatCombobox = new ComboBox({
		store: new Memory(),
		hasDownArrow: false,
		searchAttr: "label",
		autoComplete: false,
		required: false,
		placeholder: "straat",
		class: "search-combobox"
	  }, this.straatCrab);
	  this.straatCrabNode.style.display="none";
	},

	_changeGemeenten: function() {
	  if (this.land.value != 'BE') {
		this.gemeenteCrabNode.style.display="none";
		this.straatCrabNode.style.display="none";
		this.gemeente.style.display="block";
		this.straat.style.display="block";
		this._gemeenteCombobox.set("value", '');
		this._straatCombobox.set("value", '');
	  }
	  else {
		this.gemeente.style.display="none";
		this.gemeenteCrabNode.style.display="block";
		this.gemeente.value='';
	  }
	},

	_changePostcodes: function() {
	  if (this._gemeenteCombobox.item.id) {
		this.searchWidget.crabController.getPostkantons(this._gemeenteCombobox.item.id).
		  then(lang.hitch(this, function (postcodes) {
			this.postcode.style.display = "none";
			this.postcode.value = '';
			this.postcodeCrab.addOption(postcodes);
			this.postcodeCrab.style.display = "block";
		  }));
	  }
	},

	_changeStraten: function() {
	  if (this._gemeenteCombobox.item.id) {
		this.searchWidget.crabController.getStraten(this._gemeenteCombobox.item.id).
		  then(lang.hitch(this, function (straten) {
			this.straat.style.display = "none";
			this.straat.value = '';
			this._straatCombobox.set('store', new Memory({data: straten}));
			this.straatCrabNode.style.display = "block";
		  }));
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