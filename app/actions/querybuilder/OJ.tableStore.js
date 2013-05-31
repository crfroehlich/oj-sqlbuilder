/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

/**
* The Fields Store represents the data bound to a grid
*/
(function _joinsStoreIIFE() {

    //OJ.dependsOn(['OJ.fieldsModel'], function () {

    /**
     * Define the proxy
    */
    var proxy = OJ.grids.stores.proxy('memory');

    /**
     * Define the store
    */
    var store = OJ.grids.stores.store('Ext.OJ.SqlTableStore', proxy, 'Ext.OJ.SqlTableModel');

    /**
     * Create the ExtJs class
    */
    var sqlTableStore = store.init();

    /**
     * Put the class into the namespace
    */
    OJ.lift('sqlTableStore', sqlTableStore);

    // });

}());