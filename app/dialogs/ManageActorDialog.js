define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/on',
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
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  OnDemandGrid,
  Keyboard,
  DijitRegistry,
  ColumnResizer,
  Trackable,
  Memory,
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
    _mode: 'add',
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
        console.log('ADRES::', evt.adres);
        this._addAdresRow(evt.adres, evt.adresType);
      }));on(this._adresDialog, 'adres.edit', lang.hitch(this, function(evt) {
        console.log('ADRES::', evt.adres);
        this._editAdresRow(evt.adres, evt.adresType, evt.id);
      }));
    },

    startup: function () {
      this.inherited(arguments);
      this._adresDialog.startup();
    },

    show: function (actor, mode) {
      /* jshint maxcomplexity:15 */
      if (actor) {
        console.debug('ActorBekijkenDialog::show', actor);
        this.actor = actor;
        this.set('title', 'Actor \\ ID ' + actor.id);
        var href = this.actorenUrl + '/actoren/' + actor.id;
        domAttr.set(this.actorLink, 'href', href);

        this.naamInput.value = actor.naam || '';
        this.voornaamInput.value = actor.voornaam || '';
        array.forEach(actor.emails, function (email) {
          this._createListItem(email.email, email.type.naam, this.emailList);
        }, this);
        array.forEach(actor.telefoons, function (telefoon) {
          /* jshint -W106 */
          this._createListItem(telefoon.volledig_nummer, telefoon.type.naam, this.telefoonList);
          /* jshint +W106 */
        }, this);

        if (actor.adres) {
          this.landInput.value = actor.adres.land || '';
          this.gemeenteInput.value = actor.adres.gemeente || '';
          this.postcodeInput.value = actor.adres.postcode || '';
          this.straatInput.value = actor.adres.straat || '';
          this.huisnummerInput.value = actor.adres.huisnummer || '';
          this.postbusInput.value = actor.adres.postbus || '';
          this.adresTypeInput.value = actor.adres.adrestype.naam || '';
        }

        this.actorTypeInput.value = actor.type.naam || '';
        if (actor.type && actor.type.id === 2) {
          domClass.remove(this.kboContainer, 'hide');
          var kbos = array.filter(actor.ids, function (actorId) {
            return actorId.type && actorId.type.id === 6;
          });
          if (kbos.length > 0) {
            /* jshint -W106 */
            this.kboInput.value = kbos[0].extra_id;
            /* jshint +W106 */
          }
        }
        array.forEach(actor.urls, function (url) {
          this._createListItem(url.url, url.type.naam, this.urlList);
        }, this);
      }
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
            var div = domConstruct.create('div', { 'class': 'dGridHyperlink'});
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
            return div;
          })
        }
      };

      var grid = new (declare([OnDemandGrid, Keyboard, DijitRegistry, ColumnResizer]))({
        className: 'actorSearchGrid',
        collection: options.collection,
        columns: columns,
        noDataMessage: 'Er zijn geen adressen gevonden',
        loadingMessage: 'data aan het ophalen...'
      }, node);

      return grid;
    },

    _reset: function () {
      console.debug('ActorBekijkenDialog::_reset');
      this.naamInput.value = '';
      this.voornaamInput.value = '';
      domConstruct.empty(this.emailList);
      domConstruct.empty(this.telefoonList);

      //this.landInput.value = '';
      //this.gemeenteInput.value = '';
      //this.postcodeInput.value = '';
      //this.straatInput.value = '';
      //this.huisnummerInput.value = '';
      //this.postbusInput.value = '';
      //this.adresTypeInput.value = '';

      this.actorTypeInput.value = '';
      this.kboInput.value = '';
      domConstruct.empty(this.urlList);
    },

    _closeDialog: function(evt) {
      evt ? evt.preventDefault() : null;
      this.hide();
    },

    _createListItem: function(value, type, ullist) {
      domConstruct.create('li', {
        innerHTML: value + ' (' + type + ')'
      }, ullist);
    }
  });
});
