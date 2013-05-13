/* jshint undef: true, unused: true */
/* global Ext, OJ  */

(function() {

    /**
     * Create a new object with constant properties.
     * @param props {Object} an object represent the enun members
    */
    var Enum = function(props) {
        var that = null;
        if(props) {
            that = this;
            OJ.each(props, function(propVal, propName){
                Object.defineProperty(that, propName, {
                    value: propVal
                });
            });
        }
        return that;
    }

    /**
     * Create a new enum on the constants namespace.
     * Enums are objects consisting of read-only, non-configurable, non-enumerable properties.
     * @param name {String} the name of the enum
     * @param props {Object} the properties of the enum
    */
    OJ.lift('enum', function(name, props) {
        var ret = new Enum(props);
        if(ret && name) {
            OJ.constants.lift(name, ret)
            Object.seal(ret);
            Object.freeze(ret);
        }
        return ret;
    });

    }());