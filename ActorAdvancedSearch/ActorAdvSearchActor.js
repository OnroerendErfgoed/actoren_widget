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
		searchWidget: null,


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
			new CrabWidget({crabController: this.searchWidget.crabController}, this.crabWidget).startup();
		},

		_findActoren: function() {
			var query = this._getSearchParams();
			this._filterGrid(query);
			this._showSearch();
		},

		_getSearchParams: function() {
			var query = {'organisatie': this.searchWidget.erfgoed_id};
			var searchParams = [
				'naam',
				'voornaam',
				'email',
				'telefoon',
				'straat',
				'nummer',
				'postbus',
				'gemeente',
				'land',
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
			var comboboxen = [{
				combobox: this._gemeenteCombobox,
				parameter: 'gemeente'
			}];
			comboboxen.forEach(lang.hitch(this, function(object) {
				if (object.combobox.value) {
					query[object.parameter] = object.combobox.value;
				}
			}));
			return query;
		},

		_filterGrid: function (query) {
			this.searchWidget.actorSearch.AdvSearchFilterGrid(query);
		},

		_showSearch: function() {
			this.searchWidget._showSearch();
		},

		_showVKBOSearch: function() {
			this.searchWidget.showVKBOSearch();
		},

		_showVKBPSearch: function() {
			this.searchWidget.showVKBPSearch();
		}
	});
});