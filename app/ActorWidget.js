define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'dojo/on',
  './controllers/ActorController',
  './controllers/CrabController',
  './widgets/SearchWidget',
  './dialogs/ViewActorDialog',
  './dialogs/ManageActorDialog'
], function (
  declare,
  lang,
  _WidgetBase,
  on,
  ActorController,
  CrabController,
  SearchWidget,
  ViewActorDialog,
  ManageActorDialog
) {
  return declare([_WidgetBase], {

    actorStore: null,
    searchDomNode: null,
    actorenUrl: null,
    agivGrbUrl: null,
    crabUrl: null,
    ssoToken: null,
    idserviceUrl: null,
    actorController: null,
    crabController: null,
    _searchWidget: null,
    _viewWidget: null,

    postCreate: function() {
      this.inherited(arguments);

      this.actorController = new ActorController({
        actorStore: this.actorStore,
        ssoToken: this.ssoToken,
        idserviceUrl: this.idserviceUrl
      });

      this.crabController = new CrabController({
        agivGRBUrl: this.agivGrbUrl,
        crabHost: this.crabUrl.replace(/\/?$/, '/'), // add trailing slash
      });

      this._searchWidget = new SearchWidget({
        actorStore: this.actorStore
      });
      on(this._searchWidget, 'actor.open.view', lang.hitch(this, function(evt) {
        this.viewActorByUri(evt.actor.uri);
      }));
      on(this._searchWidget, 'actor.open.create', lang.hitch(this, function() {
        this.createNewActor();
      }));

      this._viewActorDialog = new ViewActorDialog({
        actorenUrl: this.actorenUrl
      });

      this._manageActorDialog = new ManageActorDialog({
        actorenUrl: this.actorenUrl,
        crabController: this.crabController
      });
    },

    startup: function() {
      this.inherited(arguments);
      this._searchWidget.startup();
      this._viewActorDialog.startup();
      this._manageActorDialog.startup();
    },

    getSearchWidget: function(node, store) {
      if (node) {
        this._searchWidget.placeAt(node);
      }
      if (store) {

      }
      return this._searchWidget;
    },

    viewActor: function(actor) {
      if (actor) {
        this._viewActorDialog.show(actor);
      }
    },

    viewActorByUri: function(actorUri) {
      if (actorUri) {
        this.actorController.getActorByUri(actorUri).then(lang.hitch(this, function(res) {
          console.log(res);
          this._viewActorDialog.show(res);
        }));
      }
    },

    createNewActor: function() {
      console.debug('create new actor');
      this._manageActorDialog.show();
    }
  });
});