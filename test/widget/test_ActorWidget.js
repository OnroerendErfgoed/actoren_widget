require([
	'actorwidget/widgets/ActorWidget',
	'dojo/store/Observable',
	'actorwidget/test/util/JsonRestCors',
	'dojo/domReady!'
], function (
	ActorWidget,
	Observable,
	JsonRestCors
) {
	var baseUrl= "http://localhost:6565";
	var ssoToken = 'u2_654897';

	var actorWijStore = new Observable(new JsonRestCors({
		target: baseUrl + '/actoren/wij/',
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
			"X-Requested-With": "",
			"Content-Type": "application/json",
			"OpenAmSSOID": ssoToken
		}
	}));

	var actorStore = new Observable(new JsonRestCors({
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
		ssoToken: this.ssoToken,
		actorCategories: {
			actoren: true,
			vkbo: false,
			vkbp: false
		},
		crabHost: "http://localhost:6565/",
		typeLists: {
			emailTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}], // get <actorenHost>/email_types
			telephoneTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}, {"naam": "mobiel", "id": 3}, {"naam": "fax thuis", "id": 4}, {"naam": "fax werk", "id": 5}], // get <actorenHost>/telephone_types
			urlTypes: [{"naam": "website", "id": 1}, {"naam": "blog", "id": 2}, {"naam": "webapplicatie", "id": 3}], // get <actorenHost>/url_types
			actorTypes: [{"naam": "persoon", "id": 1}, {"naam": "organisatie", "id": 2}], // get <actorenHost>/actor_types
      adresTypes: [{"naam": "post", "id": 1}, {"naam": "primair", "id": 2}]
		}
	}, 'widgetNode');
	actorWidget.startup();

});