/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

/**
* The Fields Store represents the data bound to a grid
*/
(function _fieldsStoreIIFE() {

    //OJ.dependsOn(['OJ.fieldsModel'], function () {

        /**
         * Define the proxy
        */
        var proxy = OJ.grids.stores.proxy('memory');

        /**
         * Define the store
        */
        var store = OJ.grids.stores.store('Ext.OJ.SQLFieldsStore',proxy, 'Ext.OJ.SQLFieldsModel');

        /**
         * Create the ExtJs class
        */
        var SqlFieldStore = store.init();

        /**
         * Put the class into the namespace
        */
        OJ.lift('sqlFieldsStore', SqlFieldStore);

   // });

}());