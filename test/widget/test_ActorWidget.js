require([
  'actorwidget/ActorWidget',
  'dojo/domReady!'
], function (ActorWidget) {

  var actorWidget = new ActorWidget({}, 'widgetNode');
  actorWidget.showSearch();

});