require([
	'dojo/_base/declare',
	'actorwidget/test/widget/test_Dialog',
	'dstore/Trackable',
	'dstore/Rest',
	'dojo/_base/lang',
    'dijit/form/Button',
	'dojo/domReady!'
], function (
	declare,
	test_Dialog,
	Trackable,
	Rest,
	lang,
	Button
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


	var dialog = new test_Dialog({
		actorStore: actorStore
	});
	dialog.startup();


	 var myButton = new Button({
      label: "show dialog",
      onClick: lang.hitch(this, function () {
        dialog.show()
      })
    }, 'openDialog');
    myButton.startup();

	//actorWidget.createActor();
	//on(actorWidget, 'created', function(){})
	//actorWidget.showActor(uri);
  //
	//function _openDialog() {
	//	console.log('test');
	//	dialog.show();
	//}
});