define([
	'dojo/text!./templates/CrabWidget.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/store/Memory',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dijit/form/ComboBox',
	'dojo/Deferred'
], function(
	template,
	declare,
	lang,
	Memory,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ComboBox,
	Deferred
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		baseClass: 'actor-widget',
		CrabController: null,

		_gemeenteCombobox: null,
		_postcodeCombobox: null,
		_straatCombobox: null,
		_nummerCombobox: null,

		_gemeentePrev: null,
		_straatPrev: null,


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
						class: "placeholder-input",
						onChange: lang.hitch(this, function() {
							this._changePostcodes();
							this._changeStraten();
						})
					}, this.gemeenteCrab);
				}));
			this.gemeenteNode.style.display="none";
		},

		_setPostcodesCombo: function() {
			this._postcodeCombobox = new ComboBox({
				hasDownArrow: false,
				searchAttr: "id",
				autoComplete: false,
				required: false,
				class: "placeholder-input"
			}, this.postcodeCrab);
			this.postcodeCrabNode.style.display="none";
		},

		_setStratenCombo: function() {
			this._straatCombobox = new ComboBox({
				hasDownArrow: false,
				searchAttr: "label",
				autoComplete: false,
				required: false,
				class: "placeholder-input",
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
				class: "placeholder-input"
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

		_changePostcodes: function() {
			if (this._gemeenteCombobox.get('value')) {
				var postcode = this.postcode.value ? this.postcode.value : this._postcodeCombobox.get('value');
				this._postcodeCombobox.set('value', postcode);
				this.postcode.value = postcode;
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

		_changeStraten: function() {
			var deferred = new Deferred();
			if (this._gemeenteCombobox.get('value') && this._gemeenteCombobox.get('value') != this._gemeentePrev) {
				this.straat.value = '';
				this._straatCombobox.set('value', '');
				this._nummerCombobox.set('value', '');
				this.nummer.value = '';
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

		_changeNummers: function() {
			if (this._straatCombobox.get('value') && this._straatCombobox.get('value') != this._straatPrev) {
				this.nummer.value = '';
				this._nummerCombobox.set('value', '');
				var straat_id = this._getStraatIdFromCombo();
				if (straat_id) {
					this.nummerNode.style.display = "none";
					this.nummerCrabNode.style.display = "inline-table";
					this.crabController.getNummers(straat_id).
						then(lang.hitch(this, function (nummers) {
							this._nummerCombobox.set('store', new Memory({data: nummers}));
						}));
				}
				this._straatPrev = this._straatCombobox.get('value');
			}
		},

		getInput: function() {
			var inputs = {
				values: {
					straat: null,
					nummer: null,
					postbus: null,
					postcode: null,
					gemeente: null,
					land: null
				},
				ids : {
					straat_id: null,
					nummer_id: null,
					gemeente_id: null
				}
			};
			var autocompleteMapping = {
				straat: {
					combobox: this._straatCombobox,
					id: {
						name: 'straat_id',
						function: this._getStraatIdFromCombo
					}
				},
				nummer: {
					combobox: this._nummerCombobox,
					id: {
						name: 'nummer_id',
						function: this._getNummerIdFromCombo
					}
				},
				postcode: {
					combobox: this._postcodeCombobox
				},
				gemeente: {
					combobox: this._gemeenteCombobox,
					id: {
						name: 'gemeente_id',
						function: this._getGemeenteIdFromCombo
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
								inputs.ids[idParam] = lang.hitch(this, autocompleteMapping[param].id.function)();
							}
						}
					}
				}
			));
			return inputs
		},

		setValuesDisabled: function(adres){
			this.setDisabled();
			this.gemeente.value = adres.gemeente;
			this.postcode.value = adres.postcode;
			this.straat.value = adres.straat;
			this.nummer.value = adres.huisnummer;
		},

		setDisabled: function() {
			this.gemeenteNode.style.display = "inline-table";
			this.gemeenteCrabNode.style.display = "none";
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
					this._changeStraten().then(lang.hitch(this, function(){
						if (this._getStraatIdFromCombo()) {
							this._straatPrev = null;
							this._changeNummers();
							this._nummerCombobox.set('value', adres.huisnummer);
						}
					}));
					this._straatCombobox.set('value', adres.straat, false);

					this.nummer.value = adres.huisnummer;
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
				this.nummer.value = adres.huisnummer;
			}
			this.postbus.value = adres.postbus ? adres.postbus : null;
		},


		resetValues: function() {
			this.land.value = 'BE';
			this._resetExceptLand();
		},
		_resetExceptLand: function() {
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
			this.gemeenteNode.style.display="none";
			this.straatNode.style.display="inline-table";
			this.postcodeNode.style.display="inline-table";
			this.nummerNode.style.display="inline-table";
			this.land.disabled=false;
			this.gemeente.disabled=false;
			this.straat.disabled=false;
			this.postcode.disabled=false;
			this.nummer.disabled=false;
			this.postbus.disabled=false;
			this._gemeentePrev=null;
			this._straatPrev=null;
		}
	});
});