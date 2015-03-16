define([
  'dojo/text!./templates/ActorWidget.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  './ActorSearch',
  './ActorDetail',
  "dijit/registry",
  'dijit/layout/ContentPane',
  'dijit/layout/StackContainer'
], function (
    template,
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    ActorSearch,
	ActorDetail,
	registry,
	ContentPane
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,
	baseUrl: null,

    _actorSearch: null,

    postCreate: function () {
      this.inherited(arguments);
      console.log('ActorWidget::postCreate', arguments);

      this._setupLayout();
    },

    startup: function () {
      this.inherited(arguments);
      console.log('ActorWidget::startup', arguments);
	  this.showSearch();
    },

    showSearch: function () {
	  this.actorStackContainer.addChild(this._actorSearch);
	  this.actorStackContainer.removeChild(this._actorDetail);
      this.actorStackContainer.selectChild(this._actorSearch);
    },

    showDetail: function (actor) {
	  this.actorStackContainer.addChild(this._actorDetail);
	  this._actorDetail.setActor(actor);
	  this.actorStackContainer.removeChild(this._actorSearch);
      this.actorStackContainer.selectChild(this._actorDetail);
    },

    _setupLayout: function() {
      this._actorSearch = new ActorSearch({baseUrl: this.baseUrl, actorWidget: this});
      this._actorDetail = new ActorDetail({actorWidget: this});
    }


  });
});
