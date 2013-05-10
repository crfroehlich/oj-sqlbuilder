/* global window, OJ, Ext:true */

(function _storeIIFE() {

    /**
     * A Store is a collection of data that is to be rendered in a View or Panel.
     * This private class can never be directly instanced.
    */
    var Store = function() {
        var that = OJ.classDefinition({extend: 'Ext.data.Store' });
        Object.defineProperties(that, {
            autoSync: {
                value: true,
                writable: true,
                configurable: true,
                enumerable: true
            },
            proxy: {
                value: OJ.proxy('memory'),
                writable: true,
                configurable: true,
                enumerable: true
            },
            model: {
                value: '',
                writable: true,
                configurable: true,
                enumerable: true
            }
        });
        return that;
    };

    OJ.instanceof.lift('Store', Store);

    /**
     * Instance a new Store for consumption by an Ext view or panel
    */
    OJ.lift('store', function(proxy, model) {
        if(!(proxy instanceof OJ.instanceof.Proxy)) {
            throw new Error('Cannot create a Store without a Proxy');
        }
        var ret = new Store();
        ret.proxy = proxy;
        ret.model = model;
        return ret;
    });

}());