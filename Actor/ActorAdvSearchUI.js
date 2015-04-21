/**
 * De hoofd layout waarmee de uitgebreid actor zoeken actor widget wordt opgestart, opgebouwd en beheerd.
 * @module Actor/ActorAdvSearchUI
 */
define([
	'dojo/text!./templates/ActorAdvSearchUI.html',
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'./actorWidgets/actorAdvSearch/ActorAdvSearchActor',
	'./actorWidgets/actorAdvSearch/ActorCreateActor'
], function(
	template,
	declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ActorAdvSearchActor,
	ActorCreateActor
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actorWidget: null,
		actorController: null,
		baseUrl: null,
		crabHost:null,

		/**
		 * Standaard widget functie.
		 * Layout opbouwen uit andere widgets.
		 */
		postCreate: function() {
			console.log('..ActorAdvancedSearch::postCreate', arguments);
			this.inherited(arguments);
			this._setupLayout();
		},

		/**
		 * Standaard widget functie.
		 * Opstarten van de gebruikte widgets en de opstart-widget bepalen.
		 */
		startup: function () {
			console.log('..ActorAdvancedSearch::startup', arguments);
			this.inherited(arguments);
			this._showActorSearch();
		},

		/**
		 * Functie om de uitgebreide actor zoek widget te tonen.
		 * @private
		 */
		_showActorSearch: function () {
			this.actorAdvSearchStackContainer.selectChild(this._actorAdvSearch);
		},

		/**
		 * Functie om de aanmaak actor widget te tonen.
		 * @private
		 */
		_showActorCreate: function () {
			this.actorWidget._actorSearch._grid.set('sort', [{ attribute: 'naam' }]);
			this.actorAdvSearchStackContainer.selectChild(this._actorCreate);
		},

		/**
		 * Functie om de zoek widget te tonen.
		 * @private
		 */
		_showSearch: function () {
			this.actorAdvSearchStackContainer.selectChild(this._actorAdvSearch);
			this.actorWidget.showSearch();
		},

		/**
		 * De content van de widget toevoegen (afhankelijk welke toegelaten zijn voor de gebruiker)
		 * @private
		 */
		_setupLayout: function() {
			this._actorAdvSearch = new ActorAdvSearchActor({actorWidget: this.actorWidget, actorAdvancedSearch : this});
			this.actorAdvSearchStackContainer.addChild(this._actorAdvSearch);

			if (this.actorWidget.permissionToAdd) {
				this._actorCreate = new ActorCreateActor({actorWidget: this.actorWidget, actorAdvancedSearch: this});
				this.actorAdvSearchStackContainer.addChild(this._actorCreate);
			}
			else {
				this._actorAdvSearch.headerButtons.style.display = 'none';
				this._actorAdvSearch.headerText.innerHTML = 'Zoeken in actoren';
			}
		}
	});
});
