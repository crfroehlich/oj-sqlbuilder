/* global OJ:true, window:true, Ext:true */

(function _fieldIIFE(){

    var Field = function (defaultValue) {
        var that = this;
        Object.defineProperties(that, {
            id: {
                value: '',
                writable: true,
                configurable: true,
                enumerable: true
            },
            name: {
                value: '',
                writable: true,
                configurable: true,
                enumerable: true
            }
        });
        if(defaultValue) {
            Object.defineProperties(that, {
                defaultValue: {
                    value: defaultValue,
                    writable: true,
                    configurable: true,
                    enumerable: true
                }
            })
        }
        return that;
    };

    OJ.instanceof.lift('Field', Field);

    OJ.models.lift('field', function (id, name, defaultValue){
        var ret = new Field(defaultValue);
        ret.id = id;
        ret.name = name;
        return ret;
    });


    }());