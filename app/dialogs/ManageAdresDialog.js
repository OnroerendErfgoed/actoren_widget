define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/query',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/topic',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  'dstore/Trackable',
  'dstore/Memory',
  'dojo/store/Memory',
  'dijit/Dialog',
  'dojo/text!./templates/ManageAdresDialog.html',
  '../widgets/AdresCrab'
], function (
  declare,
  array,
  lang,
  query,
  domClass,
  domConstruct,
  domAttr,
  topic,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  OnDemandGrid,
  Keyboard,
  DijitRegistry,
  ColumnResizer,
  Trackable,
  Memory,
  legacyMemory,
  Dialog,
  template,
  AdresCrab
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'manage-adres-dialog',
    title: 'Adres toevoegen',
    actorenUrl: null,
    crabController: null,
    adresTypes: null,
    _adresRowId: null,
    _crabAdres: null,
    _mode: 'add',

    postCreate: function () {
      this.inherited(arguments);
      this.crabController.getGemeenten().
      then(lang.hitch(this, function(gemeenten) {
        this._crabAdres = new AdresCrab({
          crabController: this.crabController,
          gemeenteStore: new legacyMemory({ data: gemeenten })
        }, this.adresCrabNode);
        this._crabAdres.startup();
        this._crabAdres.enable();
      }));

      array.forEach(this.adresTypes, function(type) {
        domConstruct.place('<option value="' + type.id + '">' + type.naam + '</option>', this.adresTypeSelect);
      }, this);
    },

    startup: function () {
      this.inherited(arguments);
    },

    show: function (adres, mode) {
      if (mode === 'add') {
        this.mode = mode;
        this.set('title', 'Adres toevoegen');
        this.executeButton.innerHTML = 'Toevoegen';
      }

      if (mode === 'edit') {
        this.mode = mode;
        if (adres) {
          console.log(adres);
          this.set('title', 'Adres bewerken');
          this.executeButton.innerHTML = 'Bewerken';
          this._setData(adres);
        }
      }

      this.inherited(arguments);
    },

    hide: function () {
      console.debug('ActorBekijkenDialog::hide');
      this._reset();
      this.inherited(arguments);
    },

    _execute: function(evt) {
      evt ? evt.preventDefault() : null;
      var adres = this._crabAdres.getInputValues();

      if (this._validateAdres(adres)) {
        if (this.mode === 'add') {
          this.emit('adres.add', {
            adres: adres,
            adresType: parseInt(this.adresTypeSelect.value)
          });
        }

        if (this.mode === 'edit') {
          this.emit('adres.edit', {
            adres: adres,
            adresType: parseInt(this.adresTypeSelect.value),
            id: this._adresRowId
          });
        }
        this.hide();
      }
    },

    _validateAdres: function(adres) {
      var valid = true;
      var invalids = [];

      if ((!adres.land || adres.land === '') || (!adres.gemeente_id || adres.gemeente_id === '')) {
        valid = false;
        invalids.push(this.adresCrabContainer);
      }

      if (!valid){
        this._highlightInvalids(invalids);
      }
      return valid;
    },

    _setData: function(adres) {
      this._adresRowId = adres.id;
      if (adres.adrestype) {
        this.adresTypeSelect.value = adres.adrestype.id;
      }
      this._crabAdres.setValues(adres);
    },

    _closeDialog: function(evt) {
      evt ? evt.preventDefault() : null;
      this.hide();
    },

    _reset: function () {
      this._clearHighlights();
      this._crabAdres._resetExceptLand();
      this.adresTypeSelect.selectedIndex = 0;
    },

    /**
     * Verwijdert de highlights op invalid velden
     * @private
     */
    _clearHighlights: function() {
      // remove all highlights
      query('.placeholder-container.error', this.containerNode).forEach(function(elem){
        domClass.remove(elem, 'error');
      });
      query('small.error', this.containerNode).forEach(function(small) {
        domConstruct.destroy(small);
      });
    },

    /**
     * Voegt highlights toe op de invalid velden
     * @param invalids
     * @private
     */
    _highlightInvalids: function(invalids) {
      this._clearHighlights();
      // add selected highlights
      invalids.forEach(lang.hitch(this, function(invalid){
        if  (invalid) {
          domClass.add(invalid, 'error');
          domConstruct.place('<small class="error" style="margin-top:-15px; margin-bottom: 0;">' +
            'Gelieve bovenstaande velden correct in te vullen: Land en gemeente zijn verplicht.</small>',
            invalid, 'after');
        }
      }));
    }
  });
});
