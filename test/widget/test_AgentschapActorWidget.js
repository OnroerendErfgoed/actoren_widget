require([
  'actorwidget/AgentschapActor/AgentschapActorWidget',
  'dojo/domReady!'
], function (AgentschapActorWidget) {

  var actorWidget = new AgentschapActorWidget({
	baseUrl: "http://localhost:6543"
  }, 'widgetNode');
  actorWidget.startup();

});