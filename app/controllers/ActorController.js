/**
 * @module controllers/ActorController
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/request/xhr',
  'dojo/Deferred'
], function(
  declare,
  lang,
  xhr,
  Deferred
) {
  return declare(null, /** @lends module:controllers/ActorController# */ {

    actorStore: null,
    ssoToken: null,
    idserviceUrl: null,
    actorenUrl: null,
    _adresParameter: '/adressen',
    existsDialog: null,

    /**
     * Module die instaat voor de 'ajax calls' die naar de server gemaakt worden voor het ophalen van de Actoren.
     * @constructs
     * @param args Options
     */
    constructor: function (args) {
      declare.safeMixin(this, args);
    },

    /**
     * Geeft een bepaalde actor terug.
     * @param {number} id ID van de actor
     * @returns {Object} Actor met het meegegeven ID
     */
    getActor: function(id) {
      return this.actorStore.get(id);
    },

    /**
     * Slaagt een actor op in de datastore.
     * @param {Object} actor Actor dat moet worden opgeslagen
     * @returns {Boolean} (Promise) 'True' als de actor opgeslagen is, anders 'False'.
     */
    saveActor: function(actor) {
      if (!actor.id || actor.id.length == 0) {
        delete actor.id;
        return this.actorStore.add(actor);
      }
      else {
        return this.actorStore.put(actor);
      }
    },

    /**
     * Slaagt een adres van een actor op in de datastore.
     * @param {Object} adres Adres van actor dat moet worden opgeslagen
     * @param {number} actorId id van de actor waarvan het adres moet worden opgeslagen
     * @returns {Boolean} (Promise) 'True' als het adres van de actor opgeslagen is, anders 'False'.
     */
    saveActorAdres:function(adres, actorId) {
      var target = this.actorenUrl + actorId + this._adresParameter;
      console.log(JSON.stringify(adres));
      return xhr(target,{
        handleAs: "json",
        method:"POST",
        data: JSON.stringify(adres),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'OpenAmSSOID':this.ssoToken
        }
      });
    },

    // todo: fix function => PUT endpoint in service does not exist
    editActorAdres:function(adres, actorId) {
      var target = this.actorenUrl + actorId + this._adresParameter;
      return xhr(target,{
        handleAs: "json",
        method:"PUT",
        data: JSON.stringify(adres),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'OpenAmSSOID':this.ssoToken
        }
      });
    },

    deleteActorAdres:function(adresId, actorId) {
      var target = this.actorenUrl + actorId + this._adresParameter + "/" + adresId;
      return xhr(target,{
        handleAs: "json",
        method:"DELETE",
        headers: {
          'Accept': 'application/json',
          'OpenAmSSOID':this.ssoToken
        }
      });
    },

    /**
     * Kijkt of een actor via ElasticSearch kan gevonden worden.
     * @param {number} id ID van de actor
     * @returns {Boolean} (Promise) 'True' als de request een response met json body terug krijgt, anders 'False'.
     */
    checkActorInES: function(id)
    {
      return this.actorStore.query({'query': 'id:' + id});
    },

    gelijkaardigeActors: function (actor, adres) {
      var searchParameter = '?';
      if (actor.naam) searchParameter += ('naam=' + actor.naam);
      if (actor.voornaam) searchParameter += ('&voornaam=' + actor.voornaam);
      if (actor.emails && actor.emails.length > 0) searchParameter += ('&email=' + actor.emails[0].email);
      if (actor.telefoons && actor.telefoons.length > 0) searchParameter += ('&telefoon=' + actor.telefoons[0].landcode + actor.telefoons[0].nummer);
      if (actor.adres && actor.adres.length > 0) searchParameter += ('&gemeente=' + adres[0].gemeente);
      var target = this.actorStore.target + 'gelijkaardig' + searchParameter;
      console.log("check gelijkaardige", target);
      return xhr(target,{
        handleAs: "json",
        method:"GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'OpenAmSSOID':this.ssoToken
        }
      });
    },

    getActorByUri: function(actorUri) {
      return xhr.get(this.idserviceUrl + '/uris?uri=' + actorUri, {
        handleAs: 'json',
        headers: {
          'X-Requested-With': null,
          'Accept': 'application/json',
          'OpenAmSSOID': this.ssoToken
        }
      }).then(
        lang.hitch(this, function (redirect) {
          if (redirect.success && redirect.location) {
            return xhr.get(redirect.location, {
              handleAs: 'json',
              headers: {
                'X-Requested-With': null,
                'Accept': 'application/json',
                'OpenAmSSOID': this.ssoToken
              }
            });
          }
          else {
            return new Deferred().reject('Er is een probleem opgetreden tijdens de redirect van: ' + actorUri);
          }
        }),
        function (error) {
          console.error('error', error);
          return new Deferred().reject('Er is een probleem opgetreden tijdens de redirect van: ' + actorUri);
        }
      );
    },
  });
});