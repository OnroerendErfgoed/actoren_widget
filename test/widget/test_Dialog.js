define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/promise/all',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/text!./test_Dialog.html',
  'actorwidget/app/ActorWidget'
], function (
  declare,
  array,
  lang,
  domClass,
  domConstruct,
  domAttr,
  all,
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
    typeLists: null,
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
        crabUrl: this.crabpyurl,
        typeLists: this.typeLists,
        canEditActor: true,
        canCreateActor: true
      });
    },

    startup: function () {
      this.inherited(arguments);
      this.actorWidget.startup();
      this.widget = this.actorWidget.getSearchWidget({}, this.actorWidgetNode);
    },

    show: function() {
      this.inherited(arguments);
      this.widget.showSearchWidget(); // MUST BE CALLED IN DIALOG.SHOW WHEN USING DIALOGS
    }
  });
});
