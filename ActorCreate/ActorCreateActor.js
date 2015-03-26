define([
	'dojo/text!./../templates/ActorCreate/ActorCreateActor.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dojo/store/Memory',
	'dijit/form/ComboBox',
	'../CrabWidget',
	'dijit/form/Form'
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
		actor: null,
		actorWidget: null,
		actorAdvancedSearch : null,
		_telefoonLandcodeSelect: null,

		_actorTelefoons: {},
		_actorEmails: {},
		_actorUrls: {},


		postCreate: function() {
			console.log('...ActorCreateActor::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
			console.log('...ActorCreateActor::startup', arguments);
			this.inherited(arguments);
			this._setTelefoonLandcodes();
			this._setCrabWidget();
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

		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

		_openSearch: function() {
			this.actorAdvancedSearch._showSearch();
			this._reset();
		},

		_showActorSearch: function() {
			this.actorAdvancedSearch._showActorSearch();
			this._reset();
		},

		_reset: function(){
			this.naam.value = "";
			this.voornaam.value = "";
			this.email.value = "";
			this._actorEmails = {};
			this.emailtypes.value = 2;
			this.telefoon.value = "";
			this._actorTelefoons = {};
			this.telefoontypes.value = 2;
			this.url.value = "";
			this._actorUrls = {};
			this.urltypes.value = 1;
			this.type.value = "";
			this.rrn.value = "";
			this.kbo.value = "";
			this._crabWidget.resetValues();
		},

		_validateInputWithTypes: function (inputs, input, inputtype, watchFuntion) {
			var inputValid = true,
				inputtypeInvalid,
				inputtypePrev = inputtype.value;
			Object.keys(inputs).forEach(lang.hitch(this, function(inputkey){
				inputtype.value = inputkey;
				lang.hitch(this, watchFuntion)();
				if (!input.validity.valid) {
					inputValid = false;
					inputtypeInvalid = inputkey;
				}
			}));
			inputtype.value = inputValid? inputtypePrev : inputtypeInvalid;
			return inputValid;
		},

		_isValid: function() {
			var valid = true;
			valid = this.naam.validity.valid ? valid : false;
			valid = this.kbo.validity.valid || this.rrn.validity.valid ? valid : false;
			var inputs = [this.voornaam, this._crabWidget, this._crabWidget.nummer, this._crabWidget.postbus,
				this._crabWidget.postcode, this._crabWidget.gemeente];
			inputs.forEach(lang.hitch(this, function(input){
				if (input.validity) {
					valid = input.validity.valid ? valid : false;
				}
			}));
			valid = this._validateInputWithTypes(this._actorEmails, this.email, this.emailtypes, this._watchEmailTypes) ?
				valid : false;
			valid = this._validateInputWithTypes(this._actorTelefoons, this.telefoon, this.telefoontypes, this._watchTelefoonTypes) ?
				valid : false;
			valid = this._validateInputWithTypes(this._actorUrls, this.url, this.urltypes, this._watchUrlTypes) ?
				valid : false;
			return valid

		},

		_save: function() {
			if (!this._isValid()) {
				this.actorWidget.emitError({
					widget: 'ActorCreateActor',
					message: 'Input waarden om een nieuwe actor aan te maken, zijn incorrect.'
				})
			} else {
				var actorNew = {};
				actorNew['naam'] = this.naam.value;
				actorNew['voornaam'] = this.voornaam.value;
				actorNew['rrn'] = this.rrn.value;
				actorNew['kbo'] = this.kbo.value;
				actorNew['actortype'] = {
					type: {
						id: this.type.value
					}
				};
				actorNew['telefoons'] = [];
				for (var telefoontype in this._actorTelefoons) {
					actorNew['telefoons'].push(
						{
							type: {
								id: telefoontype
							},
							nummer: this._actorTelefoons[telefoontype].nummer,
							landcode: this._actorTelefoons[telefoontype].landcode
						}
					)
				}
				actorNew['emails'] = [];
				for (var emailtype in this._actorEmails) {
					actorNew['emails'].push(
						{
							type: {
								id: emailtype
							},
							email: this._actorEmails[emailtype].email
						}
					)
				}
				actorNew['urls'] = [];
				for (var urltype in this._actorUrls) {
					actorNew['urls'].push(
						{
							type: {
								id: urltype
							},
							url: this._actorUrls[urltype].url
						}
					)
				}

				console.log(actorNew);

				var actorNewAdres = {};
				var crabWidgetValues = this._crabWidget.getInput();
				actorNewAdres['land'] = crabWidgetValues.values.land;
				actorNewAdres['postcode'] = crabWidgetValues.values.postcode;
				actorNewAdres['gemeente'] = crabWidgetValues.values.gemeente;
				actorNewAdres['gemeente_id'] = crabWidgetValues.ids.gemeente_id;
				actorNewAdres['straat'] = crabWidgetValues.values.straat;
				actorNewAdres['straat_id'] = crabWidgetValues.ids.straat_id;
				actorNewAdres['huisnummer'] = crabWidgetValues.values.nummer;
				actorNewAdres['huisnummer_id'] = crabWidgetValues.ids.nummer_id;

				console.log(actorNewAdres);


				this.actorWidget.actorController.saveActor(actorNew).then(
					lang.hitch(this, function(response) {
						console.log(response);
						this.actorWidget.actorController.saveActorAdres(actorNewAdres, response.id).then(
							lang.hitch(this, function(response){
								console.log(response);
							}),
							lang.hitch(this, function (error) {
									console.log(error);
									this.actorWidget.emitError({
										widget: 'ActorCreateActor',
										message: 'Bewaren van het adres van de nieuwe actor is mislukt'
									})
								}
							));
					}),
					lang.hitch(this, function(error) {
						console.log(error);
						this.actorWidget.emitError({
							widget: 'ActorCreateActor',
							message: 'Bewaren van de nieuwe actor is mislukt'
						})
					}));
			}
		},

		_findNewActor: function(naam, voornaam) {
			// of id in query
			var query = {naam: naam, voornaam: voornaam};
			this._filterGrid(query);
			this._openSearch();
		},

		_filterGrid: function (query) {
			this.actorWidget._actorSearch.AdvSearchFilterGrid(query);
		}
	});
});
