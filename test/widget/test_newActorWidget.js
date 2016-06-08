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
	var ssoToken = 'AQIC5wM2LY4Sfcxdr2WjO8zDipRLBRJFl_UAsK7N62s7GtQ.*AAJTSQACMDIAAlNLABMxNTQ4MzUzNzA3NzUzMDE3Nzg1AAJTMQACMDE.*';
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