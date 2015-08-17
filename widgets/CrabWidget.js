/**
 * Widget voor het beheren van een adres.
 * @module Actor/actorWidgets/CrabWidget
 */
define([
  'dojo',
	'dojo/text!./templates/CrabWidget.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/store/Memory',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dijit/form/ComboBox',
	'dojo/Deferred',
	'dojo/dom-class',
	'dojo/dom-construct',
  'dojo/_base/array',
  'dojo/number',
  'dojo/query',
  'dojo/topic'
], function(
  dojo,
	template,
	declare,
	lang,
	Memory,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ComboBox,
	Deferred,
	domClass,
	domConstruct,
  array,
  number,
  query,
  topic
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		baseClass: 'actor-widget',
		CrabController: null,
    actorWidget: null,

		_gemeenteCombobox: null,
		_postcodeCombobox: null,
		_straatCombobox: null,
		_nummerCombobox: null,

		_gemeentePrev: null,
		_straatPrev: null,

    _crabAddresses: [],
    _crabAddressesRemove: [],
    _crabAddressesNew: [],
    _adresIndex: 100,

		/**
		 * Standaard widget functie.
		 * Opbouwen van meerdere adres <class>dijit/form/ComboBox<class>.
		 */
		postCreate: function() {
			console.log('....CrabWidget::postCreate', arguments);
			this.inherited(arguments);
			this._setLandenList();
      this._setSelectLists();
			this._setGemeentenCombo();
			this._setPostcodesCombo();
			this._setStratenCombo();
			this._setNummersCombo();
		},

		/**
		 * Standaard widget functie.
		 */
		startup: function () {
			console.log('....CrabWidget::startup', arguments);
			this.inherited(arguments);
      this._clearHighlights();
		},

    /**
		 * Selectielijsten aanvullen met opties
		 * @private
		 */
		_setSelectLists: function(){
			var selected;
			this.actorWidget.typeLists.adresTypes.forEach(lang.hitch(this, function(type){
				selected = type.naam === 'primair' ? '" selected': '"';
				domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.adrestypes);
			}));
		},

		/**
		 * Selectielijsten aanvullen met opties
		 * @private
		 */
		_setLandenList: function(){
			// default lijst van landen
			domConstruct.place('<option value="BE" selected>België</option>', this.land);
			domConstruct.place('<option value="DE">Duitsland</option>', this.land);
			domConstruct.place('<option value="FR">Frankrijk</option>', this.land);
			domConstruct.place('<option value="GB">Groot-Brittanië</option>', this.land);
			domConstruct.place('<option value="NL">Nederland</option>', this.land);
			domConstruct.place('<option value="LU">Luxemburg</option>', this.land);
			domConstruct.place('<option disabled>─────────────────────────</option>', this.land);
			this.crabController.getLanden().
				then(lang.hitch(this, function(landenLijst){
					landenLijst.forEach(lang.hitch(this, function(land){
						domConstruct.place('<option value="' + land.id + '">' + land.naam + '</option>', this.land);
					}));
				}));
		},

		/**
		 * Opbouw gemeente <class>dijit/form/ComboBox<class>.
		 * @private
		 */
		_setGemeentenCombo: function() {
			this.crabController.getGemeenten().
				then(lang.hitch(this, function(gemeenten){
					this._gemeenteCombobox = new ComboBox({
						store: new Memory({data: gemeenten}),
						hasDownArrow: false,
						searchAttr: "naam",
						autoComplete: false,
						required: false,
						'class': "placeholder-input",
						onChange: lang.hitch(this, function() {
							this._changePostcodes();
							this._changeStraten();
						})
					}, this.gemeenteCrab);
				}));
			this.gemeenteNode.style.display="none";
		},

		/**
		 * Opbouw postcode <class>dijit/form/ComboBox<class>.
		 * @private
		 */
		_setPostcodesCombo: function() {
			this._postcodeCombobox = new ComboBox({
				hasDownArrow: false,
				searchAttr: "id",
				autoComplete: false,
				required: false,
				'class': "placeholder-input"
			}, this.postcodeCrab);
			this.postcodeCrabNode.style.display="none";
		},

		/**
		 * Opbouw straat <class>dijit/form/ComboBox<class>.
		 * @private
		 */
		_setStratenCombo: function() {
			this._straatCombobox = new ComboBox({
				hasDownArrow: false,
				searchAttr: "label",
				autoComplete: false,
				required: false,
				'class': "placeholder-input",
				onChange: lang.hitch(this, function() {
					this._changeNummers();
				})
			}, this.straatCrab);
			this.straatCrabNode.style.display="none";
		},

		/**
		 * Opbouw huisnummer <class>dijit/form/ComboBox<class>.
		 * @private
		 */
		_setNummersCombo: function() {
			this._nummerCombobox = new ComboBox({
				store: new Memory(),
				hasDownArrow: false,
				searchAttr: "label",
				autoComplete: false,
				required: false,
				'class': "placeholder-input"
			}, this.huisnummerCrab);
			this.huisnummerCrabNode.style.display="none";
		},

		/**
		 * Geeft de overeenkomen id bij een opgegeven <class>dijit/form/ComboBox<class> en string waarde.
		 * Bij geen overeenkomst null.
		 * @param {Object} combobox
		 * @param {string} searchAttr
		 * @returns {nummer} id van de string waarde in de opgegeven <class>dijit/form/ComboBox<class>.
		 * @private
		 */
		_getIdfromCombo: function (combobox, searchAttr) {
			if (combobox.item) {
				return combobox.item.id;
			}
			else {
				var query = {};
				query[searchAttr] = combobox.get('value');
				var result = combobox.store.query(query);
				if (result.length === 1) {
					return result[0].id;
				}
				else {
					return null;
				}
			}
		},

		/**
		 * Geeft de overeengekomen Crab id van de opgegeven gemeente.
		 * @returns {nummer}
		 * @private
		 */
		_getGemeenteIdFromCombo : function () {
			return this._getIdfromCombo(this._gemeenteCombobox, 'naam');
		},

		/**
		 * Geeft de overeengekomen Crab id van de opgegeven straat.
		 * @returns {nummer}
		 * @private
		 */
		_getStraatIdFromCombo : function () {
			return this._getIdfromCombo(this._straatCombobox, 'label');
		},

		/**
		 * Geeft de overeengekomen Crab id van het opgegeven huisnummer.
		 * @returns {nummer}
		 * @private
		 */
		_getNummerIdFromCombo : function () {
			return this._getIdfromCombo(this._nummerCombobox, 'label');
		},

    /**
		 * Geeft de overeengekomen Crab id van het opgegeven subadres.
		 * @returns {nummer}
		 * @private
		 */
		_getPostcodeIdFromCombo : function () {
			return this._getIdfromCombo(this._postcodeCombobox, 'label');
		},

		/**
		 * Afhankelijk van de waarde land worden de gemeenten aangepast.
		 * @private
		 */
		_changeGemeenten: function() {
			if (this.land.value != 'BE') {
				this._resetExceptLand();
				this.gemeenteCrabNode.style.display="none";
				this.gemeenteNode.style.display="inline-table";
			}
			else {
				this._resetExceptLand();
			}
		},

		/**
		 * Afhankelijk van de waarde gemeente worden de postcodes aangepast.
		 * @private
		 */
		_changePostcodes: function() {
			if (this._gemeenteCombobox.get('value')) {
				this._postcodeCombobox.set('value', '');
				this.postcode.value = '';
				var gemeente_id = this._getGemeenteIdFromCombo();
				if (gemeente_id) {
					this.postcodeNode.style.display = "none";
					this.postcodeCrabNode.style.display = "inline-table";
					this.crabController.getPostkantons(gemeente_id).
						then(lang.hitch(this, function (postcodes) {
							this._postcodeCombobox.set('store', new Memory({data: postcodes}));
						}));
				}
			}
		},

		/**
		 * Afhankelijk van de waarde gemeente worden de straten en huisnummers aangepast.
		 * @private
		 */
		_changeStraten: function() {
			var deferred = new Deferred();
			if (this._gemeenteCombobox.get('value') && this._gemeenteCombobox.get('value') != this._gemeentePrev) {
				this.straat.value = '';
				this._straatCombobox.set('value', '');
				this._nummerCombobox.set('value', '');
				this.huisnummer.value = '';
				var gemeente_id = this._getGemeenteIdFromCombo();
				if (gemeente_id) {
					this.straatNode.style.display = "none";
					this.straatCrabNode.style.display = "inline-table";
					this.crabController.getStraten(gemeente_id).
						then(lang.hitch(this, function (straten) {
							this._straatCombobox.set('store', new Memory({data: straten}));
							deferred.resolve();
						}));
				}
				this._gemeentePrev = this._gemeenteCombobox.get('value');
			}
			return deferred.promise;
		},

		/**
		 * Afhankelijk van de waarde straat worden de huisnummers aangepast.
		 * @private
		 */
		_changeNummers: function() {
			if (this._straatCombobox.get('value') && this._straatCombobox.get('value') != this._straatPrev) {
				this.huisnummer.value = '';
				this._nummerCombobox.set('value', '');
				var straat_id = this._getStraatIdFromCombo();
				if (straat_id) {
					this.huisnummerNode.style.display = "none";
					this.huisnummerCrabNode.style.display = "inline-table";
					this.crabController.getNummers(straat_id).
						then(lang.hitch(this, function (nummers) {
							this._nummerCombobox.set('store', new Memory({data: nummers}));
						}));
				}
				this._straatPrev = this._straatCombobox.get('value');
			}
		},

    _addAddress: function(evt) {
      evt? evt.preventDefault() : null;
      var adresInputs = this.getInputValues();
      if (this._isValid()) {
        this._adresIndex++;
        var adres = {
          id: this._adresIndex,
          land: adresInputs.values.land,
          gemeente: adresInputs.values.gemeente,
          gemeente_id: this._getGemeenteIdFromCombo(),
          postcode: adresInputs.values.postcode,
          straat: adresInputs.values.straat,
          straat_id: this._getStraatIdFromCombo(),
          huisnummer: adresInputs.values.huisnummer,
          nummer_id: this._getNummerIdFromCombo(),
          subadres: adresInputs.values.subadres,
          subadres_id: null,
          adrestype: {"id": adresInputs.values.adrestypes}
        };
        this._crabAddresses.push(adres);
        this._crabAddressesNew.push(adres);
        var fullAddress = adres.straat + " " + adres.huisnummer + ", " + adres.postcode + " " + adres.gemeente + ", " + adres.land;
        this._createListItem(this._adresIndex, fullAddress, this.adrestypes.selectedOptions[0].label, this.adreslist, this._removeAddress, false);
        this.resetValues();
      }
    },

    /**
		 * Toevoegen van een waarde met type aan een list (ul html element), voorzien van een verwijder functie (verwijderen uit de lijst).
		 * @param {number} id Deze id wordt gebruikt in de aanmaakt van het element en wordt doorgegeven aan de verwijder functie.
		 * @param {string} value De waarde van het toe te voegen element.
		 * @param {string} type De waarde van het type van het toe te voegen element.
		 * @param {Object} ullist Het ul html element waaraan de waarde toegevoegd moet worden.
		 * @param {function} removeFunction Een extra verwijder functie met als doel deze te verwijderen uit de attribuut lijst
		 * @private
		 */
		_createListItem: function(id, value, type, ullist, removeFunction, disabled) {
			id = id.toString();
      if (disabled) {
        domConstruct.create("li", {
          id: "li_" + id,
          innerHTML: '<small>' + value + ' (' + type + ') </small>'
        }, ullist);
      } else {
        domConstruct.create("li", {
          id: "li" + id,
          innerHTML: '<small>' + value + ' (' + type + ') <i id="' + id + '" class="fa fa-trash right" title="Verwijderen"></i></small>'
        }, ullist);
        this.connect(dojo.byId(id), "onclick", lang.hitch(this, function () {
          lang.hitch(this, removeFunction)(id);
          var nodeId = "li" + id;
          domConstruct.destroy(nodeId);
        }));
      }
		},

    _removeAddress: function(id) {
      this._crabAddressesRemove.push(this._crabAddresses.filter(lang.hitch(this, function(object){
				return (object.id == number.parse(id));
			}))[0]);
      this._crabAddressesRemove = this._crabAddressesRemove.filter(lang.hitch(this, function(object){
        return (array.indexOf(this._crabAddressesNew, object) < 0);
      }));
      this._crabAddressesNew = this._crabAddressesNew.filter(lang.hitch(this, function(object){
				return (object.id !== number.parse(id));
			}));
      this._crabAddresses = this._crabAddresses.filter(lang.hitch(this, function(object){
				return (object.id !== number.parse(id));
			}));
		},

    getInputRemove: function() {
      return this._crabAddressesRemove;
    },

    getInputNew: function() {
      return this._crabAddressesNew;
    },

		/**
		 * Geeft de ingevoerde adres waarden en crab id's terug
		 * @returns {{values: {straat: null, huisnummer: null, subadres: null, postcode: null, gemeente: null, land: null}, ids: {straat_id: null, huisnummer_id: null, gemeente_id: null}}}
		 */
		getInput: function() {
      return this._crabAddresses;
		},

    getInputValues: function() {
      var inputs = {
				values: {
					straat: null,
					huisnummer: null,
					subadres: null,
					postcode: null,
					gemeente: null,
					land: null,
          adrestypes: null
				},
				ids : {
					straat_id: null,
					huisnummer_id: null,
					gemeente_id: null
				}
			};
			var autocompleteMapping = {
				straat: {
					combobox: this._straatCombobox,
					id: {
						name: 'straat_id',
						combo_function: this._getStraatIdFromCombo
					}
				},
				huisnummer: {
					combobox: this._nummerCombobox,
					id: {
						name: 'huisnummer_id',
						combo_function: this._getNummerIdFromCombo
					}
				},
				postcode: {
					combobox: this._postcodeCombobox
				},
				gemeente: {
					combobox: this._gemeenteCombobox,
					id: {
						name: 'gemeente_id',
						combo_function: this._getGemeenteIdFromCombo
					}
				}
			};
			Object.keys(inputs.values).forEach(lang.hitch(this, function(param) {
					if (this[param].value) {
						inputs.values[param] = this[param].value;
					}
					else if (autocompleteMapping[param]) {
						if (autocompleteMapping[param].combobox.get('value')) {
							inputs.values[param] = autocompleteMapping[param].combobox.get('value');
							if (autocompleteMapping[param].id) {
								var idParam = autocompleteMapping[param].id.name;
								inputs.ids[idParam] = lang.hitch(this, autocompleteMapping[param].id.combo_function)();
							}
						}
					}
				}
			));
			return inputs;
    },

		/**
		 * Maakt van de inputvelden niet-bewerk velden. En voert het opgegeven adres in.
		 * @param {Object} adres
		 */
		setValuesDisabled: function(adres){
			this.setDisabled();
			this.land.value = adres.land;
			this.gemeente.value = adres.gemeente;
			this.postcode.value = adres.postcode;
			this.straat.value = adres.straat;
			this.huisnummer.value = adres.huisnummer;
		},

    setValuesListDisabled: function (adressen) {
      this._crabAddresses = [];
      this._crabAddressesRemove = [];
      this._crabAddressesNew = [];
      this._clearHighlights();
      domConstruct.empty(this.adreslist);
      array.forEach(adressen, lang.hitch(this, function(adres) {
        var id = this._adresIndex++;
        if (adres.id) { id = adres.id }
        this._crabAddresses.push(adres);
        var type = this.actorWidget.typeLists.adresTypes.filter(lang.hitch(this, function(type) {
          if (adres.adrestype) {
            return (type.id == adres.adrestype.id);
          } else {
            return (type.id == adres.type.id);
          }
        }));
        var fullAddress = adres.straat + " " + adres.huisnummer + ", " + adres.postcode + " " + adres.gemeente + ", " + adres.land;
        this._createListItem(id, fullAddress, type[0].naam, this.adreslist, this._removeAddress, true);
      }));
    },

    /**
		 * Maakt van de inputvelden niet-bewerk velden.
		 */
		setDisabled: function() {
      this._clearHighlights();
			this.gemeenteNode.style.display = "inline-table";
			this.gemeenteCrabNode.style.display = "none";
			this.land.disabled=true;
			domClass.add(this.landNode, 'placeholder-disabled');
			this.gemeente.disabled=true;
			domClass.add(this.gemeenteNode, 'placeholder-disabled');
			this.straat.disabled=true;
			domClass.add(this.straatNode, 'placeholder-disabled');
			this.postcode.disabled=true;
			domClass.add(this.postcodeNode, 'placeholder-disabled');
			this.huisnummer.disabled=true;
			domClass.add(this.huisnummerNode, 'placeholder-disabled');
			this.subadres.disabled=true;
			domClass.add(this.subadresNode, 'placeholder-disabled');
      this.adrestypes.disabled=true;
			domClass.add(this.adrestypeNode, 'placeholder-disabled');
      this.addAddressIconNode.style.display ='none';
    },

		/**
		 * Voert het opgegeven adres in.
		 * @param {Object} adres
		 */
		setValues: function(adres) {
      this._crabAddresses = [];
      this._crabAddressesRemove = [];
      this._crabAddressesNew = [];
      this._clearHighlights();
			this.land.value = adres.land;
			if (adres.land == 'BE') {
				this._gemeenteCombobox.set('value', adres.gemeente, false);
				if (this._getGemeenteIdFromCombo()){
					this._changeStraten().then(lang.hitch(this, function(){
						if (this._getStraatIdFromCombo()) {
							this._straatPrev = null;
							this._changeNummers();
							this._nummerCombobox.set('value', adres.huisnummer);
						}
					}));
					this._straatCombobox.set('value', adres.straat, false);

					this.huisnummer.value = adres.huisnummer;
					this._changePostcodes();
					this._postcodeCombobox.set('value', adres.postcode);
					this._straatPrev = adres.straat;
				}
				else {
					this.straat.value = adres.straat;
				}
				this._gemeentePrev = adres.gemeente;
			}
			else {
				this.gemeente.value = adres.gemeente;
				this.postcode.value = adres.postcode;
				this.straat.value = adres.straat;
				this.huisnummer.value = adres.huisnummer;
			}
			this.subadres.value = adres.subadres ? adres.subadres : null;

		},

    setValuesList: function(adressen) {
      this._crabAddresses = [];
      this._crabAddressesRemove = [];
      this._crabAddressesNew = [];
      this._clearHighlights();
      domConstruct.empty(this.adreslist);
      array.forEach(adressen, lang.hitch(this, function(adres) {
        var id = this._adresIndex++;
        if (adres.id) { id = adres.id }
        this._crabAddresses.push(adres);
        var type = this.actorWidget.typeLists.adresTypes.filter(lang.hitch(this, function(type) {
          if (adres.adrestype) {
            return (type.id == adres.adrestype.id);
          } else {
            return (type.id == adres.type.id);
          }
        }));
        var fullAddress = adres.straat + " " + adres.huisnummer + ", " + adres.postcode + " " + adres.gemeente + ", " + adres.land;
        this._createListItem(id, fullAddress, type[0].naam, this.adreslist, this._removeAddress, false);
      }));
    },

		/**
		 * reset functie naar default waarden.
		 */
		resetValues: function() {
			this.land.value = 'BE';
			this._resetExceptLand();
      this._clearHighlights();
		},

    setZoekenWidget: function() {
      this.adrestypeNode.style.display = "none";
    },

		/**
		 * reset functie naar default waarden, land niet meegerekend.
		 * @private
		 */
		_resetExceptLand: function() {
			this._gemeenteCombobox.set("value", '');
			this._straatCombobox.set("value", '');
			this._postcodeCombobox.set("value", '');
			this._nummerCombobox.set("value", '');
			this.gemeente.value = '';
			this.straat.value = '';
			this.postcode.value = '';
			this.huisnummer.value = '';
			this.subadres.value = '';
			this.gemeenteCrabNode.style.display="inline-table";
			this.straatCrabNode.style.display="none";
			this.postcodeCrabNode.style.display="none";
			this.huisnummerCrabNode.style.display="none";
			this.gemeenteNode.style.display="none";
			this.straatNode.style.display="inline-table";
			this.postcodeNode.style.display="inline-table";
			this.huisnummerNode.style.display="inline-table";
			this.land.disabled=false;
			this.gemeente.disabled=false;
			this.straat.disabled=false;
			this.postcode.disabled=false;
			this.huisnummer.disabled=false;
			this.subadres.disabled=false;
			this._gemeentePrev=null;
			this._straatPrev=null;
		},

    /**
		 * Nagaan of de ingevoerde inputs in de bewerk widget correct zijn. 'true' wanneer geldig.
     * @returns {boolean}
     * @private
     */
    _isValid: function() {
      var invalids = [];
      var invalidElements = [];
      this._clearHighlights();

      if (this.land.value == '') {
        invalids.push('land');
        invalidElements.push(this.landNode);
      }
      if (this.land.value == 'BE') {
        if (this._gemeenteCombobox.get('value') == '') {
          invalids.push('gemeente');
          invalidElements.push(this.gemeenteNode);
          invalidElements.push(this.gemeenteCrabNode);
        }
        if (this._postcodeCombobox.get('value') == '') {
          invalids.push('postcode');
          invalidElements.push(this.postcodeNode);
          invalidElements.push(this.postcodeCrabNode);
        }
        if (this._straatCombobox.get('value') == '') {
          invalids.push('straat');
          invalidElements.push(this.straatNode);
          invalidElements.push(this.straatCrabNode);
        }
        if (this._nummerCombobox.get('value') == '') {
          invalids.push('huisnummer');
          invalidElements.push(this.huisnummerNode);
          invalidElements.push(this.huisnummerCrabNode);
        }
      } else {
        if (this.gemeente.value == '') {
          invalids.push('gemeente');
          invalidElements.push(this.gemeenteNode);
        }
        if (this.straat.value == '') {
          invalids.push('straat');
          invalidElements.push(this.straatNode);
        }
        if (this.postcode.value == '') {
          invalids.push('postcode');
          invalidElements.push(this.postcodeNode);
        }
        if (this.huisnummer.value == '') {
          invalids.push('huisnummer');
          invalidElements.push(this.huisnummerNode);
        }
      }

      if(invalids.length > 0) {
        this._highlightInvalids(invalidElements);
        topic.publish('dGrowl', "Gelieve volgende velden correct in te vullen: " + invalids.join(), {
          'title':"Adres verplichte velden",
          'sticky': false,
          'channel': 'error'});
        return false;
      }
      return true;
    },

    _clearHighlights: function() {
      // remove all highlights
      query(".placeholder-container.error", this.formCrabNode).forEach(function(elem){
        domClass.remove(elem, "error");
      });
      query("small.error", this.formNode).forEach(function(small) {
        domConstruct.destroy(small);
      });
    },

    _highlightInvalids: function(invalids) {
      this._clearHighlights();
      // add selected highlights
      invalids.forEach(lang.hitch(this, function(invalid){
        domClass.add(invalid, "error");
      }));
      if (invalids.length > 0)
      {
        domConstruct.place('<small class="error" style="margin-top:-15px; margin-bottom: 0;">Gelieve bovenstaande adres velden correct in te vullen.</small>', this.errorMsg, "last");
      }
    }

	});
});