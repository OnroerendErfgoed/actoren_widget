define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/_base/fx',
  'dojo/on',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/dom-style',
  'dojo/dom',
  'dojo/query',
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
  fx,
  on,
  domClass,
  domConstruct,
  domAttr,
  domStyle,
  dom,
  query,
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
    typeLists: null,
    _adresDialog: null,
    _adresGrid: null,
    _adresStore: null,
    _actorEmails: null,
    _actorUrls: null,
    _actorTelefoons: null,
    _mode: 'add',
    _index: 0,
    _adresIndex: 0,
    _adressenAdd: null,
    _adressenEdit: null,
    _adressenRemove: null,
    actor: null,
    _invalids: null,

    postCreate: function () {
      this.inherited(arguments);

      var TrackableMemory = declare([Trackable, Memory]);
      this._adresStore = new TrackableMemory({data: []});

      this._adresGrid = this._createGrid({
        collection: this._adresStore
      }, this.adresGridNode);

      this._actorEmails = [];
      this._actorUrls = [];
      this._actorTelefoons = [];

      this._adressenAdd = [];
      this._adressenEdit = [];
      this._adressenRemove = [];

      this._invalids = [];
    },

    startup: function () {
      this.inherited(arguments);
      this._setSelectLists();
      this._setTelefoonLandcodes();

      this._adresDialog = new ManageAdresDialog({
        crabController: this.crabController,
        adresTypes: this.typeLists.adresTypes
      });
      on(this._adresDialog, 'adres.add', lang.hitch(this, function(evt) {
        this._addAdresRow(evt.adres, evt.adresType);
      }));on(this._adresDialog, 'adres.edit', lang.hitch(this, function(evt) {
        this._editAdresRow(evt.adres, evt.adresType, evt.id);
      }));
      this._adresDialog.startup();
    },

    show: function (actor, mode) {
      /* jshint maxcomplexity:15 */
      this._reset();
      this.mode = mode;

      this.inherited(arguments).then(lang.hitch(this, function() {
        if (actor) {
          console.debug('ManageActorDialog::show', actor, mode);
          this.actor = actor;
          if (actor.type) {
            this._changedActorType(actor.type.id);
          }
          this.setData(actor);
        } else {
          this.actor = null;
        }
        if (mode === 'edit') {
          // domStyle.set(this.kboNode, 'display', 'none');
          // domStyle.set(this.rrnNode, 'display', 'none');
          this.set('title', 'Actor bewerken');
          this.executeButton.innerHTML = 'Bewerken';
        } else {
          // domStyle.set(this.kboNode, 'display', 'none');
          // domStyle.set(this.rrnNode, 'display', 'inline-table');
          this.set('title', 'Actor aanmaken');
          this.executeButton.innerHTML = 'Aanmaken';
        }
      }));
    },

    hide: function () {
      console.debug('ManageActorDialog::hide');
      this._clearHighlights();
      this._reset();
      this.inherited(arguments);
    },

    _execute: function(evt) {
      console.debug('ManageActorDialog::_execute');
      evt ? evt.preventDefault() : null;
      var actor = this.getData();

      if (!this._isValid(actor)) {
        return;
      }

      if (this.mode === 'edit') {
        this.emit('actor.save', {
          actor: actor,
          mode: 'edit',
          bubbles: false
        });
      } else if (this.mode === 'add') {
        this.emit('actor.save', {
          actor: actor,
          mode: 'add',
          bubbles: false
        });
      }
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
        adres.adrestype = { id: type };
        var isDuplicateAdres = array.some(this._adressenAdd, function (existingAdres) {
         return (existingAdres.gemeente_id === adres.gemeente_id &&
             existingAdres.huisnummer_id === adres.huisnummer_id &&
             existingAdres.straat_id === adres.straat_id &&
             existingAdres.postcode === adres.postcode &&
             existingAdres.land === adres.land)
        }, this);
        if (!isDuplicateAdres) {
          adres.id = 'new_' + this._adresIndex++;
          this._adresStore.add(adres);

          var cloneAdres = lang.clone(adres);
          if (cloneAdres.id.indexOf('new') > -1) {
            delete cloneAdres.id;
          }
          this._adressenAdd.push(cloneAdres);
        }
      }
    },

    _editAdresRow: function(adres, type, id) {
      adres.id = id;
      adres.adrestype = { id: type };
      this._adresStore.put(adres);
      var found = array.filter(this._adressenEdit, function(existing) {
        return (existing.id !== adres.id);
      });
      if (found && found.length > 0) {
        this._adressenEdit.remove(found);
      }
      this._adressenEdit.push(adres);
    },

    _removeAdresRow: function(adresToRemove) {
      console.log(adresToRemove.id);
      this._adressenAdd = array.filter(this._adressenAdd, function (adres) {
        return adres.gemeente_id !== adresToRemove.gemeente_id ||
            adres.huisnummer_id !== adresToRemove.huisnummer_id ||
            adres.straat_id !== adresToRemove.straat_id ||
            adres.postcode !== adresToRemove.postcode ||
            adres.land !== adresToRemove.land;
      }, this);
      adresToRemove.einddatum = new Date(Date.now());
      adresToRemove.adrestype = {
        'id': 2,
        'naam': 'Extra'
      };
      this._adresStore.remove(adresToRemove.id);
      if (!adresToRemove.id.includes('new_')) {
        this._adressenRemove.push(adresToRemove);
      }
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
        adrestype: {
          label: 'Type',
          formatter: lang.hitch(this, function(value) {
            var type = array.filter(this.typeLists.adresTypes, function(type) {
              return type.id === parseInt(value.id);
            })[0];
            if (type) {
              return type.naam;
            } else {
              return 'onbekend type';
            }
          })
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
                this._removeAdresRow(object);
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
        noDataMessage: 'Er zijn geen adressen toegevoegd',
        loadingMessage: 'data aan het ophalen...'
      }, node);

      return grid;
    },

    getData: function() {
      var actor = lang.clone(this.actor);
      this.kboInput.value = this.kboInput.value.replace(/\./g,'' ).replace(/\s/g, '').toUpperCase().replace('BE', '');
      this.rrnInput.value = this.rrnInput.value.replace(/\./g,'' ).replace(/\s/g, '').replace(/\-/g, '');

      if (!actor) {
        actor = {};
      }
      var actorType = parseInt(this.actortypes.value);
      actor.type = {id: actorType || undefined };
      actor.naam = this.naamInput.value || undefined;

      if (actorType === 1) {
        actor.voornaam = this.vnafkInput.value || undefined;
        if (this.rrnInput.value) {
          actor.rrn = this.rrnInput.value;
          actor.ids = [{'extra_id': this.rrnInput.value, type: {naam: 'rrn', id: 4}}];
        }
        if (actor.afkorting) {
          delete actor.afkorting;
        }
      } else if (actorType === 2) {
        actor.afkorting = this.vnafkInput.value || undefined;
        if (this.kboInput.value) {
          actor.kbo = this.kboInput.value;
          actor.ids = [{'extra_id': this.kboInput.value, type: {naam: 'kbo', id: 6}}];
        }
        if (actor.voornaam) {
          delete actor.voornaam;
        }
      } else {
        if (actor.voornaam) {
          delete actor.voornaam;
        }
        if (actor.afkorting) {
          delete actor.afkorting;
        }
      }

      actor.emails = this._actorEmails;
      actor.telefoons = this._actorTelefoons;
      actor.urls = this._actorUrls;

      var data = {};
      data.actor = actor;
      data.adressen = {
        add: this._adressenAdd,
        edit: this._adressenEdit,
        remove: this._adressenRemove
      };
      return data;
    },

    setData: function(actor) {
      console.log(actor);

      if (actor.type) {
        this.actortypes.value = actor.type.id;
      }

      if (actor.naam) {
        this.naamInput.value = actor.naam;
      }
      if (actor.voornaam) {
        this.vnafkInput.value = actor.voornaam;
      } else if (actor.afkorting) {
        this.vnafkInput.value = actor.afkorting;
      }

      if (actor.rrn) {
        this.rrnInput.value = actor.rrn;
      }

      if (actor.kbo) {
        this.kboInput.value = actor.kbo;
      }

      array.forEach(actor.emails, lang.hitch(this, function(email) {
        this._index++;
        email['id'] = this._index.toString();
        this._actorEmails.push(email);
        var type = this.typeLists.emailTypes.filter(lang.hitch(this, function(type) {
          return (parseInt(type.id) == parseInt(email.type.id));
        }));
        this._createListItem(this._index, email.email, type[0].naam, this.emaillist, this._removeEmail);
      }));

      array.forEach(actor.telefoons, lang.hitch(this, function(telefoon) {
        this._index++;
        telefoon['id'] = this._index.toString();
        this._actorTelefoons.push(telefoon);
        var type = this.typeLists.telephoneTypes.filter(lang.hitch(this, function(type) {
          return (parseInt(type.id) == parseInt(telefoon.type.id));
        }));
        var telefoonvalue = telefoon.landcode ? telefoon.landcode + telefoon.nummer : '+32' + telefoon.nummer;
        this._createListItem(this._index, telefoonvalue, type[0].naam, this.telefoonlist, this._removeTelefoon);
      }));

      array.forEach(actor.urls, lang.hitch(this, function(url) {
        this._index++;
        url['id'] = this._index.toString();
        this._actorUrls.push(url);
        var type = this.typeLists.urlTypes.filter(lang.hitch(this, function(type) {
          return (parseInt(type.id) == parseInt(url.type.id));
        }));
        this._createListItem(this._index, url.url, type[0].naam, this.urllist, this._removeUrl);
      }));

      if (actor.adressen) {
        var checkedAdressen = array.map(actor.adressen, function(adres) {
          if (!adres.id) {
            var cloneAdres = lang.clone(adres);
            this._adressenAdd.push(cloneAdres);
            adres.id = 'new_' + this._adresIndex++;
          }
          return adres;
        }, this);
        this._adresStore.setData(checkedAdressen);
        this._adresGrid.refresh();
      }

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

      this._adressenAdd = [];
      this._adressenEdit = [];
      this._adressenRemove = [];

      this.actortypes.selectedIndex = 0;
      this.emailtypes.selectedIndex = 0;
      this.urltypes.selectedIndex = 0;
      this.telefoontypes.selectedIndex = 0;

      // reset adres grid
      this._adresStore.setData([]);
      this._adresGrid.refresh();
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
        this._clearHighlights();
        if (actorEmail.length === 0 && this._validateEmail(this.email.value)) {
          this._index++;
          this._actorEmails.push({
            id: this._index.toString(),
            email: this.email.value,
            type: {
              id: parseInt(this.emailtypes.value)
            }
          });
          this._createListItem(this._index, this.email.value, this.emailtypes.selectedOptions[0].label, this.emaillist, this._removeEmail);
          this.email.value = '';
        } else {
          this._invalids.push(this.email.parentNode);
          if (evt) {
            this._highlightInvalids(this._invalids);
          }
          return false;
        }
      }
      return true;
    },

    _addTelefoon: function(evt) {
      evt? evt.preventDefault() : null;
      if (this.telefoon.value.split(' ').join("").length > 0) {
        var actorTelefoon = this._actorTelefoons.filter(lang.hitch(this, function (telefoonObject) {
          return (telefoonObject.nummer === this.telefoon.value &&
          telefoonObject.landcode === this._telefoonLandcodeSelect.get('value') &&
          telefoonObject.type.id === this.telefoontypes.value);
        }));
        this._clearHighlights();
        if (actorTelefoon.length === 0 && this._validateTelefoon(this.telefoon.value, this._telefoonLandcodeSelect.get('value'))) {
          this._index++;
          this._actorTelefoons.push({
            id: this._index.toString(),
            nummer: this.telefoon.value,
            landcode: this._telefoonLandcodeSelect.get('value'),
            type: {
              id: parseInt(this.telefoontypes.value)
            }
          });
          var telefoonvalue = this._telefoonLandcodeSelect.get('value') ? this._telefoonLandcodeSelect.get('value') + this.telefoon.value : '+32' + this.telefoon.value;
          this._createListItem(this._index, telefoonvalue, this.telefoontypes.selectedOptions[0].label, this.telefoonlist, this._removeTelefoon);
          this.telefoon.value = '';
        } else {
          this._invalids.push(this.telefoon.parentNode);
          if (evt) {
            this._highlightInvalids(this._invalids);
          }
          return false;
        }
      }
      return true;
    },

    _addUrl: function(evt) {
      evt? evt.preventDefault() : null;
      if (this.url.value.split(' ').join("").length > 0) {
        var actorUrl = this._actorUrls.filter(lang.hitch(this, function (urlObject) {
          return (urlObject.url === this.url.value && urlObject.type.id === this.urltypes.value);
        }));
        this._clearHighlights();
        if (actorUrl.length === 0 && this._valideUrl(this.url.value)) {
          this._index++;
          this._actorUrls.push({
            id: this._index.toString(),
            url: this.url.value,
            type: {
              id: parseInt(this.urltypes.value)
            }
          });
          this._createListItem(this._index, this.url.value, this.urltypes.selectedOptions[0].label, this.urllist, this._removeUrl);
          this.url.value = '';
        } else {
          this._invalids.push(this.url.parentNode);
          if (evt) {
            this._highlightInvalids(this._invalids);
          }
          return false;
        }
      }
      return true;
    },

    _isValid: function(values) {
      var valid = true;
      var invalids = [];
      var actor = values.actor;

      this._clearHighlights();

      if (!this._addEmail() || !this._addTelefoon() || !this._addUrl()) {
        valid = false;
      }

      if (!actor.naam || actor.naam === '') {
        valid = false;
        invalids.push(this.naamInput.parentNode);
      }

      if (actor.type) {
        if (actor.kbo && actor.kbo !== '') {
          if (parseInt(actor.type.id) === 2) {
            if (!this._validateKBO(actor.kbo)) {
              valid = false;
              invalids.push(this.kboInput.parentNode);
            }
          }
        }
        if (actor.rrn && actor.rrn !== '') {
          if (parseInt(actor.type.id) in [1, 3]) {
            if (!this._validateRRN(actor.rrn)) {
              valid = false;
              invalids.push(this.rrnInput.parentNode);
            }
          }
        }
      }

      if (!valid) {
        this._highlightInvalids(invalids);
        this._highlightInvalids(this._invalids);
        this._invalids = [];
      }

      return valid;
    },

    _validateEmail: function(email) {
      var valid = true;
      var regex =  new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$');
      if (!regex.test(email)) {
        valid = false;
      }
      return valid;
    },

    _validateTelefoon: function(telefoon, landcode) {
      var valid = true;
      String.prototype.ltrim0 = function() {
        return this.replace(/^[0]+/,'');
      };
      console.log(landcode, telefoon);
      var nummer = telefoon.ltrim0();
      [' ', '.', '/', '-', ','].forEach(function(delimiter){
        nummer = nummer.split(delimiter).join('');
      });
      if (nummer.length !== 0) {
        var landcode = landcode.ltrim0();
        [' ', '.', '/', '-', ','].forEach(function (delimiter) {
          landcode = landcode.split(delimiter).join('');
        });
        landcode = landcode.indexOf('+') !== 0 ? '+' + landcode : landcode;
        if (landcode.slice(0, 1) !== '+' || landcode.substring(1).length > 4 || isNaN(landcode.substring(1))) {
          valid = false;
        }
        else if (landcode.substring(1).length + nummer.length > 15 || isNaN(nummer)) {
          valid = false;

        }
        else if (landcode === '+32') {
          if (nummer.length !== 8 && nummer.length !== 9) {
            valid = false;
          }
        }
      }
      return valid;
    },

    _valideUrl: function(url) {
      var valid = true;
      var regex = new RegExp('^(https?:\/\/).{1,255}');
      if (!regex.test(url)) {
        valid = false;
      }
      return valid;
    },

    _validateRRN: function(rrnInput) {
      var valid = true;
      var rrn = rrnInput;
      if (rrn.length > 0) {
        if (isNaN(rrn) || rrn.length !== 11) {
          valid = false;
        }
        else if (rrn.substring(0, 1) === '0' || rrn.substring(0, 1) === '1') {
          rrn = '2' + rrn;
        }
        else {
          var x = 97 - (parseInt(rrn.substring(0, rrn.length - 2)) - (parseInt(rrn.substring(0, rrn.length - 2) / 97))
            * 97);
          valid = parseInt(rrn.slice(-2)) === x;
        }
      }
      return valid;
    },

    _validateKBO: function(kboInput) {
      var valid = true;
      if (kboInput.length >  0) {
        valid = (!isNaN(kboInput) && kboInput.length >= 9 && kboInput.length <= 10);
      }
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
     * @param type
     * @private
     */
    _changedActorType: function(type) {
      console.debug('ManageActorDialog::_changedActorType', type);
      switch (type.toString()) {
        case "1":
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
    },

    /**
     * Verbergt de 'Loading'-overlay.
     * @public
     */
    hideLoading: function () {
      var node = this.loadingOverlay;
      fx.fadeOut({
        node: node,
        onEnd: function (node) {
          domStyle.set(node, 'display', 'none');
        },
        duration: 1000
      }).play();
    },

    /**
     * Toont de 'Loading'-overlay.
     * @public
     */
    showLoading: function (message) {
      var node = this.loadingOverlay;
      if (!message) {
        message = '';
      }
      query('.loadingMessage', node).forEach(function(node){
        node.innerHTML = message;
      });

      domStyle.set(node, 'display', 'block');
      fx.fadeIn({
        node: node,
        duration: 1
      }).play();
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
      // add selected highlights
      invalids.forEach(lang.hitch(this, function(invalid){
        if  (invalid) {
          domClass.add(invalid, 'error');
          domConstruct.place('<small class="error" style="margin-top:-15px; margin-bottom: 0;">' +
            'Gelieve bovenstaand veld correct in te vullen.</small>',
            invalid, 'after');
        }
      }));
    }

  });
});
