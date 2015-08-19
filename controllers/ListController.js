/**
 * @module controllers/ListController
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/request/xhr',
  'dojo/store/Memory'

], function (
  declare,
  lang,
  Deferred,
  xhr,
  Memory
) {
  return declare(null, {

    _stores: null,
    actorUrl: null,
    ssoToken: null,

    constructor:function(args) {
      declare.safeMixin(this, args);
      console.debug('ListController::constructor');
      this._stores = {};
      this.schemeIds = {
        actortypes: "actor_types",
        adrestypes: "adres_types",
        emailtypes: "email_types",
        telefoontypes: "telephone_types",
        urltypes: "url_types"
      };
    },

    getStore: function (schemeId) {
      var deferred = new Deferred();

      //check if schemeid is valid
      if(!(schemeId in this.schemeIds)) {
        console.error("Unknown scheme id: ", schemeId);
        deferred.reject("Ongekend scheme id: " + schemeId);
        return deferred;
      }

      //check if store has been cached already
      if(schemeId in this._stores){
        deferred.resolve(this._stores[schemeId]);
      } else {
        xhr.get(this.actorUrl + this.schemeIds[schemeId], {
          handleAs: 'json',
          headers:{'Content-Type': 'application/json', 'Accept': 'application/json', 'OpenAmSSOID': this.ssoToken }
        }).then(
          lang.hitch(this,function(data){
            this._stores[schemeId] = new Memory({data:data});
            deferred.resolve(this._stores[schemeId]);
          }),
          function(err){
            deferred.reject(err);
          }
        );
      }
      return deferred;
    }

  })
});