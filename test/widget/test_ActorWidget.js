require([
  'actorwidget/ActorWidget',
  'dojo/domReady!'
], function (ActorWidget) {

  var actorWidget = new ActorWidget({
	baseUrl: "http://localhost:6544"
  }, 'widgetNode');
  actorWidget.startup();


});