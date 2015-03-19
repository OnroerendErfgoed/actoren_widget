define([
  'dojo/text!./../templates/ActorCreate/ActorCreate.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  './ActorCreateActor',
  './ActorCreateVKBO',
  './ActorCreateVKBP'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  ActorCreateActor,
  ActorCreateVKBO,
  ActorCreateVKBP
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

	templateString: template,
	baseClass: 'actor-widget',
	widgetsInTemplate: true,
	actor: null,
	actorWidget: null,


	postCreate: function() {
	  console.log('..ActorCreate::postCreate', arguments);
	  this.inherited(arguments);
	  this._setupLayout();
	},

	startup: function () {
	  console.log('..ActorCreate::startup', arguments);
	  this.showActorCreate();
	},

	showActorCreate: function () {
	    this.actorCreateStackContainer.addChild(this._actorCreateActor);
	    this.actorCreateStackContainer.removeChild(this._actorCreateVKBO);
	    this.actorCreateStackContainer.removeChild(this._actorCreateVKBP);
	    this.actorCreateStackContainer.selectChild(this._actorCreateActor);
	},

	showActorCreateVKBO: function () {
	    this.actorCreateStackContainer.addChild(this._actorCreateVKBO);
	    this.actorCreateStackContainer.removeChild(this._actorCreateActor);
	    this.actorCreateStackContainer.removeChild(this._actorCreateVKBP);
	    this.actorCreateStackContainer.selectChild(this._actorCreateVKBO);
	},

	showActorCreateVKBP: function () {
	    this.actorCreateStackContainer.addChild(this._actorCreateVKBP);
	    this.actorCreateStackContainer.removeChild(this._actorCreateActor);
	    this.actorCreateStackContainer.removeChild(this._actorCreateVKBO);
	    this.actorCreateStackContainer.selectChild(this._actorCreateVKBP);
	},

	_showSearch: function () {
      this.actorWidget.showSearch();
    },

    _setupLayout: function() {
      this._actorCreateActor = new ActorCreateActor({createWidget: this});
      this._actorCreateVKBO = new ActorCreateVKBO({createWidget: this});
      this._actorCreateVKBP = new ActorCreateVKBP({createWidget: this});
    }
  });
});
