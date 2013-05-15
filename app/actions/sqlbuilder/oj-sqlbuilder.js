/* jshint undef: true, unused: true */
/* global Ext  */ (function() {

    window.initSqlUI = function(tables) {

        Ext.define('Ext.oj-sqlbuilder', {
            extend: 'Ext.window.Window',
            alias: ['widget.qbwindow'],
            height: 620,
            width: 1000,
            tables: [],
            layout: {
                type: 'border'
            },
            title: 'Visual SQL Query Builder',
            items: [{
                xtype: 'sqloutputpanel',
                border: false,
                region: 'center',
                autoScroll: true,
                html: '<pre class="brush: sql">SQL Output Window</pre>',
                margin: 5,
                height: 150,
                split: true
            }, {
                xtype: 'panel',
                border: false,
                height: 400,
                margin: 5,
                layout: {
                    type: 'border'
                },
                region: 'north',
                split: true,
                items: [{
                    xtype: 'sqltablepanel',
                    border: false,
                    region: 'center',
                    height: 280,
                    split: true,
                    layout: 'fit'
                }, {
                    xtype: 'sqlfieldsgrid',
                    border: false,
                    region: 'south',
                    height: 120,
                    split: true
                }, {
                    xtype: 'sqltabletree',
                    border: false,
                    region: 'west',
                    width: 200,
                    height: 400,
                    split: true,
                    tables: tables
                }]
            }],
            initComponent: function() {

                // create user extension namespace oj.sql.builder
                Ext.namespace('oj.sql.builder');

                // disable gutter (linenumbers) and toolbar for SyntaxHighlighter
                SyntaxHighlighter.defaults['gutter'] = false;
                SyntaxHighlighter.defaults['toolbar'] = false;

                oj.sql.builder.connections = [];

                oj.sql.builder.sqlSelect = Ext.create('Ext.oj-sqlbuilder.SQLSelect');

                // add toolbar to the dockedItems
                this.dockedItems = [{
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        xtype: 'tbfill'
                    }, {
                        text: "Save",
                        icon: "resources/images/icon-save.gif"
                    }, {
                        text: "Run",
                        icon: "resources/images/run.png"
                    }]
                }];

                this.callParent(arguments);
            }
        });
    };
}());