define([
	'dojo/text!./templates/ActorWidget.html',
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'./ActorController',
  './CrabController',
	'./ActorSearch',
	'./ActorDetail',
	'./ActorEdit',
	'./ActorAdvancedSearch/ActorAdvancedSearch',
	'./ActorAdvancedSearch/ActorAdvSearchVKBO',
	'./ActorAdvancedSearch/ActorAdvSearchVKBP',
	'dijit/Dialog',
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
	ActorAdvancedSearch,
	ActorAdvSearchVKBO,
	ActorAdvSearchVKBP,
	Dialog
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		baseUrl: null,
		actorController: null,
		erfgoed_id: null,
		crabHost: null,

		_actorSearch: null,

		postCreate: function () {
			this.inherited(arguments);
			console.log('ActorWidget::postCreate', arguments);

			this.actorController = new ActorController({baseUrl: this.baseUrl});
			this.crabController = new CrabController({crabHost: this.crabHost});
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
			this._actorAdvancedSearchDialog ? this._actorAdvancedSearchDialog.hide() : null;
			this._actorSearchVKBODialog ? this._actorSearchVKBODialog.hide() : null;
			this._actorSearchVKBPDialog ? this._actorSearchVKBPDialog.hide() : null;
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
			var actorAdvancedSearchContent =  new ActorAdvancedSearch({actorWidget: this});
			this._actorAdvancedSearchDialog = this.createDialog(actorAdvancedSearchContent);
			this._actorAdvancedSearchDialog.show();
		},

		showVKBOSearch: function () {
			var actorSearchVKBOContent =  new ActorAdvSearchVKBO({actorWidget: this});
			this._actorSearchVKBODialog = this.createDialog(actorSearchVKBOContent);
			this._actorSearchVKBODialog.show();
		},

		showVKBPSearch: function () {
			var actorSearchVKBPContent =  new ActorAdvSearchVKBP({actorWidget: this});
			this._actorSearchVKBPDialog = this.createDialog(actorSearchVKBPContent);
			this._actorSearchVKBPDialog.show();
		},

		_setupLayout: function() {
			this._actorSearch = new ActorSearch({actorWidget: this});
			this._actorDetail = new ActorDetail({actorWidget: this});
			this._actorEdit = new ActorEdit({actorWidget: this});

			this.actorStackContainer.addChild(this._actorSearch);
			this.actorStackContainer.addChild(this._actorDetail);
			this.actorStackContainer.addChild(this._actorEdit);

		},

		createDialog: function (content) {
			return new Dialog({
				content: content,
				style: "width: 1000px; height: 500px"
			});

		},

		emitActor: function(actor) {
			this.emit('send.actor', {actor: actor});
		}

	});
});
