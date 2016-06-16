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
	//var baseUrl= "http://localhost:6565/";
	var baseUrl= "https://dev-actoren.onroerenderfgoed.be";
	var ssoToken = 'AQIC5wM2LY4SfcxPXhy-QEDRv-jE00BFc60P0-4-1A-YppQ.*AAJTSQACMDIAAlNLABQtNDMyNTgxNTE1NDQ3MjQ2MTA1MQACUzEAAjAx*';

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
		//crabHost: "http://localhost:6565/"
		crabHost: baseUrl
		//typeLists: {
		//	emailTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}], // get <actorenHost>/email_types
		//	telephoneTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}, {"naam": "mobiel", "id": 3}, {"naam": "fax thuis", "id": 4}, {"naam": "fax werk", "id": 5}], // get <actorenHost>/telephone_types
		//	urlTypes: [{"naam": "website", "id": 1}, {"naam": "blog", "id": 2}, {"naam": "webapplicatie", "id": 3}], // get <actorenHost>/url_types
		//	actorTypes: [{"naam": "persoon", "id": 1}, {"naam": "organisatie", "id": 2}], // get <actorenHost>/actor_types
     // adresTypes: [{"naam": "post", "id": 1}, {"naam": "primair", "id": 2}]
		//}
	}, 'widgetNode');
	actorWidget.startup();

});