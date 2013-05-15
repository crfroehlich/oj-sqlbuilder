/* global window:true, Ext:true */

(function() {

    var panel = OJ.panels.panel({
        name: 'Ext.OJ.SQLOutputPanel',
        alias: ['widget.sqloutputpanel'],
        id: 'SQLOutputPanel'
    });

    panel.listeners.add(OJ.constants.panelListeners.afterlayout, function() {
        SyntaxHighlighter.highlight();
    });

    panel.init();


}());