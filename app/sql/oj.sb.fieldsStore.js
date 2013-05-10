/* global OJ:true, window:true, Ext:true */

(function() {

    var proxy = OJ.proxy('memory');
    var store = OJ.store(proxy, 'Ext.oj-sqlbuilder.SQLFieldsModel');

    var SqlFieldStore = OJ.define('Ext.oj-sqlbuilder.SQLFieldsStore', store);

    /*Ext.define('Ext.oj-sqlbuilder.SQLFieldsStore', {
        extend: 'Ext.data.Store',
        autoSync: true,
        model: 'Ext.oj-sqlbuilder.SQLFieldsModel',
        proxy: {
            type: 'memory'
        }
    });*/

}());