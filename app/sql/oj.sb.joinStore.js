/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.JoinStore', {
        extend: 'Ext.data.Store',
        autoSync: true,
        model: 'Ext.oj-sqlbuilder.SQLJoin',
        proxy: {
            type: 'memory'
        }
    });

}());