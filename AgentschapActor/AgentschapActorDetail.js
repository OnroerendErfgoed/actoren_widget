define([
  'dojo/text!./../templates/AgentschapActor/AgentschapActorDetail.html',
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
	  var email_adres = null;
	  actor.emails.forEach(function(email) {
		if (email.type.naam == "werk"){
		  email_adres = email.email;
		}
	  });
	  if (!email_adres && actor.emails.length > 0) {
		email_adres = actor.emails[0].email;
	  }
	  this.email.value  = email_adres;
	  var telefoon_nummer = null;
	  var telefoon_landcode = null;
	  actor.telefoons.forEach(function(telefoon) {
		if (telefoon.type.naam == "werk"){
		  telefoon_nummer = telefoon.nummer;
		  telefoon_landcode = telefoon.landcode ? telefoon.landcode : null;
		}
	  });
	  if (!telefoon_nummer && actor.telefoons.length > 0) {
		  telefoon_nummer = actor.telefoons[0].nummer;
		  telefoon_landcode = telefoon.landcode ? telefoon.landcode : null;
	  }
	  this.telefoon.value  = telefoon_nummer;
	  this.telefoonLandcode.value  = telefoon_landcode;
	  this.straat.value  = actor.adres ? actor.adres.straat : null;
	  this.nummer.value  = actor.adres ? actor.adres.huisnummer : null;
	  this.postcode.value  = actor.adres ? actor.adres.postcode : null;
	  this.gemeente.value  = actor.adres ? actor.adres.gemeente : null;
	  this.land.value  = actor.adres ? actor.adres.land : null;
	  this.actortype.value  = actor.type.naam;
	  this.actor = actor;
	},
	_openSearch: function() {
	  this.actorWidget.showSearch();
	}
  });
});
