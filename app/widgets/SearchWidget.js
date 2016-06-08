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
  GridSearch,
  AdvSearch
) {

  return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    actorStore: null,
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
      this._gridSearch.startup();
      this._gridSearch.resize();

      this._showAdvSearch();
    },

    _buildInterface: function() {
      // create stackcontainer
      this._stackContainer = new StackContainer({
        style: 'height: 400px'
      }, this.searchContainer);

      // gridSearch
      this._gridSearch = new GridSearch({
        actorStore: this.actorStore
      });

      this._gridSearchPane = new ContentPane({
        content: this._gridSearch,
        title: 'gridSearch'
      });
      this._stackContainer.addChild(this._gridSearchPane);

      // advSearch
       this._advSearch = new AdvSearch({
        actorStore: this.actorStore
      });
      this._advSearchPane = new ContentPane({
        content: this._advSearch,
        title: 'advSearch'
      });
      this._stackContainer.addChild(this._advSearchPane);
      this._stackContainer.startup();
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
    }
  });
});