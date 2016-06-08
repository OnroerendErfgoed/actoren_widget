define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  './widgets/SearchWidget'
], function (
  declare,
  _WidgetBase,
  SearchWidget
) {
  return declare([_WidgetBase], {

    actorStore: null,
    searchDomNode: null,
    _searchWidget: null,

    postCreate: function() {
      this.inherited(arguments);

      this._searchWidget = new SearchWidget({
        actorStore: this.actorStore
      });
    },

    startup: function() {
      this.inherited(arguments);
      this._searchWidget.startup();
    },

    getSearchWidget: function(node, store) {
      if (node) {
        this._searchWidget.placeAt(node);
      }
      if (store) {

      }
      return this._searchWidget;
    }

  });
});