/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

/**
* The Table Store represents the data bound to a table
*/
(function _tableStoreIIFE() {

    //OJ.dependsOn(['OJ.fieldsModel'], function () {

    /**
     * Define the proxy
    */
    var proxy = OJ.grids.stores.proxy('memory');

    /**
     * Define the store
    */
    var store = OJ.grids.stores.store('Ext.oj-sqlbuilder.SQLTableStore', proxy, 'Ext.oj-sqlbuilder.SQLTableModel');

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