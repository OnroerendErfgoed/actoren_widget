define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_Widget',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/on',
  'dojo/store/Observable',
  'actorwidget/test/util/JsonRestCors',
  'actorwidget/widgets/ActorWidget',
  'dojo/text!./test_ActorWidgetDialogDialog.html'
], function (declare, lang, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, on, Observable, JsonRestCors, ActorWidget, template) {
  return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    actorWidget: null,
    actorWijStore: null,
    actorStore: null,
    crabHost: null,

    postCreate: function () {
      this.inherited(arguments);
      console.debug("dialog postcreate");
      var self = this;
      self.dialog = new Dialog({title: 'Dialog title', style: "width: 1200px;" });
      self.dialog.set('content', self);
    },

    startup: function () {
      this.inherited(arguments);
      console.debug("dialog startup");

      // first show dialog, than create actorwidget, and finally resize dialog.
      // widget needs the dialog to be active before he adds the tabs.. otherwise no tabs shown.
      this.dialog.show();
      this._createActorWidget();
      this.actorWidget.startup();
      this.dialog.resize();
    },

    _createActorWidget: function () {
      var baseUrl= "localhost:6565";

      this.actorWijStore = new Observable(new JsonRestCors({
        target: baseUrl + '/actoren/wij/',
        sortParam: 'sort',
        idProperty: 'id',
        withCredentials: true,
        headers: {
          "X-Requested-With": "",
          "Content-Type": "application/json"
        }
      }));

      this.actorStore = new Observable(new JsonRestCors({
        target: baseUrl + '/actoren/',
        sortParam: 'sort',
        idProperty: 'id',
        withCredentials: true,
        headers: {
          "X-Requested-With": "",
          "Content-Type": "application/json"
        }
      }));

      this.actorWidget = new ActorWidget({
        actorWijStore: this.actorWijStore,
        actorStore: this.actorStore,
        canCreateActor: true,
        canEditActor: true,
        actorCategories: {
          actoren: true,
          vkbo: false,
          vkbp: false
        },
        crabHost: "http://localhost:6565",
        typeLists: {
          emailTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}], // get <actorenHost>/email_types
          telephoneTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}, {"naam": "mobiel", "id": 3}, {"naam": "fax thuis", "id": 4}, {"naam": "fax werk", "id": 5}], // get <actorenHost>/telephone_types
          urlTypes: [{"naam": "website", "id": 1}, {"naam": "blog", "id": 2}, {"naam": "webapplicatie", "id": 3}], // get <actorenHost>/url_types
          actorTypes: [{"naam": "persoon", "id": 1}, {"naam": "organisatie", "id": 2}], // get <actorenHost>/actor_types
          adresTypes: [{"naam": "post", "id": 1}, {"naam": "primair", "id": 2}]
        }
      }, this.actorWidgetNode);
      //this.actorWidget.startup();
    }

  });
});