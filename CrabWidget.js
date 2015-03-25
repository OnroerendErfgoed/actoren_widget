define([
	'dojo/text!./templates/CrabWidget.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/store/Memory',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dijit/form/ComboBox'
], function(
	template,
	declare,
	lang,
	Memory,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ComboBox
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		baseClass: 'actor-widget',
		CrabController: null,

		_gemeenteCombobox: null,
		_postcodeCombobox: null,
		_straatCombobox: null,
		_nummerCombobox: null,

		postCreate: function() {
			console.log('....CrabWidget::postCreate', arguments);
			this.inherited(arguments);
			this._setGemeentenCombo();
			this._setPostcodesCombo();
			this._setStratenCombo();
			this._setNummersCombo();
		},

		startup: function () {
			console.log('....CrabWidget::startup', arguments);
			this.inherited(arguments);
		},

		_setGemeentenCombo: function() {
			this.crabController.getGeementen().
				then(lang.hitch(this, function(gemeenten){
					this._gemeenteCombobox = new ComboBox({
						store: new Memory({data: gemeenten}),
						hasDownArrow: false,
						searchAttr: "naam",
						autoComplete: false,
						required: false,
						placeholder: "gemeente",
						class: "input-label-right search-combobox",
						style: "width: 60%;",
						onChange: lang.hitch(this, function() {
							this._changePostcodes();
							this._changeStraten();
						})
					}, this.gemeenteCrab);
				}));
			this.gemeente.style.display="none";
		},

		_setPostcodesCombo: function() {
			this._postcodeCombobox = new ComboBox({
				hasDownArrow: false,
				searchAttr: "id",
				autoComplete: false,
				required: false,
				placeholder: "postcode",
				class: "input-label-left search-combobox",
				style: "width: 30%;"
			}, this.postcodeCrab);
			this.postcodeCrabNode.style.display="none";
		},

		_setStratenCombo: function() {
			this._straatCombobox = new ComboBox({
				hasDownArrow: false,
				searchAttr: "label",
				autoComplete: false,
				required: false,
				placeholder: "straat",
				class: "input-label-right search-combobox",
				style: "width: 100%;",
				onChange: lang.hitch(this, function() {
					this._changeNummers();
				})
			}, this.straatCrab);
			this.straatCrabNode.style.display="none";
		},

		_setNummersCombo: function() {
			this._nummerCombobox = new ComboBox({
				store: new Memory(),
				hasDownArrow: false,
				searchAttr: "label",
				autoComplete: false,
				required: false,
				placeholder: "nummer",
				class: "input-label-left search-combobox",
				style: "width: 45%;"
			}, this.nummerCrab);
			this.nummerCrabNode.style.display="none";
		},

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

		_getGemeenteIdFromCombo : function () {
			return this._getIdfromCombo(this._gemeenteCombobox, 'naam');
		},

		_getStraatIdFromCombo : function () {
			return this._getIdfromCombo(this._straatCombobox, 'label');
		},

		_getNummerIdFromCombo : function () {
			return this._getIdfromCombo(this._nummerCombobox, 'label');
		},

		_getPostcodeIdFromCombo : function () {
			return this._getIdfromCombo(this._postcodeCombobox, 'id');
		},

		_changeGemeenten: function() {
			if (this.land.value != 'BE') {
				this.gemeenteCrabNode.style.display="none";
				this.straatCrabNode.style.display="none";
				this.postcodeCrabNode.style.display="none";
				this.nummerCrabNode.style.display="none";
				this.gemeente.style.display="block";
				this.straat.style.display="block";
				this.postcode.style.display="block";
				this.nummer.style.display="block";
				this._gemeenteCombobox.set("value", '');
				this._straatCombobox.set("value", '');
				this._postcodeCombobox.set("value", '');
				this._nummerCombobox.set("value", '');
			}
			else {
				this.gemeente.style.display="none";
				this.gemeenteCrabNode.style.display="block";
				this.gemeente.value='';
			}
		},

		_changePostcodes: function() {
			if (this._gemeenteCombobox.get('value')) {
				this.postcode.style.display = "none";
				var postcode = this.postcode.value ? this.postcode.value : this._postcodeCombobox.get('value');
				this._postcodeCombobox.set('value', postcode);
				this.postcode.value = '';
				this.postcodeCrabNode.style.display = "block";
				var gemeente_id = this._getGemeenteIdFromCombo();
				if (gemeente_id) {
					this.crabController.getPostkantons(gemeente_id).
						then(lang.hitch(this, function (postcodes) {
							this._postcodeCombobox.set('store', new Memory({data: postcodes}));
						}));
				}
			}
		},

		_changeStraten: function() {
			if (this._gemeenteCombobox.get('value')) {
				this.straat.style.display = "none";
				this.straat.value = '';
				this._straatCombobox.set('value', '');
				this._nummerCombobox.set('value', '');
				this.nummer.value = '';
				this.straatCrabNode.style.display = "block";
				var gemeente_id = this._getGemeenteIdFromCombo();
				if (gemeente_id) {
					this.crabController.getStraten(gemeente_id).
						then(lang.hitch(this, function (straten) {
							this._straatCombobox.set('store', new Memory({data: straten}));
						}));
				}
			}
		},

		_changeNummers: function() {
			if (this._straatCombobox.get('value')) {
				this.nummer.style.display = "none";
				this.nummer.value = '';
				this.nummerCrabNode.style.display = "block";
				var straat_id = this._getStraatIdFromCombo();
				if (straat_id) {
					this.crabController.getNummers(straat_id).
						then(lang.hitch(this, function (nummers) {
							this._nummerCombobox.set('store', new Memory({data: nummers}));
						}));
				}
			}
		},

		getValues: function() {
			var inputs = {
				straat: null,
				nummer: null,
				postbus: null,
				postcode: null,
				gemeente: null,
				land: null
			};
			var autocompleteMapping = {
				straat: this._straatCombobox,
				nummer: this._nummerCombobox,
				postcode: this._postcodeCombobox,
				gemeente: this._gemeenteCombobox
			};
			Object.keys(inputs).forEach(lang.hitch(this, function(param) {
				if (this[param].value) {
					inputs[param] = this[param].value;
				}
				else if (autocompleteMapping[param]) {
					if (autocompleteMapping[param].get('value')) {
						inputs[param] = autocompleteMapping[param].get('value');
					}
				}
			}));
			return inputs
		},

		setValuesDisabled: function(adres){
			this.gemeente.style.display = "block";
			this.gemeenteCrabNode.style.display = "none";
			this.gemeente.value = adres.gemeente;
			this.postcode.value = adres.postcode;
			this.straat.value = adres.straat;
			this.nummer.value = adres.huisnummer;
			this.land.disabled=true;
			this.gemeente.disabled=true;
			this.straat.disabled=true;
			this.postcode.disabled=true;
			this.nummer.disabled=true;
			this.postbus.disabled=true;
		},

		setValues: function(adres) {
			this.land.value = adres.land;
			if (adres.land == 'BE') {
				this._gemeenteCombobox.set('value', adres.gemeente, false);
				if (this._getGemeenteIdFromCombo()){
					this._changeStraten();
					this._changePostcodes();
					this._straatCombobox.set('value', adres.straat, false);
					this._postcodeCombobox.set('value', adres.postcode);
					if (this._getStraatIdFromCombo()) {
						this._changeNummers();
						this._nummerCombobox.set('value', adres.huisnummer);
					}
					else {
						this.nummer.value = adres.huisnummer;
					}
				}
				else {
					this.straat.value = adres.straat;
				}
			}
			else {
				this.gemeente.value = adres.gemeente;
				this.postcode.value = adres.postcode;
				this.straat.value = adres.straat;
				this.nummer.value = adres.huisnummer;
			}
			this.postbus.value = adres.postbus ? adres.postbus : null;
		},


		resetValues: function() {
			this.land.value = 'BE';
			this._gemeenteCombobox.set("value", '');
			this._straatCombobox.set("value", '');
			this._postcodeCombobox.set("value", '');
			this._nummerCombobox.set("value", '');
			this.gemeente.value = '';
			this.straat.value = '';
			this.postcode.value = '';
			this.nummer.value = '';
			this.postbus.value = '';
			this.gemeenteCrabNode.style.display="block";
			this.straatCrabNode.style.display="none";
			this.postcodeCrabNode.style.display="none";
			this.nummerCrabNode.style.display="none";
			this.gemeente.style.display="none";
			this.straat.style.display="block";
			this.postcode.style.display="block";
			this.nummer.style.display="block";
			this.land.disabled=false;
			this.gemeente.disabled=false;
			this.straat.disabled=false;
			this.postcode.disabled=false;
			this.nummer.disabled=false;
			this.postbus.disabled=false;
		}
	});
});