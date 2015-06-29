/**
 * Extension to ActorWidget that allows to track the state of the selection on the result grid of ActorSearch by relaying its
 * Selection event with an event of its own 'select.actors'
 * @module Actor/ActorSelection
 */
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/Evented'
], function (declare, lang, on, Evented) {
    return declare(Evented, {
        postCreate: function () {
            console.log('..ActorSelection::postCreate', arguments);
            this.inherited(arguments);
        },

        startup: function () {
            console.log('..ActorSelection::startup', arguments);
            this.inherited(arguments);

            //verifies necessary components are present
            if (!('_actorSearch' in this) || !('_grid' in this._actorSearch)) {
                console.error('Could not initiate actor selection on actor widget');
                return;
            }

            //relays selection event
            this.own(on(this._actorSearch._grid, "dgrid-select", lang.hitch(this, function (event) {
                var selected = event.rows.map(function (row) {
                    return row.data;
                });
                this.emit('select.actors', {actors: selected});
            })));
        }
    });
});