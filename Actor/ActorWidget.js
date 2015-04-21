/**
 * De hoofd layout waarmee de actor widget wordt opgestart, opgebouwd en beheerd.
 * @module Actor/ActorWidget
 */
define([
	'dojo/text!./templates/ActorWidget.html',
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'../controllers/ActorController',
	'../controllers/CrabController',
	'./actorWidgets/ActorSearch',
	'./actorWidgets/actorDetail/ActorDetail',
	'./actorWidgets/actorDetail/ActorEdit',
	'./ActorAdvSearchUI',
	'./actorWidgets/actorAdvSearch/ActorAdvSearchVKBO',
	'./actorWidgets/actorAdvSearch/ActorAdvSearchVKBP',
	'dijit/layout/StackContainer'
], function (
	template,
	declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ActorController,
	CrabController,
	ActorSearch,
	ActorDetail,
	ActorEdit,
	ActorAdvSearchUI,
	ActorAdvSearchVKBO,
	ActorAdvSearchVKBP
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actorWijStore: null,
		actorStore: null,
		actorController: null,
		crabHost: null,
		permissionToAdd: false,
		permissionToEdit: false,
		// default values
		typeLists: {
			emailTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}],
			telephoneTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}, {"naam": "mobiel", "id": 3}, {"naam": "fax thuis", "id": 4}, {"naam": "fax werk", "id": 5}],
			urlTypes: [{"naam": "website", "id": 1}, {"naam": "blog", "id": 2}, {"naam": "webapplicatie", "id": 3}],
			actorTypes: [{"naam": "persoon", "id": 1}, {"naam": "organisatie", "id": 2}]
		},
		_actorSearch: null,

		/**
		 * Standaard widget functie.
		 * Aanmaken van de actor en crab controllers.
		 * Layout opbouwen uit andere widgets.
		 * Listener events toevoegen (log voor development).
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
				console.log('send.actor', evt.actor);
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
		 * Functie om de bewerk widget te tonen met informatie over de meegegeven actor.
		 * @param {Object} actor
		 */
		showEdit: function (actor) {
			this._actorEdit.setActor(actor);
			this.actorStackContainer.selectChild(this._actorEdit);
		},

		/**
		 * Functie om de uitgebreide actor zoek widget te tonen.
		 */
		showActorSearch: function () {
			this.actorStackContainer.selectChild(this._ActorAdvSearchUI);
		},

		/**
		 * Functie om de vkbo zoek widget te tonen.
		 */
		showVKBOSearch: function () {
			this.actorStackContainer.selectChild(this._actorSearchVKBO);
		},

		/**
		 * Functie om de uitgebreide vkbp zoek widget te tonen.
		 */
		showVKBPSearch: function () {
			this.actorStackContainer.selectChild(this._actorSearchVKBP);
		},

		/**
		 * De content van de widget toevoegen (afhankelijk welke toegelaten zijn voor de gebruiker)
		 * @private
		 */
		_setupLayout: function() {
			this._actorSearch = new ActorSearch({actorWidget: this});
			this._actorDetail = new ActorDetail({actorWidget: this});

			this.actorStackContainer.addChild(this._actorSearch);
			this.actorStackContainer.addChild(this._actorDetail);

			this._ActorAdvSearchUI =  new ActorAdvSearchUI({actorWidget: this});
			this._actorSearchVKBO =  new ActorAdvSearchVKBO({actorWidget: this});
			this._actorSearchVKBP =  new ActorAdvSearchVKBP({actorWidget: this});

			this.actorStackContainer.addChild(this._ActorAdvSearchUI);
			this.actorStackContainer.addChild(this._actorSearchVKBO);
			this.actorStackContainer.addChild(this._actorSearchVKBP);

			if (this.permissionToEdit) {
				this._actorEdit = new ActorEdit({actorWidget: this});
				this.actorStackContainer.addChild(this._actorEdit);
			}
			else {
				this._actorDetail.headerButtons.style.display = 'none';
				this._actorDetail.headerText.innerHTML = 'Actor detail';
			}
		},

		/**
		 * Een event toevoegen aan deze widget waaraan een actor wordt meegeven.
		 * @param {Object} actor
		 */
		emitActor: function(actor) {
			this.emit('send.actor', {actor: actor});
		},

		/**
		 * Geeft de geselecteerde actor.
		 * @returns {Deferred.promise|*}
		 */
		getSelectedActor: function() {
			return this._actorSearch.getSelectedActor();
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
