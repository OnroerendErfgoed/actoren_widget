define([
	'dojo',
	'dojo/text!./templates/ActorEdit.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dojo/store/Memory',
	'dijit/form/ComboBox',
	'./CrabWidget',
	"dojo/dom-construct"
], function(
	dojo,
	template,
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	Memory,
	ComboBox,
	CrabWidget,
	domConstruct
) {
	return declare([_WidgetBase, _TemplatedMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actor: null,
		actorWidget: null,
		_telefoonLandcodeSelect: null,

		_actorTelefoons: [],
		_actorEmails: [],
		_actorUrls: [],
		_index: 0,


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
				this._index++;
				email['id'] = this._index.toString();
				this._actorEmails.push(email);
				this._createEmail(this._index, email.email, email.type.naam);
			}));

			actor.telefoons.forEach(lang.hitch(this, function(telefoon) {
				this._index = this._index++;
				telefoon['id'] = this._index.toString();
				this._actorTelefoons.push(telefoon);
				this._createTelefoon(this._index, telefoon.landcode, telefoon.nummer, telefoon.type.naam);
			}));

			if (actor.adres) {
				this._crabWidget.setValues(actor.adres);
			}
			this.actortype.value  = actor.type.naam;

			actor.urls.forEach(lang.hitch(this, function(url) {
				this._actorUrls[url.type.id] = {url: url.url};
			}));
			var urltypesValues =  Object.keys(this._actorUrls);
			this.urltypes.value = urltypesValues.length === 0 ? "1" : urltypesValues[0];
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

		_addEmail: function () {
			if (this.email.value.split(' ').join("").length > 0) {
				var actorEmail = this._actorEmails.filter(lang.hitch(this, function (emailObject) {
					return (emailObject.email === this.email.value && emailObject.type.id === this.emailtypes.value);
				}));
				if (actorEmail.length === 0 && lang.hitch(this, this._setCustomValidity)(this.email, true)) {
					this._index++;
					this._actorEmails.push({
						id: this._index.toString(),
						email: this.email.value,
						type: {
							id: this.emailtypes.value
						}
					});
					this._createEmail(this._index, this.email.value, this.emailtypes.selectedOptions[0].label)
					this.email.value = '';
				}
			}
		},

		_addTelefoon: function () {
			if (this.telefoon.value.split(' ').join("").length > 0) {
				var actorTelefoon = this._actorTelefoons.filter(lang.hitch(this, function (telefoonObject) {
					return (telefoonObject.nummer === this.telefoon.value &&
					telefoonObject.landcode === this._telefoonLandcodeSelect.get('value') &&
					telefoonObject.type.id === this.telefoontypes.value);
				}));
				if (actorTelefoon.length === 0 && lang.hitch(this, this._setCustomValidity)(this.telefoon, true)) {
					this._index++;
					this._actorTelefoons.push({
						id: this._index.toString(),
						nummer: this.telefoon.value,
						landcode: this._telefoonLandcodeSelect.get('value'),
						type: {
							id: this.telefoontypes.value
						}
					});
					this._createTelefoon(this._index, this._telefoonLandcodeSelect.get('value'), this.telefoon.value, this.telefoontypes.selectedOptions[0].label);
					this.telefoon.value = '';
				}
			}
		},

		_createEmail: function(index, emailvalue, emailtype) {
			index = index.toString();
			domConstruct.create("li", {id: "li" + index, innerHTML: emailvalue + ' (' + emailtype + ') <i id="' + index + '" class="fa fa-trash plus-minus-icon"></i>'}, this.emaillist);
			this.connect(dojo.byId(index), "onclick", function() {
				domConstruct.empty("li" + index);
				this._actorEmails = this._actorEmails.filter(lang.hitch(this, function(emailObject){
					return (emailObject.id !== index);
				}))
			});
		},

		_createTelefoon: function(index, telefoonlandcode, telefoonnummer, telefoontype) {
			var telefoonvalue = telefoonlandcode ? telefoonlandcode + telefoonnummer : '+32' + telefoonnummer;
			index = index.toString();
			domConstruct.create("li", {id: "li" + index, innerHTML: telefoonvalue + ' (' + telefoontype + ') <i id="' + index + '" class="fa fa-trash plus-minus-icon"></i>'}, this.telefoonlist);
			this.connect(dojo.byId(index), "onclick", function() {
				domConstruct.empty("li" + index);
				this._actorTelefoons = this._actorTelefoons.filter(lang.hitch(this, function(telefoonObject){
					return (telefoonObject.id !== index);
				}))
			});
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
			this._actorEmails.forEach(lang.hitch(this, function(emailObject){
				domConstruct.empty('li' + emailObject.id);
			}));
			this._actorEmails = [];
			this.emailtypes.value = 2;
			this.telefoon.value = '';
			this._actorTelefoons.forEach(lang.hitch(this, function(telefoonObject){
				domConstruct.empty('li' + telefoonObject.id);
			}));
			this._actorTelefoons = [];
			this.telefoontypes.value = 2;
			this.telefoonLandcode.value = '';
			this._crabWidget.resetValues();
			this.actortype.value = "1";
			this.url.value = "";
			this._actorUrls = [];
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
			var inputs = [this.email, this.telefoon, this.url, this._crabWidget.straat, this._crabWidget.nummer, this._crabWidget.postbus,
				this._crabWidget.postcode, this._crabWidget.gemeente];
			inputs.forEach(lang.hitch(this, function(input){
				if (input.validity) {
					valid = lang.hitch(this, this._setCustomValidity)(input, valid);
				}
			}));
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

				this._addEmail();
				actorEdit['emails'] = this._actorEmails;

				this._addTelefoon();
				actorEdit['telefoons'] = this._actorTelefoons;

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
						this.actor = actorEdit;
						if (!adresEdited) {
							this._openDetail()
						}
						else {
							this.actorWidget.actorController.saveActorAdres(actorEditAdres, actorId).then(
								lang.hitch(this, function (response) {
									this._openDetail()
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
		}
	});
});
