/**
 * De hoofd layout waarmee de actor widget voor actoren van het agentschap wordt opgestart, opgebouwd en beheerd.
 * @module AgentschapActor/AgentschapActorWidget
 */
define([
	'dojo/text!./templates/AgentschapActorWidget.html',
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'./../controllers/ActorController',
	'./../controllers/CrabController',
	'./AgentschapActorSearch',
	'./AgentschapActorDetail',
	'dijit/layout/StackContainer'
], function (
	template,
	declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ActorController,
	CrabController,
	AgentschapActorSearch,
	AgentschapActorDetail
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actorWijStore: null,
		actorStore: null,
		actorController: null,
		_actorSearch: null,

		/**
		 * Standaard widget functie.
		 * Aanmaken van de actor controller.
		 * Aanmaken van de crab controller.
		 * Layout opbouwen uit andere widgets.
		 * Een listener event toevoegen (log voor development).
		 */
		postCreate: function () {
			this.inherited(arguments);
			console.log('ActorWidget::postCreate', arguments);

			this.actorController = new ActorController({
				actorWijStore: this.actorWijStore,
				actorStore: this.actorStore
			});
			this.crabController = new CrabController({crabHost: this.crabHost});
			this._setupLayout();

			this.on('send.actor', function(evt){
				console.log('send.actor');
				console.log(evt.actor);
			});
			this.on('error', function(evt){
				console.log('error', evt.error);
			});
		},

		/**
		 * Standaard widget functie.
		 * Opstarten van de gebruikte widgets en de opstart-widget bepalen.
		 */
		startup: function () {
			this.inherited(arguments);
			console.log('ActorWidget::startup', arguments);
			this.showSearch();
		},

		/**
		 * Functie om de zoek widget te tonen.
		 */
		showSearch: function () {
			this.actorStackContainer.selectChild(this._actorSearch);
		},

		/**
		 * Functie om de detail widget te tonen met informatie over de meegegeven actor.
		 * @param {Object} actor
		 */
		showDetail: function (actor) {
			this._actorDetail.setActor(actor);
			this.actorStackContainer.selectChild(this._actorDetail);
		},

		/**
		 * De content van de widget toevoegen
		 * @private
		 */
		_setupLayout: function() {
			this._actorSearch = new AgentschapActorSearch({actorWidget: this});
			this._actorDetail = new AgentschapActorDetail({actorWidget: this});
			this.actorStackContainer.addChild(this._actorSearch);
			this.actorStackContainer.addChild(this._actorDetail);
		},

		/**
		 * Geeft de geselecteerde actor.
		 * @returns {Deferred.promise|*}
		 */
		getSelectedActor: function() {
			return this._actorSearch.getSelectedActor();
		},

		/**
		 * Een event toevoegen aan deze widget waaraan een actor wordt meegeven.
		 * @param {Object} actor
		 */
		emitActor: function(actor) {
			this.emit('send.actor', {actor: actor});
		},

		/**
		 * Een event toevoegen aan deze widget waaraan een error wordt meegeven.
		 * @param {Event} evt met error attribuut.
		 */
		emitError: function(evt) {
			this.emit('error', evt);
		}

	});
});
