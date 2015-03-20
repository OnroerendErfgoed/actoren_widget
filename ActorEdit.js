define([
  'dojo/text!./templates/ActorEdit.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/store/Memory',
  'dijit/form/ComboBox'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  Memory,
  ComboBox
) {
  return declare([_WidgetBase, _TemplatedMixin], {

	templateString: template,
	baseClass: 'actor-widget',
	widgetsInTemplate: true,
	actor: null,
	actorWidget: null,
  _telefoonLandcodeSelect: null,


	postCreate: function() {
	  console.log('..ActorEdit::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('..ActorEdit::startup', arguments);
	  this.inherited(arguments);
    this._setTelefoonLandcodes();
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
	  this._telefoonLandcodeSelect.set('value',telefoon_landcode);
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
	},
	_openDetail: function() {
	  this.actorWidget.showDetail(this.actor);
	},

  _setTelefoonLandcodes: function() {
    var countryCodeStore = new Memory({
      data: [
        {name:"+32",  id:"32",  label:"<span class='flag be'>België (+32)</span>"},
        {name:"+49",  id:"49",  label:"<span class='flag de'>Duitsland (+49)</span>"},
        {name:"+33",  id:"33",  label:"<span class='flag fr'>Frankrijk (+33)</span>"},
        {name:"+44",  id:"44",  label:"<span class='flag gb'>Groot-Brittannië (+44)</span>"},
        {name:"+31",  id:"31",  label:"<span class='flag nl'>Nederland (+31)</span>"},
        {name:"+352", id:"352", label:"<span class='flag lu'>Luxemburg (+352)</span>"}
      ]
    });

    this._telefoonLandcodeSelect = new ComboBox({
      store: countryCodeStore,
      value: "+32",
      hasDownArrow: true,
      searchAttr: "name",
      autoComplete: false,
      required: false,
      class: "combo-dropdown",
      labelAttr: "label",
      labelType: "html"
    }, this.telefoonLandcode);
  }
  });
});
