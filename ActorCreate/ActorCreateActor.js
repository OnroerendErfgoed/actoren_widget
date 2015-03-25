define([
  'dojo/text!./../templates/ActorCreate/ActorCreateActor.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/store/Memory',
  'dijit/form/ComboBox',
	'../CrabWidget'
], function(
  template,
  declare,
  _WidgetBase,
  _TemplatedMixin,
  Memory,
  ComboBox,
	CrabWidget
) {
  return declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    actor: null,
		actorWidget: null,
		actorAdvancedSearch : null,
    _telefoonLandcodeSelect: null,


    postCreate: function() {
      console.log('...ActorCreateActor::postCreate', arguments);
      this.inherited(arguments);
    },

    startup: function () {
      console.log('...ActorCreateActor::startup', arguments);
      this.inherited(arguments);
      this._setTelefoonLandcodes();
			this._setCrabWidget();
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
        style: "width: 30%; float: left; padding-left: 10px;",
        labelAttr: "label",
        labelType: "html"
      }, this.telefoonLandcode);
    },

		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

    _openSearch: function() {
      this.actorAdvancedSearch._showSearch();
    },

    _showActorSearch: function() {
      this.actorAdvancedSearch._showActorSearch();
    },

		_reset: function(){
			this.naam.value = "";
			this._crabWidget.resetValues();
			this.persid.value = "";
			this.rrn.value = "";
		}
  });
});
