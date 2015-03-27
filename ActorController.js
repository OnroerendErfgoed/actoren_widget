define([
	'dojo/_base/declare',
	"dojo/store/Observable",
	'./JsonRestCors',
	'dijit/_WidgetBase',
	'dojo/request/xhr'
], function(
	declare,
	Observable,
	JsonRestCors,
	_WidgetBase,
	xhr
) {
	return declare([_WidgetBase], {

		baseUrl: null,
		actorStore: null,

		_target: '/actoren/',
		_targetWij: '/actoren/wij/',
		_adresParameter: '/adressen',

		postCreate: function() {
			console.log('..ActorController::postCreate', arguments);
			this.inherited(arguments);
			this.actorStore = this._getStore(this._target);
			this.actorWijStore = this._getStore(this._targetWij);
		},

		startup: function () {
			this.inherited(arguments);
		},

		_getStore: function(endpoint) {
			return new Observable(new JsonRestCors({
				target: this.baseUrl + endpoint,
				sortParam: 'sort',
				idProperty: 'id',
				withCredentials: true,
				headers: {
					"X-Requested-With": "",
					"Content-Type": "application/json"
				}
			}));
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