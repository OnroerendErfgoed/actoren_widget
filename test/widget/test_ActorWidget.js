require([
  'actorwidget/ActorWidget',
  'dojo/domReady!'
], function (ActorWidget) {

  var actorWidget = new ActorWidget({
	baseUrl: "http://localhost:6543", erfgoed_id: 501
  }, 'widgetNode');
  actorWidget.startup();


});