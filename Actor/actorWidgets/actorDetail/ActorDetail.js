/**
 * Widget om een actor gedetaileerd weer te geven.
 * @module Actor/actorWidgets/actorDetail/ActorDetail
 */
define([
	'dojo/text!./templates/ActorDetail.html',
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'../CrabWidget'
], function(
	template,
	declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	CrabWidget
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actor: null,
		actorWidget: null,

		/**
		 * Standaard widget functie.
		 */
		postCreate: function() {
			console.log('..ActorDetail::postCreate', arguments);
			this.inherited(arguments);
		},

		/**
		 * Standaard widget functie.
		 * Opstarten van CrabWidget.
		 */
		startup: function () {
			console.log('..ActorDetail::startup', arguments);
			this.inherited(arguments);
			this._setCrabWidget();
		},

		/**
		 * CrabWidget opstarten.
		 * @private
		 */
		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

		/**
		 * Zet de detail data van de actor.
		 * @param {Object} actor
		 */
		setActor: function(actor) {
			this.naam.value = actor.naam;
			this.voornaam.value = actor.voornaam;
			var email = actor.emails.filter(function(email){
				return email.type.naam == "werk";
			});
			if (!email.length && actor.emails.length > 0) {
				email = actor.emails.slice(0, 1);
			}
			this.email.value  = email.length ? email[0].email : null;
			var telefoon = actor.telefoons.filter(function(telefoon) {
				return telefoon.type.naam == "werk"
			});
			if (!telefoon.length && actor.telefoons.length > 0) {
				telefoon = actor.telefoons.slice(0, 1);
			}
			this.telefoon.value  = telefoon.length ? telefoon[0].nummer : null;
			this.telefoonLandcode.value  = telefoon.length ? telefoon[0].landcode ? telefoon[0].landcode : null : null;
			actor.adres ? this._crabWidget.setValuesDisabled(actor.adres) :	this._crabWidget.setDisabled();
			this.actortype.value  = actor.type.naam;
			this.url.value  = actor.urls.length ? actor.urls[0].url ? actor.urls[0].url : null : null;
			this.actor = actor;
		},

		/**
		 * Event functie waarbij de zoek widget geopend wordt.
		 * @param {Event} evt
		 * @private
		 */
		_openSearch: function(evt) {
			evt.preventDefault();
			this.actorWidget.showSearch();
			this._reset();
		},

		/**
		 * Event functie waarbij de bewerk widget geopend wordt.
		 * @param {Event} evt
		 * @private
		 */
		_openEdit: function(evt) {
			evt.preventDefault();
			this.actorWidget.showEdit(this.actor);
			this._reset();
		},

		/**
		 * Reset functie van de detail widget.
		 * @private
		 */
		_reset: function() {
			this.naam.value = '';
			this.voornaam.value = '';
			this.email.value=  '';
			this.telefoon.value = '';
			this.telefoonLandcode.value = '';
			this._crabWidget.resetValues();
			this.actortype.value = "1";
		}
	});
});