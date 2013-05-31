/* global window:true, Ext:true */

(function() {

    var panel = OJ.panels.panel({
        name: 'Ext.OJ.SQLOutputPanel',
        alias: ['widget.sqloutputpanel'],
        id: 'SQLOutputPanel'
    });

    panel.listeners.add(OJ.panels.constants.listeners.afterlayout, function() {
        window.SyntaxHighlighter.highlight();
    });

    panel.init();
    

}());