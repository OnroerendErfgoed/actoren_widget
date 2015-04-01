define([
	'dojo/text!./../templates/ActorCreate/ActorCreateActor.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dojo/store/Memory',
	'dijit/form/ComboBox',
	'../CrabWidget',
	'dojo/dom-class',
	"dojo/dom-construct"
], function(
	template,
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	Memory,
	ComboBox,
	CrabWidget,
	domClass,
	domConstruct
) {
	return declare([_WidgetBase, _TemplatedMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		actor: null,
		actorWidget: null,
		actorAdvancedSearch : null,
		_telefoonLandcodeSelect: null,

		_actorTelefoons: [],
		_actorEmails: [],
		_actorUrls: [],
		_index: 0,


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

		_addEmail: function (evt) {
			evt.preventDefault();
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
					this._createListItem(this._index, this.email.value, this.emailtypes.selectedOptions[0].label, this.emaillist, this._removeEmail);
					this.email.value = '';
				}
			}
		},

		_addTelefoon: function (evt) {
			evt.preventDefault();
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
					var telefoonvalue = this._telefoonLandcodeSelect.get('value') ? this._telefoonLandcodeSelect.get('value') + this.telefoon.value : '+32' + this.telefoon.value;
					this._createListItem(this._index, telefoonvalue, this.telefoontypes.selectedOptions[0].label, this.telefoonlist, this._removeTelefoon);
					this.telefoon.value = '';
				}
			}
		},

		_addUrl: function (evt) {
			evt.preventDefault();
			if (this.url.value.split(' ').join("").length > 0) {
				var actorUrl = this._actorUrls.filter(lang.hitch(this, function (urlObject) {
					return (urlObject.url === this.url.value && urlObject.type.id === this.urltypes.value);
				}));
				if (actorUrl.length === 0 && lang.hitch(this, this._setCustomValidity)(this.url, true)) {
					this._index++;
					this._actorUrls.push({
						id: this._index.toString(),
						url: this.url.value,
						type: {
							id: this.urltypes.value
						}
					});
					this._createListItem(this._index, this.url.value, this.urltypes.selectedOptions[0].label, this.urllist, this._removeUrl);
					this.url.value = '';
				}
			}
		},

		_createListItem: function(id, value, type, ullist, removeFunction) {
			id = id.toString();
			domConstruct.create("li", {id: "li" + id, innerHTML: value + ' (' + type + ') <i id="' + id + '" class="fa fa-trash plus-minus-icon"></i>'}, ullist);
			this.connect(dojo.byId(id), "onclick", lang.hitch(this, function() {
				domConstruct.empty("li" + id);
				lang.hitch(this, removeFunction)(id);
			}));
		},

		_removeEmail: function(id) {
			this._actorEmails = this._actorEmails.filter(lang.hitch(this, function(object){
				return (object.id !== id);
			}))
		},
		_removeTelefoon: function(id) {
			this._actorTelefoons = this._actorTelefoons.filter(lang.hitch(this, function(object){
				return (object.id !== id);
			}))
		},
		_removeUrl: function(id) {
			this._actorUrls = this._actorUrls.filter(lang.hitch(this, function(object){
				return (object.id !== id);
			}))
		},

		_watchActorTypes: function() {
			switch (this.type.value) {
				case "1":
					this.kbo.value = '';
					this.kbo.disabled=true;
					domClass.add(this.kboNode, 'placeholder-disabled');
					this.rrn.disabled=false;
					domClass.remove(this.rrnNode, 'placeholder-disabled');
					break;
				case "2":
					this.rrn.value = '';
					this.rrn.disabled=true;
					domClass.add(this.rrnNode, 'placeholder-disabled');
					this.kbo.disabled=false;
					domClass.remove(this.kboNode, 'placeholder-disabled');
					break;
			}

		},

		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

		_openSearch: function(evt) {
			evt.preventDefault();
			this.actorAdvancedSearch._showSearch();
			this._reset();
		},

		_showActorSearch: function(evt) {
			evt.preventDefault();
			this.actorAdvancedSearch._showActorSearch();
			this._reset();
		},

		_reset: function(){
			this.naam.value = "";
			this.voornaam.value = "";
			this.email.value = "";
			this._actorEmails.forEach(lang.hitch(this, function(emailObject){
				domConstruct.empty('li' + emailObject.id);
			}));
			this._actorEmails = [];
			this.emailtypes.value = 2;
			this.telefoon.value = "";
			this._actorTelefoons.forEach(lang.hitch(this, function(telefoonObject){
				domConstruct.empty('li' + telefoonObject.id);
			}));
			this._actorTelefoons = [];
			this.telefoontypes.value = 2;
			this.url.value = "";
			this._actorUrls.forEach(lang.hitch(this, function(urlObject){
				domConstruct.empty('li' + urlObject.id);
			}));
			this._actorUrls = [];
			this.urltypes.value = 1;
			this.type.value = "";
			this.rrn.value = "";
			this.kbo.value = "";
			this._crabWidget.resetValues();
		},

		_rrnValidation: function () {
			var rrn = this.rrn.value,
				valid = true;
			rrn = this.rrn.value.split(" ").join("").split('.').join("").split('-').join("");
			this.rrn.value = rrn;
			if (rrn.length > 0) {
				if (isNaN(rrn) || rrn.length != 11) {
					valid = false;
				}
				else if (rrn.substring(0, 1) === '0' || rrn.substring(0, 1) === '1') {
					rrn = '2' + rrn;
				}
				else {
					var x = 97 - (parseInt(rrn.substring(0, rrn.length - 2)) - (parseInt(rrn.substring(0, rrn.length - 2) / 97)) * 97);
					valid = parseInt(rrn.slice(-2)) === x;
				}
			}
			return valid;
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

		_kboValidation: function () {
			var kbo = this.kbo.value.split(" ").join("").split('.').join();
			if (kbo.length >  0) {
				return (!isNaN(kbo) && kbo.length >= 9 && kbo.length <= 10);
			} else {
				return true;
			}
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
			var inputs = [this.naam, this.voornaam, this.email, this.telefoon, this._crabWidget.straat, this._crabWidget.nummer, this._crabWidget.postbus,
				this._crabWidget.postcode, this._crabWidget.gemeente, this.url];
			inputs.forEach(lang.hitch(this, function(input){
				if (input.validity) {
					valid = lang.hitch(this, this._setCustomValidity)(input, valid);
				}
			}));
			valid = lang.hitch(this, this._setCustomValidity)(this.kbo, valid, this._kboValidation());
			valid = lang.hitch(this, this._setCustomValidity)(this.rrn, valid, this._rrnValidation());
			valid = lang.hitch(this, this._setCustomValidity)(this._crabWidget.gemeenteCrabValidation, valid, this._gemeenteValidation());
			return valid

		},

		_save: function() {
			if (!this._isValid()) {
				this.actorWidget.emitError({
					widget: 'ActorCreate',
					message: 'Input waarden om een nieuwe actor aan te maken, zijn incorrect.',
					error: 'Input waarden om een nieuwe actor aan te maken, zijn incorrect.'
				})
			} else {
				var actorNew = {};
				actorNew['naam'] = this.naam.value;
				actorNew['voornaam'] = this.voornaam.value;
				actorNew['rrn'] = this.rrn.value;
				actorNew['kbo'] = this.kbo.value;
				actorNew['type'] = {
					type: {
						id: this.type.value
					}
				};
				this._addEmail();
				actorNew['emails'] = this._actorEmails;

				this._addTelefoon();
				actorNew['telefoons'] = this._actorTelefoons;

				this._addUrl();
				actorNew['urls'] = this._actorUrls;

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

				this.actorWidget.actorController.saveActor(actorNew).then(
					lang.hitch(this, function(response) {
						var actorId = response.id;
						this.actorWidget.actorController.saveActorAdres(actorNewAdres, actorId).then(
							lang.hitch(this, function (response) {
								this._findNewActor(actorId)
							}),
							lang.hitch(this, function (error) {
									this.actorWidget.emitError({
										widget: 'ActorCreate',
										message: 'Bewaren van het adres van de nieuwe actor is mislukt',
										error: error
									})
								}
							));
					}),
					lang.hitch(this, function(error) {
						this.actorWidget.emitError({
							widget: 'ActorCreate',
							message: 'Bewaren van de nieuwe actor is mislukt',
							error: error
						})
					}));
			}
		},

		_findNewActor: function(id) {
			var query = {query:'id:' +id};
			this._filterGrid(query);
			this._openSearch();
		},

		_filterGrid: function (query) {
			this.actorWidget._actorSearch.AdvSearchFilterGrid(query);
		}
	});
});
