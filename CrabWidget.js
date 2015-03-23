define([
	'dojo/text!./templates/CrabWidget.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/store/Memory',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/form/ComboBox'
], function(
	template,
	declare,
	lang,
	Memory,
	_WidgetBase,
	_TemplatedMixin,
	ComboBox
) {
	return declare([_WidgetBase, _TemplatedMixin], {
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
				this.postcode.value = '';
				this._postcodeCombobox.set('value', '');
				this.postcodeCrabNode.style.display = "block";
				if (this._gemeenteCombobox.item) {
					this.crabController.getPostkantons(this._gemeenteCombobox.item.id).
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
				if (this._gemeenteCombobox.item) {
					this.crabController.getStraten(this._gemeenteCombobox.item.id).
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
				if (this._straatCombobox.item) {
					this.crabController.getNummers(this._straatCombobox.item.id).
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
		}
	});
});