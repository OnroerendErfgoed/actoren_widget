define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dijit/layout/_LayoutWidget',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/Selection',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  'dojo/text!./templates/AdvSearch.html'
], function(
  declare,
  lang,
  Deferred,
  _LayoutWidget,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  OnDemandGrid,
  Keyboard,
  Selection,
  DijitRegistry,
  ColumnResizer,
  template
) {
  return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,


    /**
     * Standaard widget functie.
     */
    postCreate: function () {
      console.debug('...GridSearch::postCreate', arguments);
      this.inherited(arguments);
    },

    /**
     * Standaard widget functie.
     */
    startup: function () {
      console.debug('...GridSearch::startup', arguments);
      this.inherited(arguments);
    },

    _findActoren: function(evt) {
      evt ? evt.preventDefault() : null;
    }

  });
});