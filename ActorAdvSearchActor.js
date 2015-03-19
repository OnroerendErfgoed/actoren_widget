define([
  'dojo/text!./templates/ActorAdvSearchActor.html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin'
], function(
  template,
  declare,
  lang,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin
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
	},

	_findActoren: function() {
	  var query = this._getSearchParams();
	  this._filterGrid(query);
	  this._showSearch();
	},

	_getSearchParams: function() {
	  var query = {'organisatie': 501};
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
		'rrn'
	  ];
	  searchParams.forEach(lang.hitch(this, function(param) {
		console.log(this.naam.value);
		if (this.getAttributeNode(param)) {
		  query[param] = this.getAttribute(param).value;
		}
	  }));
	  return query;
	},

	_filterGrid: function (query) {
	  this.searchWidget.actorWidget._actorSearch.AdvSearchFilterGrid(query);
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