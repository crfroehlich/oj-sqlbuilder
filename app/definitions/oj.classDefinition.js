/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function _classDefinitionIIFE() {

    /**
     * Private constructor to create an object suitable for defining a new class
     * @param extend {String} The ExtJS class to extend/copy
     * @param requires {Array} [requires] An array of dependencies
     * @param alias {Array} [alias] An array of alternate names for this class
     * @param id {String} [id] A unique id for this class
     * @param store {OJ.store} [store] A data store for this class
     * @param plugins [Array] [plugins] An array of plugins to initialize with new instances of this class
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
     * @param def {Object} defintion object with possible properties: def.extend, def.requires, def.alias, def.id, def.store, def.plugins
    */
    OJ.lift('classDefinition', function(def) {
        if(!def) {
            throw new Error('Cannot create a definition without parameters.')
        }
        var ret = new ClassDefinition(def.extend, def.requires, def.alias, def.id, def.store, def.plugins);
        return ret;
    });

}());