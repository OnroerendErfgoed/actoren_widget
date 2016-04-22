/**
 * De hoofd layout waarmee de actor widget wordt opgestart, opgebouwd en beheerd.
 * @module Actor/ActorWidget
 */
define([
  'dojo/text!./templates/ActorWidget.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/_base/fx',
  'dojo/dom-style',
  'dojo/dom-construct',
  'dojo/query',
  "dojo/promise/all",
  'dojo/_base/lang',
  'dijit/_WidgetsInTemplateMixin',
  '../controllers/ActorController',
  '../controllers/CrabController',
  '../controllers/ListController',
  '../views/ActorSearchView',
  '../views/ActorAdvSearchView',
  '../views/ActorDetailView',
  '../views/ActorEditView',
  '../views/ActorCreateView',
  '../views/VKBOAdvSearchView',
  '../views/VKBPAdvSearchView',
  //'./ActorAdvSearchUI',
  //'./actorWidgets/actorAdvSearch/ActorAdvSearchVKBO',
  //'./actorWidgets/actorAdvSearch/ActorAdvSearchVKBP',
  'dijit/layout/TabContainer',
  'dijit/layout/ContentPane',
  'dojo/NodeList-manipulate'
], function (
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  fx,
  domStyle,
  domConstruct,
  query,
  all,
  lang,
  _WidgetsInTemplateMixin,
  ActorController,
  CrabController,
  ListController,
  ActorSearchView,
  ActorAdvSearchView,
  ActorDetailView,
  ActorEditView,
  ActorCreateView,
  VKBOAdvSearchView,
  VKBPAdvSearchView
  //ActorAdvSearchUI,
  //ActorAdvSearchVKBO,
  //ActorAdvSearchVKBP,
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,
    actorWijStore: null,
    actorStore: null,
    actorController: null,
    listController: null,
    crabHost: null,
    ssoToken: null,
    canCreateActor: false,
    canEditActor: false,
    hideTabButtons: false,
    // default values
    actorCategories: {
      actoren: true,
      vkbo: false,
      vkbp: false
    },
    startMode: null,
    actorToCreate: null,
    typeLists: null,
    _actorSearch: null,
    _tabList: null,
    overlayContainer: null,

    /**
     * Standaard widget functie.
     * Aanmaken van de actor en crab controllers.
     * Layout opbouwen uit andere widgets.
     * Listener events toevoegen (log voor development).
     */
    postCreate: function () {
      this.inherited(arguments);
      console.log('ActorWidget::postCreate', arguments);
      this.typeLists = {};
      this.listController = new ListController({
        actorUrl: this.crabHost,
        ssoToken: this.ssoToken
      });
      this.actorController = new ActorController({
        actorWijStore: this.actorWijStore,
        actorStore: this.actorStore,
        ssoToken: this.ssoToken
      });
      this.crabController = new CrabController({
        crabHost: this.crabHost
      });

      this.overlayContainer = this.loadingOverlay;

      this.on('error', function(evt){
        console.log('error', evt.error);
      });
    },

    /**
     * Standaard widget functie.
     * Opstarten van de gebruikte widgets en de opstart-widget bepalen.
     */
    startup: function () {
      this.inherited(arguments);
      console.log('ActorWidget::startup', arguments);
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
        this._tabList = {};

        this._setupLayout();
        this.resize();
      }));
    },

    _setupLayout: function () {
      console.log("layout");
      this._createActorSearchView();
      this._createActorAdvSearchView();
      this._createActorDetailView();
      this._createActorEditView();
      this._createActorCreateView();
      this._createVKBOSearchView();
      this._createVKBPSearchView();
      if (this.isLoading()) {
        this.hideLoading();
      }
      if (this.hideTabButtons) {
        this.tabOverzicht.controlButton.domNode.style.display =  'none';
        this.tabAdvSearch.controlButton.domNode.style.display =  'none';
      }
      if (this.startMode === 'create') {
        this._openTab(this.tabActorCreate);
        var widget = this._tabList.actorCreate;
        widget._cancel = lang.hitch(this, function(evt) {
          evt? evt.preventDefault() : null;
          widget._reset();
          this.emit('create.cancel');
        });

      }
    },

    resize: function() {
      this.actorTabContainer.resize();
    },

    /**
     * Opent een bepaalde tab.
     * @param tab Tab
     */
    _openTab: function (tab) {
      this.actorTabContainer.selectChild(tab);
    },

    advSearchFilterGrid: function(query) {
      this._openTab(this.tabOverzicht);
      this._tabList.overzicht.advSearchFilterGrid(query);
    },

    setSelectedActor: function(actor) {
      this._tabList.overzicht.setSelectedActor(actor);
    },

    showActorDetail: function(actor) {
      this._openTab(this.tabActorDetail);
      if (actor) {
        this._tabList.actorDetail.setActor(actor);
      }
    },

    showActorEdit: function(actor) {
      this._openTab(this.tabActorEdit);
      if (actor) {
        this._tabList.actorEdit.setActor(actor);
      }
    },

    showActorCreate: function() {
      this._openTab(this.tabActorCreate);
      this._tabList.actorCreate._reset();
    },

    showActorSearch: function() {
      this._openTab(this.tabOverzicht);
    },

    getActorSearch: function() {
      return this._tabList.overzicht;
    },

    /**
     * Geeft aan of de 'Loading'-overlay zichtbaar is.
     * @public
     */
    isLoading: function () {
      var node = this.overlayContainer;
      return (domStyle.get(node, 'display') == 'block');
    },

    /**
     * Verbergt de 'Loading'-overlay.
     * @public
     */
    hideLoading: function () {
      var node = this.overlayContainer;
      fx.fadeOut({
        node: node,
        onEnd: function (node) {
          domStyle.set(node, 'display', 'none');
        },
        duration: 1000
      }).play();
    },

    /**
     * Toont de 'Loading'-overlay.
     * @public
     */
    showLoading: function (message) {
      if (!message) message = "";
      var node = this.overlayContainer;
      query(".loadingMessage", node).innerHTML(message);

      domStyle.set(node, 'display', 'block');
      fx.fadeIn({
        node: node,
        duration: 1
      }).play();
    },

    _createActorSearchView: function() {
      console.debug('ActorWidget::_createActorSearchView');
      var actorSearchView = new ActorSearchView({
        actorWidget: this,
        actorController: this.actorController,
        actorStore: this.actorStore
      }, this.overzichtNode);
      this._tabList.overzicht = actorSearchView;
      this._actorSearch = actorSearchView;
      //this._tabList.onFocus = lang.hitch(actorSearchView, actorSearchView.initialize);
      actorSearchView.startup();
    },

    _createActorAdvSearchView: function() {
      console.debug('ActorWidget::_createActorAdvSearchView');
      var actorAdvSearchView = new ActorAdvSearchView({
        actorWidget: this,
        actorController: this.actorController,
        actorStore: this.actorStore
      }, this.advSearchNode);
      this._tabList.advSearch = actorAdvSearchView;
      //this._tabList.onFocus = lang.hitch(actorAdvSearchView, actorAdvSearchView.initialize);
      actorAdvSearchView.startup();
    },

    _createActorDetailView: function() {
      console.debug('ActorWidget::_createActorDetailView');
      var actorDetailView = new ActorDetailView({
        actorWidget: this
      }, this.actorDetailNode);
      this._tabList.actorDetail = actorDetailView;
      this.tabActorDetail.controlButton.domNode.style.display =  'none'; // HIDE TAB BUTTON
      //this._tabList.onFocus = lang.hitch(actorDetailView, actorDetailView.initialize);
      actorDetailView.startup();
    },

    _createActorEditView: function() {
      if (this.canEditActor) {
        console.debug('ActorWidget::_createActorEditView');
        var actorEditView = new ActorEditView({
          actorWidget: this
        }, this.actorEditNode);
        this._tabList.actorEdit = actorEditView;
        //this._tabList.onFocus = lang.hitch(actorDetailView, actorDetailView.initialize);
        actorEditView.startup();
      }
      this.tabActorEdit.controlButton.domNode.style.display = 'none'; // HIDE TAB BUTTON
    },

    _createActorCreateView: function() {
      if (this.canCreateActor) {
        console.debug('ActorWidget::_createActorCreateView');
        var actorCreateView = new ActorCreateView({
          actorWidget: this
        }, this.actorCreateNode);
        this._tabList.actorCreate = actorCreateView;
        this.tabActorCreate.controlButton.domNode.style.display = 'none'; // HIDE TAB BUTTON
        //this._tabList.onFocus = lang.hitch(actorDetailView, actorDetailView.initialize);
        actorCreateView.startup();
      }
      this.tabActorCreate.controlButton.domNode.style.display = 'none'; // HIDE TAB BUTTON
    },

    _createVKBOSearchView: function() {
      if (this.actorCategories.vkbo) {
        console.debug('ActorWidget::_createVKBOSearchView');
        var advSearchVKBOView = new VKBOAdvSearchView({
          actorWidget: this
        }, this.VKBOSearchNode);
        this._tabList.vkboSearch = advSearchVKBOView;
        //this._tabList.onFocus = lang.hitch(actorDetailView, actorDetailView.initialize);
        advSearchVKBOView.startup();
      }
      else {
        this.tabVKBOSearch.controlButton.domNode.style.display =  'none'; // HIDE TAB BUTTON
      }
    },

    _createVKBPSearchView: function() {
      if (this.actorCategories.vkbp) {
        console.debug('ActorWidget::_createVKBPSearchView');
        var advSearchVKBPView = new VKBPAdvSearchView({
          actorWidget: this
        }, this.VKBPSearchNode);
        this._tabList.vkbpSearch = advSearchVKBPView;
        //this._tabList.onFocus = lang.hitch(actorDetailView, actorDetailView.initialize);
        advSearchVKBPView.startup();
      } else {
        this.tabVKBPSearch.controlButton.domNode.style.display =  'none'; // HIDE TAB BUTTON
      }
    },

    /**
     * Een event toevoegen aan deze widget waaraan een actor wordt meegeven.
     * @param {Object} actor
     */
    emitActor: function(actor) {
      this.emit('send.actor', {actor: actor});
    },

    /**
     * Geeft de geselecteerde actor.
     * @returns {Deferred.promise|*}
     */
    getSelectedActor: function() {
      return this.getActorSearch().getSelectedActor();
    },

    /**
     * Een event toevoegen aan deze widget waaraan een error wordt meegeven.
     * @param {Event} evt met error attribuut.
     */
    emitError: function(evt) {
      this.emit('error', evt);
    }

  });
});
