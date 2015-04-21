require([
	'actorwidget/Actor/ActorWidget',
	'dojo/store/Observable',
	'actorwidget/test/util/JsonRestCors',
	'dojo/domReady!'
], function (
	ActorWidget,
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

	var actorWidget = new ActorWidget({
		actorWijStore: actorWijStore,
		actorStore: actorStore,
		permissionToAdd: true,
		permissionToEdit: true,
		actorCategories: {
			actoren: true,
			vkbo: false,
			vkbp: false
		},
		crabHost: "http://localhost:6543/",
		typeLists: {
			emailTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}], // get <actorenHost>/email_types
			telephoneTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}, {"naam": "mobiel", "id": 3}, {"naam": "fax thuis", "id": 4}, {"naam": "fax werk", "id": 5}], // get <actorenHost>/telephone_types
			urlTypes: [{"naam": "website", "id": 1}, {"naam": "blog", "id": 2}, {"naam": "webapplicatie", "id": 3}], // get <actorenHost>/url_types
			actorTypes: [{"naam": "persoon", "id": 1}, {"naam": "organisatie", "id": 2}] // get <actorenHost>/actor_types
		}
	}, 'widgetNode');
	actorWidget.startup();

});