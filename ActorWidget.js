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
  './ActorAdvancedSearch/ActorAdvancedSearch',
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
	erfgoed_id: null,

    _actorSearch: null,

    postCreate: function () {
      this.inherited(arguments);
      console.log('ActorWidget::postCreate', arguments);

	  this.actorController = new ActorController({baseUrl: this.baseUrl});
	  this._setupLayout();

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
      this.actorStackContainer.selectChild(this._actorSearch);
    },

    showDetail: function (actor) {
	  this._actorDetail.setActor(actor);
      this.actorStackContainer.selectChild(this._actorDetail);
    },

    showEdit: function (actor) {
	  this._actorEdit.setActor(actor);
      this.actorStackContainer.selectChild(this._actorEdit);
    },

    showAdvancedSearch: function () {
      this.actorStackContainer.selectChild(this._actorAdvancedSearch);
    },

    _setupLayout: function() {
      this._actorSearch = new ActorSearch({actorWidget: this});
	  this.actorStackContainer.addChild(this._actorSearch);
      this._actorDetail = new ActorDetail({actorWidget: this});
	  this.actorStackContainer.addChild(this._actorDetail);
      this._actorEdit = new ActorEdit({actorWidget: this});
	  this.actorStackContainer.addChild(this._actorEdit);
      this._actorAdvancedSearch = new ActorAdvancedSearch({actorWidget: this});
	  this.actorStackContainer.addChild(this._actorAdvancedSearch );

    },

	emitActor: function(actor) {
	 this.emit('send.actor', {actor: actor})
	}

  });
});
