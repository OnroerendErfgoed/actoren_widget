define([
  'dojo/text!./templates/ActorCreateActor.html',
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
	  console.log('...ActorCreateActor::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('...ActorCreateActor::startup', arguments);
	},

	_openSearch: function() {
	  this.createWidget._showSearch();
	},

	_showActorCreateVKBO: function() {
	  this.createWidget.showActorCreateVKBO();
	}
  });
});
