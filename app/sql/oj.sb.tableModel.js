/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLTableModel', {
        extend: 'Ext.data.Model',
        fields: [{
            name: 'id',
            type: 'string'
        }, {
            name: 'tableName',
            type: 'string'
        }, {
            name: 'tableAlias',
            type: 'string'
        }]
    });

}());