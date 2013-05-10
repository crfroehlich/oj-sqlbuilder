/* global window, OJ, Ext:true */

(function _proxyClassIIFE() {

    /**
     * Internal class to define a Proxy. This class cannot be directly instanced.
     */
    var Proxy = function() {
        var that = this;

        Object.defineProperties(that, {
           type: {
               value: 'memory',
               writable: true,
               configurable: true,
               enumerable: true
           }
        });

        return that;
    };

    OJ.instanceof.lift('Proxy', Proxy);

    /**
     * Instance a new Proxy. Proxies are the mechanisms by which Stores are populated with data.
     * Currently, only Proxy types of 'memory' are supported.
     */
    OJ.lift('proxy', function(type) {

        var ret = new Proxy();

        if(type !== 'memory') {
            throw new Error('Only proxy types of "memory" are supported.');
        }

        ret.type = type;
        return ret;
    });

}());