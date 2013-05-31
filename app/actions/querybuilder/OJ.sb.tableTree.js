/* global window:true, Ext:true */

(function() {

    var initTreeDragZone = function(thisTree) {
        // init tree view as a ViewDragZone
        thisTree.view.dragZone = new Ext.tree.ViewDragZone({
            view: thisTree.view,
            ddGroup: 'sqlDDGroup',
            dragText: '{0} Selected Table{1}',
            repairHighlightColor: 'c3daf9',
            repairHighlight: Ext.enableFx
        });
    };

    var tables = [];

    Ext.define('Ext.OJ.SqlTableTree', {
        extend: 'Ext.tree.Panel',
        alias: ['widget.sqltabletree'],
        id: 'SQLTableTree',
        listeners: {
            afterrender: function() {
                var that = this;
                initTreeDragZone(that);
            },
            itemdblclick: function(view, record, el, index, event) {
                var sqlTablePanel;
                // add a sqltable to the sqlTablePanel component
                sqlTablePanel = Ext.getCmp('SQLTablePanel');
                sqlTablePanel.add({
                    xtype: 'sqltable',
                    constrain: true,
                    title: record.get('text')
                }).show();

            }
        },
        initComponent: function() {

            this.store = Ext.create('Ext.data.TreeStore', {
                root: {
                    text: 'Tables',
                    expanded: true,
                    children: this.tables
                },
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json'
                    }
                }
            });

            this.callParent(arguments);
        }
    });

}());