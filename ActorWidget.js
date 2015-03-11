define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin'
], function (declare, WidgetBase, TemplatedMixin) {
  return declare([WidgetBase, TemplatedMixin], {

    templateString: '<div data-dojo-attach-point="actorNode">Actors</div>',

    postCreate: function () {
        this.inherited(arguments);
    },

    startup: function () {
      this.inherited(arguments);
    }
  });
});
