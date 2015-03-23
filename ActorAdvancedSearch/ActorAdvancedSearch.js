define([
  'dojo/text!./../templates/ActorAdvancedSearch/ActorAdvancedSearch.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  './ActorAdvSearchActor',
	'../ActorCreate/ActorCreateActor'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  ActorAdvSearchActor,
	ActorCreateActor
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,
    actorWidget: null,
    actorController: null,
    baseUrl: null,
    crabHost:null,

    postCreate: function() {
      console.log('..ActorAdvancedSearch::postCreate', arguments);
      this.inherited(arguments);
      this._setupLayout();
    },

    startup: function () {
      console.log('..ActorAdvancedSearch::startup', arguments);
      this.inherited(arguments);
      this._showActorSearch();
    },

    _showActorSearch: function () {
      this.actorAdvSearchStackContainer.selectChild(this._actorAdvSearch);
    },

    _showActorCreate: function () {
      this.actorAdvSearchStackContainer.selectChild(this._actorCreate);
    },

    _showSearch: function () {
			this.actorAdvSearchStackContainer.selectChild(this._actorAdvSearch);
      this.actorWidget.showSearch();
    },

    _setupLayout: function() {
      this._actorAdvSearch = new ActorAdvSearchActor({actorWidget: this.actorWidget, actorAdvancedSearch : this});
      this._actorCreate = new ActorCreateActor({actorWidget: this.actorWidget, actorAdvancedSearch : this});

      this.actorAdvSearchStackContainer.addChild(this._actorAdvSearch);
      this.actorAdvSearchStackContainer.addChild(this._actorCreate);
    }
  });
});
