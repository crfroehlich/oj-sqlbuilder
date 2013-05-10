/* global window, OJ, Ext:true */

(function _classDefinitionIIFE() {

    /**
     * Create an object suitable for defining a new class
    */
    var ClassDefinition = function(extend, requires, alias, id, store, plugins) {
        var that = this;

        if(extend) {
            Object.defineProperties(that, {
                extend:{
                    value: extend,
                    writable: true,
                    configurable: true,
                    enumerable: true

                }
            });
        }
        if(requires) {
            Object.defineProperties(that, {
                requires:{
                    value: requires,
                    writable: true,
                    configurable: true,
                    enumerable: true

                }
            });
        }
        if(alias) {
            Object.defineProperties(that, {
                alias:{
                    value: alias,
                    writable: true,
                    configurable: true,
                    enumerable: true

                }
            });
        }
        if(id) {
            Object.defineProperties(that, {
                id:{
                    value: id,
                    writable: true,
                    configurable: true,
                    enumerable: true

                }
            });
        }
        if(plugins) {
            Object.defineProperties(that, {
                plugins:{
                    value: plugins,
                    writable: true,
                    configurable: true,
                    enumerable: true

                }
            });
        }
        if(store) {
            Object.defineProperties(that, {
                store:{
                    value: store,
                    writable: true,
                    configurable: true,
                    enumerable: true

                }
            });
        }
        return that;
    };

    OJ.instanceof.lift('ClassDefinition', ClassDefinition);

    /**
     * Define declares a new class on the ExtJs namespace
    */
    OJ.lift('classDefinition', function(def) {
        if(!def) {
            throw new Error('Cannot create a definition without parameters.')
        }
        var ret = new ClassDefinition(def.extend, def.requires, def.alias, def.id, def.store, def.plugins);
        return ret;
    });

}());