define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-construct',
  'dojo/Deferred',
  'dijit/layout/_LayoutWidget',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/Selection',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  'dojo/text!./templates/AdvSearch.html'
], function(
  declare,
  lang,
  array,
  domConstruct,
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
  return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    actorTypes: null,
    crabController: null,
    _listSet: false,

    /**
     * Standaard widget functie.
     */
    postCreate: function () {
      console.debug('...AdvSearch::postCreate', arguments);
      this.inherited(arguments);
    },

    /**
     * Standaard widget functie.
     */
    startup: function () {
      console.debug('...AdvSearch::startup', arguments);
      this.inherited(arguments);
      this._setSelectLists();
    },

    _setSelectLists: function(){
      domConstruct.place('<option value="" disabled selected>Selecteer Actortype</option>', this.typeInput);
      array.forEach(this.actorTypes, lang.hitch(this, function (type) {
        domConstruct.place('<option value="' + type.uri + '">' + type.naam + '</option>', this.typeInput);
      }));
      this._setLandenList();
    },

    /**
     * Selectielijsten aanvullen met opties
     * @private
     */
    _setLandenList: function(){
      // default lijst van landen
      domConstruct.place('<option value="BE">België</option>', this.landList);
      domConstruct.place('<option value="DE">Duitsland</option>', this.landList);
      domConstruct.place('<option value="FR">Frankrijk</option>', this.landList);
      domConstruct.place('<option value="GB">Groot-Brittanië</option>', this.landList);
      domConstruct.place('<option value="NL">Nederland</option>', this.landList);
      domConstruct.place('<option value="LU">Luxemburg</option>', this.landList);
      domConstruct.place('<option disabled>─────────────────────────</option>', this.landList);
      this.crabController.getLanden().
      then(lang.hitch(this, function(landenLijst){
        landenLijst.forEach(lang.hitch(this, function(land){
          domConstruct.place('<option value="' + land.id + '">' + land.naam + '</option>', this.landList);
        }));
      }));
    },

    _findActoren: function(evt) {
      evt ? evt.preventDefault() : null;
      var query = this._getSearchParams();
      this._filterGrid(query);
      this._reset();
    },

    _filterGrid: function (query) {
      this.emit('filter.grid', { query: query, bubbles: false });
    },

    _getSearchParams: function() {
      var query = {};
      var searchParams = [
        { query: 'naam', input: 'naamInput' },
        { query: 'voornaam', input: 'voornaamInput' },
        { query: 'email', input: 'emailInput' },
        { query: 'telefoon', input: 'telefoonInput' },
        { query: 'type', input: 'typeInput' },
        { query: 'persid', input: 'persidInput' },
        { query: 'rrn', input: 'rrnInput' },
        { query: 'kbo', input: 'kboInput' },
        { query: 'gemeente_naam', input: 'gemeenteInput' },
        { query: 'straat_naam', input: 'straatInput' },
        { query: 'postcode', input: 'postcodeInput' },
        { query: 'subadres', input: 'busnummerInput' },
        { query: 'land', input: 'landList' },
        { query: 'huisnummer_label', input: 'huisnummerInput' }
      ];
      searchParams.forEach(lang.hitch(this, function(param) {
        if (this[param.input].value) {
          query[param.query] = this[param.input].value;
        }
      }));

      //var crabParams = this._crabWidget.getInputValues();
      //['postcode', 'subadres', 'land'].forEach(function(param){
      //	if (crabParams.values[param]) {
      //		query[param] = crabParams.values[param];
      //	}
      //});
      //// bijvoorbeeld ?gemeente=143 en ?gemeente_naam=Rotterdam
      //['gemeente', 'straat', 'huisnummer'].forEach(function(param){
      //	if (crabParams.ids[param + '_id']) {
      //		query[param] = crabParams.ids[param + '_id']
      //	} else if (crabParams.values[param]) {
      //		if (param === 'huisnummer') {
      //			query[param + '_label'] = crabParams.values[param]
      //		} else {
      //			query[param + '_naam'] = crabParams.values[param]
      //		}
      //	}
      //});
      return query;
    },

    _reset: function(){
      this.naamInput.value = '';
      this.voornaamInput.value = '';
      this.emailInput.value=  '';
      this.telefoonInput.value = '';
      this.typeInput.value = '';
      this.persidInput.value = '';
      this.rrnInput.value = '';
      this.kboInput.value = '';
      this.landList.selectedIndex = 0;
      this.gemeenteInput.value = '';
      this.straatInput.value = '';
      this.postcodeInput.value = '';
      this.huisnummerInput.value = '';
      this.busnummerInput.value = '';
    }

  });
});