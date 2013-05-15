/* jshint undef: true, unused: true */
/* global Ext  */

// Init the singleton.  Any tag-based quick tips will start working.
Ext.tip.QuickTipManager.init();

// create main application namespace oj.sql
Ext.namespace('oj.sql');

window.initSqlUI([{
                        "allowDrop": false,
                        "text": "library",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "floor",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "aisle",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "shelf",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "employee",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "schedule",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "book",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "agency",
                        "leaf": true
                    }, {
                        "allowDrop": false,
                        "text": "author",
                        "leaf": true
                    }]);

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