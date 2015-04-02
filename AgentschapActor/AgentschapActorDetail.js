define([
  'dojo/text!./templates/AgentschapActorDetail.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,
    actor: null,
    actorWidget: null,


    postCreate: function() {
      console.log('..ActorDetail::postCreate', arguments);
      this.inherited(arguments);
    },

    startup: function () {
      console.log('..ActorDetail::startup', arguments);
      this.inherited(arguments);
    },

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
      this.straat.value  = actor.adres ? actor.adres.straat : null;
      this.nummer.value  = actor.adres ? actor.adres.huisnummer : null;
      this.postcode.value  = actor.adres ? actor.adres.postcode : null;
      this.gemeente.value  = actor.adres ? actor.adres.gemeente : null;
      this.land.value  = actor.adres ? actor.adres.land : null;
      this.actortype.value  = actor.type.naam;
      this.url.value = actor.urls.length ? actor.urls[0].url ? actor.urls[0].url : null : null;
      this.actor = actor;
    },
    _openSearch: function(evt) {
			evt.preventDefault();
      this.actorWidget.showSearch();
    }
  });
});
