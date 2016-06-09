define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/text!./test_Dialog.html',
  'actorwidget/app/ActorWidget'
], function (
  declare,
  array,
  domClass,
  domConstruct,
  domAttr,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Dialog,
  template,
  ActorWidget
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actorDialog',
    title: 'Actor',
    style: 'width: 1000px; height: 600px;',
    actorStore: null,
    actorenUrl: null,
    ssoToken: null,
    idserviceUrl: null,
    agivgrburl: null,
    crabpyurl: null,

    postCreate: function () {
      this.inherited(arguments);
      this.actorWidget = new ActorWidget({
        actorStore: this.actorStore,
        actorenUrl: this.actorenUrl,
        ssoToken: this.ssoToken,
        idserviceUrl: this.idserviceUrl,
        agivGrbUrl: this.agivgrburl,
        crabUrl: this.crabpyurl
      });
      this.actorWidget.startup();
    },

    startup: function () {
      this.inherited(arguments);
      this.widget = this.actorWidget.getSearchWidget(this.actorWidgetNode);
    },

    show: function() {
      this.inherited(arguments);
      this.widget.showSearchWidget(); // MUST BE CALLED IN DIALOG.SHOW WHEN USING DIALOGS
    }
  });
});
