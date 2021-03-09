define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dojo/dom-construct',
    'dojo/text!./templates/ActorExistsDialog.html',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/Dialog',
    'dojo/store/Memory',
    'dgrid/OnDemandGrid',
    'dgrid/Selection',
    'dgrid/Keyboard',
    'dgrid/extensions/DijitRegistry',
    'dstore/legacy/StoreAdapter'
  ],
  function (
    declare,
    lang,
    array,
    on,
    topic,
    domConstruct,
    template,
    _TemplatedMixin,
    _WidgetBase,
    Dialog,
    Memory,
    OnDemandGrid,
    Selection,
    Keyboard,
    DijitRegistry,
    StoreAdapter
  ) {
    return declare([_WidgetBase, _TemplatedMixin], {

      dialog: null,
      templateString: template,
      actoren: null,
      existsStore: null,
      canSelect: false, //default
      actorController: null,
      parent: null,
      checkActor: null,
      checkAdressen: null,
      _grid: null,

      /**
       * Standaard widget functie.
       */
      postCreate: function () {
        this.inherited(arguments);
        this.existsStore = new Memory({data: this.actoren});
      },

      /**
       * Standaard widget functie.
       * Maakt de dialog aan.
       * @param me Parent van deze widget
       */
      startup: function () {
        this.inherited(arguments);
        this._createGrid();
        this.dialog = new Dialog({
          title: 'Gelijkaardige gebruikers gevonden',
          doLayout: false,
          draggable: false,
          'class': 'actorExistsDialog'
        });
        this.dialog.set('content', this);
        this.dialog.closeText.innerHTML = '<i class="fa fa-times"></i>';
        if (!this.canSelect) {
          this.selectActorButton.style.display = 'none';
        }
        this.dialog.show();
        this._grid.startup();
        this._grid.refresh();
      },

      _createGrid: function() {
        var columns = {
          id: {
            label:'#',
            formatter: function (id) {
              return '<a href="#" >' + id + '</a>'
            }
          },
          naam: {
            label:'Naam',
            sortable: false
          },
          voornaam: {
            label: 'Voornaam',
            sortable: false
          },
          type: {
            label: 'Type',
            formatter: function (type) {
              return type['naam'];
            },
            sortable: false
          },
          'view_actor': {
            label: '',
            renderCell: lang.hitch(this, function (object) {
              if (!object.id) {
                return null;
              }
              var div = domConstruct.create('div', { 'class': 'dGridHyperlink text-center'});
              domConstruct.create('a', {
                href: '#',
                title: 'Actor bekijken',
                className: 'fa fa-eye',
                innerHTML: '',
                onclick: lang.hitch(this, function (evt) {
                  evt.preventDefault();
                  this._viewActor(object);
                })
              }, div);
              return div;
            })
          }
        };

        this._grid = new (declare([OnDemandGrid, Selection, Keyboard, DijitRegistry]))({
          selectionMode: 'single',
          collection: new StoreAdapter({objectStore: this.existsStore}),
          columns: columns,
          loadingMessage: 'laden...',
          noDataMessage: 'geen resultaten beschikbaar'
        }, this.gridNode);

        this._grid.on("dgrid-sort", this._onSort);
        this._grid.on(".dgrid-cell:click", lang.hitch(this, function(evt){
          evt.preventDefault();
          var cell = this._grid.cell(evt);
          if (cell.column.field == 'id' && this._grid.row(evt)) {
            var id = this._grid.row(evt).id;
            this.actorController.getActor(id).
            then(lang.hitch(this, function(actor){
              window.open(actor.uri,'plain');
            }));
          }
        }));
      },

      _onSort: function(event) {
        console.log("Sort invoked", event);
        // Stop the normal sort event/bubbling
        event.preventDefault();
        event.stopPropagation();
      },

      _useSelectedActor: function(evt) {
        evt ? evt.preventDefault() : null;
        var selected = null;
        array.forEach(this.existsStore.data, lang.hitch(this, function (item) {
          if (this._grid.selection[item.id]) {
            selected = item;
          }
        }));
        if (selected) {
          this.parent._useExistingActor(selected);
          this.dialog.hide();
        }
      },

      _mergeSelectedActor: function(evt) {
        evt ? evt.preventDefault() : null;
        var selected = null;
        array.forEach(this.existsStore.data, lang.hitch(this, function (item) {
          if (this._grid.selection[item.id]) {
            selected = item.id;
          }
        }));
        if (selected) {
          this.actorController.getActor(selected).then(lang.hitch(this, function (actor) {
            var mergedActor = this._compareAndCompleteActor(actor, this.checkActor, this.checkAdressen);
            this.parent.editActor(mergedActor);
            this.dialog.hide();
          }), lang.hitch(this, function(err) {
            this.parent._emitError(err);
          }));
        } else {
          alert('Gelieve een actor te selecteren om te mergen.');
        }
      },

      _saveActor: function(evt) {
        evt ? evt.preventDefault() : null;
        var adressen = {};
        adressen.add = this.checkAdressen;
        this.parent._doSave(this.checkActor, adressen);
        this.dialog.hide();
      },

      _compareAndCompleteActor: function(selectedActor, actorNew, adresNew) {
        console.debug('comparing actors', selectedActor, actorNew);

        // compare emails
        var selectedEmails = lang.clone(selectedActor.emails);
        selectedEmails.push.apply(selectedEmails, actorNew.emails);
        selectedActor.emails = this.makeEmailsUnique(selectedEmails);

        // compare telnr
        var selectedTels = lang.clone(selectedActor.telefoons);
        selectedTels.push.apply(selectedTels, actorNew.telefoons);
        selectedActor.telefoons = this.makeTelefoonsUnique(selectedTels);

        // compare websites
        var selectedSites = lang.clone(selectedActor.urls);
        selectedSites.push.apply(selectedSites, actorNew.urls);
        selectedActor.urls = this.makeUrlsUnique(selectedSites);

        // compare kbo
        if (actorNew.kbo) {
          selectedActor.kbo = actorNew.kbo;
        } else {
          var kbos = array.filter(selectedActor.ids, function (actorId) {
            return actorId.type && actorId.type.id === 6;
         });
         if (kbos.length > 0) {
           /* jshint -W106 */
           selectedActor.kbo = kbos[0].extra_id;
           /* jshint +W106 */
         }
        }

        // compare rrn
        if (actorNew.rrn) {
          selectedActor.rrn = actorNew.rrn;
        } else {
          var rrns = array.filter(selectedActor.ids, function (actorId) {
            return actorId.type && actorId.type.id === 4;
         });
         if (rrns.length > 0) {
           /* jshint -W106 */
           selectedActor.rrn = rrns[0].extra_id;
           /* jshint +W106 */
         }
        }

        // TODO check adressen merge
        // compare addresses
        var selectedAddresses = lang.clone(selectedActor.adressen);

        selectedAddresses = array.filter(selectedAddresses, function (adres) {
          return adres.einddatum === null;
        });

        var newAddressList = [];
        if (selectedAddresses.length > 0) {
          array.forEach(adresNew, function (newAdres) {
            var isDuplicateAdres = array.some(selectedAddresses, function (selectedAddress) {
              return (selectedAddress.gemeente_id === newAdres.gemeente_id &&
                  selectedAddress.huisnummer_id === newAdres.huisnummer_id &&
                  selectedAddress.straat_id === newAdres.straat_id &&
                  selectedAddress.postcode === newAdres.postcode &&
                  selectedAddress.land === newAdres.land)
            }, this);
            if (!isDuplicateAdres) {
              newAdres.adrestype = {id:  2};
              newAddressList.push(newAdres);
            }
          });
          selectedAddresses.push.apply(selectedAddresses, newAddressList);
          selectedActor.adressen = selectedAddresses;
        } else {
          selectedActor.adressen = adresNew;
        }

        console.debug('merged actor', selectedActor);
        return selectedActor;
      },

      makeEmailsUnique: function (nonUniqueArray) {
        var unique = {};
        var mappedArray = array.map(nonUniqueArray, function(email) {
          return { email: email.email, type: { id: email.type.id }};
        });
        return array.filter(mappedArray, function(value) {
          if (!unique[JSON.stringify(value)]) {
            unique[JSON.stringify(value)] = true;
            return true;
          }
          return false;

        });
      },

       makeTelefoonsUnique: function (nonUniqueArray) {
        var unique = {};
        var mappedArray = array.map(nonUniqueArray, function(tel) {
          return { landcode: tel.landcode, nummer: tel.nummer, type: { id: tel.type.id }};
        });
        return array.filter(mappedArray, function(value) {
          if (!unique[JSON.stringify(value)]) {
            unique[JSON.stringify(value)] = true;
            return true;
          }
          return false;

        });
      },

      makeUrlsUnique: function (nonUniqueArray) {
        var unique = {};
        var mappedArray = array.map(nonUniqueArray, function(url) {
          return { url: url.url, type: { id: url.type.id }};
        });
        return array.filter(mappedArray, function(value) {
          if (!unique[JSON.stringify(value)]) {
            unique[JSON.stringify(value)] = true;
            return true;
          }
          return false;

        });
      },
      _viewActor: function(actor) {
        if (actor) {
          this.emit('actor.open.view', {
            actor: actor
          });
        }
      },
    });
  });
