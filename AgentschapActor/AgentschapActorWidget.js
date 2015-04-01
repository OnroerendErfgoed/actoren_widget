define([
	'dojo/text!templates/AgentschapActorWidget.html',
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'./../controllers/ActorController',
	'./AgentschapActorSearch',
	'./AgentschapActorDetail',
	'dijit/layout/StackContainer'
], function (
	template,
	declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ActorController,
  AgentschapActorSearch,
  AgentschapActorDetail
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actorWijStore: null,
    actorStore: null,
		actorController: null,
		_actorSearch: null,

		postCreate: function () {
			this.inherited(arguments);
			console.log('ActorWidget::postCreate', arguments);

			this.actorController = new ActorController({
        actorWijStore: this.actorWijStore,
        actorStore: this.actorStore
      });
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

		_setupLayout: function() {
			this._actorSearch = new AgentschapActorSearch({actorWidget: this});
			this._actorDetail = new AgentschapActorDetail({actorWidget: this});
      this.actorStackContainer.addChild(this._actorSearch);
      this.actorStackContainer.addChild(this._actorDetail);
		},

		emitActor: function(actor) {
			this.emit('send.actor', {actor: actor});
		}

	});
});
