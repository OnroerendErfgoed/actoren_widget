define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dojo/request/xhr'
], function(
	declare,
	_WidgetBase,
	xhr
) {
	return declare([_WidgetBase], {

		actorStore: null,
    actorWijStore: null,

		_adresParameter: '/adressen',

		postCreate: function() {
			console.log('..ActorController::postCreate', arguments);
			this.inherited(arguments);
		},

		getActor: function(id) {
			return this.actorStore.get(id);
		},

		saveActor: function(actor) {
			if (!actor.id || actor.id.length == 0) {
				delete actor.id;
				return this.actorStore.add(actor);
			}
			else {
				return this.actorStore.put(actor);
			}
		},

		queryActor: function(query) {
			return this.actorStore.query(query);
		},

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
		 * @returns {Object} Actor met het meegegeven ID
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