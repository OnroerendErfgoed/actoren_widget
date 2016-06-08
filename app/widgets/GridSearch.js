define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dijit/layout/_LayoutWidget',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/Selection',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  'dojo/text!./templates/GridSearch.html'
], function(
  declare,
  lang,
  Deferred,
  _LayoutWidget,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  OnDemandGrid,
  Keyboard,
  Selection,
  DijitRegistry,
  ColumnResizer,
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
    actorStore: null, //requires dstore!
    _actorGrid: null,

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
      this._actorGrid.startup();
      this._actorGrid.resize();
    },

    _createGrid: function(options, node) {

      var columns = {
        id: {
          label:'#'
        },
        naam: {
          label:'Naam',
          sortable: true
        },
        voornaam: {
          label: 'Voornaam',
          sortable: false
        }
        //type: {
        //	label: 'Type',
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
      };

      var grid = new (declare([OnDemandGrid, Keyboard, DijitRegistry, ColumnResizer, Selection]))({
        className: 'actorSearchGrid',
        collection: options.collection,
        columns: columns,
        noDataMessage: 'Er zijn geen actoren gevonden',
        loadingMessage: 'data aan het ophalen...'
      }, node);

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

    _createActor: function() {

    },

    _editActor: function(actor) {

    },

    resize: function() {
      this.inherited(arguments);
      console.log('RESIZE GRIDSEARCH');
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