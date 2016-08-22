require([
  'actorwidget/AgentschapActor/AgentschapActorWidget',
	'dojo/store/Observable',
	'dojo/store/JsonRest',
  'dojo/domReady!'
], function (
  AgentschapActorWidget,
	Observable,
	JsonRest
) {
	//var baseUrl= "http://localhost:6565/";
	var baseUrl= "https://dev-actoren.onroerenderfgoed.be";
	var ssoToken = 'AQIC5wM2LY4Sfcwk-UhdlxdnObEuZT5H2AfQ7CSV6o_RjCk.*AAJTSQACMDIAAlNLABM0NDM4ODA4MzM3MDgwOTM5MjMzAAJTMQACMDM.*';

  var actorWijStore = new Observable(new JsonRest({
    target: baseUrl + '/actoren/wij/',
    sortParam: 'sort',
    idProperty: 'id',
    headers: {
      "X-Requested-With": "",
      "Content-Type": "application/json",
			"OpenAmSSOID": ssoToken
    }
  }));

  var actorStore = new Observable(new JsonRest({
    target: baseUrl + '/actoren/',
    sortParam: 'sort',
    idProperty: 'id',
    headers: {
      "X-Requested-With": "",
      "Content-Type": "application/json",
			"OpenAmSSOID": ssoToken
    }
  }));

  var actorWidget = new AgentschapActorWidget({
    actorWijStore: actorWijStore,
    actorStore: actorStore,
		crabHost: baseUrl,
    ssoToken: ssoToken
  }, 'widgetNode');
  actorWidget.startup();

});