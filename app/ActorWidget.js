define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
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
  array,
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
        idserviceUrl: this.idserviceUrl,
        actorenUrl: this.actorenUrl
      });

      this.crabController = new CrabController({
        crabHost: this.crabUrl.replace(/\/?$/, '/') // add trailing slash
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
      on(this._searchWidget, 'actor.open.edit', lang.hitch(this, function(evt) {
        this.editActorByUri(evt.actor.uri);
      }));

      this._viewActorDialog = new ViewActorDialog({
        actorenUrl: this.actorenUrl
      });

      this._manageActorDialog = new ManageActorDialog({
        actorenUrl: this.actorenUrl,
        crabController: this.crabController
      });
      on(this._manageActorDialog, 'actor.save', lang.hitch(this, function(evt) {
        this._saveActor(evt.actor, evt.method);
      }));
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
        this.actorController.getActorByUri(actorUri).then(lang.hitch(this, function(actor) {
          this._viewActorDialog.show(actor);
        }));
      }
    },

    editActor: function(actor) {
      if (actor) {
        this._manageActorDialog.show(actor, 'edit');
      }
    },

    editActorByUri: function(actorUri) {
      if (actorUri) {
        this.actorController.getActorByUri(actorUri).then(lang.hitch(this, function(actor) {
          this._manageActorDialog.show(actor, 'edit');
        }));
      }
    },

    createNewActor: function() {
      this._manageActorDialog.show(null, 'add');
    },

    createActor: function(actor) {
      this._manageActorDialog.show(actor, 'add');
    },

    _saveActor: function(data, mode) {
      console.log('SAVE ACTOR', data, mode);
      var actorToSave = data.actor;
      this.actorController.saveActor(actorToSave).then(lang.hitch(this, function(resActor) {
        actorToSave.id = resActor.id; // set id for new actors
        this._saveAdressen(data.adressen, actorToSave.id).then(lang.hitch(this, function(saveAdressenResult) {
          console.log('Alles gesaved', resActor, saveAdressenResult);
        }));
      }));
    },

    _saveAdressen: function(adressen, actorId) {
      var promises = [];
      array.forEach(adressen.add, function(adres) {
        promises.push(this.actorController.saveActorAdres(adres, actorId));
      }, this);
      array.forEach(adressen.edit, function(adres) {
        promises.push(this.actorController.editActorAdres(adres, actorId));
      }, this);
      array.forEach(adressen.remove, function(adres) {
        promises.push(this.actorController.deleteActorAdres(adres, actorId));
      }, this);
      return all(promises);
    },

    getTypeLists: function() {
      return this.typeLists;
    }
  });
});