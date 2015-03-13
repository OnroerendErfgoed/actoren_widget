require([
  'actorwidget/ActorWidget',
  'dojo/domReady!'
], function (ActorWidget) {

  var actorWidget = new ActorWidget({
	baseUrl: "http://localhost:6543"
  }, 'widgetNode');
  actorWidget.startup();
  actorWidget.showSearch();

});