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
  './dialogs/ManageActorDialog',
  './dialogs/ActorExistsDialog'
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
  ManageActorDialog,
  ActorExistsDialog
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
    canEditActor: true,
    canCreateActor: true,
    _initialized: false,
    _searchWidget: null,
    _viewWidget: null,
    _existsDialog: null,

    postCreate: function() {
      console.debug('.ActorWidget::postCreate', arguments);
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

      this._searchWidget = new SearchWidget({
        actorStore: this.actorStore,
        canEdit: this.canEditActor,
        canCreate: this.canCreateActor,
        actorTypes: this.typeLists.actorTypes,
        crabController: this.crabController
      });
      on(this._searchWidget, 'actor.open.view', lang.hitch(this, function(evt) {
        this.viewActorByUri(evt.actor.uri);
        evt.stopPropagation();
      }));
      on(this._searchWidget, 'actor.open.create', lang.hitch(this, function(evt) {
        this.createNewActor();
        evt.stopPropagation();
      }));
      on(this._searchWidget, 'actor.open.edit', lang.hitch(this, function(evt) {
        this.editActorByUri(evt.actor.uri);
        evt.stopPropagation();
      }));
      on(this._searchWidget, 'actor.selected', lang.hitch(this, function(evt) {
        this._actorSelected(evt.actor);
      }));

      this._viewActorDialog = new ViewActorDialog({
        actorenUrl: this.actorenUrl
      });

      this._manageActorDialog = new ManageActorDialog({
        actorenUrl: this.actorenUrl,
        typeLists: this.typeLists,
        crabController: this.crabController
      });
      on(this._manageActorDialog, 'actor.save', lang.hitch(this, function(evt) {
        this._saveActor(evt.actor, evt.mode);
      }));

      this.typeLists = {};
    },

    startup: function() {
      console.debug('.ActorWidget::startup', arguments);
      this.inherited(arguments);
      this._searchWidget.startup();
      this._viewActorDialog.startup();
      this._manageActorDialog.startup();
    },

    getSearchWidget: function(options, node) {
      if (node) {
        this._searchWidget.placeAt(node);
      }
      if (options) {
        this._searchWidget.setOptions(options);
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
        this.showLoading('Even geduld. Actor wordt opgehaald..');
        this.actorController.getActorByUri(actorUri).then(lang.hitch(this, function(actor) {
          this._viewActorDialog.show(actor);
        }), lang.hitch(this, function(err) {
          this._emitError(err);
        })).always(lang.hitch(this, function() {
          this.hideLoading();
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
        this.showLoading('Even geduld. Actor wordt opgehaald..');
        this.actorController.getActorByUri(actorUri).then(lang.hitch(this, function(actor) {
          this._manageActorDialog.show(actor, 'edit');
        }), lang.hitch(this, function(err) {
          this._emitError(err);
        })).always(lang.hitch(this, function() {
          this.hideLoading();
        }));
      }
    },

    createNewActor: function() {
      this._manageActorDialog.show(null, 'add');
    },

    createActor: function(actor) {
      this._manageActorDialog.show(actor, 'add');
    },

    _checkActorExists: function(actor, adressen) {
      console.log(adressen);
      this.actorController.gelijkaardigeActors(actor, adressen).then(lang.hitch(this, function(data) {
        if (data.length == 0) {
          this._doSave(actor, adressen);
        }
        else {
          this._existsDialog = new ActorExistsDialog({
            actorController: this.actorController,
            actoren: data,
            parent: this,
            checkActor: actor,
            checkAdressen: adressen,
            canSelect: true
          });
          this._existsDialog.startup();
        }
      }), lang.hitch(this, function(err) {
        this._emitError(err);
      }));
    },

    _useExistingActor: function(selected) {
      this.actorController.getActor(selected.id).then(
        lang.hitch(this, function (actor) {
          this._actorSelected(actor);
          this._searchWidget.setSelectedGridActor(actor);
          this._manageActorDialog.hide();
        }), lang.hitch(this, function(err) {
          this._emitError(err);
        }));
    },

    _saveActor: function(data, mode) {
      console.log('SAVE ACTOR', data, mode);
      var actorToSave = data.actor;
      if (mode === 'add') {
        var adressen = data.adressen.add;
        this._checkActorExists(actorToSave, adressen);
      } else {
        this._doSave(actorToSave, data.adressen);
      }
    },

    _doSave: function(actor, adressen) {
      console.log('SAVE ACTOR', actor, adressen);
      this.showLoading('Even geduld. Actor wordt opgeslagen..');
      this.actorController.saveActor(actor).then(lang.hitch(this, function(resActor) {
        actor.id = resActor.id; // set id for new actors
        this._saveAdressen(adressen, actor.id).then(lang.hitch(this, function(saveAdressenResult) {
          console.log('Alles gesaved', resActor, saveAdressenResult);
          this._manageActorDialog.hide();
          this.emit('actorwidget.saved', {actor: resActor});
        })).always(lang.hitch(this, function() {
          this.hideLoading();
        }));
      }), lang.hitch(this, function(err) {
        this._emitError(err);
        this.hideLoading();
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

    _actorSelected: function(actor) {
      console.debug('ACTOR SELECTED', actor);
      this.emit('actorwidget.selected', {
        actor: actor
      });
    },

    getTypeLists: function() {
      return this.typeLists;
    },

    _emitError: function(error) {
      this.emit('error', {
        error: error
      });
    },

    showLoading: function(message) {
      if (this._searchWidget) {
        this._searchWidget.showLoading(message);
      }
      if (this._manageActorDialog) {
        this._manageActorDialog.showLoading(message);
      }
    },

    hideLoading: function() {
      if (this._searchWidget) {
        this._searchWidget.hideLoading();
      }
      if (this._manageActorDialog) {
        this._manageActorDialog.hideLoading();
      }
    }
  });
});