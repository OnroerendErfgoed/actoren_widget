define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
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
  domClass,
  domConstruct,
  domAttr,
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
      console.log(adres);
      if (this.mode === 'add') {

        this.emit('adres.add', {
          adres: adres,
          adresType: ''
        });
      }

      if (this.mode === 'edit') {
        this.emit('adres.edit', {
          adres: adres,
          adresType: '',
          id: this._adresRowId
        })
      }

      this.hide();
    },

    _setData: function(adres) {
      this._adresRowId = adres.id;
      this._crabAdres.setValues(adres);
    },

    _closeDialog: function(evt) {
      evt ? evt.preventDefault() : null;
      this.hide();
    },

    _reset: function () {
      this._crabAdres._resetExceptLand();
    }
  });
});
