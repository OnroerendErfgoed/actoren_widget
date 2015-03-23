require([
  'actorwidget/ActorWidget',
  'dojo/domReady!'
], function (ActorWidget) {

  var actorWidget = new ActorWidget({
	baseUrl: "http://localhost:6543",
	erfgoed_id: 501,
	crabHost: "https://dev-geo.onroerenderfgoed.be/"
	//in afwachting op 'Access-Control-Allow-Origin' header
	//crabHost: "https://dev-actoren.onroerenderfgoed.be/"
  }, 'widgetNode');
  actorWidget.startup();

});