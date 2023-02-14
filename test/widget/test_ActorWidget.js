require([
	'actorwidget/widgets/ActorWidget',
	'dojo/store/Observable',
	'dojo/store/JsonRest',
	'dojo/domReady!'
], function (
	ActorWidget,
	Observable,
	JsonRest
) {
	//var baseUrl= "http://localhost:6565/";
	var baseUrl= 'https://dev-actoren.onroerenderfgoed.be';
	var ssoToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4YktMaGdDMUZiTVd5ZFIxSkluQk54bUl' + 
	'oNVJEekFsYWtZWG9wb0N6UFVJIn0.eyJleHAiOjE2NzYzNzIyNDYsImlhdCI6MTY3NjM3MTk0NiwiYXV0aF90aW1lIjoxNjc2M' +
	'zcwNTIyLCJqdGkiOiJiNGNiNzI4NC00NzcxLTQ3YTktYmUwYS04MDJhNmI2MDcwZWMiLCJpc3MiOiJodHRwczovL3Nzb3YyLW9' +
	'udHdpa2tlbC5vbWdldmluZy52bGFhbmRlcmVuLmJlL2F1dGgvcmVhbG1zL09tZ2V2aW5nIiwic3ViIjoiODg4NzExMzAtNjM3Z' +
	'i00ZmJjLTk0ZGEtNzI4NzlmNmZhZmExIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidmlvZS1wcm9jZXMtdG9ldmFsc3ZvbmRzdGV' +
	'uIiwic2Vzc2lvbl9zdGF0ZSI6IjA0NjEwYzk2LWY2ZjMtNDYwYS1iYjJhLWY5YWU2YWUxZTFmZiIsImFjciI6IjEiLCJyZXNvd' +
	'XJjZV9hY2Nlc3MiOnsidmlvZS1kb3NzaWVycyI6eyJyb2xlcyI6WyJ2aW9lLWRvc3NpZXJzOmJlaGVlcmRlciJdfSwidmlvZS1' +
	'hY3RvcmVuIjp7InJvbGVzIjpbInZpb2UtYWN0b3JlbjphY3RvcmVuLmJlaGVlcmRlciJdfSwidmlvZS12b25kc3RtZWxkaW5nZ' + 
	'W4iOnsicm9sZXMiOlsidmlvZS12b25kc3RtZWxkaW5nZW46dm9uZHN0bWVsZGluZ2VuLWJlaGVlcmRlciJdfSwidmlvZS1wb3N' +
	'0Ijp7InJvbGVzIjpbInZpb2UtcG9zdDpiZWhlZXJkZXIiXX0sInZpb2UtdG9lbGF0aW5nZW4tYXJjaGVvbG9naWUiOnsicm9sZ' +
	'XMiOlsidmlvZS10b2VsYXRpbmdlbi1hcmNoZW9sb2dpZTpiZWhlZXJkZXIiXX0sInZpb2UtaW52ZW50YXJpcyI6eyJyb2xlcyI' +
	'6WyJ2aW9lLWludmVudGFyaXM6YmVoZWVyZGVyIl19LCJ2aW9lLWFsZ2VtZWVuIjp7InJvbGVzIjpbInZpb2UtYWxnZW1lZW46b' +
	'WVkZXdlcmtlcl9pdCJdfSwidmlvZS1kZ2VuIjp7InJvbGVzIjpbInZpb2UtZGdlbjpiZWhlZXJkZXIiXX0sInZpb2UtcHJvY2V' +
	'zLXRvZXZhbHN2b25kc3RlbiI6eyJyb2xlcyI6WyJ2aW9lLXByb2Nlcy10b2V2YWxzdm9uZHN0ZW46YmVoZWVyZGVyIl19fSwic' +
	'2NvcGUiOiJvcGVuaWQiLCJzaWQiOiIwNDYxMGM5Ni1mNmYzLTQ2MGEtYmIyYS1mOWFlNmFlMWUxZmYiLCJvcmdjb2RlIjoiT1Z' +
	'PMDAwMTA0Iiwib3JnbmFhbSI6Ik9ucm9lcmVuZCBFcmZnb2VkIiwicGVyc29vbmlkIjoiYjgyNjY0YTM2MDE0M2QwMTU0OGVlM' +
	'zViYTY0ZWIxOGFmZTMyNTAyMjY1MDgzMTM0NWMxOGU4OGU0YTg2NjJmYSIsImRvZWxncm9lcGNvZGUiOiJHSUQiLCJwcmVmZXJ' +
	'yZWRfdXNlcm5hbWUiOiJiODI2NjRhMzYwMTQzZDAxNTQ4ZWUzNWJhNjRlYjE4YWZlMzI1MDIyNjUwODMxMzQ1YzE4ZTg4ZTRhO' +
	'DY2MmZhLW92bzAwMDEwNCIsIm92b2NvZGUiOiJPVk8wMDAxMDQifQ.AlrBF7cGKa4D2OtmJn1juDJfTKK-6wE_CFRTpbpGttCx' +
	'TNxIYgEZXXJhH0rlElVdtyydf4Vysnl9nnQHqMcwXpdC0UDdRe8SKDFsx9X0deAHRqAGdpxQy18kNS1yW6rHzmpWKNULFshj1t' +
	'ka-VckgH8tEY_o903PsacwVghUSR2JfDYXrJME1SqKBtXnYybAuauAhsZPJ997k_z2crwBeo_dY1h42whonm3Mh5xhO820h_aI' +
	'rMKE5NE_o45LTdkVTwaGq2SlpPK1qiCENNInWggx-hQi6LJgS7Pl-bbBWqKb4p-8e4B8ZC_7zuvPOcJvBVqc16enx-eu4nyUY1' +
	'x3TQ';

	var actorWijStore = new Observable(new JsonRest({
		target: baseUrl + '/actoren/wij/',
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
			'X-Requested-With': '',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + ssoToken
		}
	}));

	var actorStore = new Observable(new JsonRest({
		target: baseUrl + '/actoren/',
		sortParam: 'sort',
		idProperty: 'id',
		headers: {
			'X-Requested-With': '',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + ssoToken
		}
	}));

	var actorWidget = new ActorWidget({
		actorWijStore: actorWijStore,
		actorStore: actorStore,
    canCreateActor: true,
    canEditActor: true,
		ssoToken: ssoToken,
		actorCategories: {
			actoren: true,
			vkbo: false,
			vkbp: false
		},
		//crabHost: "http://localhost:6565/"
		crabHost: baseUrl
		//typeLists: {
		//	emailTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}], // get <actorenHost>/email_types
		//	telephoneTypes: [{"naam": "thuis", "id": 1}, {"naam": "werk", "id": 2}, {"naam": "mobiel", "id": 3}, {"naam": "fax thuis", "id": 4}, {"naam": "fax werk", "id": 5}], // get <actorenHost>/telephone_types
		//	urlTypes: [{"naam": "website", "id": 1}, {"naam": "blog", "id": 2}, {"naam": "webapplicatie", "id": 3}], // get <actorenHost>/url_types
		//	actorTypes: [{"naam": "persoon", "id": 1}, {"naam": "organisatie", "id": 2}], // get <actorenHost>/actor_types
     // adresTypes: [{"naam": "post", "id": 1}, {"naam": "primair", "id": 2}]
		//}
	}, 'widgetNode');
	actorWidget.startup();

});