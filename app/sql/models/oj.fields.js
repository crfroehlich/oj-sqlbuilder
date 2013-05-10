/* global OJ:true, window:true, Ext:true */

(function _fieldsIIFE() {

    //OJ.dependsOn(['OJ.models.field'], function () {

        /**
         * Defines a collection of fields
         */
        var Fields = function _Fields() {
            var that = this;
            Object.defineProperties(that, {
                value: {
                    value: [],
                    writable: true,
                    configurable: true,
                    enumerable: true
                },
                add: {
                    value: function (field) {
                        if (!(field instanceof OJ.instanceof.Field)) {
                            throw new Error('Only fields can be added to the Fields collection');
                        }
                        that.value.push(field);
                        return that;
                    }
                }
            });
            return that;
        };

        OJ.instanceof.lift('Fields', Fields);

        /**
         * A mechanism for generating fields
         */
        OJ.models.lift('fields', function _ojFields() {
            var ret = new Fields();
            return ret;
        });

    //});

}());