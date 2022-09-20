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
], function(
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
  var delay = (function(){
    var timer = 0;
    return function(callback, ms){
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    actorController: null,
    actorStore: null, //requires dstore!
    _actorGrid: null,
    _canEdit: true,
    _canCreate: true,
    _isAuteurs: false,

    /**
     * Standaard widget functie.
     */
    postCreate: function () {
      console.debug('...GridSearch::postCreate', arguments);
      this.inherited(arguments);

      if (this._isAuteurs) {
        this.actorenFilter.placeholder = 'Zoeken in auteurs..'
        this.actorenFilter.title = 'Zoek een auteur'
      }

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

    _createGrid: function(options, node) {
      var columns = {
        id: {
          label: '#'
        }
      }

      if (this._isAuteurs) {
        columns.omschrijving = {
          label: 'Omschrijving',
          sortable: true
        }
      } else {
        columns.naam = {
          label: 'Naam',
          sortable: true
        }
        columns.voornaam = {
          label: 'Voornaam',
          sortable: false
        }
      }

      columns. type = {
        label: 'Type',
        formatter: function(type) {
          return type.naam;
        }
      },

      columns.uri = {
        label: 'Uri',
        hidden: true
      },

      columns.status = {
        label: 'Status',
        hidden: true,
        formatter: function(value) {
          if (value && value.status) {
            return value.status;
          }
          else {
            return '-';
          }
        }
      },

      columns.self = {
        label: 'Self',
        hidden: true
      },

      columns.edit_view = {
        label: '',
        renderCell: lang.hitch(this, function (object) {
          if (!object.id) {
            return null;
          }
          var div = domConstruct.create('div', { 'class': 'dGridHyperlink text-center'});
          var viewTitle = this._isAuteurs ? 'Auteur bekijken' : 'Actor bekijken';
          domConstruct.create('a', {
            href: '#',
            title: viewTitle,
            className: 'fa fa-eye',
            innerHTML: '',
            onclick: lang.hitch(this, function (evt) {
              evt.preventDefault();
              this._viewActor(object);
            })
          }, div);

          var editTitle = this._isAuteurs ? 'Auteur bewerken' : 'Actor bewerken';
          if (this._canEdit) {
            domConstruct.create('a', {
              href: '#',
              title: editTitle,
              className: 'fa fa-pencil',
              style: 'margin-left: 15px;',
              innerHTML: '',
              onclick: lang.hitch(this, function (evt) {
                evt.preventDefault();
                this._editActor(object);
              })
            }, div);
          }
          return div;
        })
      }

      var grid = new (declare([OnDemandGrid, Keyboard, DijitRegistry, ColumnResizer, Selection, ColumnHider]))({
        className: 'actorSearchGrid',
        collection: options.collection,
        columns: columns,
        noDataMessage: 'Er zijn geen actoren gevonden',
        loadingMessage: 'data aan het ophalen...'
      }, node);

      grid.on('.dgrid-row:click', lang.hitch(this, function(evt){
        evt.preventDefault();
        var actor = grid.row(evt).data;
        this._actorSelected(actor);
      }));

      return grid;
    },

    // function triggered from template
    _filterGrid: function(evt) {
      evt ? evt.preventDefault() : null;

      var searchValue = evt.target.value;

      delay(lang.hitch(this, function() {
        this._removeSort(); // remove sort when searching (for ES)
        if (searchValue && searchValue !== '') {
          this._actorGrid.set('collection', this.actorStore.filter({omschrijving: searchValue}));
        } else {
          this._actorGrid.set('collection', this.actorStore.filter({}));
        }
        this._actorGrid.resize();
      }), 250);
    },

    resetFilters: function(evt) {
      evt ? evt.preventDefault() : null;
      this.advFilterGrid({});
      this.actorenFilter.value = '';
    },

    advFilterGrid: function(query) {
      this._actorGrid.set('collection', this.actorStore.filter(query));
      this.resize();
    },

    setSelectedGridActor: function(actor) {
      var list = [];
      list.push(actor);
      this._actorGrid.set('collection', new Memory({ data: list }));
      this._actorGrid.select(this._actorGrid.row(actor.id));
    },

    _createActor: function() {
      this.emit('actor.open.create');
    },

    _editActor: function(actor) {
      if (actor) {
        this.emit('actor.open.edit', {
          actor: actor
        });
      }
    },

    _viewActor: function(actor) {
      if (actor) {
        this.emit('actor.open.view', {
          actor: actor
        });
      }
    },

    _actorSelected: function(actor) {
      this.emit('actor.selected', {
        actor: actor,
        bubbles: false
      });
    },

    setStore: function(store) {
      this.actorStore = store;
      this._actorGrid.set('collection', this.actorStore);
      this.resize();
    },

    setSecurityOptions: function(canEdit, canCreate) {
      if (typeof canEdit !== 'undefined' ) {
        this._canEdit = canEdit;
      }
      if (typeof canCreate !== 'undefined' ) {
        this._canCreate = canCreate;
      }
      if (this._canCreate) {
        this.addActorLink.style.display = 'inline-block';
      } else {
        this.addActorLink.style.display = 'none';
      }
      this._refresh();
    },

    resize: function() {
      this.inherited(arguments);
      this._actorGrid.resize();
    },

    _refresh: function() {
      this._actorGrid.refresh();
      this._actorGrid.resize();
    },

    _removeSort: function() {
      this._actorGrid.set('sort', '');
    }
  });
});