define([
  'dojo/text!./../templates/ActorAdvancedSearch/ActorAdvSearchVKBO.html',
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
	  console.log('...ActorAdvSearchVKBO::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('...ActorAdvSearchVKBO::startup', arguments);
	  this.inherited(arguments);
	},

	_findVKBO: function() {
	  var query = this._getSearchParams();
	  this._filterGrid(query);
	  this._showSearch();
	},

	_getSearchParams: function() {
	  var query = {'type': 2};
	  var searchParams = [
		'naam',
		'straat',
		'nummer',
		'postbus',
	  	'gemeente',
		'land',
		'persid'
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

	_showActorSearch: function() {
	    this.searchWidget.showActorSearch();
	},

	_showVKBPSearch: function() {
	    this.searchWidget.showVKBPSearch();
	}
  });
});