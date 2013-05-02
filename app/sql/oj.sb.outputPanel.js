/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLOutputPanel', {
        extend: 'Ext.panel.Panel',
        alias: ['widget.sqloutputpanel'],
        id: 'SQLOutputPanel',
        listeners: {
            afterlayout: function() {
                SyntaxHighlighter.highlight();
            }
        },
        initComponent: function() {
            this.callParent(arguments);
        }
    });

}());