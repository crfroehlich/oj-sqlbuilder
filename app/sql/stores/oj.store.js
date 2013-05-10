/* global window, OJ, Ext:true */

(function _storeIIFE() {

    /**
     * A Store is a collection of data that is to be rendered in a View or Panel.
     * This private class can never be directly instanced.
    */
    var Store = function _Store() {
        var that = this;
        Object.defineProperties(that, {
            extend: {
                value: 'Ext.data.Store',
                writable: true,
                configurable: true,
                enumerable: true

            },
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

    /**
     * Instance a new Store for consumption by an Ext view or panel
    */
    OJ.lift('store', function _OjStore(proxy, model) {
        /*if(!(proxy instanceof OJ.proxy)) {
            throw new Error('Cannot create a Store without a Proxy');
        }*/
        var ret = new Store();
        //var ret = Object.create(store);
        ret.proxy = proxy;
        ret.model = model;
        return ret;
    });

}());