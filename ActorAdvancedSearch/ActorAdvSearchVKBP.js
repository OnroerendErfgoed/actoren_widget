define([
	'dojo/text!./../templates/ActorAdvancedSearch/ActorAdvSearchVKBP.html',
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
		searchWidget: null,

		postCreate: function() {
			console.log('...ActorAdvSearchVKBO::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
			console.log('...ActorAdvSearchVKBO::startup', arguments);
			this.inherited(arguments);
			this._setCrabWidget();
		},

		_setCrabWidget: function() {
			this._crabWidget = new CrabWidget({crabController: this.actorWidget.crabController}, this.crabWidget);
		},

		_findVKBP: function() {
			var query = this._getSearchParams();
			this._filterGrid(query);
			this._openSearch();
			this._reset();
		},

		_getSearchParams: function() {
			var query = {'type': 1};
			var searchParams = [
				'naam',
				'persid',
				'rrn'
			];
			searchParams.forEach(lang.hitch(this, function(param) {
				if (this[param].value) {
					query[param] = this[param].value;
				}
			}));
			var crabParams = this._crabWidget.getValues();
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

		_openSearch: function() {
			this.actorWidget.showSearch();
		},

		_reset: function(){
			this.naam.value = "";
			this._crabWidget.resetValues();
			this.persid.value = "";
			this.rrn.value = "";
		}
	});
});