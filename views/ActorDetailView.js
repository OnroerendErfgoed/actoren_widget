/**
 * Widget om een actor gedetaileerd weer te geven.
 * @module Actor/actorWidgets/actorDetail/ActorDetail
 */
define([
  'dojo/text!./templates/ActorDetailView.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/dom-construct',
  'dojo/_base/lang',
  '../widgets/CrabWidget'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  domConstruct,
  lang,
  CrabWidget
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,
    actor: null,
    actorWidget: null,
    _index: 100,

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
      this._setSecurity();
    },

    _setSecurity: function() {
      if (!this.actorWidget.canEditActor) {
        this.editButton.style.display = 'none';
      }
    },

    /**
     * CrabWidget opstarten.
     * @private
     */
    _setCrabWidget: function() {
      this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController, actorWidget: this.actorWidget}, this.crabWidget);
    },

    /**
     * Zet de detail data van de actor.
     * @param {Object} actor
     */
    setActor: function(actor) {
      this._reset();
      this.naam.value = actor.naam;
      this.voornaam.value = actor.voornaam;
      if (actor.emails) {
        var email = actor.emails.filter(function (email) {
          return email.type.naam == "werk";
        });
        if (!email.length && actor.emails.length > 0) {
          email = actor.emails.slice(0, 1);
        }
        this.email.value = email.length ? email[0].email : null;

        actor.emails.forEach(lang.hitch(this, function(email) {
          this._index++;
          email['id'] = this._index.toString();
          var type = this.actorWidget.typeLists.emailTypes.filter(lang.hitch(this, function(type) {
            return (type.id == email.type.id);
          }));
          this._createListItem(this._index, email.email, type[0].naam, this.emaillistDetail);
        }));
      }

      if (actor.telefoons) {
        var telefoon = actor.telefoons.filter(function (telefoon) {
          return telefoon.type.naam == "werk"
        });
        if (!telefoon.length && actor.telefoons.length > 0) {
          telefoon = actor.telefoons.slice(0, 1);
        }
        actor.telefoons.forEach(lang.hitch(this, function(telefoon) {
          this._index++;
          telefoon['id'] = this._index.toString();
          var type = this.actorWidget.typeLists.telephoneTypes.filter(lang.hitch(this, function(type) {
            return (type.id == telefoon.type.id);
          }));
          var telefoonvalue = telefoon.landcode ? telefoon.landcode + telefoon.nummer : '+32' + telefoon.nummer;
          this._createListItem(this._index, telefoonvalue, type[0].naam, this.telefoonlistDetail);
        }));
      }

      if (actor.urls) {
        actor.urls.forEach(lang.hitch(this, function (url) {
          this._index++;
          url['id'] = this._index.toString();
          var type = this.actorWidget.typeLists.urlTypes.filter(lang.hitch(this, function (type) {
            return (type.id == url.type.id);
          }));
          this._createListItem(this._index, url.url, type[0].naam, this.urllistDetail);
        }));
      }

      if (telefoon) {
        this.telefoon.value = telefoon.length ? telefoon[0].nummer : null;
        this.telefoonLandcode.value = telefoon.length ? telefoon[0].landcode ? telefoon[0].landcode : null : null;
      }
      actor.adres ? this._crabWidget.setValuesDisabled(actor.adres) :	this._crabWidget.setDisabled();
      actor.adressen ? this._crabWidget.setValuesListDisabled(actor.adressen) : this._crabWidget.setDisabled();
      this.actortype.value  = actor.type.naam;
      if (actor.urls) {
        this.url.value = actor.urls.length ? actor.urls[0].url ? actor.urls[0].url : null : null;
      }
      this.actor = actor;
    },

    _openActorEdit: function(evt) {
      evt.preventDefault();
      this.actorWidget.showActorEdit(this.actor);
    },

    /**
     * Toevoegen van een waarde met type aan een list (ul html element), voorzien van een verwijder functie (verwijderen uit de lijst).
     * @param {number} id Deze id wordt gebruikt in de aanmaakt van het element en wordt doorgegeven aan de verwijder functie.
     * @param {string} value De waarde van het toe te voegen element.
     * @param {string} type De waarde van het type van het toe te voegen element.
     * @param {Object} ullist Het ul html element waaraan de waarde toegevoegd moet worden.
     * @param {function} removeFunction Een extra verwijder functie met als doel deze te verwijderen uit de attribuut l
     * @private
     */
    _createListItem: function(id, value, type, ullist) {
      id = id.toString();
      domConstruct.create("li", {id: "li" + id, innerHTML: '<small>' + value + ' (' + type + ')</small>'}, ullist);
    },

    /**
     * Reset functie van de detail widget.
     * @private
     */
    _reset: function() {
      domConstruct.empty(this.emaillistDetail);
      domConstruct.empty(this.telefoonlistDetail);
      domConstruct.empty(this.urllistDetail);
      this.naam.value = '';
      this.voornaam.value = '';
      this.email.value=  '';
      this.telefoon.value = '';
      this.telefoonLandcode.value = '';
      this._crabWidget.resetValues();
      this.actortype.value = '';
      this.actor = null;
    }
  });
});
