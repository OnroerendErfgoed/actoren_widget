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
	'dojo/dom-construct'
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
	domConstruct
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
      var adres = this.getInput();
      this._adresIndex++;
      this._crabAddresses.push({
        id: this._adresIndex.toString(),
        land: adres.values.land,
        gemeente: adres.values.gemeente,
        postcode: adres.values.postcode,
        straat: adres.values.straat,
        huisnummer: adres.values.huisnummer,
        postbus: adres.values.subadres,
        type: {
          id: 1
        }
      });
      var fullAddress = adres.values.straat + " " + adres.values.huisnummer + ", " + adres.values.postcode + " " + adres.values.gemeente + ", " + adres.values.land;
      this._createListItem(this._adresIndex, fullAddress, "Post", this.adreslist, this._removeAddress);
      this.resetValues();
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
		_createListItem: function(id, value, type, ullist, removeFunction) {
			id = id.toString();
			domConstruct.create("li", {id: "li" + id, innerHTML: '<small>' + value + ' (' + type + ') <i id="' + id + '" class="fa fa-trash right" title="Verwijderen"></i></small>'}, ullist);
			this.connect(dojo.byId(id), "onclick", lang.hitch(this, function() {
				domConstruct.destroy("li" + id);
				lang.hitch(this, removeFunction)(id);
			}));
		},

    _removeAddress: function(id) {
			this._crabAddresses = this._crabAddresses.filter(lang.hitch(this, function(object){
				return (object.id !== id);
			}))
		},

		/**
		 * Geeft de ingevoerde adres waarden en crab id's terug
		 * @returns {{values: {straat: null, huisnummer: null, subadres: null, postcode: null, gemeente: null, land: null}, ids: {straat_id: null, huisnummer_id: null, gemeente_id: null}}}
		 */
		getInput: function() {
			var inputs = {
				values: {
					straat: null,
					huisnummer: null,
					subadres: null,
					postcode: null,
					gemeente: null,
					land: null
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
			return inputs
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

		/**
		 * Maakt van de inputvelden niet-bewerk velden.
		 */
		setDisabled: function() {
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

		/**
		 * reset functie naar default waarden.
		 */
		resetValues: function() {
			this.land.value = 'BE';
			this._resetExceptLand();
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
		}
	});
});