define([
  'dojo/text!./templates/ActorAdvSearchVKBP.html',
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
	  console.log('...ActorAdvSearchVKBO::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('...ActorAdvSearchVKBO::startup', arguments);
	},

	_showSearch: function() {
	    this.searchWidget._showSearch();
	},

	_showActorSearch: function() {
	    this.searchWidget.showActorSearch();
	},

	_showVKBOSearch: function() {
	    this.searchWidget.showVKBOSearch();
	}
  });
});