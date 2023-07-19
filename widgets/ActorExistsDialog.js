/**
 * Widget Dialog voor wanneer de sessie van de gebruiker timed-out is.
 * @module ui/widgets/sessionDialog
 */
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/fx',
    "dojo/on",
    'dojo/topic',
    'dojo/query',
    'dojo/dom-style',
    "dojo/dom-construct",
    "dojo/text!./templates/ActorExistsDialog.html",
    "dijit/_TemplatedMixin",
    'dijit/_WidgetBase',
    'dijit/Dialog',
    'dojo/store/Memory',
    'dgrid/OnDemandGrid',
    'dgrid/Selection',
    'dgrid/Keyboard',
    'dgrid/extensions/DijitRegistry',
        "dstore/legacy/StoreAdapter"

  ],
  function (
    declare,
    lang,
    array,
    fx,
    on,
    topic,
    query,
    domStyle,
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
    return declare(
      [_WidgetBase, _TemplatedMixin], {

        dialog: null,
        templateString: template,
        baseClass: 'actor-exists-dialog',
        actoren: null,
        existsStore: null,
        canSelect: false, //default
        actorWidget: null,
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
            'edit_view': {
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
              this.actorWidget.actorController.getActor(id).
                then(lang.hitch(this, function(actor){
                  //this.actorWidget.showActorDetail(actor);
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
            this.actorWidget._useExistingActor(selected);
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
            this.actorWidget.actorController.getActor(selected).then(lang.hitch(this, function (actor) {
              var mergedActor = this._compareAndCompleteActor(actor, this.checkActor, this.checkAdressen);
              this.actorWidget.showActorEdit(mergedActor);
              this.dialog.hide();
            }));
          } else {
            alert('Gelieve een actor te selecteren om te mergen.');
          }
        },

        _saveActor: function(evt) {
          evt ? evt.preventDefault() : null;
          this.parent._doSave(this.checkActor, this.checkAdressen);
          this.dialog.hide();
        },

        _compareAndCompleteActor: function(selectedActor, actorNew, adresNew) {
          console.debug('comparing actors', selectedActor, actorNew);

          // compare emails
          var selectedEmails = selectedActor.emails;
          var newEmailList = [];
          if (selectedEmails.length > 0) {
            array.forEach(actorNew.emails, function (newEmail) {
              array.forEach(selectedEmails, function (selectedEmail) {
                if ((selectedEmail.email != newEmail.email) || (selectedEmail.type.id != newEmail.type.id)) {
                  newEmailList.push(newEmail);
                }
              });
            });
            selectedEmails.push.apply(selectedEmails, newEmailList);
            selectedActor.emails = selectedEmails;
          } else {
            selectedActor.emails = actorNew.emails;
          }

          // compare telnr
          var selectedTels = selectedActor.telefoons;
          var newTelList = [];
          if (selectedTels.length > 0) {
            array.forEach(actorNew.telefoons, function (newTel) {
              array.forEach(selectedTels, function (selectedTel) {
                if ((selectedTel.landcode != newTel.landcode) || (selectedTel.nummer != newTel.nummer) || (selectedTel.type.id != newTel.type.id)) {
                  newTelList.push(newTel);
                }
              });
            });
            selectedTels.push.apply(selectedTels, newTelList);
            selectedActor.telefoons = selectedTels;
          } else {
            selectedActor.telefoons = actorNew.telefoons;
          }

          // compare websites
          var selectedSites = selectedActor.urls;
          var newUrlList = [];
          if (selectedSites.length > 0) {
            array.forEach(actorNew.urls, function (newUrl) {
              array.forEach(selectedSites, function (selectedUrl) {
                if ((selectedUrl.url != newUrl.url) || (selectedUrl.type.id != newUrl.type.id)) {
                  newUrlList.push(newUrl);
                }
              });
            });
            selectedSites.push.apply(selectedSites, newUrlList);
            selectedActor.urls = selectedSites;
          } else {
            selectedActor.url = actorNew.urls;
          }

          // compare addresses
          var selectedAddresses = selectedActor.adressen;
          var newAddressList = [];
          if (selectedAddresses.length > 0) {
            array.forEach(adresNew, function (newAdres) {
              array.forEach(selectedAddresses, function (selectedAdres) {
                if ((selectedAdres.gemeente_id != newAdres.gemeente_id) || (selectedAdres.adrestype.id != newAdres.adrestype.id)
                  || (selectedAdres.huisnummer_id != newAdres.huisnummer_id) || (selectedAdres.straat_id != newAdres.straat_id)
                  || (selectedAdres.postcode != newAdres.postcode) || (selectedAdres.land != newAdres.land)) {
                  newAddressList.push(newAdres);
                }
              });
            });
            selectedAddresses.push.apply(selectedAddresses, newAddressList);
            selectedActor.adressen = selectedAddresses;
          } else {
            selectedActor.adressen = adresNew;
          }

          // compare voornaam
          if (selectedActor.voornaam == null || selectedActor.voornaam == "") {
            selectedActor.voornaam = actorNew.voornaam;
          }

          console.debug('merged actor', selectedActor);
          return selectedActor;
        },

        _viewActor: function (actor) {
          if (actor) {
            this._viewActorByUri(actor.uri);
          }
        },
        _viewActorByUri: function (actorUri) {
          if (actorUri) {
            this._showLoading('Even geduld. Actor wordt opgehaald..');
            this.actorController.getActorByUri(actorUri).then(lang.hitch(this, function (actor) {
              this.viewActorDialog.show(actor);
            }), lang.hitch(this, function (err) {
              this.parent._emitError(err);
            })).finally(lang.hitch(this, function () {
              this._hideLoading();
            }));
          }
        },
  
        /**
       * Toont de 'Loading'-overlay.
       * @public
       */
      _showLoading: function (message) {
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
       * Verbergt de 'Loading'-overlay.
       * @public
       */
      _hideLoading: function () {
        var node = this.loadingOverlay;
        fx.fadeOut({
          node: node,
          onEnd: function (node) {
            domStyle.set(node, 'display', 'none');
          },
          duration: 1000
        }).play();
      }
      });
  });
