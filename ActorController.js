define([
  'dojo/_base/declare',
  "dojo/store/Observable",
  './JsonRestCors',
  'dijit/_WidgetBase'
], function(
  declare,
  Observable,
  JsonRestCors,
  _WidgetBase
) {
  return declare([_WidgetBase], {

	baseUrl: null,
	actorStore: null,


	postCreate: function() {
	  console.log('..ActorController::postCreate', arguments);
	  this.inherited(arguments);
	  this.actorStore = this._getStore('/actoren/');
	  this.actorWijStore = this._getStore('/actoren/wij/');
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

	queryActor: function(query) {
	  return this.actorStore.query(query);
	}

  });
});