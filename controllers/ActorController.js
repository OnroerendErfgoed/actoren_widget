/**
 * @module controllers/ActorController
 */
define([
	'dojo/_base/declare',
	'dojo/request/xhr'
], function(
	declare,
	xhr
) {
	return declare(null, /** @lends module:controllers/ActorController# */ {

		actorStore: null,
		actorWijStore: null,
		_adresParameter: '/adressen',

		/**
		 * Module die instaat voor de 'ajax calls' die naar de server gemaakt worden voor het ophalen van de Actoren.
		 * @constructs
		 * @param args Options
		 */
		constructor: function (args) {
			declare.safeMixin(this, args);
		},

		/**
		 * Geeft een bepaalde actor terug.
		 * @param {number} id ID van de actor
		 * @returns {Object} Actor met het meegegeven ID
		 */
		getActor: function(id) {
			return this.actorStore.get(id);
		},

		/**
		 * Slaagt een actor op in de datastore.
		 * @param {Object} actor Actor dat moet worden opgeslagen
		 * @returns {Boolean} (Promise) 'True' als de actor opgeslagen is, anders 'False'.
		 */
		saveActor: function(actor) {
			if (!actor.id || actor.id.length == 0) {
				delete actor.id;
				return this.actorStore.add(actor);
			}
			else {
				return this.actorStore.put(actor);
			}
		},

		/**
		 * Slaagt een adres van een actor op in de datastore.
		 * @param {Object} adres Adres van actor dat moet worden opgeslagen
		 * @param {number} actorId id van de actor waarvan het adres moet worden opgeslagen
		 * @returns {Boolean} (Promise) 'True' als het adres van de actor opgeslagen is, anders 'False'.
		 */
		saveActorAdres:function(adres,actorId) {
			var target = this.actorStore.target + actorId + this._adresParameter;
			return xhr(target,{
				withCredentials: true,
				handleAs: "json",
				method:"POST",
				data: JSON.stringify(adres),
				headers:{'Content-Type': 'application/json', "Accept": "application/json"}
			})
		},

		/**
		 * Kijkt of een actor via ElasticSearch kan gevonden worden.
		 * @param {number} id ID van de actor
		 * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
		 */
		checkActorInES: function(id)
		{
			return xhr(this.actorStore.target + "?query=id:" + id, {
					'handleAs': 'json',
					'headers': {
						'Accept': "application/json",
						"X-Requested-With": ""
					}
				}
			)
		}

	});
});