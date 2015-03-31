define([
	'dojo/text!./templates/ActorEdit.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dojo/store/Memory',
	'dijit/form/ComboBox',
	'./CrabWidget'
], function(
	template,
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	Memory,
	ComboBox,
	CrabWidget
) {
	return declare([_WidgetBase, _TemplatedMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actor: null,
		actorWidget: null,
		_telefoonLandcodeSelect: null,

		_actorTelefoons: {},
		_actorEmails: {},
		_actorUrls: {},


		postCreate: function() {
			console.log('..ActorEdit::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
			console.log('..ActorEdit::startup', arguments);
			this.inherited(arguments);
			this._setTelefoonLandcodes();
			this._setCrabWidget();
		},

		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

		setActor: function(actor) {
			this.naam.value = actor.naam;
			this.voornaam.value = actor.voornaam;

			actor.emails.forEach(lang.hitch(this, function(email) {
				this._actorEmails[email.type.id] = {email: email.email};
			}));
			var emailtypesValues =  Object.keys(this._actorEmails);
			this.emailtypes.value = emailtypesValues.length === 0 ? "2" : emailtypesValues.indexOf("2") > -1 ? "2" : emailtypesValues[0];
			this.email.value = emailtypesValues.length === 0 ? '' : this._actorEmails[this.emailtypes.value].email;

			actor.telefoons.forEach(lang.hitch(this, function(telefoon) {
				this.telefoontypes.value = telefoon.type.id;
				var landcode = telefoon.landcode? telefoon.landcode : '+32';
				this._actorTelefoons[telefoon.type.id] = {nummer: telefoon.nummer, landcode: landcode};
			}));
			var telefoontypesValues =  Object.keys(this._actorTelefoons);
			this.telefoontypes.value = telefoontypesValues.length === 0 ? "2" : telefoontypesValues.indexOf("2") > -1 ? "2" : telefoontypesValues[0];
			this._telefoonLandcodeSelect.set('value', telefoontypesValues.length === 0 ? '+32' : this._actorTelefoons[this.telefoontypes.value].landcode);
			this.telefoon.value = telefoontypesValues.length === 0 ? '' : this._actorTelefoons[this.telefoontypes.value].nummer;

			if (actor.adres) {
				this._crabWidget.setValues(actor.adres);
			}
			this.actortype.value  = actor.type.naam;

			actor.urls.forEach(lang.hitch(this, function(url) {
				this._actorUrls[url.type.id] = {url: url.url};
			}));
			var urltypesValues =  Object.keys(this._actorUrls);
			this.urltypes.value = urltypesValues.length === 0 ? "1" : emailtypesValues[0];
			this.url.value = urltypesValues.length === 0 ? '' : this._actorUrls[this.urltypes.value].url;

			this.actor = actor;
		},
		_openSearch: function() {
			this.actorWidget.showSearch();
			this._reset();
		},
		_openDetail: function() {
			this.actorWidget.showDetail(this.actor);
			this._reset();
		},

		_setTelefoonLandcodes: function() {
			var countryCodeStore = new Memory({
				data: [
					{name:"+32",  id:"32",  label:"<span class='flag be'>België (+32)</span>"},
					{name:"+49",  id:"49",  label:"<span class='flag de'>Duitsland (+49)</span>"},
					{name:"+33",  id:"33",  label:"<span class='flag fr'>Frankrijk (+33)</span>"},
					{name:"+44",  id:"44",  label:"<span class='flag gb'>Groot-Brittannië (+44)</span>"},
					{name:"+31",  id:"31",  label:"<span class='flag nl'>Nederland (+31)</span>"},
					{name:"+352", id:"352", label:"<span class='flag lu'>Luxemburg (+352)</span>"}
				]
			});

			this._telefoonLandcodeSelect = new ComboBox({
				store: countryCodeStore,
				value: "+32",
				hasDownArrow: true,
				searchAttr: "name",
				autoComplete: false,
				required: false,
				class: "combo-dropdown",
				style: "width: 20%; float: left; padding-left: 10px;",
				labelAttr: "label",
				labelType: "html"
			}, this.telefoonLandcode);
		},

		_watchTelefoonTypes: function () {
			this.telefoon.value = this._actorTelefoons[this.telefoontypes.selectedOptions[0].value] ?
				this._actorTelefoons[this.telefoontypes.selectedOptions[0].value].nummer : null;
			this._telefoonLandcodeSelect.set('value', this._actorTelefoons[this.telefoontypes.selectedOptions[0].value] ?
				this._actorTelefoons[this.telefoontypes.selectedOptions[0].value].landcode : '+32');
		},

		_watchTelefoonInput: function() {
			this._actorTelefoons[this.telefoontypes.selectedOptions[0].value] = {
				nummer: this.telefoon.value,
				landcode: this._telefoonLandcodeSelect.get('value')
			}
		},

		_watchEmailTypes: function () {
			this.email.value = this._actorEmails[this.emailtypes.selectedOptions[0].value] ?
				this._actorEmails[this.emailtypes.selectedOptions[0].value].email : null;
		},

		_watchEmailInput: function() {
			this._actorEmails[this.emailtypes.selectedOptions[0].value] = {
				email: this.email.value
			}
		},

		_watchUrlTypes: function () {
			this.url.value = this._actorUrls[this.urltypes.selectedOptions[0].value] ?
				this._actorUrls[this.urltypes.selectedOptions[0].value].url : null;
		},

		_watchUrlInput: function() {
			this._actorUrls[this.urltypes.selectedOptions[0].value] = {
				url: this.url.value
			}
		},

		_reset: function() {
			this.naam.value = '';
			this.voornaam.value = '';
			this.email.value=  '';
			this._actorEmails = {};
			this.emailtypes.value = 2;
			this.telefoon.value = '';
			this._actorTelefoons = {};
			this.telefoontypes.value = 2;
			this.telefoonLandcode.value = '';
			this._crabWidget.resetValues();
			this.actortype.value = "1";
			this.url.value = "";
			this._actorUrls = {};
			this.urltypes.value = 1;

		},

		_gemeenteValidation: function() {
			var valid = true;
			if (this._crabWidget.land.value == 'BE') {
				if (!this._crabWidget.getInput().ids.gemeente_id) {
					valid = false;
				}
			}
			return valid;
		},

		_validateInputWithTypes: function (inputs, input, inputtype, watchFuntion) {
			input.setCustomValidity('');
			var inputValid = true,
				inputtypeInvalid,
				inputtypePrev = inputtype.value;
			Object.keys(inputs).forEach(lang.hitch(this, function(inputkey){
				inputtype.value = inputkey;
				lang.hitch(this, watchFuntion)();
				inputValid = lang.hitch(this, this._setCustomValidity)(input, inputValid);
				if (!input.validity.valid) {
					inputtypeInvalid = inputkey;
				}
			}));
			inputtype.value = inputValid? inputtypePrev : inputtypeInvalid;
			return inputValid;
		},

		_setCustomValidity: function(node, validParam, CustomValidBool) {
			node.setCustomValidity('');
			var valid = CustomValidBool === undefined ? node.validity.valid : CustomValidBool;
			if (!valid) {
				node.setCustomValidity("Waarde is niet volgens het juiste formaat.");
				validParam = false;
			}
			return validParam;
		},

		_isValid: function() {
			var valid = true;
			var inputs = [this._crabWidget.straat, this._crabWidget.nummer, this._crabWidget.postbus,
				this._crabWidget.postcode, this._crabWidget.gemeente];
			inputs.forEach(lang.hitch(this, function(input){
				if (input.validity) {
					valid = lang.hitch(this, this._setCustomValidity)(input, valid);
				}
			}));
			valid = this._validateInputWithTypes(this._actorEmails, this.email, this.emailtypes, this._watchEmailTypes) ?
				valid : false;
			valid = this._validateInputWithTypes(this._actorTelefoons, this.telefoon, this.telefoontypes, this._watchTelefoonTypes) ?
				valid : false;
			valid = this._validateInputWithTypes(this._actorUrls, this.url, this.urltypes, this._watchUrlTypes) ?
				valid : false;
			valid = lang.hitch(this, this._setCustomValidity)(this._crabWidget.gemeenteCrabValidation, valid, this._gemeenteValidation());
			return valid

		},

		_save: function() {
			if (!this._isValid()) {
				this.actorWidget.emitError({
					widget: 'ActorEdit',
					message: 'Input waarden om een actor te bewerken, zijn incorrect.',
					error: 'Input waarden om een actor te bewerken, zijn incorrect.'
				})
			} else {
				var actorEdit = this.actor;

				console.log(actorEdit);


				console.log(this._crabWidget.getInput());

				actorEdit['telefoons'] = [];
				for (var telefoontype in this._actorTelefoons) {
					actorEdit['telefoons'].push(
						{
							type: {
								id: telefoontype
							},
							nummer: this._actorTelefoons[telefoontype].nummer,
							landcode: this._actorTelefoons[telefoontype].landcode
						}
					)
				}
				actorEdit['emails'] = [];
				for (var emailtype in this._actorEmails) {
					actorEdit['emails'].push(
						{
							type: {
								id: emailtype
							},
							email: this._actorEmails[emailtype].email
						}
					)
				}
				actorEdit['urls'] = [];
				for (var urltype in this._actorUrls) {
					actorEdit['urls'].push(
						{
							type: {
								id: urltype
							},
							url: this._actorUrls[urltype].url
						}
					)
				}

				var actorEditAdres = {};
				var crabWidgetValues = this._crabWidget.getInput();
				actorEditAdres['land'] = crabWidgetValues.values.land;
				actorEditAdres['postcode'] = crabWidgetValues.values.postcode;
				actorEditAdres['gemeente'] = crabWidgetValues.values.gemeente;
				actorEditAdres['gemeente_id'] = crabWidgetValues.ids.gemeente_id;
				actorEditAdres['straat'] = crabWidgetValues.values.straat;
				actorEditAdres['straat_id'] = crabWidgetValues.ids.straat_id;
				actorEditAdres['huisnummer'] = crabWidgetValues.values.nummer;
				actorEditAdres['huisnummer_id'] = crabWidgetValues.ids.nummer_id;

				var adresEdited = false;
				if (actorEdit.adres) {
					['huisnummer', 'gemeente', 'poscode', 'land', 'straat'].forEach(function (adresKey) {
						if (actorEditAdres[adresKey] != actorEdit.adres[adresKey]) {
							adresEdited = true;
						}
					});
				}
				else {
					adresEdited = true;
				}

				var actorId = actorEdit.id;
				this.actorWidget.actorController.saveActor(actorEdit).then(
					lang.hitch(this, function(response) {
						if (!adresEdited) {
							this._findActor(actorId)
						}
						else {
							this.actorWidget.actorController.saveActorAdres(actorEditAdres, actorId).then(
								lang.hitch(this, function (response) {
									this._findActor(actorId)
								}),
								lang.hitch(this, function (error) {
									this.actorWidget.emitError({
										widget: 'ActorEdit',
										message: 'Bewaren van het nieuwe adres van de actor is mislukt',
										error: error
									})
								})
							);
						}
					}),
					lang.hitch(this, function(error) {
						this.actorWidget.emitError({
							widget: 'ActorEdit',
							message: 'Bewaren van de bewerkte actor is mislukt',
							error: error
						})
					}));
			}
		},

		_findActor: function(id) {
			var query = {query:'id:' +id};
			this._filterGrid(query);
			this._openSearch();
		}
	});
});
