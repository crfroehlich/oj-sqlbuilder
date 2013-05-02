// Init the singleton.  Any tag-based quick tips will start working.
Ext.tip.QuickTipManager.init();

// create main application namespace ux.qb.app
Ext.namespace('ux.qb.app');


Ext.application({
    name: 'ux.qb',
    appFolder: 'app',
    autoCreateViewport: false,
    launch: function(){
        // copy application to ux.qb.app so that ux.qb.app can be used as an application singleton
        var qbWindow = Ext.create('Ext.ux.window.VisualSQLQueryBuilder');
    	qbWindow.show();
        Ext.apply(ux.qb.app, this);
    }
});