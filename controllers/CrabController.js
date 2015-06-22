/**
 * @module controllers/CrabController
 */
define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Deferred',
	'dojo/request/xhr'
], function(
	declare,
	lang,
	Deferred,
	xhr
) {
	return declare(null, /** @lends module:controllers/ActorController# */ {

		crabHost: null,

		/**
		 * Module die instaat voor de 'ajax calls' die naar de server gemaakt worden voor het ophalen van de crab adres gegevens.
		 * @constructs
		 * @param args Options
		 */
		constructor: function (args) {
			declare.safeMixin(this, args);
		},

		/**
		 * Een GET ajax call naar de crab target waarbij een endpoint meegegeven wordt.
		 * @param {string} endpoint
		 * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
		 * @private
		 */
		_crabGet: function(endpoint){
			return xhr(this.crabHost + endpoint, {
				methode: "GET",
				handleAs: "json",
				headers: {
					"X-Requested-With": "",
					"Content-Type": "application/json"
				}
			})
		},

		/**
		 * Geeft landen terug.
		 * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
		 */
		getLanden: function(){
			var deferred = new Deferred();
			this._crabGet('crab/landen').
				then(lang.hitch(this, function(landen) {
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
		getLandNaam: function(landId){
			var deferred = new Deferred();
			this._crabGet('crab/landen/' + landId).
				then(function(land){
					deferred.resolve(land.naam)
				});
			return deferred.promise;
		},

		/**
		 * Geeft de gemeenten van België terug.
		 * Per gewest worden de gemeenten opgehaald, samengevoegd en gesorteerd.
		 * @returns {Boolean} (Promise) 'True' als de deferred een response met json body terug krijgt, anders 'False'.
		 */
		getGemeenten: function(){
			var deferred = new Deferred();
			this._crabGet('crab/gewesten/1/gemeenten').
				then(lang.hitch(this, function(data) {
					var gemeenten = data;
					this._crabGet('crab/gewesten/2/gemeenten').
						then(lang.hitch(this, function(data) {
							gemeenten = gemeenten.concat(data);
							this._crabGet('crab/gewesten/3/gemeenten').
								then(lang.hitch(this, function(data) {
									gemeenten = gemeenten.concat(data);
									gemeenten.sort(this._compare);
									deferred.resolve(gemeenten);
								}))
						}))
				}));
			return deferred.promise;
		},

		/**
		 * Geeft de postcodes van een bepaalde gemeente terug.
		 * @param {number} gemeente_id Crab id van de gemeente
		 * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
		 */
		getPostkantons: function(gemeente_id) {
			return this._crabGet("crab/gemeenten/" + gemeente_id + "/postkantons");
		},

		/**
		 * Geeft de straten van een bepaalde gemeente terug.
		 * @param {number} gemeente_id Crab id van de gemeente
		 * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
		 */
		getStraten: function(gemeente_id) {
			return this._crabGet("crab/gemeenten/" + gemeente_id + "/straten");
		},

		/**
		 * Geeft de huisnummer van een bepaalde straat terug.
		 * @param {number} straat_id Crab id van de straat
		 * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
		 */
		getNummers: function(straat_id) {
			return this._crabGet("crab/straten/" + straat_id + "/huisnummers");
		},

		/**
		 * Een javascript inputfunctie voor array.prototype.sort om objecten te sorteren op basis van de naam attribuut
		 * @param {object} a Het eerste object
		 * @param {object} b Het tweede object
		 * @returns {number} -1: naam a alfabetisch voor naam b; 0: naam b gelijk aan naam a; 1: naam b alfabetisch voor naam a
		 * @private
		 */
		_compare: function(a,b) {
			if (a.naam < b.naam)
				return -1;
			if (a.naam > b.naam)
				return 1;
			return 0;
		}

	});
});