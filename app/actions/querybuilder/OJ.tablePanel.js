/* global window:true, Ext:true */

(function () {

    var panel = OJ.panels.panel({
        name: 'Ext.OJ.SqlTablePanel',
        alias: ['widget.sqltablepanel'],
        id: 'SQLTablePanel'
    });

    var initDropTarget = function(thisPanel) {
        // init draw component inside qbwindow as a DropTarget
        thisPanel.dropTarget = Ext.create('Ext.dd.DropTarget', thisPanel.el, {
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
    };

    panel.addProp('items', [{
        xtype: 'draw',
        listeners: {
            afterrender: function() {
                var thisPanel = this;
                initDropTarget(thisPanel);
            }
        }
    }]);

    panel.init();


}());