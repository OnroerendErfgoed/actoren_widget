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

		baseUrl: null,
		actorStore: null,
    actorWijStore: null,

		_target: '/actoren/',
		_adresParameter: '/adressen',

		postCreate: function() {
			console.log('..ActorController::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
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

		saveActorAdres:function(adres,actorId)
		{
			var target=this.baseUrl + this._target + actorId + this._adresParameter;
			return xhr(target,{
				withCredentials: true,
				handleAs: "json",
				method:"POST",
				data: JSON.stringify(adres),
				headers:{'Content-Type': 'application/json', "Accept": "application/json"}
			})
		}
	});
});