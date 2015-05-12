define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/Evented'
], function (declare, lang, on, Evented) {
    return declare(Evented, {

        postMixInProperties: function () {
            this.inherited(arguments);
        },

        buildRendering: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);
        },

        startup: function () {
            this.inherited(arguments);
            if (!('_actorSearch' in this) || !('_grid' in this._actorSearch)) {
                console.error('Could not initiate actor selection on actor widget');
                return;
            }
            this.own(on(this._actorSearch._grid, "dgrid-select", lang.hitch(this, function (event) {
                var selected = event.rows.map(function (row) {
                    return row.data;
                });
                this.emit('select.actors', {actors: selected});
            })));
        }
    });
});
