define([
  'dojo/text!./../templates/ActorCreate/ActorCreateActor.html',
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
	actor: null,
	createWidget: null,


	postCreate: function() {
	  console.log('...ActorCreateActor::postCreate', arguments);
	  this.inherited(arguments);
	},

	startup: function () {
	  console.log('...ActorCreateActor::startup', arguments);
    this.inherited(arguments);
    this._setTelefoonLandcodes();
	},

	_setTelefoonLandcodes: function() {
    var countryCodeStore = new Memory({
      data: [
        {name:"België (+32)", id:"32"},
        {name:"Duitsland (+49)", id:"49"},
        {name:"Frankrijk (+33)", id:"33"},
        {name:"Groot-Brittannië (+44)", id:"44"},
        {name:"Nederland (+31)", id:"31"},
        {name:"Luxemburg (+352)", id:"352"}
      ]
    });

    new ComboBox({
      store: countryCodeStore,
      value: "België (+32)",
      hasDownArrow: false,
      searchAttr: "name",
      autoComplete: false,
      required: false
    }, this.telefoonLandcode);
	},

	_openSearch: function() {
	  this.createWidget._showSearch();
	},

	_showActorCreateVKBO: function() {
	  this.createWidget.showActorCreateVKBO();
	},

	_showActorCreateVKBP: function() {
	  this.createWidget.showActorCreateVKBP();
	}
  });
});
