define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'dojo/on',
  'dojo/promise/all',
  './controllers/ActorController',
  './controllers/CrabController',
  './controllers/ListController',
  './widgets/SearchWidget',
  './dialogs/ViewActorDialog',
  './dialogs/ManageActorDialog'
], function (
  declare,
  lang,
  _WidgetBase,
  on,
  all,
  ActorController,
  CrabController,
  ListController,
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
    typeLists: null,
    _initialized: false,
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

      this.listController = new ListController({
        ssoToken: this.ssoToken,
        actorUrl: this.actorenUrl
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
      this.typeLists = {};
    },

    startup: function() {
      this.inherited(arguments);

      all({
        email: this.listController.getStore('emailtypes'),
        tel: this.listController.getStore('telefoontypes'),
        url: this.listController.getStore('urltypes'),
        actor: this.listController.getStore('actortypes'),
        adres: this.listController.getStore('adrestypes')
      }).then(lang.hitch(this, function(results) {
        this.typeLists.emailTypes = results.email.data;
        this.typeLists.telephoneTypes = results.tel.data;
        this.typeLists.urlTypes = results.url.data;
        this.typeLists.actorTypes = results.actor.data;
        this.typeLists.adresTypes = results.adres.data;

        this._searchWidget.startup();
        this._viewActorDialog.startup();
        this._manageActorDialog.typeLists = this.typeLists;
        this._manageActorDialog.startup();
        this._initialized = true;
      }));

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
          this._viewActorDialog.show(res);
        }));
      }
    },

    createNewActor: function() {
      console.debug('create new actor');
      this._manageActorDialog.show();
    },

    getTypeLists: function() {
      return this.typeLists;
    }
  });
});