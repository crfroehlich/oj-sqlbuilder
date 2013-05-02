// Init the singleton.  Any tag-based quick tips will start working.
Ext.tip.QuickTipManager.init();

// create main application namespace oj.sql
Ext.namespace('oj.sql');


Ext.application({
    name: 'oj',
    appFolder: 'sql',
    autoCreateViewport: false,
    launch: function(){
        // copy application to oj.sql so that oj.sql.app can be used as an application singleton
        var qbWindow = Ext.create('Ext.oj-sqlbuilder');
    	qbWindow.show();
        Ext.apply(oj.sql, this);
    }
});