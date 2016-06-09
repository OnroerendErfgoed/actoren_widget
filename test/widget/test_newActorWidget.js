require([
	'dojo/_base/declare',
	'actorwidget/app/ActorWidget',
	'dstore/Trackable',
	'dstore/Rest',
	'dojo/domReady!'
], function (
	declare,
	ActorWidget,
	Trackable,
	Rest
) {
	//var baseUrl= "http://localhost:6565/";
	var baseUrl= "https://dev-actoren.onroerenderfgoed.be";
	var ssoToken = 'AQIC5wM2LY4Sfcy_6JlKjf0ekepmH2Lp4cWwQvQcI__GITE.*AAJTSQACMDIAAlNLABQtNzc1MzE2ODU4MDAyNzcxMzc1NgACUzEAAjAz*';
	var trackStore = declare([Rest, Trackable]);
	var actorStore = new trackStore({
		target: baseUrl + '/actoren/',
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
			"X-Requested-With": "",
			"Content-Type": "application/json",
			"OpenAmSSOID": ssoToken
		},
		useRangeHeaders: true
	});

	var actorWidget = new ActorWidget({
		actorStore: actorStore
	});
	actorWidget.startup();

	var search = actorWidget.getSearchWidget('widgetNode');
	search.showSearchWidget();


	//actorWidget.createActor();
	//on(actorWidget, 'created', function(){})
	//actorWidget.showActor(uri);


});