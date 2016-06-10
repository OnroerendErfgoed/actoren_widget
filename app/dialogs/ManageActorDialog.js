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
      this.mode = mode;
      if (actor) {
        console.debug('ManageActorDialog::show', actor);
        this.actor = actor;
        if (actor.type) {
          this._changedActorType(actor.type.id);
        }
        this.setData(actor);
      } else {
        this.actor = null;
      }
      if (mode === 'edit') {
        domStyle.set(this.kboNode, 'display', 'none');
        domStyle.set(this.rrnNode, 'display', 'none');
        this.set('title', 'Actor bewerken');
        this.executeButton.innerHTML = 'Bewerken';
      } else {
        domStyle.set(this.kboNode, 'display', 'none');
        domStyle.set(this.rrnNode, 'display', 'inline-table');
        this.set('title', 'Actor aanmaken');
        this.executeButton.innerHTML = 'Aanmaken';
      }
      this.inherited(arguments);
    },

    hide: function () {
      console.debug('ManageActorDialog::hide');
      this._reset();
      this.inherited(arguments);
    },

    _execute: function(evt) {
      evt ? evt.preventDefault() : null;
      console.log('EXECUTE!!')

      var actor = this.getData();

      if (this.mode === 'edit') {
        this.emit('actor.save', {
          actor: actor,
          method: 'PUT'
        });
      } else if (this.mode === 'add') {
        this.emit('actor.save', {
          actor: actor,
          method: 'POST'
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
        adres.id = 'new_' + this._adresIndex++;
        this._adresStore.add(adres);
        if (adres.id.indexOf('new') > -1) {
          delete adres.id;
        }
        this._adressenAdd.push(adres);
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

    _removeAdresRow: function(rowId) {
      this._adresStore.remove(rowId);
      this._adressenRemove.push(rowId);
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
        noDataMessage: 'Er zijn geen adressen toegevoegd',
        loadingMessage: 'data aan het ophalen...'
      }, node);

      return grid;
    },

    getData: function() {
      var actor = lang.clone(this.actor);
      if (!actor) {
        actor = {};
      }
      var actorType = this.actortypes.value;
      actor.actortype = {id: actorType || undefined };
      actor.naam = this.naamInput.value || undefined;

      if (actorType === '1' || actorType === '3') {
        actor.voornaam = this.vnafkInput.value || undefined;
        if (!actor.id) {
          actor.rrn = this.rrnInput.value || undefined;
        }
        if (actor.afkorting) {
          delete actor.afkorting;
        }
      } else if (actorType === '2') {
        actor.afkorting = this.vnafkInput.value || undefined;
        if (!actor.id) {
          actor.kbo = this.kboInput.value || undefined;
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

      actor.email = this._actorEmails;
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

      array.forEach(actor.emails, lang.hitch(this, function(email) {
        this._index++;
        email['id'] = this._index.toString();
        this._actorEmails.push(email);
        var type = this.typeLists.emailTypes.filter(lang.hitch(this, function(type) {
          return (type.id == email.type.id);
        }));
        this._createListItem(this._index, email.email, type[0].naam, this.emaillist, this._removeEmail);
      }));

      array.forEach(actor.telefoons, lang.hitch(this, function(telefoon) {
        this._index++;
        telefoon['id'] = this._index.toString();
        this._actorTelefoons.push(telefoon);
        var type = this.typeLists.telephoneTypes.filter(lang.hitch(this, function(type) {
          return (type.id == telefoon.type.id);
        }));
        var telefoonvalue = telefoon.landcode ? telefoon.landcode + telefoon.nummer : '+32' + telefoon.nummer;
        this._createListItem(this._index, telefoonvalue, type[0].naam, this.telefoonlist, this._removeTelefoon);
      }));

      array.forEach(actor.urls, lang.hitch(this, function(url) {
        this._index++;
        url['id'] = this._index.toString();
        this._actorUrls.push(url);
        var type = this.typeLists.urlTypes.filter(lang.hitch(this, function(type) {
          return (type.id == url.type.id);
        }));
        this._createListItem(this._index, url.url, type[0].naam, this.urllist, this._removeUrl);
      }));

      if (actor.adressen) {
        this._adresStore.setData(actor.adressen);
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
      switch (type.toString()) {
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
