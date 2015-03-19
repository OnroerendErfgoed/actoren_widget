define([
  'dojo/text!./templates/ActorCreateVKBO.html',
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
	actor: null,
	createWidget: null,


	postCreate: function() {
	  console.log('...ActorCreateVKBO::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('...ActorCreateVKBO::startup', arguments);
	},

	_openSearch: function() {
	  this.createWidget._showSearch();
	},

	_showActorCreate: function() {
	  this.createWidget.showActorCreate();
	}
  });
});
