/**
 * @module controllers/AuthorisationController
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/request"
	],
	function (declare, lang, array, request) {
		return declare (null, /** @lends module:controllers/AuthorisationController# */{

			user: null,
			applicationName:null,
			applicationPrefix:null,

			/**
			 * Module die instaat voor de toegangscontrole en rechten van de gebruikers.
			 * @constructs
			 * @param args Options
			 */
			constructor: function (/*Object*/ args) {
				declare.safeMixin(this, args);
				request.get(
					'/user',
					{'handleAs': 'json', sync: true}
				).then(lang.hitch(this, function (user) {
						//console.debug('USER: ' + user.userid);
						this.user = user;
					}));
			},
			/**
			 * Zet de ApplicationPrefix.
			 * @param prefix {string} Nieuwe prefix voor de ApplicationPrefix.
			 * @public
			 */
			setApplicationPrefix:function(prefix)
			{
				this.applicationPrefix=prefix;
			},

			/**
			 * Geeft aan of de gebruiker de 'lezer' rol heeft.
			 * @returns {Boolean} 'True' als de gebruiker een 'lezer' is, anders 'False'.
			 * @private
			 */
			_isLezer: function () {
				return array.indexOf(this.user.groups, this.applicationPrefix+'lezer') > -1;
			},

			/**
			 * Geeft aan of de gebruiker de 'beperkt-lezer' rol heeft.
			 * @returns {Boolean} 'True' als de gebruiker een 'beperkt-lezer' is, anders 'False'.
			 * @private
			 */
			_isBeperktLezer: function () {
				return array.indexOf(this.user.groups, this.applicationPrefix+'beperkt-lezer') > -1;
			},

			/**
			 * Geeft aan of de gebruiker de 'toevoeger' rol heeft.
			 * @returns {Boolean} 'True' als de gebruiker een 'toevoeger' is, anders 'False'.
			 * @private
			 */
			_isToevoeger: function () {
				return array.indexOf(this.user.groups, this.applicationPrefix+'toevoeger') > -1;
			},

			/**
			 * Geeft aan of de gebruiker de 'invoerder' rol heeft.
			 * @returns {Boolean} 'True' als de gebruiker een 'invoerder' is, anders 'False'.
			 * @private
			 */
			_isInvoerder: function () {
				return array.indexOf(this.user.groups, this.applicationPrefix+'invoerder') > -1;
			},

			/**
			 * Geeft aan of de gebruiker de 'beheerder' rol heeft.
			 * @returns {Boolean} 'True' als de gebruiker een 'beheerder' is, anders 'False'.
			 * @private
			 */
			_isBeheerder: function () {
				return array.indexOf(this.user.groups, this.applicationPrefix+'beheerder') > -1;
			},

			/**
			 * Geeft de gebruikersnaam van de gebruiker terug.
			 * @returns {string} Naam van de gebruiker.
			 * @public
			 */
			getUserName: function () {
				return this.user.userid || "(niet ingelogd)";
			},

			/**
			 * Geeft de rol van de gebruiker terug.
			 * @returns {string} Rol van de gebruiker.
			 * @public
			 */
			getRole: function () {
				if (this._isBeheerder()) {
					return "beheerder";
				}
				else if (this._isInvoerder()) {
					return "invoerder";
				}
				else if (this._isToevoeger()) {
					return "toevoeger";
				}
				else if (this._isLezer()) {
					return "lezer";
				}
				else if (this._isBeperktLezer()) {
					return "lezer";
				}
				else return "stouterik";
			},

			/**
			 * Geeft aan of een gebruiker alle actoren kan lezen of enkel diegene van het agentschap.
			 * @returns {Boolean} 'True' als gebruiker items kan lezen, anders 'False'.
			 * @public
			 */
			canViewAll: function () {
				return (
				this._isBeheerder() ||
				this._isInvoerder() ||
				this._isToevoeger() ||
				this._isLezer()
				);
			},

			/**
			 * Geeft aan of een gebruiker items kan toevoegen.
			 * @returns {Boolean} 'True' als gebruiker items kan toevoegen, anders 'False'.
			 * @public
			 */
			canAddItem: function () {
				return (
				this._isBeheerder() ||
				this._isInvoerder() ||
				this._isToevoeger()
				);
			},

			/**
			 * Geeft aan of een gebruiker alle items kan bewerken.
			 * @returns {Boolean} 'True' als gebruiker items kan bewerken, anders 'False'.
			 * @public
			 */
			canEditAllItem: function () {
				return (
				this._isBeheerder() ||
				this._isInvoerder()
				);
			},

			/**
			 * Geeft aan of een gebruiker een bepaalde item kan bewerken.
			 * @param {Object} item Item die gebruiker wilt bewerken.
			 * @returns {Boolean} 'True' als gebruiker de item kan bewerken, anders 'False'.
			 * @public
			 */
			canEditItem: function (item) {
				return (
				this._isBeheerder() ||
				this._isInvoerder() ||
				(this._isToevoeger() && item.status.status.id === 10)
				);
			}
		});
	});
