require([
	'dojo/_base/declare',
	'actorwidget/test/widget/test_Dialog',
	'dstore/Trackable',
	'dstore/Rest',
	'dojo/_base/lang',
	'dojo/promise/all',
	'dijit/form/Button',
	'actorwidget/controllers/ListController',
	'dojo/domReady!'
], function (
	declare,
	test_Dialog,
	Trackable,
	Rest,
	lang,
	all,
	Button,
	ListController
) {
	//var baseUrl= "http://localhost:6565";
	var baseUrl= "https://dev-actoren.onroerenderfgoed.be";
	var ssoToken = 'AQIC5wM2LY4Sfcy1lRaASokbtEijZYG44iLUiR2EdEjl_AU.*AAJTSQACMDIAAlNLABQtNTI4ODAxNzkxODIwNjc1ODYxNQACUzEAAjAz*';
	var actor = JSON.parse('{"status": {"status": {"status": "Actief", "id": 75},"opmerkingen": "", "datum": "2015-10-29T17:33:52.774966+01:00", "gebruiker": {"uri": "vandaeko", "omschrijving": "vandaeko"}},"ids": [{"extra_id": "vandaeko", "type": {"naam": "uid", "id": 7}, "actor_id": 1}, {"extra_id": "ejqXLMvSRNTGEtlaZCKeZA", "type": {"naam": "persid", "id": 5}, "actor_id": 1}], "erkenningen": [], "adres": {"huisnummer": "19", "huisnummer_id": 2779410, "subadres_id": 425604, "startdatum": "2015-05-08T00:00:00+02:00", "straat": "Koning Albert II-Laan", "straat_id": 139852, "postcode": "1210", "id": 60, "gemeente": "Sint-Joost-ten-Node", "adrestype": {"naam": "Primair", "id": 1},"land": "BE", "subadres": "5", "einddatum": null, "omschrijving": "Koning Albert II-Laan 19 bus 5, 1210 Sint-Joost-ten-Node", "gemeente_id": 84},"adressen": [{"huisnummer": "19", "huisnummer_id": 2779410, "subadres_id": 425604, "startdatum": "2015-05-08T00:00:00+02:00", "straat": "Koning Albert II-Laan", "straat_id": 139852, "postcode": "1210", "id": 60, "gemeente": "Sint-Joost-ten-Node", "adrestype": {"naam": "Primair", "id": 1}, "land": "BE", "subadres": "5", "einddatum": null, "omschrijving": "Koning Albert II-Laan 19 bus 5, 1210 Sint-Joost-ten-Node", "gemeente_id": 84}], "naam": "Van Daele", "self": "https://dev-actoren.onroerenderfgoed.be/actoren/1", "uri": "https://dev-id.erfgoed.net/actoren/1", "emails": [{"type": {"naam": "werk", "id": 2}, "email": "koen.vandaele@rwo.vlaanderen.be"}, {"type": {"naam": "thuis", "id": 1}, "email": "koen_van_daele@telenet.be"}], "voornaam": "Koen", "systemfields": {"created_at": "2007-10-05T00:14:12+02:00", "updated_at": "2016-04-20T15:05:42.601882+02:00", "created_by": {"uri": "https://id.erfgoed.net/actoren/501", "description": "Onroerend Erfgoed"},"updated_by": {"uri": "https://dev-id.erfgoed.net/actoren/10051", "description": "Millet, Klaas"}},"urls": [], "telefoons": [{"type": {"naam": "werk", "id": 2}, "nummer": "25531682", "landcode": "+32", "volledig_nummer": "+3225531682"}], "afkorting": null, "relaties": [{"einddatum": null, "type": {"naam": "is deel van", "id": 1, "inverse_id": 2}, "id": 501, "startdatum": null}], "type": {"naam": "publieke persoon", "id": 3},"id": 1, "omschrijving": "Van Daele, Koen"}');
	var idservice= 'https://dev-id.erfgoed.net';
	var testActor = JSON.parse('{"naam": "joske"}');
	var crabpyurl = 'https://dev-geo.onroerenderfgoed.be';

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

	var typeLists = {};
	var listController = new ListController({
		ssoToken: ssoToken,
		actorUrl: baseUrl
	});

	all({
		email: listController.getStore('emailtypes'),
		tel: listController.getStore('telefoontypes'),
		url: listController.getStore('urltypes'),
		actor: listController.getStore('actortypes'),
		adres: listController.getStore('adrestypes')
	}).then(lang.hitch(this, function(results) {
		typeLists.emailTypes = results.email.data;
		typeLists.telephoneTypes = results.tel.data;
		typeLists.urlTypes = results.url.data;
		typeLists.actorTypes = results.actor.data;
		typeLists.adresTypes = results.adres.data;


		var dialog = new test_Dialog({
			actorStore: actorStore,
			actorenUrl: baseUrl,
			ssoToken: ssoToken,
			idserviceUrl: idservice,
			crabpyurl: crabpyurl,
			typeLists: typeLists
		});
		dialog.startup();


		var myButton = new Button({
			label: "show dialog",
			onClick: lang.hitch(this, function () {
				dialog.show();
			})
		}, 'openDialog');
		myButton.startup();

		var myButton2 = new Button({
			label: "show actor",
			onClick: lang.hitch(this, function () {
				dialog.actorWidget.viewActor(actor);
			})
		}, 'viewActor');
		myButton2.startup();

		var myButton3 = new Button({
			label: "edit actor",
			onClick: lang.hitch(this, function () {
				dialog.actorWidget.editActor(actor);
			})
		}, 'editActor');
		myButton3.startup();
	}));
});