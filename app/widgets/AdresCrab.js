/**
 * Widget voor het beheren van een adres.
 * @module Actor/actorWidgets/CrabWidget
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/on',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/store/Memory',
  'dijit/form/FilteringSelect',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'dojo/text!./templates/AdresCrab.html',
  'dijit/TooltipDialog',
  'dijit/popup'
], function(
  declare,
  lang,
  Deferred,
  on,
  domConstruct,
  domClass,
  Memory,
  FilteringSelect,
  _TemplatedMixin,
  _WidgetBase,
  template,
  TooltipDialog,
  popup
) {
  return declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,
    crabController: null,
    gemeenteStore: null,
    disabled: true,
    adres: null,

    _gemeenteFilteringSelect: null,
    _postcodeFilteringSelect: null,
    _straatFilteringSelect: null,
    _nummerFilteringSelect: null,
    _gemeenteCrabTooltipDialog: null,

    _huisnummersFound: true,
    required: '',

    /**
     * Standaard widget functie.
     * Opbouwen van meerdere adres <class>dijit/form/ComboBox<class>.
     */
    postCreate: function() {
      console.debug('....ActorCrabLogic::postCreate', arguments);
      this.inherited(arguments);

      this._gemeenteCrabTooltipDialog = new TooltipDialog({
        'baseClass': 'dijitTooltipDialog info-dialog',
        content: '<p><i class="fa fa-info"></i>&nbsp;Opgelet: enkel officiële gemeenten (en niet deelgemeenten) kunnen ingegeven worden.</p>',
        onClick: function () {
          popup.close(this);
        }
      });
      this.own(
        on(this.gemeenteLabelCrab, 'click', lang.hitch(this, function() {
          if (!this.disabled) {
            popup.open({
              popup: this._gemeenteCrabTooltipDialog,
              around: this.gemeenteLabelCrab
            });
          }
        }))
      )
    },

    initCrab: function(){
      this._setLandenList();
      this._setGemeentenSelect();
      this._setPostcodesSelect();
      this._setStratenSelect();
      this._setNummersSelect();

      // set defaults
      this._resetExceptLand();
    },

    /**
     * Standaard widget functie.
     */
    startup: function () {
      console.debug('....ActorCrabLogic::startup', arguments);
      this.inherited(arguments);

      this.initCrab();
    },

    enable: function() {
      if (this.disabled) {
        this.disabled = false;
        domClass.remove(this.gemeenteCrabNode, 'placeholder-disabled');
        this._gemeenteFilteringSelect.set('disabled', false);
        this._changeStraten();
        this._changePostcodes();
      }
    },

    disable: function() {
      if (!this.disabled) {
        this.disabled = true;
        domClass.add(this.gemeenteCrabNode, 'placeholder-disabled');
        this._gemeenteFilteringSelect.set('disabled', true);
      }
    },

    /**
     * Selectielijsten aanvullen met opties
     * @private
     */
    _setLandenList: function(){
      // default lijst van landen
      domConstruct.place('<option value="BE">België</option>', this.land);
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
     * Opbouw gemeente <class>dijit/form/FilteringSelect<class>.
     * @private
     */
    _setGemeentenSelect: function() {
      this._gemeenteFilteringSelect = new FilteringSelect({
        store: this.gemeenteStore,
        hasDownArrow: true,
        placeHolder: 'Gemeente',
        searchAttr: 'naam',
        autoComplete: false,
        required: false,
        'class': 'placeholder-input',
        onChange: lang.hitch(this, function() {
          this._changePostcodes();
          this._changeStraten();
        }),
        onBlur: lang.hitch(this, function() {
          popup.close(this._gemeenteCrabTooltipDialog);
        })
      }, this.gemeenteCrab);
      this.gemeenteNode.style.display = 'none';
    },

    /**
     * Opbouw postcode <class>dijit/form/FilteringSelect<class>.
     * @private
     */
    _setPostcodesSelect: function() {
      this._postcodeFilteringSelect = new FilteringSelect({
        hasDownArrow: true,
        searchAttr: 'id',
        placeHolder: 'Postcode',
        autoComplete: false,
        required: false,
        'class': 'placeholder-input'
      }, this.postcodeCrab);
      this.postcodeCrabNode.style.display = 'none';
    },

    /**
     * Opbouw straat <class>dijit/form/FilteringSelect<class>.
     * @private
     */
    _setStratenSelect: function() {
      this._straatFilteringSelect = new FilteringSelect({
        hasDownArrow: true,
        searchAttr: 'label',
        placeHolder: 'Straat',
        autoComplete: false,
        required: false,
        'class': 'placeholder-input',
        onChange: lang.hitch(this, function() {
          this._changeNummers();
        })
      }, this.straatCrab);
      this.straatCrabNode.style.display = 'none';
    },

    /**
     * Opbouw huisnummer <class>dijit/form/FilteringSelect<class>.
     * @private
     */
    _setNummersSelect: function() {
      this._nummerFilteringSelect = new FilteringSelect({
        store: new Memory(),
        hasDownArrow: true,
        placeHolder: 'Nummer',
        searchAttr: 'label',
        autoComplete: false,
        required: false,
        'class': 'placeholder-input'
      }, this.huisnummerCrab);
      this.huisnummerCrabNode.style.display = 'none';
      this._nummerFilteringSelect.set('disabled', true);
    },

    isValid: function(){
      /* jshint maxcomplexity:20 */
      var values = this.getInputValues();
      var valid = true;

      if (!values.gemeente || values.gemeente === '') {
        valid = false;
      }
      if (!values.straat || values.straat === '') {
        valid = false;
      }
      if (!values.postcode || values.postcode === '') {
        valid = false;
      }

      if (this._huisnummersFound && (!values.huisnummer || values.huisnummer === '')) {
        valid = false;
      }

      /* jshint -W106 */
      if (values.land === 'BE') {
        if (!values.gemeente_id || values.gemeente_id === '') {
          valid = false;
        }
        if(!values.straat_id || values.straat_id === '') {
          valid = false;
        }
        if(this._huisnummersFound && (!values.huisnummer_id || values.huisnummer_id === '')) {
          valid = false;
        }
      }
      /* jshint +W106 */
      return valid;
    },

    isBelgieGemeenteValid: function(valid, mess){
      var values = this.getInputValues();
      if(values.land === 'BE' && values.gemeente !== null && values.gemeente_id === null){ // jshint ignore:line
        valid.message = valid.message + '- De ingevulde gemeente bij ' + mess  + '' +
          ' is geen geldige belgische gemeente.<br/>';
        valid.valid = false;
      }
      return valid;
    },

    /**
     * Voert het opgegeven adres in.
     * @param {Object} adres
     */
    setValues: function(adres) {
      console.log('AdresCrab::setValues', adres);
      this.adres = adres;
      this.land.value = adres.land;
      if (adres.land === 'BE') {
        this._adresObject = adres;
        /* jshint -W106 */
        this._gemeenteFilteringSelect.set('value', adres.gemeente_id);
        /* jshint +W106 */
        if (this.disabled) {
          domClass.add(this.gemeenteCrabNode, 'placeholder-disabled');
          this._gemeenteFilteringSelect.set('disabled', true);
        } else {
          domClass.remove(this.gemeenteCrabNode, 'placeholder-disabled');
          this._gemeenteFilteringSelect.set('disabled', false);
        }
      }
      else {
        this.gemeente.value = adres.gemeente;
        this.postcode.value = adres.postcode;
        this.straat.value = adres.straat;
        this.huisnummer.value = adres.huisnummer;
      }
      this.subadres.value = adres.subadres ? adres.subadres : null;
    },

    getInputValues: function() {
      /* jshint maxcomplexity:20 */
      var data = {};
      if (this.adres) {
        data.einddatum = this.adres.einddatum;
        data.startdatum = this.adres.startdatum;
      }
      data.land = this.land.value;

      if (data.land === 'BE') {
        // get data from filteringselects
        data.gemeente = this._gemeenteFilteringSelect.get('displayedValue') || null;
        data.straat = this._straatFilteringSelect.get('displayedValue') || null;
        data.postcode = this._postcodeFilteringSelect.get('displayedValue') || null;
        data.huisnummer = this._nummerFilteringSelect.get('displayedValue') || null;
        data.subadres = this.subadres.value || undefined;

        /* jshint -W106 */
        data.gemeente_id = parseInt(this._gemeenteFilteringSelect.get('value')) || null;
        data.straat_id = parseInt(this._straatFilteringSelect.get('value')) || null;
        data.huisnummer_id = parseInt(this._nummerFilteringSelect.get('value')) || null;
        /* jshint +W106 */

      } else {
        // get data from inputfields
        data.gemeente = this.gemeente.value || null;
        data.straat = this.straat.value || null;
        data.postcode = this.postcode.value || null;
        data.huisnummer = this.huisnummer.value || null;
        data.subadres = this.subadres.value || null;

        /* jshint -W106 */
        data.gemeente_id = null;
        data.straat_id = null;
        data.huisnummer_id = null;
      }
      return data;
    },

    /**
     * Afhankelijk van de waarde land worden de gemeenten aangepast.
     * @private
     */
    _changeGemeenten: function(evt) {
      evt ? evt.preventDefault() : null;
      if (this.land.value !== 'BE') {
        this._resetExceptLand();
        this.gemeenteCrabNode.style.display= 'none';
        this.gemeenteNode.style.display= 'inline-table';
        this.subadres.disabled = false;
        this.straat.disabled = false;
        this.postcode.disabled = false;
        this.huisnummer.disabled = false;
        domClass.remove(this.straatNode, 'placeholder-disabled');
        domClass.remove(this.postcodeNode, 'placeholder-disabled');
        domClass.remove(this.huisnummerNode, 'placeholder-disabled');
        domClass.remove(this.subadresNode, 'placeholder-disabled');
      }
      else {
        this._resetExceptLand();
        if (this.disabled) {
          domClass.add(this.gemeenteCrabNode, 'placeholder-disabled');
          this._gemeenteFilteringSelect.set('disabled', true);
        }
      }
    },

    /**
     * reset functie naar default waarden, land niet meegerekend.
     * @private
     */
    _resetExceptLand: function() {
      this._gemeenteFilteringSelect.set('value', '');
      this._straatFilteringSelect.set('value', '');
      this._postcodeFilteringSelect.set('value', '');
      this._nummerFilteringSelect.set('value', '');
      this.gemeente.value = '';
      this.straat.value = '';
      this.postcode.value = '';
      this.huisnummer.value = '';
      this.subadres.value = '';
      this.gemeenteCrabNode.style.display= 'inline-table';
      this.straatCrabNode.style.display= 'none';
      this.postcodeCrabNode.style.display= 'none';
      this.huisnummerCrabNode.style.display= 'none';
      this.gemeenteNode.style.display= 'none';
      this.straatNode.style.display= 'inline-table';
      this.postcodeNode.style.display= 'inline-table';
      this.huisnummerNode.style.display= 'inline-table';
      this.land.disabled=false;
      this.gemeente.disabled=false;
      this.straat.disabled=true;
      this.postcode.disabled=true;
      this.huisnummer.disabled=true;
      this.subadres.disabled=true;
      domClass.add(this.straatNode, 'placeholder-disabled');
      domClass.add(this.postcodeNode, 'placeholder-disabled');
      domClass.add(this.huisnummerNode, 'placeholder-disabled');
      domClass.add(this.subadresNode, 'placeholder-disabled');

      domClass.add(this.straatCrabNode, 'placeholder-disabled');
      this._straatFilteringSelect.set('disabled', true);
      domClass.add(this.huisnummerCrabNode, 'placeholder-disabled');
      this._nummerFilteringSelect.set('disabled', true);
      domClass.add(this.postcodeCrabNode, 'placeholder-disabled');
      this._postcodeFilteringSelect.set('disabled', true);
      domClass.add(this.subadresNode, 'placeholder-disabled');
      this.subadres.disabled = true;
    },

    /**
     * Afhankelijk van de waarde gemeente worden de postcodes aangepast.
     * @private
     */
    _changePostcodes: function() {
      this._postcodeFilteringSelect.set('value', '');
      this._postcodeFilteringSelect.set('store', new Memory({data: []}));
      this.postcode.value = '';
      domClass.add(this.postcodeCrabNode, 'placeholder-disabled');
      this._postcodeFilteringSelect.set('disabled', true);
      if (this._gemeenteFilteringSelect.get('value')) {
        var gemeenteId = this._gemeenteFilteringSelect.get('value');
        if (gemeenteId) {
          this.postcodeCrabLoader.style.display = 'block';
          this.postcodeNode.style.display = 'none';
          this.postcodeCrabNode.style.display = 'inline-table';
          this.crabController.getPostinfo(gemeenteId).
          then(lang.hitch(this, function (postcodes) {
            this._postcodeFilteringSelect.set('store', new Memory({data: postcodes}));
            domClass.remove(this.postcodeCrabNode, 'placeholder-disabled');
            this._postcodeFilteringSelect.set('disabled', false);
          })).finally(lang.hitch(this, function() {
            this.postcodeCrabLoader.style.display = 'none';
            if (this._adresObject && this._adresObject.postcode) {
              this._postcodeFilteringSelect.set('value', this._adresObject.postcode);
            }
            if (this.disabled) {
              domClass.add(this.postcodeCrabNode, 'placeholder-disabled');
              this._postcodeFilteringSelect.set('disabled', true);
            }
          }));
        }
      }
    },

    /**
     * Afhankelijk van de waarde gemeente worden de straten en huisnummers aangepast.
     * @private
     */
    _changeStraten: function() {
      this.straat.value = '';
      this._straatFilteringSelect.set('value', '');
      this._straatFilteringSelect.set('store', new Memory({data: []}));
      domClass.add(this.straatCrabNode, 'placeholder-disabled');
      this._straatFilteringSelect.set('disabled', true);

      this.huisnummer.value = '';
      this._nummerFilteringSelect.set('value', '');
      domClass.add(this.huisnummerCrabNode, 'placeholder-disabled');
      this._nummerFilteringSelect.set('disabled', true);
      domClass.add(this.subadresNode, 'placeholder-disabled');

      this.subadres.disabled = true;
      this.subadres.value = '';

      if (this._gemeenteFilteringSelect.get('value')) {
        var gemeenteId = this._gemeenteFilteringSelect.get('value');
        if (gemeenteId) {
          this.straatCrabLoader.style.display = 'block';
          this.straatNode.style.display = 'none';
          this.straatCrabNode.style.display = 'inline-table';
          this.crabController.getStraten(gemeenteId).
          then(lang.hitch(this, function (straten) {
            this._straatFilteringSelect.set('store', new Memory({data: straten}));
            domClass.remove(this.straatCrabNode, 'placeholder-disabled');
            this._straatFilteringSelect.set('disabled', false);
          })).finally(lang.hitch(this, function() {
            this.straatCrabLoader.style.display = 'none';
            /* jshint -W106 */
            if (this._adresObject && this._adresObject.straat_id) {
              this._straatFilteringSelect.set('value', this._adresObject.straat_id);
            }
            /* jshint +W106 */
            if (this.disabled) {
              domClass.add(this.straatCrabNode, 'placeholder-disabled');
              this._straatFilteringSelect.set('disabled', true);
            }
          }));
        }
      }
    },

    /**
     * Afhankelijk van de waarde straat worden de huisnummers aangepast.
     * @private
     */
    _changeNummers: function() {
      this.huisnummer.value = '';
      domClass.add(this.huisnummerCrabNode, 'placeholder-disabled');
      this._nummerFilteringSelect.set('disabled', true);
      this._nummerFilteringSelect.set('value', '');
      this._nummerFilteringSelect.set('store', new Memory({data: []}));
      domClass.add(this.subadresNode, 'placeholder-disabled');
      this.subadres.disabled = true;
      if (this._straatFilteringSelect.get('value')) {
        var straatId = this._straatFilteringSelect.get('value');
        if (straatId) {
          this.huisnummerCrabLoader.style.display = 'block';
          this.huisnummerNode.style.display = 'none';
          this.huisnummerCrabNode.style.display = 'inline-table';
          this.crabController.getNummers(straatId).
          then(lang.hitch(this, function (nummers) {
            if (nummers && nummers.length > 0) {
              this._nummerFilteringSelect.set('store', new Memory({data: nummers}));
              domClass.remove(this.huisnummerCrabNode, 'placeholder-disabled');
              domClass.remove(this.subadresNode, 'placeholder-disabled');
              this.subadres.disabled = false;
              this._nummerFilteringSelect.set('disabled', false);
              this._huisnummersFound = true;
            } else {
              this._huisnummersFound = false;
            }
          })).finally(lang.hitch(this, function() {
            this.huisnummerCrabLoader.style.display = 'none';
            /* jshint -W106 */
            if (this._adresObject && this._adresObject.huisnummer_id) {
              this._nummerFilteringSelect.set('value', this._adresObject.huisnummer_id);
              this.subadres.value = this._adresObject.subadres;
            }
            /* jshint +W106 */
            if (this.disabled) {
              domClass.add(this.huisnummerCrabNode, 'placeholder-disabled');
              domClass.add(this.subadresNode, 'placeholder-disabled');
              this.subadres.disabled = true;
              this._nummerFilteringSelect.set('disabled', true);
            }
          }));
        }
      }
    }

  });
});