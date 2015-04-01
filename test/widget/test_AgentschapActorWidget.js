require([
  'actorwidget/AgentschapActor/AgentschapActorWidget',
	'dojo/store/Observable',
	'actorwidget/test/util/JsonRestCors',
  'dojo/domReady!'
], function (
  AgentschapActorWidget,
	Observable,
	JsonRestCors
) {

  var baseUrl= "http://localhost:6543";

  var actorWijStore = new Observable(new JsonRestCors({
    target: baseUrl + '/actoren/wij/',
    sortParam: 'sort',
    idProperty: 'id',
    withCredentials: true,
    headers: {
      "X-Requested-With": "",
      "Content-Type": "application/json"
    }
  }));

  var actorStore = new Observable(new JsonRestCors({
    target: baseUrl + '/actoren/',
    sortParam: 'sort',
    idProperty: 'id',
    withCredentials: true,
    headers: {
      "X-Requested-With": "",
      "Content-Type": "application/json"
    }
  }));

  var actorWidget = new AgentschapActorWidget({
    actorWijStore: actorWijStore,
    actorStore: actorStore
  }, 'widgetNode');
  actorWidget.startup();

});