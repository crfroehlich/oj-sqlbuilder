/* global window, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLTableStore', {
        extend: 'Ext.data.Store',
        autoSync: true,
        model: 'Ext.oj-sqlbuilder.SQLTableModel',
        proxy: {
            type: 'memory'
        }
    });

}());