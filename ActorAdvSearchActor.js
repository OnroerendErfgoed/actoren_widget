define([
  'dojo/text!./templates/ActorAdvSearchActor.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin'
], function(
  template,
  declare,
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
	  this.searchWidget.actorWidget._actorSearch.AdvSearchFilterGrid(query);
	  this._showSearch();
	},

	_getSearchParams: function() {
	  var query = {'organisatie': 501};
	  if (this.naam.value) {
		query.naam = this.naam.value;
	  }
	  if (this.voornaam.value) {
		query.voornaam = this.voornaam.value;
	  }
	  return query;
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