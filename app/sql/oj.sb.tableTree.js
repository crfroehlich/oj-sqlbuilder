/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLTableTree', {
        extend: 'Ext.tree.Panel',
        alias: ['widget.sqltabletree'],
        id: 'SQLTableTree',
        tables: [],
        listeners: {
            afterrender: function() {
                this.initTreeDragZone();
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
        initTreeDragZone: function() {
            // init tree view as a ViewDragZone
            this.view.dragZone = new Ext.tree.ViewDragZone({
                view: this.view,
                ddGroup: 'sqlDDGroup',
                dragText: '{0} ausgewählte Tabelle{1}',
                repairHighlightColor: 'c3daf9',
                repairHighlight: Ext.enableFx
            });
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