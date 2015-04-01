define([
	'dojo/text!./../templates/ActorAdvancedSearch/ActorAdvSearchActor.html',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'../CrabWidget'
], function(
	template,
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	CrabWidget
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		baseClass: 'actor-widget',
		widgetsInTemplate: true,
		crabWidget: null,
		actorWidget: null,
		actorAdvancedSearch : null,


		postCreate: function() {
			this.inherited(arguments);
			console.log('...ActorAdvSearchActor::postCreate', arguments);
		},

		startup: function () {
			this.inherited(arguments);
			console.log('...ActorAdvSearchActor::startup', arguments);
			this._setCrabWidget();
		},

		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

		_findActoren: function() {
			var query = this._getSearchParams();
			this._filterGrid(query);
			this._openSearch();
			this._reset();
		},

		_getSearchParams: function() {
			var query = {};
			var searchParams = [
				'naam',
				'voornaam',
				'email',
				'telefoon',
				'type',
				'persid',
				'rrn',
				'kbo'
			];
			searchParams.forEach(lang.hitch(this, function(param) {
				if (this[param].value) {
					query[param] = this[param].value;
				}
			}));
			var crabParams = this._crabWidget.getInput().values;
			Object.keys(crabParams).forEach(function(param){
				if(crabParams[param]) {
					query[param] = crabParams[param];
				}
			});
			return query;
		},

		_filterGrid: function (query) {
			this.actorWidget._actorSearch.AdvSearchFilterGrid(query);
		},

		_openSearch: function(evt) {
			evt.preventDefault();
			this.actorAdvancedSearch._showSearch();
			this._reset();
		},

		_showActorCreate: function(evt) {
			evt.preventDefault();
			this.actorAdvancedSearch._showActorCreate();
		},

		_reset: function(){
			this.naam.value = '';
			this.voornaam.value = '';
			this.email.value=  '';
			this.telefoon.value = '';
			this._crabWidget.resetValues();
			this.type.value = "1";
			this.persid.value = "";
			this.rrn.value = "";
			this.kbo.value = "";
		}
	});
});