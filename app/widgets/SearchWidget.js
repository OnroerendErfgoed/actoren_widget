define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dijit/layout/_LayoutWidget',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/SearchWidget.html',
  'dijit/layout/StackContainer',
  'dijit/layout/LayoutContainer',
  'dijit/layout/ContentPane',
  'dojo/dom-class',
  'dojo/dom-style',
  'dojo/query',
  'dojo/on',
  'dojo/_base/fx',
  './GridSearch',
  './AdvSearch'
], function(
  declare,
  lang,
  Deferred,
  _LayoutWidget,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  template,
  StackContainer,
  LayoutContainer,
  ContentPane,
  domClass,
  domStyle,
  query,
  on,
  fx,
  GridSearch,
  AdvSearch
) {

  return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'search-actor-widget',
    actorStore: null,
    actorTypes: null,
    canEdit: null,
    canCreate: null,
    _gridSearch: null,
    _advSearch: null,

    /**
     * Standaard widget functie.
     */
    postCreate: function () {
      console.debug('..SearchWidget::postCreate', arguments);
      this.inherited(arguments);

      this._buildInterface();
    },

    /**
     * Standaard widget functie.
     */
    startup: function () {
      console.debug('..SearchWidget::startup', arguments);
      this.inherited(arguments);
      this._stackContainer.startup();
      this._gridSearch.resize();
      this._showAdvSearch();
    },

    _buildInterface: function() {
      // create stackcontainer
      this._stackContainer = new StackContainer({
      }, this.searchContainer);

      // gridSearch
      this._gridSearch = new GridSearch({
        actorStore: this.actorStore,
        _canEdit: this.canEdit,
        _canCreate: this.canCreate
      });

      this._gridSearchPane = new ContentPane({
        content: this._gridSearch,
        title: 'gridSearch'
      });
      this._stackContainer.addChild(this._gridSearchPane);

      // advSearch
      this._advSearch = new AdvSearch({
        actorStore: this.actorStore,
        actorTypes: this.actorTypes
      });
      on(this._advSearch, 'filter.grid', lang.hitch(this, function(evt) {
        this._advFilterGrid(evt.query);
      }));
      this._advSearchPane = new ContentPane({
        content: this._advSearch,
        title: 'advSearch'
      });
      this._stackContainer.addChild(this._advSearchPane);
    },

    _showGridSearch: function(evt) {
      evt ? evt.preventDefault() : null;
      this._stackContainer.selectChild(this._gridSearchPane, false);
      this._gridSearch.resize();
    },

    _showAdvSearch: function(evt) {
      evt ? evt.preventDefault() : null;
      this._stackContainer.selectChild(this._advSearchPane, false);
    },

    showSearchWidget: function() {
      this._showGridSearch();
    },

    setOptions: function(options) {
      if (options.store) {
        this.actorStore = options.store;
        this._gridSearch.setStore(this.actorStore);
      }
      this._gridSearch.setSecurityOptions(options.canEditActor, options.canCreateActor);
    },

    _advFilterGrid: function(query) {
      this._gridSearch.advFilterGrid(query);
      this.showSearchWidget();
    },

    /**
     * Verbergt de 'Loading'-overlay.
     * @public
     */
    hideLoading: function () {
      var node = this.loadingOverlay;
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
      var node = this.loadingOverlay;
      if (!message) {
        message = '';
      }
      query('.loadingMessage', node).forEach(function(node){
        node.innerHTML = message;
      });

      domStyle.set(node, 'display', 'block');
      fx.fadeIn({
        node: node,
        duration: 1
      }).play();
    }
  });
});