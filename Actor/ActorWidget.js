define([
	'dojo/text!./templates/ActorWidget.html',
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'../controllers/ActorController',
	'../controllers/CrabController',
	'./actorWidgets/ActorSearch',
	'./actorWidgets/actorDetail/ActorDetail',
	'./actorWidgets/actorDetail/ActorEdit',
	'./ActorAdvSearchUI',
	'./actorWidgets/actorAdvSearch/ActorAdvSearchVKBO',
	'./actorWidgets/actorAdvSearch/ActorAdvSearchVKBP',
	'dijit/layout/StackContainer'
], function (
	template,
	declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	ActorController,
	CrabController,
	ActorSearch,
	ActorDetail,
	ActorEdit,
	ActorAdvSearchUI,
	ActorAdvSearchVKBO,
	ActorAdvSearchVKBP
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		actorWijStore: null,
		actorStore: null,
		actorController: null,
		erfgoed_id: null,
		crabHost: null,
		permissionToAdd: false,
		permissionToEdit: false,

		_actorSearch: null,

		postCreate: function () {
			this.inherited(arguments);
			console.log('ActorWidget::postCreate', arguments);

			this.actorController = new ActorController({
				actorWijStore: this.actorWijStore,
				actorStore: this.actorStore
			});
			this.crabController = new CrabController({crabHost: this.crabHost});
			this._setupLayout();

			this.on('send.actor', function(evt){
				console.log('send.actor', evt.actor);
			});
			this.on('error', function(evt){
				console.log('error', evt.error);
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

		showActorSearch: function () {
			this.actorStackContainer.selectChild(this._ActorAdvSearchUI);
		},

		showVKBOSearch: function () {
			this.actorStackContainer.selectChild(this._actorSearchVKBO);
		},

		showVKBPSearch: function () {
			this.actorStackContainer.selectChild(this._actorSearchVKBP);
		},

		_setupLayout: function() {
			this._actorSearch = new ActorSearch({actorWidget: this});
			this._actorDetail = new ActorDetail({actorWidget: this});

			this.actorStackContainer.addChild(this._actorSearch);
			this.actorStackContainer.addChild(this._actorDetail);

			this._ActorAdvSearchUI =  new ActorAdvSearchUI({actorWidget: this});
			this._actorSearchVKBO =  new ActorAdvSearchVKBO({actorWidget: this});
			this._actorSearchVKBP =  new ActorAdvSearchVKBP({actorWidget: this});

			this.actorStackContainer.addChild(this._ActorAdvSearchUI);
			this.actorStackContainer.addChild(this._actorSearchVKBO);
			this.actorStackContainer.addChild(this._actorSearchVKBP);

			if (this.permissionToEdit) {
				this._actorEdit = new ActorEdit({actorWidget: this});
				this.actorStackContainer.addChild(this._actorEdit);
			}
			else {
				this._actorDetail.headerButtons.style.display = 'none';
				this._actorDetail.headerText.innerHTML = 'Actor detail';
			}
		},

		emitActor: function(actor) {
			this.emit('send.actor', {actor: actor});
		},
		emitError: function(evt) {
			this.emit('error', evt);
		}

	});
});
