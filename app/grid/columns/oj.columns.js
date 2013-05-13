/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function _columnsIIFE() {

    //OJ.dependsOn(['OJ.models.field'], function () {

        /**
         * Defines a collection of columns
         */
        var Columns = function() {
            var that = this;
            Object.defineProperties(that, {
                value: {
                    value: [],
                    writable: true,
                    configurable: true,
                    enumerable: true
                },
                add: {
                    value: function (column) {
                        if (!(column instanceof OJ.instanceof.Column)) {
                            throw new Error('Only columns can be added to the Columns collection');
                        }
                        that.value.push(column);
                        return that;
                    }
                }
            });
            return that;
        };

        OJ.instanceof.lift('Columns', Columns);

        /**
         * A mechanism for generating columns
         */
        OJ.grids.columns.lift('columns', function() {
            var ret = new Columns();
            return ret;
        });

    //});

}());