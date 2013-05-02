/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLFieldsStore', {
        extend: 'Ext.data.Store',
        autoSync: true,
        model: 'Ext.oj-sqlbuilder.SQLFieldsModel',
        proxy: {
            type: 'memory'
        }
    });

}());