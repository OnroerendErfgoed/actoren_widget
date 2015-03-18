define([
  'dojo/text!./templates/ActorWidget.html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  './ActorController',
  './ActorSearch',
  './ActorDetail',
  './ActorEdit',
  './ActorAdvancedSearch',
  'dijit/layout/StackContainer'
], function (
    template,
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
	ActorController,
    ActorSearch,
	ActorDetail,
	ActorEdit,
	ActorAdvancedSearch
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'actor-widget',
    widgetsInTemplate: true,
	baseUrl: null,
	actorController: null,

    _actorSearch: null,

    postCreate: function () {
      this.inherited(arguments);
      console.log('ActorWidget::postCreate', arguments);

      this._setupLayout();
	  this.actorController = new ActorController({baseUrl: this.baseUrl});

	  this.on('send.actor', function(evt){
		console.log('send.actor');
		console.log(evt.actor);
	  });
    },

    startup: function () {
      this.inherited(arguments);
      console.log('ActorWidget::startup', arguments);
	  this.showSearch();
    },

    showSearch: function () {
	  this.actorStackContainer.addChild(this._actorSearch);
	  this.actorStackContainer.removeChild(this._actorDetail);
	  this.actorStackContainer.removeChild(this._actorEdit);
	  this.actorStackContainer.removeChild(this._actorAdvancedSearch);
      this.actorStackContainer.selectChild(this._actorSearch);
    },

    showDetail: function (actor) {
	  this.actorStackContainer.addChild(this._actorDetail);
	  this._actorDetail.setActor(actor);
	  this.actorStackContainer.removeChild(this._actorSearch);
	  this.actorStackContainer.removeChild(this._actorAdvancedSearch);
      this.actorStackContainer.selectChild(this._actorDetail);
    },

    showEdit: function (actor) {
	  this.actorStackContainer.addChild(this._actorEdit);
	  this._actorEdit.setActor(actor);
	  this.actorStackContainer.removeChild(this._actorSearch);
	  this.actorStackContainer.removeChild(this._actorAdvancedSearch);
      this.actorStackContainer.selectChild(this._actorEdit);
    },

    showAdvancedSearch: function () {
      this.actorStackContainer.addChild(this._actorAdvancedSearch);
      this.actorStackContainer.removeChild(this._actorSearch);
      this.actorStackContainer.selectChild(this._actorAdvancedSearch);
    },

    _setupLayout: function() {
	  // probleem: Wanneer meerdere widgets aan de stackcontainer worden toegevoegd worden deze beide getoond
      this._actorSearch = new ActorSearch({actorWidget: this});
      this._actorDetail = new ActorDetail({actorWidget: this});
      this._actorEdit = new ActorEdit({actorWidget: this});
      this._actorAdvancedSearch = new ActorAdvancedSearch({actorWidget: this});
    },

	emitActor: function(actor) {
	 this.emit('send.actor', {actor: actor})
	}

  });
});
