/**
 * Widget om een actor te bewerken.
 * @module Actor/actorWidgets/actorDetail/ActorEdit
 */
define([
	'dojo',
	'dojo/text!./templates/ActorEditView.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dojo/store/Memory',
	'dijit/form/ComboBox',
	'../widgets/CrabWidget',
	'dojo/dom-construct',
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
	domConstruct,
  array,
  all
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

		/**
		 * Standaard widget functie.
		 */
		postCreate: function() {
			console.log('..ActorEdit::postCreate', arguments);
			this.inherited(arguments);
		},

		/**
		 * Standaard widget functie.
		 * Opstarten lijsten
		 * Opstarten telefoon landcodes
		 * Opstarten CrabWidget
		 * Opstarten boodschappen mapping voor validatie
		 */
		startup: function () {
			console.log('..ActorEdit::startup', arguments);
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
		},

		/**
		 * CrabWidget opstarten.
		 * @private
		 */
		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController, actorWidget: this.actorWidget}, this.crabWidget);
		},

		/**
		 * Zet de detail data van de actor en opslaan van widget attributen voor verder beheer.
		 * @param {Object} actor
		 */
		setActor: function(actor) {
			this.naam.value = actor.naam;
			this.voornaam.value = actor.voornaam;

			actor.emails.forEach(lang.hitch(this, function(email) {
				this._index++;
				email['id'] = this._index.toString();
				this._actorEmails.push(email);
				var type = this.actorWidget.typeLists.emailTypes.filter(lang.hitch(this, function(type) {
					return (type.id == email.type.id);
        }));
				this._createListItem(this._index, email.email, type[0].naam, this.emaillist, this._removeEmail);
			}));

			actor.telefoons.forEach(lang.hitch(this, function(telefoon) {
				this._index++;
				telefoon['id'] = this._index.toString();
				this._actorTelefoons.push(telefoon);
				var type = this.actorWidget.typeLists.telephoneTypes.filter(lang.hitch(this, function(type) {
					return (type.id == telefoon.type.id);
        }));
				var telefoonvalue = telefoon.landcode ? telefoon.landcode + telefoon.nummer : '+32' + telefoon.nummer;
				this._createListItem(this._index, telefoonvalue, type[0].naam, this.telefoonlist, this._removeTelefoon);
			}));

			/*if (actor.adres) {
				this._crabWidget.setValues(actor.adres);
			}*/
      if (actor.adressen) {
        this._crabWidget.setValuesList(actor.adressen);
      }
			this.actortype.value  = actor.type.naam;

			actor.urls.forEach(lang.hitch(this, function(url) {
				this._index++;
				url['id'] = this._index.toString();
				this._actorUrls.push(url);
				var type = this.actorWidget.typeLists.urlTypes.filter(lang.hitch(this, function(type) {
					return (type.id == url.type.id);
        }));
				this._createListItem(this._index, url.url, type[0].naam, this.urllist, this._removeUrl);
			}));
			this.actor = actor;
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
		 * Reset functie van de bewerk widget.
		 * @private
		 */
		_reset: function() {
			this.naam.value = '';
			this.voornaam.value = '';
			this.email.value=  '';
			this._actorEmails.forEach(lang.hitch(this, function(emailObject){
				domConstruct.destroy('li' + emailObject.id);
			}));
			this._actorEmails = [];
			this.emailtypes.value = 2;
			this.telefoon.value = '';
			this._actorTelefoons.forEach(lang.hitch(this, function(telefoonObject){
				domConstruct.destroy('li' + telefoonObject.id);
			}));
			this._actorTelefoons = [];
			this.telefoontypes.value = 2;
			this.telefoonLandcode.value = '';
			this._crabWidget.resetValues();
			this.actortype.value = "1";
			this.url.value = "";
			this._actorUrls.forEach(lang.hitch(this, function(urlObject){
				domConstruct.destroy('li' + urlObject.id);
			}));
			this._actorUrls = [];
			this.urltypes.value = 1;
      this.actor = null;
		},

		/**
		 * Opstarsten van de boodschappen mapping voor de validatie
		 * @private
		 */
		_setValidationMessageMapping: function () {
			this._validationMessageMapping = {
				email: "De waarde is niet volgens het geldig email formaat.",
				telefoon: "De waarde is niet volgens het geldig telefoon formaat.",
				url: "De waarde is niet volgens het geldig url formaat.",
				gemeente: "De waarde is te lang",
				gemeenteCrabValidation: "Gemeente is verplicht. Gelieve een geldige gemeente in te vullen.",
				straat: "De waarde is te lang",
				huisnummer: "De waarde is te lang",
				subadres: "De waarde is te lang"
			}
		},

		/**
		 * Validatie gemeente.
		 * @returns {boolean} True wanneer geldig, False wanneer ongeldig.
		 * @private
		 */
		_gemeenteValidation: function() {
			var valid = true;
			if (this._crabWidget.land.value == 'BE') {
				if (!this._crabWidget.getInputValues().ids.gemeente_id) {
					valid = false;
				}
			}
			return valid;
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
			var inputs = [this.email, this._crabWidget.straat, this._crabWidget.huisnummer, this._crabWidget.subadres,
				this._crabWidget.postcode, this._crabWidget.gemeente, this.url, this.telefoon, this._crabWidget.gemeenteCrabValidation];
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
			var inputs = [this.email, this._crabWidget.straat, this._crabWidget.huisnummer, this._crabWidget.subadres,
				this._crabWidget.postcode, this._crabWidget.gemeente, this.url];
			inputs.forEach(lang.hitch(this, function(input){
				if (input.validity) {
					valid = lang.hitch(this, this._setCustomValidity)(input, valid);
				}
			}));
			valid = lang.hitch(this, this._setCustomValidity)(this.telefoon, valid, this._telefoonValidation());
			//valid = lang.hitch(this, this._setCustomValidity)(this._crabWidget.gemeenteCrabValidation, valid, this._gemeenteValidation());
      if (this._crabWidget.getInput().length <= 0) {
        valid = false;
      }
			return valid

		},

		/**
		 * Event functie om de ingevoerde gegevens van een actor op te slaan. Eerst worden de parameters gevalideerd.
		 * Enkel wanneer een adres wijzigd is, zal een een put op de adressen endpoint uitgevoerd worden.
		 * Bij succes zal de detail widget van deze actor getoond worden. Anders wordt er een error uitgezonden in een event van de actor widget.
		 * @param {Event} evt
		 * @private
		 */
		_save: function(evt) {
			evt? evt.preventDefault() : null;
			if (!this._isValid()) {
				this.actorWidget.emitError({
					widget: 'ActorEdit',
					message: 'Input waarden om een actor te bewerken, zijn incorrect.',
					error: 'Input waarden om een actor te bewerken, zijn incorrect.'
				})
			} else {
        this.actorWidget.showLoading("Actor wordt opgeslagen. Even geduld aub..");
				var actorEdit = this.actor;

				this._addEmail();
				actorEdit['emails'] = this._actorEmails;

				this._addTelefoon();
				actorEdit['telefoons'] = this._actorTelefoons;

				this._addUrl();
				actorEdit['urls'] = this._actorUrls;

				var crabWidgetValuesNew = this._crabWidget.getInputNew();
        var crabWidgetValuesRemove = this._crabWidget.getInputRemove();
        var crabWidgetValues = this._crabWidget.getInput();

        crabWidgetValuesRemove = crabWidgetValuesRemove.filter(lang.hitch(this, function(object){
          return (array.indexOf(crabWidgetValuesNew, object) < 0);
        }));

				var actorId = actorEdit.id;
        this.actorWidget.actorController.saveActor(actorEdit).then(
          lang.hitch(this, function(response) {
            var actor = response;
            if (crabWidgetValues.length > 0) {
              actor.adressen = crabWidgetValues;
            }
            if (crabWidgetValuesRemove.length > 0) { // first remove addresses, then add new
              var promises = [];
              array.forEach(crabWidgetValuesRemove, lang.hitch(this, function(adres) {
                var prom = this.actorWidget.actorController.deleteActorAdres(adres.id, actorId);
                promises.push(prom);
              }));
              all(promises).then( // when all removed, add new ones
                lang.hitch(this, function (response) {
                  var promisesNew = [];
                  if (crabWidgetValuesNew.length > 0) {
                    array.forEach(crabWidgetValuesNew, lang.hitch(this, function (adres) {
                      adres.id = null;
                      var prom = this.actorWidget.actorController.saveActorAdres(adres, actorId);
                      promisesNew.push(prom);
                    }));
                    all(promisesNew).then( // when new ones added handle redirect and stuff
                      lang.hitch(this, function (response) {
                        //if (!actor.adres) {
                          actor.adres = response[0];
                        //}
                        this._addUpdatedTag(actor.id);
                        this.actorWidget.hideLoading();
                        this.actorWidget.showActorDetail(actor);
                        this._reset();
                      }),
                      lang.hitch(this, function (error) {
                        this.actorWidget.hideLoading();
                        this.actorWidget.emitError({
                          widget: 'ActorEdit',
                          message: 'Bewaren van het nieuwe adres van de actor is mislukt',
                          error: error
                        })
                      }));
                  } else { // when only removed, handle redirect and stuff
                    if (crabWidgetValues.length > 0) {
                      actor.adressen = crabWidgetValues;
                      actor.adres = crabWidgetValues[0];
                    }
                    this._addUpdatedTag(actor.id);
                    this.actorWidget.hideLoading();
                    this.actorWidget.showActorDetail(actor);
                    this._reset();
                  }
                }),
                lang.hitch(this, function (error) {
                  this.actorWidget.hideLoading();
                  this.actorWidget.emitError({
                    widget: 'ActorEdit',
                    message: 'Er ging iets mis bij het verwijderen van een adres.',
                    error: error
                  })
                }));
            } else { // just add new
              var promisesOnlyNew = [];
              array.forEach(crabWidgetValuesNew, lang.hitch(this, function(adres) {
                adres.id = null;
                var prom = this.actorWidget.actorController.saveActorAdres(adres, actorId);
                promisesOnlyNew.push(prom);
              }));
              all(promisesOnlyNew).then( // when new ones added handle redirect and stuff
                lang.hitch(this, function (response) {
                  actor.adres = response[0];
                  if (crabWidgetValues.length > 0) {
                    actor.adressen = crabWidgetValues;
                  }
                  this._addUpdatedTag(actor.id);
                  this.actorWidget.hideLoading();
                  this.actorWidget.showActorDetail(actor);
                  this._reset();
                }),
                lang.hitch(this, function (error) {
                  this.actorWidget.hideLoading();
                  this.actorWidget.emitError({
                    widget: 'ActorEdit',
                    message: 'Bewaren van het nieuwe adres van de actor is mislukt',
                    error: error
                  })
                }));
            }
					}),
					lang.hitch(this, function(error) {
            this.actorWidget.hideLoading();
						this.actorWidget.emitError({
							widget: 'ActorEdit',
							message: 'Bewaren van de bewerkte actor is mislukt',
							error: error
						})
					})
				);
			}
		},

    _cancel: function (evt) {
			evt.preventDefault();
      this.actorWidget.showActorDetail(this.actor);
      this._reset();
    },

		/**
		 * Id toevoegen aan lijst met bewerkte id's zodat er een tag getoond kan worden in het grid voor de bewerkte actor.
		 * Alleen als de actor id nog niet in de lijst of in de lijst met nieuwe actor id's voorkomt.
		 * @param id
		 * @private
		 */
		_addUpdatedTag: function (id) {
			var actorSearch = this.actorWidget.getActorSearch();
			if (!(actorSearch.actoren_updated.indexOf(id) > -1 || actorSearch.actoren_new.indexOf(id) > -1)) {
				actorSearch.actoren_updated.push(id);
			}
		},

		_filterGrid: function (query) {
			this.actorWidget.advSearchFilterGrid(query);
		}

	});
});
