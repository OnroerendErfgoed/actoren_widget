require([
	'actorwidget/widgets/ActorWidget',
	'dojo/store/Observable',
	'dojo/store/JsonRest',
	'dojo/on',
	'dojo/domReady!'
], function (
	ActorWidget,
	Observable,
	JsonRest,
  on
) {
	var baseUrl= 'https://dev-actoren.onroerenderfgoed.be';
	var ssoToken = 'AQIC5wM2LY4SfczcF5xbKlqhnzOrPre7au1326YcUxOUZ1o.*AAJTSQACMDIAAlNLABMyODczNTM0ODU4ODYwMTUyNDMwAAJTMQACMDM.*';

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
    voornaam: 'testvoornaam',
    emails: [
      {
        type: {id: 1},
        email: 'test.test@test.be'
      }
    ],
    telefoons: [
      {
        "type": {
          "id": 1
        },
        "nummer": "123456789",
        "landcode": "+32"
      }
    ],
    "adres": {
      "omschrijving_straat": "Liersesteenweg 107",
      "adrestype": {
        "id": 1
      },
      "straat": "Liersesteenweg",
      "straat_id": 10769,
      "huisnummer_id": 2133160,
      "subadres_id": null,
      "huisnummer": "107",
      "gemeente_id": 37,
      "subadres": null,
      "postcode": "2800",
      "id": 86,
      "gemeente": "Mechelen",
      "land": "BE"
    },
    "type": {
      "id": 1
    }
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

  on(actorWidget, 'create.cancel', function () {
    console.debug('catch cancel create');
  });

  on(actorWidget, 'create.existing', function (evt) {
    console.debug('catch create existing', evt.actor);
  });

  on(actorWidget, 'create.new', function (evt) {
    console.debug('catch create new', evt.actor);
  });

  on(actorWidget, 'error', function (evt) {
    console.debug('catch error', evt.message);
  });

});