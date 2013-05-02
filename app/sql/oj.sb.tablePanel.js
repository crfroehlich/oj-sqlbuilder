/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLTablePanel', {
        extend: 'Ext.panel.Panel',
        alias: ['widget.sqltablepanel'],
        id: 'SQLTablePanel',
        items: [{
            xtype: 'draw',
            listeners: {
                afterrender: function() {
                    this.initDropTarget();
                }
            },
            initDropTarget: function() {
                // init draw component inside qbwindow as a DropTarget
                this.dropTarget = Ext.create('Ext.dd.DropTarget', this.el, {
                    ddGroup: 'sqlDDGroup',
                    notifyDrop: function(source, event, data) {
                        var sqlTablePanel;
                        // add a sqltable to the sqlTablePanel component
                        sqlTablePanel = Ext.getCmp('SQLTablePanel');
                        sqlTablePanel.add({
                            xtype: 'sqltable',
                            constrain: true,
                            title: data.records[0].get('text')
                        }).show();
                        return true;
                    }
                });
            }
        }]
    });

}());