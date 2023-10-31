/**
 * @module controllers/CrabController
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/request/xhr',
  'dojo/store/JsonRest'
], function (
  declare,
  lang,
  Deferred,
  xhr,
  JsonRest
) {
  return declare(null, {

    crabHost: null,
    baseUrl: null,
    geolocationHost: null,
    _geolocationTarget: '/geolocation/',
    _geolocationStore: null,

    /**
     * Module die instaat voor de 'ajax calls' die naar de server gemaakt worden voor het ophalen van de
     * crab adres gegevens.
     * @constructs
     * @param args Options
     */
    constructor: function (args) {
      declare.safeMixin(this, args);
      this._geolocationStore = new JsonRest({
        target: this.geolocationHost + this._geolocationTarget
      });
    },

    /**
     * Een GET ajax call naar de crab target waarbij een endpoint meegegeven wordt.
     * @param {string} endpoint
     * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
     * @private
     */
    _crabGet: function (endpoint) {
      return xhr(this.crabHost + endpoint, {
        methode: 'GET',
        handleAs: 'json',
        headers: {
          'X-Requested-With': '',
          'Content-Type': 'application/json'
        }
      });
    },

    /**
     * Geeft landen terug.
     * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
     */
    getLanden: function () {
      const deferred = new Deferred();
      this._crabGet('adressenregister/landen').then(lang.hitch(this, function (landen) {
        landen.sort(this._compare);
        deferred.resolve(landen);
      }));
      return deferred.promise;
    },

    /**
     * Geef de naam van het land terug met een opgegeven ID.
     * @param landId
     * @returns {Deferred.promise|*} promise met string van de landnaam
     */
    getLandNaam: function (landId) {
      const deferred = new Deferred();
      this._crabGet('adressenregister/landen/' + landId).then(function (land) {
        deferred.resolve(land.naam);
      });
      return deferred.promise;
    },

    /**
     * Geeft de gemeenten van België terug.
     * Per gewest worden de gemeenten opgehaald, samengevoegd en gesorteerd.
     * @returns {Boolean} (Promise) 'True' als de deferred een response met json body terug krijgt, anders 'False'.
     */
    getGemeenten: async function () {
      const promises = [
        this._getGemeentenPerGewest('2000'),
        this._getGemeentenPerGewest('3000'),
        this._getGemeentenPerGewest('4000')
      ];
      const promiseResult = await Promise.all(promises);
      if (promiseResult.length === 0) {
        return [];
      }
      let gemeenten = [];
      gemeenten = gemeenten.concat(promiseResult[0], promiseResult[1], promiseResult[2]);
      gemeenten.sort(this._compare);
      return gemeenten;
    },

    /**
     * Geeft de postcodes van een bepaalde gemeente terug.
     * @param {string} gemeente Naam van de gemeente
     * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
     */
    getPostinfo: function (gemeente) {
      return this._crabGet(`adressenregister/gemeenten/${gemeente}/postinfo`);
    },
    /**
     * Geeft de straten van een bepaalde gemeente terug.
     * @param {string} niscode Niscode id van de gemeente
     * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
     */
    getStraten: function (niscode) {
      return this._crabGet(`adressenregister/gemeenten/${niscode}/straten`);
    },

    /**
     * Geeft de huisnummer van een bepaalde straat terug.
     * @param {number} straatId Id van de straat
     * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
     */
    getNummers: function (straatId) {
      return this._crabGet(`adressenregister/straten/${straatId}/adressen`);
    },

    /**
     * Geeft de huisnummer van een bepaalde straat terug.
     * @param {number} straatId Id van de straat
     * @param {number} huisnummer
     * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
     */
    getBusnummers: function (straatId, huisnummer) {
      return this._crabGet(`adressenregister/straten/${straatId}/huisnummers/${huisnummer}`);
    },

    /**
     * Geeft een store terug om te kunnen gelocaties bepalen
     * @returns {Object} De JsonRest store die de geolocation service bevraagt
     */
    getGeolocationStore: function () {
      return this._geolocationStore;
    },

    /**
     * Een javascript inputfunctie voor array.prototype.sort om objecten te sorteren op basis van de naam attribuut
     * @param {object} a Het eerste object
     * @param {object} b Het tweede object
     * @returns {number} -1: naam a alfabetisch voor naam b; 0: naam b gelijk aan naam a; 1: naam b
     * alfabetisch voor naam a
     * @private
     */
    _compare: function (a, b) {
      if (a.naam < b.naam) {
        return -1;
      } else if (a.naam > b.naam) {
        return 1;
      } else {
        return 0;
      }
    },

    _getGemeentenPerGewest: function (niscode) {
      return this._crabGet(`adressenregister/gewesten/${niscode}/gemeenten`);
    }

  });
});
