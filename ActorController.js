define([
  'dojo/_base/declare',
  "dojo/store/Observable",
  "dojo/store/JsonRest",
  'dijit/_WidgetBase'
], function(
  declare,
  Observable,
  JsonRest,
  _WidgetBase
) {
  return declare([_WidgetBase], {

	baseUrl: null,
	actorStore: null,


	postCreate: function() {
	  console.log('..ActorController::postCreate', arguments);
	  this.inherited(arguments);
	  this.actorStore = this._getStore('/actoren');
	  this.actorWijStore = this._getStore('/actoren/wij');
	},

	startup: function () {
	},

	_getStore: function(endpoint) {
	  return new Observable(new JsonRest({
		target: this.baseUrl + endpoint,
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
		  "X-Requested-With": "",
		  "Content-Type": "application/json"
		}
	  }));
	},

	getActor: function(id) {
	  return this.actorStore.get(id)
	}
  });
});