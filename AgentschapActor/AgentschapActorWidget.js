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
	'dijit/layout/StackContainer',
	'dijit/layout/ContentPane'
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
    crabHost: null,
    ssoToken: null,
		_actorDetail: null,
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
			console.log('AgentschapActorWidget::postCreate', arguments);

			this.actorController = new ActorController({
				actorWijStore: this.actorWijStore,
				actorStore: this.actorStore,
				ssoToken: this.ssoToken
			});
			this.crabController = new CrabController({
				crabHost: this.crabHost
			});

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
			console.log('AgentschapActorWidget::startup', arguments);
			this._actorSearch = this._createActorSearchView();
			this._actorDetail = this._createActorDetailView();
			this._actorSearch.startup();
			this._actorDetail.startup();
			this.resize();
		},

		/**
		 * Functie om de zoek widget te tonen.
		 */
		showSearch: function () {
			this.actorStackContainer.selectChild(this.tabActorSearch);
		},

		/**
		 * Functie om de detail widget te tonen met informatie over de meegegeven actor.
		 * @param {Object} actor
		 */
		showDetail: function (actor) {
			this._actorDetail.setActor(actor);
			this.actorStackContainer.selectChild(this.tabActorDetail);
		},

    resize: function() {
      this.actorStackContainer.resize();
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
		},

		_createActorSearchView: function() {
			console.debug('AgentschapActorWidget::_createActorSearchView');
			return new AgentschapActorSearch({
				actorWidget: this,
				actorController: this.actorController,
				actorStore: this.actorStore
			}, this.searchNode);
		},

    _createActorDetailView: function() {
      console.debug('AgentschapActorWidget::_createActorDetailView');
      return new AgentschapActorDetail({
        actorWidget: this
      }, this.actorDetailNode);
    }

	});
});
