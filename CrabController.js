define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Deferred',
	'dijit/_WidgetBase',
	'dojo/request/xhr'
], function(
	declare,
	lang,
	Deferred,
	_WidgetBase,
	xhr
) {
	return declare([_WidgetBase], {

		crabHost: null,


		postCreate: function() {
			console.log('..CrabController::postCreate', arguments);
			this.inherited(arguments);
		},

		startup: function () {
		},

		_crabGet: function(endpoint){
			return xhr(this.crabHost + endpoint, {
				methode: "GET",
				handleAs: "json",
				headers: {
					"X-Requested-With": "",
					"Content-Type": "application/json"
				}
			})
		},

		getGeementen: function(){
			var deferred = new Deferred();
			this._crabGet('crab/gewesten/1/gemeenten').
				then(lang.hitch(this, function(data) {
					var gemeenten = data;
					this._crabGet('crab/gewesten/2/gemeenten').
						then(lang.hitch(this, function(data) {
							gemeenten = gemeenten.concat(data);
							this._crabGet('crab/gewesten/3/gemeenten').
								then(lang.hitch(this, function(data) {
									gemeenten = gemeenten.concat(data);
									gemeenten.sort(this.compare);
									deferred.resolve(gemeenten);
								}))
						}))
				}));
			return deferred.promise;
		},

		getPostkantons: function(gemeente_id) {
			// nog niet op dev-geo.onroerenderfgoed.be
			return this._crabGet("crab/gemeenten/" + gemeente_id + "/postkantons");
		},

		getStraten: function(gemeente_id) {
			return this._crabGet("crab/gemeenten/" + gemeente_id + "/straten");
		},

		getNummers: function(straat_id) {
			return this._crabGet("crab/straten/" + straat_id + "/huisnummers");
		},

		compare: function(a,b) {
			if (a.naam < b.naam)
				return -1;
			if (a.naam > b.naam)
				return 1;
			return 0;
		}

	});
});