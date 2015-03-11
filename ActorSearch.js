define([
  'dojo/text!./templates/ActorSearch.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/layout/ContentPane'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-search',
    widgetsInTemplate: true,

    postCreate: function() {
      console.log('..ActorSearch::postCreate', arguments);
      this.inherited(arguments);
    }

  });
});