/**
 * Widget Dialog voor wanneer de sessie van de gebruiker timed-out is.
 * @module ui/widgets/sessionDialog
 */
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    "dojo/on",
    'dojo/topic',
    "dojo/dom-construct",
    "dojo/text!./templates/ActorExistsDialog.html",
    "dijit/_TemplatedMixin",
    'dijit/_WidgetBase',
    'dijit/Dialog',
    'dojo/store/Memory',
    'dgrid/OnDemandGrid',
    'dgrid/Selection',
    'dgrid/Keyboard',
    'dgrid/extensions/DijitRegistry'
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
    DijitRegistry
  ) {
    return declare(
      [_WidgetBase, _TemplatedMixin], {

        dialog: null,
        templateString: template,
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
          this._grid.refresh();
        },

        _createGrid: function() {
          var columns = {
            id: {
              label:'#'
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
            }
          };

          this._grid = new (declare([OnDemandGrid, Selection, Keyboard, DijitRegistry]))({
            selectionMode: 'single',
            store: this.existsStore,
            columns: columns,
            loadingMessage: 'laden...',
            noDataMessage: 'geen resultaten beschikbaar'
          }, this.gridNode);

          this._grid.on("dgrid-sort", this._onSort);
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
          array.forEach(this._grid.store.data, lang.hitch(this, function (item) {
            if (this._grid.selection[item.id]) {
              selected = item;
            }
          }));
          if (selected) {
            console.debug('emit actor', selected);
            this.actorWidget.emitActor(selected);
            this.dialog.hide();
          }
        },

        _mergeSelectedActor: function(evt) {
          evt ? evt.preventDefault() : null;
          var selected = null;
          array.forEach(this._grid.store.data, lang.hitch(this, function (item) {
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

          console.debug('merged actor', selectedActor);
          return selectedActor;
        }
      });
  });