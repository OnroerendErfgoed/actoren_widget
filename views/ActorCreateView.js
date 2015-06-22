/**
 * Widget om een actor aan te maken.
 * @module Actor/actorWidgets/actorAdvSearch/ActorCreateActor
 */
define([
	'dojo',
	'dojo/text!./templates/ActorCreateView.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dojo/store/Memory',
	'dijit/form/ComboBox',
	'../widgets/CrabWidget',
	'dojo/dom-class',
	"dojo/dom-construct",
  'dojo/_base/array',
  'dojo/promise/all'
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
	domClass,
	domConstruct,
  array,
  all
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

		/**
		 * Standaard widget functie.
		 */
		postCreate: function() {
			console.log('...ActorCreateActor::postCreate', arguments);
			this.inherited(arguments);
		},

		/**
		 * Standaard widget functie.
		 * Selectielijsten aanvullen.
		 * Opstarten telefoon landcodes.
		 * Opstarten CrabWidget.
		 * Opstarten boodschappen mapping voor validatie.
		 */
		startup: function () {
			console.log('...ActorCreateActor::startup', arguments);
			this.inherited(arguments);
			this._setSelectLists();
			this._setTelefoonLandcodes();
			this._setCrabWidget();
			this._setValidationMessageMapping();
		},

		/**
		 * Selectielijsten aanvullen met opties
		 * @private
		 */
		_setSelectLists: function(){
			var selected;
			this.actorWidget.typeLists.emailTypes.forEach(lang.hitch(this, function(type){
				selected = type.naam === 'werk' ? '" selected': '"';
				domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.emailtypes);
			}));
			this.actorWidget.typeLists.telephoneTypes.forEach(lang.hitch(this, function(type){
				selected = type.naam === 'werk' ? '" selected': '"';
				domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.telefoontypes);
			}));
			this.actorWidget.typeLists.urlTypes.forEach(lang.hitch(this, function(type){
				selected = type.naam === 'website' ? '" selected': '"';
				domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.urltypes);
			}));
			this.actorWidget.typeLists.actorTypes.forEach(lang.hitch(this, function(type){
				selected = type.naam === 'persoon' ? '" selected': '"';
				domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.type);
			}));
		},

		/**
		 * Opstarten van telefoon landcodes.
		 * @private
		 */
		_setTelefoonLandcodes: function() {
			var countryCodeStore = new Memory({
				data: [
					{name:"+32",  id:"32",  label:"<span class='actor-widget flag be'>België (+32)</span>"},
					{name:"+49",  id:"49",  label:"<span class='actor-widget flag de'>Duitsland (+49)</span>"},
					{name:"+33",  id:"33",  label:"<span class='actor-widget flag fr'>Frankrijk (+33)</span>"},
					{name:"+44",  id:"44",  label:"<span class='actor-widget flag gb'>Groot-Brittannië (+44)</span>"},
					{name:"+31",  id:"31",  label:"<span class='actor-widget flag nl'>Nederland (+31)</span>"},
					{name:"+352", id:"352", label:"<span class='actor-widget flag lu'>Luxemburg (+352)</span>"}
				]
			});

			this._telefoonLandcodeSelect = new ComboBox({
				store: countryCodeStore,
				value: "+32",
				hasDownArrow: true,
				searchAttr: "name",
				autoComplete: false,
				required: false,
				'class': "combo-dropdown",
				style: "width: 20%; float: left; padding-left: 10px;",
				labelAttr: "label",
				labelType: "html"
			}, this.telefoonLandcode);
		},

		/**
		 * Event functie waarbij een email gevalideerd wordt en toegevoegd wordt aan een emaillijst gecombineerd met een delete event.
		 * @param {event} evt
		 * @private
		 */
		_addEmail: function (evt) {
			evt? evt.preventDefault() : null;
			if (this.email.value.split(' ').join("").length > 0) {
				var actorEmail = this._actorEmails.filter(lang.hitch(this, function (emailObject) {
					return (emailObject.email === this.email.value && emailObject.type.id === this.emailtypes.value);
				}));
				this._resetValidity();
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

		/**
		 * Event functie waarbij een telefoon object gevalideerd wordt en toegevoegd wordt aan een telefoonlijst gecombineerd met een delete event.
		 * @param {event} evt
		 * @private
		 */
		_addTelefoon: function (evt) {
			evt? evt.preventDefault() : null;
			if (this.telefoon.value.split(' ').join("").length > 0) {
				var actorTelefoon = this._actorTelefoons.filter(lang.hitch(this, function (telefoonObject) {
					return (telefoonObject.nummer === this.telefoon.value &&
					telefoonObject.landcode === this._telefoonLandcodeSelect.get('value') &&
					telefoonObject.type.id === this.telefoontypes.value);
				}));
				this._resetValidity();
				if (actorTelefoon.length === 0 && lang.hitch(this, this._setCustomValidity)(this.telefoon, true, this._telefoonValidation())) {
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

		/**
		 * Event functie waarbij een url gevalideerd wordt en toegevoegd wordt aan een urllijst gecombineerd met een delete event.
		 * @param {event} evt
		 * @private
		 */
		_addUrl: function (evt) {
			evt? evt.preventDefault() : null;
			if (this.url.value.split(' ').join("").length > 0) {
				var actorUrl = this._actorUrls.filter(lang.hitch(this, function (urlObject) {
					return (urlObject.url === this.url.value && urlObject.type.id === this.urltypes.value);
				}));
				this._resetValidity();
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

		/**
		 * Toevoegen van een waarde met type aan een list (ul html element), voorzien van een verwijder functie (verwijderen uit de lijst).
		 * @param {number} id Deze id wordt gebruikt in de aanmaakt van het element en wordt doorgegeven aan de verwijder functie.
		 * @param {string} value De waarde van het toe te voegen element.
		 * @param {string} type De waarde van het type van het toe te voegen element.
		 * @param {Object} ullist Het ul html element waaraan de waarde toegevoegd moet worden.
		 * @param {function} removeFunction Een extra verwijder functie met als doel deze te verwijderen uit de attribuut l
		 * @private
		 */
		_createListItem: function(id, value, type, ullist, removeFunction) {
			id = id.toString();
			domConstruct.create("li", {id: "li" + id, innerHTML: '<small>' + value + ' (' + type + ') <i id="' + id + '" class="fa fa-trash right"></i></small>'}, ullist);
			this.connect(dojo.byId(id), "onclick", lang.hitch(this, function() {
				domConstruct.destroy("li" + id);
				lang.hitch(this, removeFunction)(id);
			}));
		},

		/**
		 * Verwijder functie voor een item met opgegeven id in emaillijst _actorEmails van de widget.
		 * @param id
		 * @private
		 */
		_removeEmail: function(id) {
			this._actorEmails = this._actorEmails.filter(lang.hitch(this, function(object){
				return (object.id !== id);
			}))
		},

		/**
		 * Verwijder functie voor een item met opgegeven id in telefoonlijst _actorTelefoons van de widget.
		 * @param id
		 * @private
		 */
		_removeTelefoon: function(id) {
			this._actorTelefoons = this._actorTelefoons.filter(lang.hitch(this, function(object){
				return (object.id !== id);
			}))
		},

		/**
		 * Verwijder functie voor een item met opgegeven id in urllijst _actorUrls van de widget.
		 * @param id
		 * @private
		 */
		_removeUrl: function(id) {
			this._actorUrls = this._actorUrls.filter(lang.hitch(this, function(object){
				return (object.id !== id);
			}))
		},

		/**
		 * Event functie waarbij de kbo input veld niet-bewerkbaan wordt als het over een persoon gaat.
		 * Bij een organisatie zal het rrn input veld niet-bewerkbaar worden.
		 * @param evt
		 * @private
		 */
		_watchActorTypes: function(evt) {
			evt? evt.preventDefault() : null;
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

		/**
		 * CrabWidget opstarten.
		 * @private
		 */
		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController, actorWidget: this.actorWidget}, this.crabWidget);
		},

    _cancel: function() {
      this.actorWidget.showActorSearch();
      this._reset();
    },

		/**
		 * Reset functie van de aanmaak actor widget.
		 * @private
		 */
		_reset: function(){
			this.naam.value = "";
			this.voornaam.value = "";
			this.email.value = "";
			this._actorEmails.forEach(lang.hitch(this, function(emailObject){
				domConstruct.destroy('li' + emailObject.id);
			}));
			this._actorEmails = [];
			this.emailtypes.value = 2;
			this.telefoon.value = "";
			this._actorTelefoons.forEach(lang.hitch(this, function(telefoonObject){
				domConstruct.destroy('li' + telefoonObject.id);
			}));
			this._actorTelefoons = [];
			this.telefoontypes.value = 2;
			this.url.value = "";
			this._actorUrls.forEach(lang.hitch(this, function(urlObject){
				domConstruct.destroy('li' + urlObject.id);
			}));
			this._actorUrls = [];
			this.urltypes.value = 1;
			this.type.value = "1";
			this.rrn.value = "";
			this.kbo.value = "";
			this._crabWidget.resetValues();
		},

		/**
		 * Opstarsten van de boodschappen mapping voor de validatie
		 * @private
		 */
		_setValidationMessageMapping: function () {
			this._validationMessageMapping = {
				naam: "Naam is verplicht. Gelieve een geldige naam in te vullen.",
				voornaam: "Naam is verplicht. Gelieve een geldige voornaam in te vullen.",
				email: "De waarde is niet volgens het geldig email formaat.",
				telefoon: "De waarde is niet volgens het geldig telefoon formaat.",
				url: "De waarde is niet volgens het geldig url formaat.",
				rrn: "De waarde is niet volgens het geldig rrn formaat.",
				kbo: "De waarde is niet volgens het geldig kbo formaat.",
				gemeente: "De waarde is te lang",
				gemeenteCrabValidation: "Gemeente is verplicht. Gelieve een geldige gemeente in te vullen.",
				straat: "De waarde is te lang",
				huisnummer: "De waarde is te lang",
				subadres: "De waarde is te lang"
			}
		},

		/**
		 * Validatie rijksregisternummer
		 * @returns {boolean} True wanneer geldig, False wanneer ongeldig. Met eventuele aanpassing van de validatie boodschap.
		 * @private
		 */
		_rrnValidation: function () {
			var rrn = this.rrn.value,
				valid = true;
			rrn = this.rrn.value.split(" ").join("").split('.').join("").split('-').join("");
			this.rrn.value = rrn;
			if (rrn.length > 0) {
				if (isNaN(rrn) || rrn.length != 11) {
					valid = false;
					this._validationMessageMapping['rrn'] = "Een rijksregisternummer moet 11 cijfers lang zijn.";
				}
				else if (rrn.substring(0, 1) === '0' || rrn.substring(0, 1) === '1') {
					rrn = '2' + rrn;
				}
				else {
					var x = 97 - (parseInt(rrn.substring(0, rrn.length - 2)) - (parseInt(rrn.substring(0, rrn.length - 2) / 97)) * 97);
					valid = parseInt(rrn.slice(-2)) === x;
					if (!valid) {
						this._validationMessageMapping['rrn'] = "Dit is geen correct rijksregisternummer.";
					}
				}
			}
			return valid;
		},

		/**
		 * Validatie gemeente.
		 * @returns {boolean} True wanneer geldig, False wanneer ongeldig.
		 * @private
		 */
		_gemeenteValidation: function() {
			var valid = true;
			if (this._crabWidget.land.value == 'BE') {
				if (!this._crabWidget.getInput().gemeente_id) {
					valid = false;
				}
			}
			return valid;
		},

		/**
		 * Validatie kbo nummer
		 * @returns {boolean} True wanneer geldig, False wanneer ongeldig. Met eventuele aanpassing van de validatie boodschap.
		 * @private
		 */
		_kboValidation: function () {
			var kbo = this.kbo.value.split(" ").join("").split('.').join();
			if (kbo.length >  0) {
				var valid = (!isNaN(kbo) && kbo.length >= 9 && kbo.length <= 10);
				if (!valid) {
					this._validationMessageMapping['kbo'] = "Dit is geen correct ondernemingsnummer.";
				}
				return valid
			} else {
				return true;
			}
		},

		/**
		 * Validatie telefoon
		 * @returns {boolean} True wanneer geldig, False wanneer ongeldig. Met eventuele aanpassing van de validatie boodschap.
		 * @private
		 */
		_telefoonValidation: function () {
			var valid = true;
			String.prototype.ltrim0 = function() {
				return this.replace(/^[0]+/,"");
			};
			var nummer = this.telefoon.value.ltrim0();
			[' ', '.', '/', '-', ','].forEach(function(delimiter){
				nummer = nummer.split(delimiter).join("");
			});
			if (nummer.length !== 0) {
				var landcode = this._telefoonLandcodeSelect.get('value').ltrim0();
				[' ', '.', '/', '-', ','].forEach(function (delimiter) {
					landcode = landcode.split(delimiter).join("");
				});
				landcode = landcode.indexOf('+') !== 0 ? '+' + landcode : landcode;
				if (landcode.slice(0, 1) !== '+' || landcode.substring(1).length > 4 || isNaN(landcode.substring(1))) {
					valid = false;
					this._validationMessageMapping['telefoon'] = "Een geldige landcode begint met een + gevolgd door maximaal 4 cijfers";
				}
				else if (landcode.substring(1).length + nummer.length > 15 || isNaN(nummer)) {
					valid = false;
					this._validationMessageMapping['telefoon'] = "Een geldige nummer begint met een + gevolgd door maximaal 15 cijfers";
				}
				else if (landcode === '+32') {
					if (nummer.length !== 8 && nummer.length !== 9) {
						this._validationMessageMapping['telefoon'] = "Na +32 moeten er 8 of 9 cijfers volgen";
						valid = false;
					}
				}
			}
			return valid
		},

		/**
		 * Een functie die de geldigheid van een html node nagaat.
		 * Wanneer geldig zal de opgegeven validatie parameter ongewijzigd blijven. Anders wordt deze op 'false' gezet.
		 * @param {Object} node Html element.
		 * @param {Boolean} validParam Validatie parameter
		 * @param {Boolean} CustomValidBool. Wanneer aanwezig bepaalt deze parameter de validatie. Enkel geldig wanneer 'true'.
		 * @returns {Boolean}
		 * @private
		 */
		_setCustomValidity: function(node, validParam, CustomValidBool) {
			node.setCustomValidity('');
			var valid = CustomValidBool === undefined ? node.validity.valid : CustomValidBool;
			if (!valid) {
				var message = this._validationMessageMapping[node.id] ? this._validationMessageMapping[node.id] : "Waarde is niet volgens het juiste formaat.";
				node.setCustomValidity(message);
				validParam = false;
				/* firefox heeft geen reportValidity functie */
				node.reportValidity ? node.reportValidity() : this._reportValidity();
			}
			return validParam;
		},

		/**
		 * Nodig in Firefox omdat een htlm node geen reportValidity functie heeft.
		 * @private
		 */
		_reportValidity: function() {
			this.reportValidity.click();
		},
		/**
		 * Nodig in Firefox om de reportValidity functie correct uit te voeren.
		 * @private
		 */
		_resetValidity: function () {
			var inputs = [this.naam, this.voornaam, this.email, this.url, this.telefoon, this.kbo, this.rrn];
			inputs.forEach(lang.hitch(this, function(input){
				input.setCustomValidity('');
			}))
		},

		/**
		 * Nagaan of de ingevoerde inputs in de bewerk widget correct zijn. 'true' wanneer geldig.
		 * @returns {boolean}
		 * @private
		 */
		_isValid: function() {
			var valid = true;
			var inputs = [this.naam, this.voornaam, this.email, this.url];
			inputs.forEach(lang.hitch(this, function(input){
				if (input.validity) {
					valid = lang.hitch(this, this._setCustomValidity)(input, valid);
				}
			}));
			valid = lang.hitch(this, this._setCustomValidity)(this.telefoon, valid, this._telefoonValidation());
			valid = lang.hitch(this, this._setCustomValidity)(this.kbo, valid, this._kboValidation());
			valid = lang.hitch(this, this._setCustomValidity)(this.rrn, valid, this._rrnValidation());
      if (this._crabWidget.getInput().length <= 0) {
        valid = false;
      }

			return valid

		},

		/**
		 * Event functie om de ingevoerde gegevens van een actor op te slaan. Eerst worden de parameters gevalideerd.
		 * Bij succes zal de detail widget van deze actor getoond worden. Anders wordt er een error uitgezonden in een event van de actor widget.
		 * @param {Event} evt
		 * @private
		 */
		_save: function(evt) {
			if (!this._isValid()) {
				evt? evt.preventDefault() : null;
				this.actorWidget.emitError({
					widget: 'ActorCreate',
					message: 'Input waarden om een nieuwe actor aan te maken, zijn incorrect.',
					error: 'Input waarden om een nieuwe actor aan te maken, zijn incorrect.'
				})
			} else {
        this.actorWidget.showLoading("Actor wordt opgeslagen. Even geduld aub..");
				var actorNew = {};
				actorNew['naam'] = this.naam.value;
				actorNew['voornaam'] = this.voornaam.value;
				actorNew['rrn'] = this.rrn.value;
				actorNew['kbo'] = this.kbo.value;
				actorNew['type'] = {id: this.type.value};
				this._addEmail();
				actorNew['emails'] = this._actorEmails;
				this._addTelefoon();
				actorNew['telefoons'] = this._actorTelefoons;
				this._addUrl();
				actorNew['urls'] = this._actorUrls;

				var crabWidgetValues = this._crabWidget.getInputNew();

				this.actorWidget.actorController.saveActor(actorNew).then(
					lang.hitch(this, function(response) {
						var actor = response;
            var promises = [];
            array.forEach(crabWidgetValues, lang.hitch(this, function(adres) {
              adres.id = null;
              var prom = this.actorWidget.actorController.saveActorAdres(adres, actor.id);
              promises.push(prom);
            }));
						all(promises).then(
              lang.hitch(this, function (response) {
								actor.adres = response[0];
								this._addNewTag(actor.id);
								this._waitForAdd(actor, lang.hitch(this, this._findNewActor));
                this.actorWidget.hideLoading();
							}),
							lang.hitch(this, function (error) {
                  console.log("error: ", error);
                  this.actorWidget.hideLoading();
									this.actorWidget.emitError({
										widget: 'ActorCreate',
										message: 'Bewaren van het adres van de nieuwe actor is mislukt',
										error: error
									})
								}
							));
					}),
					lang.hitch(this, function(error) {
            this.actorWidget.hideLoading();
						this.actorWidget.emitError({
							widget: 'ActorCreate',
							message: 'Bewaren van de nieuwe actor is mislukt',
							error: error
						})
					})
				);
			}
		},

		/**
		 * De nieuw toegevoegde actor weergeven in de detail widget.
		 * Wanneer er daarna naar de zoek widget wordt teruggekeerd, zal deze weergegeven zijn in het het grid.
		 * @param {Object} actor De toegevoegde actor.
		 * @private
		 */
		_findNewActor: function(actor) {
			var query = {query:'id:' +actor.id};
			this._filterGrid(query);
			this._reset();
			this.actorWidget.showActorDetail(actor);
		},

		/**
		 * Wacht tot de afwerking van het toevoegen van een Actor is uitgevoerd.
		 * @param {Object} actor
		 * @param {Function} callback
		 * @private
		 */
		_waitForAdd: function (actor, callback) {
			this.recursively_ajax({
				actor:actor,
				callback: callback
			}, this);
		},

		/**
		 * Maakt recursieve ajax calls om de paar seconden naar de server
		 * om te controleren of deze de behandeling van de actor heeft afgerond.
		 * @param {Object} params Parameters
		 * @param {Object} context Context
		 */
		recursively_ajax: function(params, context){
			//wait for the backend to finish by polling every 2 seconds
			context.actorWidget.actorController.checkActorInES(params.actor.id).then(function (response) {
				if (response.length===0) {
					setTimeout(context.recursively_ajax, 2000, params, context);
				}
				else {
					params.callback(params.actor);
				}
			},  function(error) {
				context.actorWidget.emitError({
					widget: 'ActorCreate',
					error: error
				});
			});
		},

		_filterGrid: function (query) {
			this.actorWidget.advSearchFilterGrid(query);
		},

		/**
		 * Id toevoegen aan lijst met nieuwe id's zodat er een tag getoond kan worden in het grid voor de nieuwe actor.
		 * @param id
		 * @private
		 */
		_addNewTag: function (id) {
			this.actorWidget.getActorSearch().actoren_new.push(id);
		}
	});
});
