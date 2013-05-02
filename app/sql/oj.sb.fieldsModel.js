/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLFieldsModel', {
        extend: 'Ext.data.Model',
        fields: [{
            name: 'id',
            type: 'string'
        }, {
            name: 'tableName',
            type: 'string'
        }, {
            name: 'tableId',
            type: 'string'
        }, {
            name: 'extCmpId',
            type: 'string'
        }, {
            name: 'tableAlias',
            type: 'string'
        }, {
            name: 'field',
            type: 'string'
        }, {
            name: 'output',
            type: 'boolean'
        }, {
            name: 'expression',
            type: 'string'
        }, {
            name: 'aggregate',
            type: 'string'
        }, {
            name: 'alias',
            type: 'string'
        }, {
            name: 'sortType',
            type: 'string'
        }, {
            name: 'sortOrder',
            type: 'int'
        }, {
            name: 'grouping',
            type: 'boolean'
        }, {
            name: 'criteria',
            type: 'string'
        }]
    });

}());