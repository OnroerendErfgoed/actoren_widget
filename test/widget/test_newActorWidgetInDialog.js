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
	var baseUrl= 'https://dev-actoren.onroerenderfgoed.be';
	var ssoToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4YktMaGdDMUZiTVd5ZFIxSkluQk54bUl' + 
	'oNVJEekFsYWtZWG9wb0N6UFVJIn0.eyJleHAiOjE2NzYzNzIyNDYsImlhdCI6MTY3NjM3MTk0NiwiYXV0aF90aW1lIjoxNjc2M' +
	'zcwNTIyLCJqdGkiOiJiNGNiNzI4NC00NzcxLTQ3YTktYmUwYS04MDJhNmI2MDcwZWMiLCJpc3MiOiJodHRwczovL3Nzb3YyLW9' +
	'udHdpa2tlbC5vbWdldmluZy52bGFhbmRlcmVuLmJlL2F1dGgvcmVhbG1zL09tZ2V2aW5nIiwic3ViIjoiODg4NzExMzAtNjM3Z' +
	'i00ZmJjLTk0ZGEtNzI4NzlmNmZhZmExIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidmlvZS1wcm9jZXMtdG9ldmFsc3ZvbmRzdGV' +
	'uIiwic2Vzc2lvbl9zdGF0ZSI6IjA0NjEwYzk2LWY2ZjMtNDYwYS1iYjJhLWY5YWU2YWUxZTFmZiIsImFjciI6IjEiLCJyZXNvd' +
	'XJjZV9hY2Nlc3MiOnsidmlvZS1kb3NzaWVycyI6eyJyb2xlcyI6WyJ2aW9lLWRvc3NpZXJzOmJlaGVlcmRlciJdfSwidmlvZS1' +
	'hY3RvcmVuIjp7InJvbGVzIjpbInZpb2UtYWN0b3JlbjphY3RvcmVuLmJlaGVlcmRlciJdfSwidmlvZS12b25kc3RtZWxkaW5nZ' + 
	'W4iOnsicm9sZXMiOlsidmlvZS12b25kc3RtZWxkaW5nZW46dm9uZHN0bWVsZGluZ2VuLWJlaGVlcmRlciJdfSwidmlvZS1wb3N' +
	'0Ijp7InJvbGVzIjpbInZpb2UtcG9zdDpiZWhlZXJkZXIiXX0sInZpb2UtdG9lbGF0aW5nZW4tYXJjaGVvbG9naWUiOnsicm9sZ' +
	'XMiOlsidmlvZS10b2VsYXRpbmdlbi1hcmNoZW9sb2dpZTpiZWhlZXJkZXIiXX0sInZpb2UtaW52ZW50YXJpcyI6eyJyb2xlcyI' +
	'6WyJ2aW9lLWludmVudGFyaXM6YmVoZWVyZGVyIl19LCJ2aW9lLWFsZ2VtZWVuIjp7InJvbGVzIjpbInZpb2UtYWxnZW1lZW46b' +
	'WVkZXdlcmtlcl9pdCJdfSwidmlvZS1kZ2VuIjp7InJvbGVzIjpbInZpb2UtZGdlbjpiZWhlZXJkZXIiXX0sInZpb2UtcHJvY2V' +
	'zLXRvZXZhbHN2b25kc3RlbiI6eyJyb2xlcyI6WyJ2aW9lLXByb2Nlcy10b2V2YWxzdm9uZHN0ZW46YmVoZWVyZGVyIl19fSwic' +
	'2NvcGUiOiJvcGVuaWQiLCJzaWQiOiIwNDYxMGM5Ni1mNmYzLTQ2MGEtYmIyYS1mOWFlNmFlMWUxZmYiLCJvcmdjb2RlIjoiT1Z' +
	'PMDAwMTA0Iiwib3JnbmFhbSI6Ik9ucm9lcmVuZCBFcmZnb2VkIiwicGVyc29vbmlkIjoiYjgyNjY0YTM2MDE0M2QwMTU0OGVlM' +
	'zViYTY0ZWIxOGFmZTMyNTAyMjY1MDgzMTM0NWMxOGU4OGU0YTg2NjJmYSIsImRvZWxncm9lcGNvZGUiOiJHSUQiLCJwcmVmZXJ' +
	'yZWRfdXNlcm5hbWUiOiJiODI2NjRhMzYwMTQzZDAxNTQ4ZWUzNWJhNjRlYjE4YWZlMzI1MDIyNjUwODMxMzQ1YzE4ZTg4ZTRhO' +
	'DY2MmZhLW92bzAwMDEwNCIsIm92b2NvZGUiOiJPVk8wMDAxMDQifQ.AlrBF7cGKa4D2OtmJn1juDJfTKK-6wE_CFRTpbpGttCx' +
	'TNxIYgEZXXJhH0rlElVdtyydf4Vysnl9nnQHqMcwXpdC0UDdRe8SKDFsx9X0deAHRqAGdpxQy18kNS1yW6rHzmpWKNULFshj1t' +
	'ka-VckgH8tEY_o903PsacwVghUSR2JfDYXrJME1SqKBtXnYybAuauAhsZPJ997k_z2crwBeo_dY1h42whonm3Mh5xhO820h_aI' +
	'rMKE5NE_o45LTdkVTwaGq2SlpPK1qiCENNInWggx-hQi6LJgS7Pl-bbBWqKb4p-8e4B8ZC_7zuvPOcJvBVqc16enx-eu4nyUY1' +
	'x3TQ';
	var actor = JSON.parse('{"status": {"status": {"status": "Actief", "id": 75},"opmerkingen": "", "datum": "2015-10-29T17:33:52.774966+01:00", "gebruiker": {"uri": "vandaeko", "omschrijving": "vandaeko"}},"ids": [{"extra_id": "vandaeko", "type": {"naam": "uid", "id": 7}, "actor_id": 1}, {"extra_id": "ejqXLMvSRNTGEtlaZCKeZA", "type": {"naam": "persid", "id": 5}, "actor_id": 1}], "erkenningen": [], "adres": {"huisnummer": "19", "huisnummer_id": 2779410, "subadres_id": 425604, "startdatum": "2015-05-08T00:00:00+02:00", "straat": "Koning Albert II-Laan", "straat_id": 139852, "postcode": "1210", "id": 60, "gemeente": "Sint-Joost-ten-Node", "adrestype": {"naam": "Primair", "id": 1},"land": "BE", "subadres": "5", "einddatum": null, "omschrijving": "Koning Albert II-Laan 19 bus 5, 1210 Sint-Joost-ten-Node", "gemeente_id": 84},"adressen": [{"huisnummer": "19", "huisnummer_id": 2779410, "subadres_id": 425604, "startdatum": "2015-05-08T00:00:00+02:00", "straat": "Koning Albert II-Laan", "straat_id": 139852, "postcode": "1210", "id": 60, "gemeente": "Sint-Joost-ten-Node", "adrestype": {"naam": "Primair", "id": 1}, "land": "BE", "subadres": "5", "einddatum": null, "omschrijving": "Koning Albert II-Laan 19 bus 5, 1210 Sint-Joost-ten-Node", "gemeente_id": 84}], "naam": "Van Daele", "self": "https://dev-actoren.onroerenderfgoed.be/actoren/1", "uri": "https://dev-id.erfgoed.net/actoren/1", "emails": [{"type": {"naam": "werk", "id": 2}, "email": "koen.vandaele@rwo.vlaanderen.be"}, {"type": {"naam": "thuis", "id": 1}, "email": "koen_van_daele@telenet.be"}], "voornaam": "Koen", "systemfields": {"created_at": "2007-10-05T00:14:12+02:00", "updated_at": "2016-04-20T15:05:42.601882+02:00", "created_by": {"uri": "https://id.erfgoed.net/actoren/501", "description": "Onroerend Erfgoed"},"updated_by": {"uri": "https://dev-id.erfgoed.net/actoren/10051", "description": "Millet, Klaas"}},"urls": [], "telefoons": [{"type": {"naam": "werk", "id": 2}, "nummer": "25531682", "landcode": "+32", "volledig_nummer": "+3225531682"}], "afkorting": null, "relaties": [{"einddatum": null, "type": {"naam": "is deel van", "id": 1, "inverse_id": 2}, "id": 501, "startdatum": null}], "type": {"naam": "publieke persoon", "id": 3},"id": 1, "omschrijving": "Van Daele, Koen"}');
	var actorRp = JSON.parse('{"info": [], "status": {"status": {"status": "Actief", "id": 75}, "opmerkingen": "", "datum": "2018-02-20T02:09:34.683151+01:00", "gebruiker": {"uri": "https://dev-id.erfgoed.net/actoren/10038", "omschrijving": "Goessens, Bram"}}, "ids": [{"extra_id": "0456322543", "type": {"naam": "kbo", "id": 6}}], "erkenningen": [{"geldigheid": "Vanaf 01-06-2018 tot 28-06-2028", "reden_erkenning": {"id": 2, "reden_erkenning": "Van rechtswege erkend"}, "erkend_als": "Archeoloog type 1", "erkenningsnummer": "OE/ERK/Archeoloog/2018/00015", "erkend_voor": "Archeologie type 1", "type": "rechtspersoon", "uri": "https://dev-id.erfgoed.net/actoren/10052", "omschrijving": "ABO"}], "adres": {"adrestype": {"naam": "Primair", "id": 1}, "land": "BE", "huisnummer_id": 3043096, "straat_id": 20042, "subadres_id": null, "land_omschrijving": "Belgi\u00eb", "startdatum": "2016-02-11T00:00:00+01:00", "einddatum": null, "beschrijving": null, "huisnummer": "19", "straat": "Koning Albert II-laan", "postcode": "1000", "subadres": null, "omschrijving": "Koning Albert II-laan 19, 1000 Brussel", "id": 144, "gemeente": "Brussel", "gemeente_id": 74}, "adressen": [{"adrestype": {"naam": "Primair", "id": 1}, "land": "BE", "huisnummer_id": 3043096, "straat_id": 20042, "subadres_id": null, "land_omschrijving": "Belgi\u00eb", "startdatum": "2016-02-11T00:00:00+01:00", "einddatum": null, "beschrijving": null, "huisnummer": "19", "straat": "Koning Albert II-laan", "postcode": "1000", "subadres": null, "omschrijving": "Koning Albert II-laan 19, 1000 Brussel", "id": 144, "gemeente": "Brussel", "gemeente_id": 74}], "naam": "ABO", "self": "https://dev-actoren.onroerenderfgoed.be/actoren/10052", "uri": "https://dev-id.erfgoed.net/actoren/10052", "emails": [{"type": {"naam": "werk", "id": 2}, "email": "bram.goessens@rwo.vlaanderen.be"}], "voornaam": null, "systemfields": {"created_at": "2016-02-11T15:01:13.205660+01:00", "updated_at": "2018-06-06T16:12:13.184365+02:00", "created_by": {"uri": "https://id.erfgoed.net/actoren/10032", "description": "Saelen, Bart"}, "updated_by": {"uri": "https://dev-id.erfgoed.net/actoren/10051", "description": "Millet, Klaas"}}, "urls": [], "telefoons": [], "afkorting": "ABO", "relaties": [{"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10449, "startdatum": null}, {"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10092, "startdatum": null}, {"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10469, "startdatum": null}, {"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10038, "startdatum": null}, {"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10168, "startdatum": null}, {"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10175, "startdatum": null}, {"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10140, "startdatum": null}, {"einddatum": null, "type": {"naam": "heeft sleutelgebruiker", "id": 4, "inverse_id": 3}, "id": 10461, "startdatum": null}], "type": {"naam": "organisatie", "id": 2, "uri": "foaf:Organization"}, "id": 10052, "types": ["http://xmlns.com/foaf/0.1/Organization", "foaf:Organization", "https://www.w3.org/ns/prov#Organization", "prov:Organization", "https://id.erfgoed.net/vocab/ontology#ErkendArcheoloog", "oe:ErkendArcheoloog"], "omschrijving": "ABO"}');
	var idservice= 'https://dev-id.erfgoed.net';
	var testActor = JSON.parse('{"adressen":[{"omschrijving_straat":"Werftsesteenweg 3 bus 10","adrestype":{"id":1},"straat":"Werftsesteenweg","huisnummer_id":2167307,"straat_id":10020,"subadres_id":413908,"huisnummer":"3","land":"BE","gemeente_id":35,"subadres":"10","id":204,"gemeente":"Heist-op-den-Berg","postcode":"2220"}],"naam":"Saelen","ids":[{"extra_id":null,"type":{"id":4}}],"voornaam":"Bart","telefoons":[{"landcode":"+32","nummer":"123456789","type":{"id":1}}],"type":{"id":1},"emails":[{"type":{"id":1},"email":"bart.saelen@geosolutions.be"}],"omschrijving":"Saelen, Bart", "rrn": 93051822361, "urls":[{"type": {"id":2}, "url": "https://www.myblog.be"}]}');
	var testRpActor = JSON.parse('{"adres": {"omschrijving_straat":"Werftsesteenweg 3 bus 10","adrestype":{"id":1},"straat":"Werftsesteenweg","huisnummer_id":2167307,"straat_id":10020,"subadres_id":413908,"huisnummer":"3","land":"BE","gemeente_id":35,"subadres":"10","id":204,"gemeente":"Heist-op-den-Berg","postcode":"2220"},"adressen":[{"omschrijving_straat":"Werftsesteenweg 3 bus 10","adrestype":{"id":1},"straat":"Werftsesteenweg","huisnummer_id":2167307,"straat_id":10020,"subadres_id":413908,"huisnummer":"3","land":"BE","gemeente_id":35,"subadres":"10","id":204,"gemeente":"Heist-op-den-Berg","postcode":"2220"}],"naam":"Saelens BVBA","afkorting":"SBA","telefoons":[{"landcode":"+32","nummer":"123456789","type":{"id":1}}],"type":{"id":2},"emails":[{"type":{"id":2},"email":"bart.saelen@werk.be"}], "kbo": "0474603875", "urls":[{"type": {"id":1}, "url": "https://www.sba.be"}]}');
	var crabpyurl = 'https://dev-geo.onroerenderfgoed.be';

	var trackStore = declare([Rest, Trackable]);
	var actorStore = new trackStore({
		target: baseUrl + '/actoren/',
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
			'X-Requested-With': '',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + ssoToken
		},
		useRangeHeaders: true
	});

	var typeLists = {};
	var listController = new ListController({
		getSsoToken: () => { return this.ssoToken; },
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
				dialog.actorWidget.createActor(testActor);
			})
		}, 'editActor');
		myButton3.startup();

		var myButton4 = new Button({
			label: "edit rechtspersoon actor",
			onClick: lang.hitch(this, function () {
				dialog.actorWidget.createActor(testRpActor);
			})
		}, 'editRpActor');
		myButton4.startup();

		var myButton5 = new Button({
			label: "show rechtspersoon actor",
			onClick: lang.hitch(this, function () {
				dialog.actorWidget.viewActor(actorRp);
			})
		}, 'viewRpActor');
		myButton5.startup();
	}));
});