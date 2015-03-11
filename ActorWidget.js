define([
  'dojo/text!./templates/ActorWidget.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  './ActorSearch',
  'dijit/layout/StackContainer'
], function (
    template,
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    ActorSearch
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,

    _actorSearch: null,

    postCreate: function () {
      this.inherited(arguments);
      console.log('ActorWidget::postCreate', arguments);

      this._setupLayout();
    },

    startup: function () {
      this.inherited(arguments);
      console.log('ActorWidget::startup', arguments);
    },

    showSearch: function () {
      this.actorStackContainer.selectChild(this._actorSearch);
    },

    _setupLayout: function() {
      this._actorSearch = new ActorSearch();
      this.actorStackContainer.addChild(this._actorSearch)
    }


  });
});
