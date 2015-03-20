define([
	'dojo/text!./templates/CrabWidget.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/store/Memory',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dijit/form/ComboBox',
	'dijit/form/Select'
], function(
	template,
	declare,
	lang,
	Memory,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ComboBox,
	Select
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		CrabController: null,

		_gemeenteCombobox: null,
		_postcodeSelect: null,
		_straatCombobox: null,
		_nummerCombobox: null,

		postCreate: function() {
			console.log('...ActorAdvSearchActor::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
			console.log('...ActorAdvSearchActor::startup', arguments);
			this.inherited(arguments);
			this._setGemeentenCombo();
			this._setPostcodesSelect();
			this._setStratenCombo();
			this._setNummersCombo();
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
							//Postcodes moet eerst nog op dev-geo.onroerenderfgoed.be
							this._changePostcodes();

							this._changeStraten();
						})
					}, this.gemeenteCrab);
				}));
			this.gemeente.style.display="none";
		},

		_setPostcodesSelect: function() {
			this._postcodeSelect = new Select({
				hasDownArrow: false,
				required: false,
				class: "search-combobox"
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
				class: "search-combobox"
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
				this._postcodeSelect.set("value", '');
				this._nummerCombobox.set("value", '');
			}
			else {
				this.gemeente.style.display="none";
				this.gemeenteCrabNode.style.display="block";
				this.gemeente.value='';
			}
		},

		_changePostcodes: function() {
			if (this._gemeenteCombobox) {
				if (this._gemeenteCombobox.item) {
					//Postcodes moet eerst nog op dev-geo.onroerenderfgoed.be
					//this.crabController.getPostkantons(this._gemeenteCombobox.item.id).
					//  then(lang.hitch(this, function (postcodes) {
					var postcodesOptions = [];
					var postcodes = [
						{"id": "8300 test"},
						{"id": "8301 test"}
					];
					postcodes.forEach(function(postcode){
						postcodesOptions.push({label:postcode.id, value: postcode.id})
					});
					this.postcode.style.display = "none";
					this.postcode.value = '';
					this._postcodeSelect.removeOption(this._postcodeSelect.getOptions());
					this._postcodeSelect.addOption(postcodesOptions);
					this.postcodeCrabNode.style.display = "block";
					//  }));
				}
			}
		},

		_changeStraten: function() {
			if (this._gemeenteCombobox) {
				if (this._gemeenteCombobox.item) {
					this.crabController.getStraten(this._gemeenteCombobox.item.id).
						then(lang.hitch(this, function (straten) {
							this.straat.style.display = "none";
							this.straat.value = '';
							this._straatCombobox.set('store', new Memory({data: straten}));
							this.straatCrabNode.style.display = "block";
						}));
				}
			}
		},

		_changeNummers: function() {
			if (this._straatCombobox) {
				if (this._straatCombobox.item) {
					this.crabController.getNummers(this._straatCombobox.item.id).
						then(lang.hitch(this, function (nummers) {
							this.nummer.style.display = "none";
							this.nummer.value = '';
							this._nummerCombobox.set('store', new Memory({data: nummers}));
							this.nummerCrabNode.style.display = "block";
						}));
				}
			}
		}

	});
});