define([
  'dojo/text!./templates/ActorAdvancedSearch.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  './ActorController',
  './ActorAdvSearchActor',
  './ActorAdvSearchVKBO',
  './ActorAdvSearchVKBP'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  ActorController,
  ActorAdvSearchActor,
  ActorAdvSearchVKBO,
  ActorAdvSearchVKBP
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

	templateString: template,
	baseClass: 'actor-widget',
	widgetsInTemplate: true,
	actorWidget: null,
	actorController: null,
	baseUrl: null,

	postCreate: function() {
	  console.log('..ActorAdvancedSearch::postCreate', arguments);
	  this.inherited(arguments);
	  this.baseUrl = this.actorWidget.baseUrl;
	  this.actorSearch = this.actorWidget._actorSearch;
	  this.erfgoed_id = this.actorWidget.erfgoed_id;
	  this.actorController = new ActorController({baseUrl: this.baseUrl});
	  this._setupLayout();
	},

	startup: function () {
	  console.log('..ActorAdvancedSearch::startup', arguments);
	  this.showActorSearch();
	},

	showActorSearch: function () {
	  this.actorAdvSearchStackContainer.addChild(this._actorAdvSearchActor);
	  this.actorAdvSearchStackContainer.removeChild(this._actorAdvSearchVKBO);
	  this.actorAdvSearchStackContainer.removeChild(this._actorAdvSearchVKBP);
      this.actorAdvSearchStackContainer.selectChild(this._actorAdvSearchActor);
    },

    showVKBOSearch: function () {
	  this.actorAdvSearchStackContainer.addChild(this._actorAdvSearchVKBO);
	  this.actorAdvSearchStackContainer.removeChild(this._actorAdvSearchActor);
	  this.actorAdvSearchStackContainer.removeChild(this._actorAdvSearchVKBP);
      this.actorAdvSearchStackContainer.selectChild(this._actorAdvSearchVKBO);
    },

    showVKBPSearch: function () {
	  this.actorAdvSearchStackContainer.addChild(this._actorAdvSearchVKBP);
	  this.actorAdvSearchStackContainer.removeChild(this._actorAdvSearchActor);
	  this.actorAdvSearchStackContainer.removeChild(this._actorAdvSearchVKBO);
      this.actorAdvSearchStackContainer.selectChild(this._actorAdvSearchVKBP);
    },

    _showSearch: function () {
      this.actorWidget.showSearch();
    },

	_setupLayout: function() {
	  // probleem: Wanneer meerdere widgets aan de stackcontainer worden toegevoegd worden deze beide getoond
      this._actorAdvSearchActor = new ActorAdvSearchActor({searchWidget: this});
      this._actorAdvSearchVKBO = new ActorAdvSearchVKBO({searchWidget: this});
      this._actorAdvSearchVKBP = new ActorAdvSearchVKBP({searchWidget: this});
    }
  });
});
