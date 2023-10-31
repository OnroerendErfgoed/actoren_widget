define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/dom-style',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/text!./templates/ViewActorDialog.html'
], function (
  declare,
  array,
  domClass,
  domConstruct,
  domAttr,
  domStyle,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Dialog,
  template
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    parentNode: null,
    baseClass: 'view-actor-dialog',
    title: 'Actor',
    actorenUrl: null,
    actor: null,

    postCreate: function () {
      this.inherited(arguments);
    },

    startup: function () {
      this.inherited(arguments);
    },

    show: function (actor) {
      /* jshint maxcomplexity:20 */
      console.debug('ActorBekijkenDialog::show', actor);
      this.actor = actor;
      this.set('title', 'Actor \\ ID ' + actor.id);
      const href = `${this.actorenUrl}/actoren/${actor.id}`;
      domAttr.set(this.actorLink, 'href', href);

      this._changedActorType(actor.type);

      this.naamInput.value = actor.naam || '';
      if (actor.voornaam) {
        this.vnafkInput.value = actor.voornaam;
      } else if (actor.afkorting) {
        this.vnafkInput.value = actor.afkorting;
      }
      array.forEach(actor.emails, function (email){
        this._createListItem(email.email, email.type.naam, this.emailList);
      }, this);
      array.forEach(actor.telefoons, function (telefoon){
        /* jshint -W106 */
        this._createListItem(telefoon.volledig_nummer, telefoon.type.naam, this.telefoonList);
        /* jshint +W106 */
      }, this);

      const {adres} = actor;
      if (adres) {
        this.landInput.value = adres.land && adres.land.naam || '';
        this.gemeenteInput.value = adres.gemeente && adres.gemeente.naam || '';
        this.postcodeInput.value = adres.postcode && adres.postcode.nummer || '';
        this.straatInput.value = adres.straat && adres.straat.naam || '';
        this.huisnummerInput.value = adres.adres && adres.adres.huisnummer || '';
        this.postbusInput.value = adres.adres&& adres.adres.busnummer || '';
        this.adresTypeInput.value = adres.adrestype.naam || '';
      }

      const kbos = array.filter(actor.ids, function (actorId) {
        return actorId.type && actorId.type.id === 6;
      });
      if (kbos.length > 0) {
        /* jshint -W106 */
        this.kboInput.value = kbos[0].extra_id;
        /* jshint +W106 */
      }

      array.forEach(actor.urls, function (url){
        this._createListItem(url.url, url.type.naam, this.urlList);
      }, this);

      this.inherited(arguments);
    },

    hide: function () {
      console.debug('ActorBekijkenDialog::hide');
      this._reset();
      this.inherited(arguments);
    },

    _closeDialog: function(evt) {
      evt ? evt.preventDefault() : null;
      this.hide();
    },

    _reset: function () {
      console.debug('ActorBekijkenDialog::_reset');
      this.naamInput.value = '';
      this.vnafkInput.value = '';
      domConstruct.empty(this.emailList);
      domConstruct.empty(this.telefoonList);

      this.landInput.value = '';
      this.gemeenteInput.value = '';
      this.postcodeInput.value = '';
      this.straatInput.value = '';
      this.huisnummerInput.value = '';
      this.postbusInput.value = '';
      this.adresTypeInput.value = '';

      this.actorTypeInput.value = '';
      this.kboInput.value = '';
      domConstruct.empty(this.urlList);
    },

    _createListItem: function(value, type, ullist) {
      domConstruct.create('li', {
        innerHTML: value + ' (' + type + ')'
      }, ullist);
    },

    _changedActorType: function(type) {
      console.debug('ViewActorDialog::_changedActorType', type);
      this.actorTypeInput.value = type.naam || '';

      switch (type.id.toString()) {
        case '1':
          this.kboInput.value = '';
          domClass.add(this.kboContainer, 'hide');
          this.vnAfkLabel.innerHTML = 'Voornaam';
          domClass.remove(this.vnafkNode, 'hide');
          break;
        case '2':
          domClass.remove(this.kboContainer, 'hide');
          this.vnAfkLabel.innerHTML = 'Afkorting';
          domClass.remove(this.vnafkNode, 'hide');
          break;
        case '4':
          this.kboInput.value = '';
          domClass.add(this.kboContainer, 'hide');
          this.vnafkInput.value = '';
          domClass.add(this.vnafkNode, 'hide');
          break;
      }
    }
  });
});
