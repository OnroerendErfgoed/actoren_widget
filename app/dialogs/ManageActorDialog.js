define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/dom-style',
  'dojo/dom',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  'dijit/form/ComboBox',
  'dstore/Trackable',
  'dstore/Memory',
  'dstore/legacy/DstoreAdapter', //to put dstore/memory in combobox
  'dijit/Dialog',
  './ManageAdresDialog',
  'dojo/text!./templates/ManageActorDialog.html'
], function (
  declare,
  array,
  lang,
  on,
  domClass,
  domConstruct,
  domAttr,
  domStyle,
  dom,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  OnDemandGrid,
  Keyboard,
  DijitRegistry,
  ColumnResizer,
  ComboBox,
  Trackable,
  Memory,
  DstoreAdapter,
  Dialog,
  ManageAdresDialog,
  template
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    parentNode: null,
    baseClass: 'manage-actor-dialog',
    title: 'Actor aanmaken',
    actorenUrl: null,
    crabController: null,
    _adresDialog: null,
    _adresGrid: null,
    _adresStore: null,
    _actorEmails: null,
    _actorUrls: null,
    _actorTelefoons: null,
    _mode: 'add',
    _index: 0,
    actor: null,

    postCreate: function () {
      this.inherited(arguments);

      var TrackableMemory = declare([Trackable, Memory]);
      this._adresStore = new TrackableMemory({data: []});

      this._adresGrid = this._createGrid({
        collection: this._adresStore
      }, this.adresGridNode);

      this._adresDialog = new ManageAdresDialog({
        crabController: this.crabController
      });
      on(this._adresDialog, 'adres.add', lang.hitch(this, function(evt) {
        this._addAdresRow(evt.adres, evt.adresType);
      }));on(this._adresDialog, 'adres.edit', lang.hitch(this, function(evt) {
        this._editAdresRow(evt.adres, evt.adresType, evt.id);
      }));

      this._actorEmails = [];
      this._actorUrls = [];
      this._actorTelefoons = [];
    },

    startup: function () {
      this.inherited(arguments);
      this._setSelectLists();
      this._setTelefoonLandcodes();
      this._adresDialog.startup();
    },

    show: function (actor, mode) {
      ///* jshint maxcomplexity:15 */
      //if (actor) {
      //  console.debug('ActorBekijkenDialog::show', actor);
      //  this.actor = actor;
      //  this.set('title', 'Actor \\ ID ' + actor.id);
      //  var href = this.actorenUrl + '/actoren/' + actor.id;
      //  domAttr.set(this.actorLink, 'href', href);
      //
      //  this.naamInput.value = actor.naam || '';
      //  this.voornaamInput.value = actor.voornaam || '';
      //  array.forEach(actor.emails, function (email) {
      //    this._createListItem(email.email, email.type.naam, this.emailList);
      //  }, this);
      //  array.forEach(actor.telefoons, function (telefoon) {
      //    /* jshint -W106 */
      //    this._createListItem(telefoon.volledig_nummer, telefoon.type.naam, this.telefoonList);
      //    /* jshint +W106 */
      //  }, this);
      //
      //  if (actor.adres) {
      //    this.landInput.value = actor.adres.land || '';
      //    this.gemeenteInput.value = actor.adres.gemeente || '';
      //    this.postcodeInput.value = actor.adres.postcode || '';
      //    this.straatInput.value = actor.adres.straat || '';
      //    this.huisnummerInput.value = actor.adres.huisnummer || '';
      //    this.postbusInput.value = actor.adres.postbus || '';
      //    this.adresTypeInput.value = actor.adres.adrestype.naam || '';
      //  }
      //
      //  this.actorTypeInput.value = actor.type.naam || '';
      //  if (actor.type && actor.type.id === 2) {
      //    domClass.remove(this.kboContainer, 'hide');
      //    var kbos = array.filter(actor.ids, function (actorId) {
      //      return actorId.type && actorId.type.id === 6;
      //    });
      //    if (kbos.length > 0) {
      //      /* jshint -W106 */
      //      this.kboInput.value = kbos[0].extra_id;
      //      /* jshint +W106 */
      //    }
      //  }
      //  array.forEach(actor.urls, function (url) {
      //    this._createListItem(url.url, url.type.naam, this.urlList);
      //  }, this);
      //}
      this.inherited(arguments);
    },

    hide: function () {
      console.debug('ActorBekijkenDialog::hide');
      this._reset();
      this.inherited(arguments);
    },

    _showAddAdres: function(evt) {
      evt ? evt.preventDefault() : null;
      this._adresDialog.show(null, 'add');
    },

    _showEditAdres: function(adres) {
      this._adresDialog.show(adres, 'edit');
    },

    _addAdresRow: function(adres, type) {
      if (adres) {
        this._adresStore.add(adres);
      }
    },

    _editAdresRow: function(adres, type, id) {
      adres.id = id;
      this._adresStore.put(adres);
    },

    _removeAdresRow: function(rowId) {
      this._adresStore.remove(rowId);
    },

    _createGrid: function(options, node) {
      var columns = {
        straat: {
          label:'Straat'
        },
        huisnummer: {
          label: 'Huisnr.'
        },
        subadres: {
          label:'Busnr.'
        },
        postcode: {
          label: 'Postcode'
        },
        gemeente: {
          label: 'Gemeente'
        },
        land: {
          label: 'Land'
        },
        'edit_delete': {
          label: '',
          renderCell: lang.hitch(this, function (object) {
            if (!object.id) {
              return null;
            }
            var div = domConstruct.create('div', { 'class': 'dGridHyperlink text-center'});
            domConstruct.create('a', {
              href: '#',
              title: 'Adres bewerken',
              className: 'fa fa-pencil',
              innerHTML: '',
              onclick: lang.hitch(this, function (evt) {
                evt.preventDefault();
                this._showEditAdres(object);

              })
            }, div);

            domConstruct.create('a', {
              href: '#',
              title: 'Adres verwijderen',
              className: 'fa fa-trash',
              style: 'margin-left: 15px;',
              innerHTML: '',
              onclick: lang.hitch(this, function(evt)  {
                evt.preventDefault();
                this._removeAdresRow(object.id);
              })
            }, div);
            return div;
          })
        }
      };

      var grid = new (declare([OnDemandGrid, Keyboard, DijitRegistry, ColumnResizer]))({
        className: 'actorAdresGrid',
        collection: options.collection,
        columns: columns,
        noDataMessage: 'Er zijn geen adressen gevonden',
        loadingMessage: 'data aan het ophalen...'
      }, node);

      return grid;
    },

    _reset: function () {
      console.debug('ManageActorDialog::_reset');
      this.naamInput.value = '';
      this.vnafkInput.value = '';
      this.rrnInput.value = '';
      this.kboInput.value = '';
      this.email.value = '';
      this.url.value = '';
      this.telefoon.value = '';

      domConstruct.empty(this.emaillist);
      domConstruct.empty(this.telefoonlist);
      domConstruct.empty(this.urllist);
      this._actorEmails = [];
      this._actorTelefoons = [];
      this._actorUrls = [];

      this.actortypes.selectedIndex = 0;
      this.emailtypes.selectedIndex = 0;
      this.urltypes.selectedIndex = 0;
      this.telefoontypes.selectedIndex = 0;
    },

    _closeDialog: function(evt) {
      evt ? evt.preventDefault() : null;
      this.hide();
    },

    _addEmail: function(evt) {
      evt? evt.preventDefault() : null;
      if (this.email.value.split(' ').join("").length > 0) {
        var actorEmail = this._actorEmails.filter(lang.hitch(this, function (emailObject) {
          return (emailObject.email === this.email.value && emailObject.type.id === this.emailtypes.value);
        }));
        if (actorEmail.length === 0 && this._validateEmail(this.email.value)) {
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

    _addTelefoon: function(evt) {
      evt? evt.preventDefault() : null;
      if (this.telefoon.value.split(' ').join("").length > 0) {
        var actorTelefoon = this._actorTelefoons.filter(lang.hitch(this, function (telefoonObject) {
          return (telefoonObject.nummer === this.telefoon.value &&
          telefoonObject.landcode === this._telefoonLandcodeSelect.get('value') &&
          telefoonObject.type.id === this.telefoontypes.value);
        }));
        if (actorTelefoon.length === 0 && this._validateTelefoon(this.telefoon.value)) {
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

    _addUrl: function(evt) {
      evt? evt.preventDefault() : null;
      if (this.url.value.split(' ').join("").length > 0) {
        var actorUrl = this._actorUrls.filter(lang.hitch(this, function (urlObject) {
          return (urlObject.url === this.url.value && urlObject.type.id === this.urltypes.value);
        }));
        if (actorUrl.length === 0 && this._valideUrl(this.url.value)) {
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

    _validateEmail: function(email) {
      var valid = true;
      return valid;
    },

    _validateTelefoon: function(telefoon) {
      var valid = true;
      return valid;
    },

    _valideUrl: function(url) {
      var valid = true;
      return valid;
    },

    _validateRRN: function(rrn) {
      var valid = true;
      return valid;
    },

    _validateKBO: function(kbo) {
      var valid = true;
      return valid;
    },

    /**
     * Selectielijsten aanvullen met opties
     * @private
     */
    _setSelectLists: function(){
      var selected;
      this.typeLists.emailTypes.forEach(lang.hitch(this, function(type){
        selected = type.naam === 'werk' ? '" selected': '"';
        domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.emailtypes);
      }));
      this.typeLists.telephoneTypes.forEach(lang.hitch(this, function(type){
        selected = type.naam === 'werk' ? '" selected': '"';
        domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.telefoontypes);
      }));
      this.typeLists.urlTypes.forEach(lang.hitch(this, function(type){
        selected = type.naam === 'website' ? '" selected': '"';
        domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.urltypes);
      }));
      this.typeLists.actorTypes.forEach(lang.hitch(this, function(type){
        selected = type.naam === 'persoon' ? '" selected': '"';
        domConstruct.place('<option value="' + type.id + selected + '>' + type.naam + '</option>', this.actortypes);
      }));

      on(this.actortypes, 'change', lang.hitch(this, function(evt) {
        this._changedActorType(evt.target.value);
      }));
    },

    /**
     * Opstarten van telefoon landcodes.
     * @private
     */
    _setTelefoonLandcodes: function() {
      var countryCodeStore = new DstoreAdapter(new Memory({
        data: [
          {name: "+32", id: "32", label: "<span class='actor-widget flag be'>België (+32)</span>"},
          {name: "+49", id: "49", label: "<span class='actor-widget flag de'>Duitsland (+49)</span>"},
          {name: "+33", id: "33", label: "<span class='actor-widget flag fr'>Frankrijk (+33)</span>"},
          {name: "+44", id: "44", label: "<span class='actor-widget flag gb'>Groot-Brittannië (+44)</span>"},
          {name: "+31", id: "31", label: "<span class='actor-widget flag nl'>Nederland (+31)</span>"},
          {name: "+352", id: "352", label: "<span class='actor-widget flag lu'>Luxemburg (+352)</span>"}
        ]
      }));

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
      var li = domConstruct.create('li', {
        id: id,
        innerHTML: '<small>' + value + ' (' + type + ')</small>'
      }, ullist);

      if (removeFunction) {
        var trash = domConstruct.create('i', {'class': 'fa fa-trash right'}, li);
        on(trash, 'click', lang.hitch(this, function (evt) {
          evt.preventDefault();
          domConstruct.destroy(li);
          lang.hitch(this, removeFunction)(id);
        }));
      }
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
     * Event functie waarbij de kbo input veld niet-bewerkbaan wordt als het over een persoon gaat.
     * Bij een organisatie zal het rrn input veld niet-bewerkbaar worden.
     * @param evt
     * @private
     */
    _changedActorType: function(type) {
      switch (type) {
        case "1":
        case "3":
          this.kboInput.value = '';
          domStyle.set(this.kboNode, 'display', 'none');
          domStyle.set(this.rrnNode, 'display', 'inline-table');
          this.vn_afk_label.innerHTML = 'Voornaam';
          domStyle.set(this.vnafkNode, 'display', 'inline-table');
          break;
        case "2":
          this.rrnInput.value = '';
          domStyle.set(this.kboNode, 'display', 'inline-table');
          domStyle.set(this.rrnNode, 'display', 'none');
          this.vn_afk_label.innerHTML = 'Afkorting';
          domStyle.set(this.vnafkNode, 'display', 'inline-table');
          break;
        case "4":
          this.rrnInput.value = '';
          domStyle.set(this.rrnNode, 'display', 'none');
          this.kboInput.value = '';
          domStyle.set(this.kboNode, 'display', 'none');
          this.vnafkInput.value = '';
          domStyle.set(this.vnafkNode, 'display', 'none');
          break;
      }
    }

  });
});
