define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/dom-construct',
  'dijit/layout/_LayoutWidget',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/Selection',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  'dgrid/extensions/ColumnHider',
  'dstore/Memory',
  'dojo/text!./templates/GridSearch.html'
], function (
  declare,
  lang,
  Deferred,
  domConstruct,
  _LayoutWidget,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  OnDemandGrid,
  Keyboard,
  Selection,
  DijitRegistry,
  ColumnResizer,
  ColumnHider,
  Memory,
  template
) {
  /* used for 'search on input' delay */
  var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    actorController: null,
    actorenUrl: null,
    actorStore: null, //requires dstore!
    _actorGrid: null,
    _canEdit: true,
    _canCreate: true,

    /**
     * Standaard widget functie.
     */
    postCreate: function () {
      console.debug('...GridSearch::postCreate', arguments);
      this.inherited(arguments);

      this._actorGrid = this._createGrid({
        collection: this.actorStore
      }, this.actorGridNode);
    },

    /**
     * Standaard widget functie.
     */
    startup: function () {
      console.debug('...GridSearch::startup', arguments);
      this.inherited(arguments);
      if (this._canCreate) {
        this.addActorLink.style.display = 'inline-block';
      } else {
        this.addActorLink.style.display = 'none';
      }
      this._actorGrid.startup();
      this._actorGrid.resize();
    },

    _createGrid: function (options, node) {

      var columns = {
        id: {
          label: '#'
        },
        naam: {
          label: 'Naam',
          sortable: true
        },
        voornaam: {
          label: 'Voornaam',
          sortable: false
        },
        type: {
          label: 'Type',
          formatter: function (type) {
            return type.naam;
          }
        },
        uri: {
          label: 'Uri',
          hidden: true
        },
        status: {
          label: 'Status',
          hidden: true,
          formatter: function (value) {
            if (value && value.status) {
              return value.status;
            } else {
              return '-';
            }
          }
        },
        self: {
          label: 'Self',
          hidden: true
        },
        //	formatter: lang.hitch(this, function (type, object) {
        //		if (this.actoren_updated.indexOf(object.id) > -1) {
        //			return type['naam'] + '<span class="success label right">bewerkt</span>';
        //		}
        //		else if (this.actoren_new.indexOf(object.id) > -1) {
        //			return type['naam'] + '<span class="success label right">nieuw</span>';
        //		}
        //		else {
        //			return type['naam'];
        //		}
        //	}),
        //	sortable: false
        //}
        'edit_view': {
          label: '',
          renderCell: lang.hitch(this, function (object) {
            if (!object.id) {
              return null;
            }
            var div = domConstruct.create('div', {'class': 'dGridHyperlink text-center'});
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

            if (this._canEdit) {
              var editUrl = this.actorenUrl + 'beheer/' + object.id;
              domConstruct.create('a', {
                href: editUrl,
                title: 'Actor bewerken',
                className: 'fa fa-pencil',
                style: 'margin-left: 15px;',
                innerHTML: '',
                onclick: lang.hitch(this, function (evt) {
                  evt.preventDefault();
                  window.open(editUrl);
                })
              }, div);
            }
            return div;
          })
        }
      };

      var grid = new (declare([OnDemandGrid, Keyboard, DijitRegistry, ColumnResizer, Selection, ColumnHider]))({
        className: 'actorSearchGrid',
        collection: options.collection,
        columns: columns,
        noDataMessage: 'Er zijn geen actoren gevonden',
        loadingMessage: 'data aan het ophalen...'
      }, node);

      grid.on('.dgrid-row:click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        var actor = grid.row(evt).data;
        this._actorSelected(actor);
      }));

      return grid;
    },

    // function triggered from template
    _filterGrid: function (evt) {
      evt ? evt.preventDefault() : null;

      var searchValue = this.actorenFilter.value;

      delay(lang.hitch(this, function() {
        this._actorGrid.set('collection', undefined); // Avoid unnecessary rendering and processing
        this._removeSort(); // remove sort when searching (for ES)
        if (searchValue && searchValue.trim() !== '') {
          this._actorGrid.set('collection', this.actorStore.filter({omschrijving: searchValue}));
        } else {
          this._actorGrid.set('collection', this.actorStore.filter({}));
        }
        this._actorGrid.resize();
      }), 250);
    },

    resetFilters: function (evt) {
      evt ? evt.preventDefault() : null;
      this.advFilterGrid({});
      this.actorenFilter.value = '';
    },

    advFilterGrid: function (query) {
      this._actorGrid.set('collection', this.actorStore.filter(query));
      this.resize();
    },

    setSelectedGridActor: function (actor) {
      var list = [];
      list.push(actor);
      this._actorGrid.set('collection', new Memory({data: list}));
      this._actorGrid.select(this._actorGrid.row(actor.id));
    },

    _viewActor: function (actor) {
      if (actor) {
        this.emit('actor.open.view', {
          actor: actor
        });
      }
    },

    _actorSelected: function (actor) {
      this.emit('actor.selected', {
        actor: actor,
        bubbles: false
      });
    },

    setStore: function (store) {
      this.actorStore = store;
      this._actorGrid.set('collection', this.actorStore);
      this.resize();
      if (this.actorenFilter.value.trim()) {
        this._filterGrid();
      }
    },

    setSecurityOptions: function (canEdit, canCreate) {
      if (typeof canEdit !== 'undefined') {
        this._canEdit = canEdit;
      }
      if (typeof canCreate !== 'undefined') {
        this._canCreate = canCreate;
      }
      if (this._canCreate) {
        this.addActorLink.style.display = 'inline-block';
      } else {
        this.addActorLink.style.display = 'none';
      }
      setTimeout(function () {
        this._refresh();
      }.bind(this), 0);
    },

    resize: function () {
      this.inherited(arguments);
      this._actorGrid.resize();
    },

    _refresh: function () {
      this._actorGrid.refresh();
      this._actorGrid.resize();
    },

    _removeSort: function () {
      this._actorGrid.set('sort', '');
    }
  });
});