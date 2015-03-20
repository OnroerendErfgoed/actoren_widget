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
				//in afwachting op 'Access-Control-Allow-Origin' header op "https://dev-actoren.onroerenderfgoed.be/actoren/"
				//withCredentials: true,
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
			//in afwachting op 'Access-Control-Allow-Origin' header op "https://dev-actoren.onroerenderfgoed.be/actoren/"
			//return this._crabGet("crab/gemeenten/" + gemeente_id + "/postkantons");
			var deferred = new Deferred();
			deferred.resolve([
						{"id": "8300"},
						{"id": "8301"}
					]);
			return deferred.promise;
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