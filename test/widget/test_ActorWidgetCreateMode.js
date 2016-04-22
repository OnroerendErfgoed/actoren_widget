require([
	'actorwidget/widgets/ActorWidget',
	'dojo/store/Observable',
	'dojo/store/JsonRest',
	'dojo/domReady!'
], function (
	ActorWidget,
	Observable,
	JsonRest
) {
	var baseUrl= 'https://dev-actoren.onroerenderfgoed.be';
	var ssoToken = 'AQIC5wM2LY4SfcxBiA0_fpFhmsmyCzZ5fa2CXq8TmNS-3ow.*AAJTSQACMDIAAlNLABEyNjUwMjMxNjk0MjkyNDM2OQACUzEAAjAx*';

	var actorWijStore = new Observable(new JsonRest({
		target: baseUrl + '/actoren/wij/',
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
			'X-Requested-With': '',
			'Content-Type': 'application/json',
			'OpenAmSSOID': ssoToken
		}
	}));

	var actorStore = new Observable(new JsonRest({
		target: baseUrl + '/actoren/',
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
			'X-Requested-With': '',
			'Content-Type': 'application/json',
			'OpenAmSSOID': ssoToken
		}
	}));

  var testActor = {
    naam: 'testnaam',
    voornaam: 'testvoornaam'
  };

	var actorWidget = new ActorWidget({
		actorWijStore: actorWijStore,
		actorStore: actorStore,
    canCreateActor: true,
    canEditActor: true,
		ssoToken: ssoToken,
		actorCategories: {
			actoren: true,
			vkbo: false,
			vkbp: false
		},
		crabHost: baseUrl,
		startMode: 'create',
    actorToCreate: testActor,
		hideTabButtons: true
	}, 'widgetNode');
	actorWidget.startup();

});