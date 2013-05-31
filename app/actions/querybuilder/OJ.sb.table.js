/* global window:true, Ext:true */

(function() {

    var getOffset = function (thisView, constrain) {
        var xy = thisView.dd.getXY(constrain), s = thisView.dd.startXY;
        // return the the difference between the current and the drag&drop start position
        return [xy[0] - s[0], xy[1] - s[1]];
    };

    var closeSQLTable = function(thisView) {
        // remove fields / columns from sqlFieldsStore
        OJ.sql.builder.sqlSelect.removeFieldsByTableId(thisView.tableId);

        // remove table from sqlTables store inside OJ.sql.builder.sqlSelect
        OJ.sql.builder.sqlSelect.removeTableById(thisView.tableId);

        // unregister mousedown event
        thisView.getHeader().el.un('mousedown', function _doRegStartDrag() { regStartDrag(thisView); }, thisView);
        // unregister mousemove event
        Ext.EventManager.un(document, 'mousemove', function _doMoveWindow() { moveWindow(thisView); }, thisView);
        // remove sprite from surface
        Ext.getCmp('SQLTablePanel').down('draw').surface.remove(thisView.shadowSprite, false);
        // remove any connection lines from surface and from array OJ.sql.builder.connections
        OJ.sql.builder.connections = Ext.Array.filter(OJ.sql.builder.connections, function(connection) {
            var bRemove = true;
            for (var j = 0, l = this.connectionUUIDs.length; j < l; j++) {
                if (connection.uuid == this.connectionUUIDs[j]) {
                    connection.line.remove();
                    connection.bgLine.remove();
                    connection.miniLine1.remove();
                    connection.miniLine2.remove();
                    bRemove = false;
                }
            }
            return bRemove;
        }, thisView);

    };
    
    var initSQLTable = function(thisView) {
        var sqlTablePanel, xyParentPos, xyChildPos, childSize, sprite;

        // get the main sqlTablePanel
        sqlTablePanel = Ext.getCmp('SQLTablePanel');

        // get the main sqlTablePanel position
        xyParentPos = sqlTablePanel.el.getXY();

        // get position of the previously added sqltable
        xyChildPos = thisView.el.getXY();

        // get the size of the previously added sqltable
        childSize = thisView.el.getSize();

        // create a sprite of type rectangle and set its position and size
        // to position and size of the the sqltable
        sprite = Ext.create('Ext.OJ.SqlTableSprite', {
            type: 'rect',
            stroke: '#fff',
            height: childSize.height - 4,
            width: childSize.width - 4,
            x: xyChildPos[0] - xyParentPos[0] + 2,
            y: xyChildPos[1] - xyParentPos[1] + 2,
            scrollTop: 0
        });

        // add the sprite to the surface of the sqlTablePanel
        thisView.shadowSprite = sqlTablePanel.down('draw').surface.add(sprite).show(true);

        // handle resizeing of sqltabel
        thisView.resizer.on('resize', function(resizer, width, height, event) {
            var thisViewEl = this;
            thisViewEl.shadowSprite.setAttributes({
                width: width - 6,
                height: height - 6
            }, true);
            // also move the associated connections
            for (var i = OJ.sql.builder.connections.length; i--;) {
                connection(thisViewEl, OJ.sql.builder.connections[i]);
            }
        }, thisView);

        // register a function for the mousedown event on the previously added sqltable and bind to thisView scope
        thisView.getHeader().el.on('mousedown', function _doRegStartDrag() { regStartDrag(thisView); }, thisView);

        thisView.getHeader().el.on('contextmenu', function _doShowSqlTable() { showSQLTableCM(thisView); }, thisView);

        thisView.getHeader().el.on('dblclick', function _doShowTableAliasEdit() { showTableAliasEditForm(thisView); }, thisView);

        thisView.getHeader().origValue = '';

        // register method thisView.moveWindow for the mousemove event on the document and bind to thisView scope
        Ext.EventManager.on(document, 'mousemove', function _doMoveWindow() { moveWindow(thisView); }, thisView);

        // register a function for the mouseup event on the document and add the thisView scope
        Ext.EventManager.on(document, 'mouseup', function() {
            // save the mousedown state
            thisView.bMouseDown = false;
        }, thisView);


    };
    
    var showSQLTableCM = function(thisView, event, el) {
        var cm;
        // stop the browsers event bubbling
        event.stopEvent();
        // create context menu
        cm = Ext.create('Ext.menu.Menu', {
            items: [{
                    text: 'Add/Edit Alias',
                    icon: 'resources/images/document_edit16x16.gif',
                    handler: Ext.Function.bind(function() {
                        showTableAliasEditForm(this);
                    }, this)
                }, {
                    text: 'Remove Table',
                    icon: 'resources/images/delete.gif',
                    handler: Ext.Function.bind(function() {
                        // remove the sqltable
                        this.close();
                    }, this)
                }, {
                    text: 'Close Menu',
                    icon: 'resources/images/cross.gif',
                    handler: Ext.emptyFn
                }]
        });
        // show the contextmenu next to current mouse position
        cm.showAt(event.getXY());
    };
    
    var showTableAliasEditForm = function(thisView, event, el) {
        var table, header, title, titleId;
        table = OJ.sql.builder.sqlSelect.getTableById(this.tableId);
        header = thisView.getHeader();
        titleId = '#' + header.getId() + '_hd';
        title = thisView.down(titleId);
        header.remove(title);
        header.insert(0, [{
                xtype: 'textfield',
                flex: 0.95,
                parentCmp: header,
                parentTableModel: table,
                initComponent: function() {

                    this.setValue(this.parentTableModel.get('tableAlias'));

                    this.on('render', function(field, event) {
                        // set focus to the textfield Benutzerkennung
                        field.focus(true, 200);
                    }, this);

                    this.on('specialkey', function(field, event) {
                        if (event.getKey() == event.ENTER) {
                            if (field.getValue() != this.parentCmp.origValue) {
                                this.parentTableModel.set('tableAlias', field.getValue());
                                this.parentCmp.origValue = field.getValue();
                            }
                            this.removeTextField();
                            this.addTitle();
                        }
                    }, this);

                    this.on('blur', function(field, event) {
                        if (field.getValue() != this.parentCmp.origValue) {
                            this.parentTableModel.set('tableAlias', field.getValue());
                            this.parentCmp.origValue = field.getValue();
                        }
                        this.removeTextField();
                        this.addTitle();
                    }, this);

                    this.callParent(arguments);
                },
                removeTextField: function() {
                    var next;
                    next = this.next();
                    this.parentCmp.remove(next);
                    this.parentCmp.remove(this);
                },
                addTitle: function() {
                    var titleText;
                    if (this.parentTableModel.get('tableAlias') != '') {
                        titleText = this.parentTableModel.get('tableAlias') + ' ( ' + this.parentTableModel.get('tableName') + ' )';
                    } else {
                        titleText = this.parentTableModel.get('tableName');
                    }
                    this.parentCmp.insert(0, {
                        xtype: 'component',
                        ariaRole: 'heading',
                        focusable: false,
                        noWrap: true,
                        flex: 1,
                        id: this.parentCmp.id + '_hd',
                        style: 'text-align:' + this.parentCmp.titleAlign,
                        cls: this.parentCmp.baseCls + '-text-container',
                        renderTpl: this.parentCmp.getTpl('headingTpl'),
                        renderData: {
                            title: titleText,
                            cls: this.parentCmp.baseCls,
                            ui: this.parentCmp.ui
                        },
                        childEls: ['textEl']
                    });
                }
            }, {
                xtype: 'component',
                flex: 0.05
            }]);
    };
    
    
    var regStartDrag = function(thisView) {
        // save the mousedown state
        thisView.bMouseDown = true;
        // start the drag of the sprite
        thisView.shadowSprite.startDrag(thisView.getId());
    };

    var moveWindow = function(thisView, event, domEl, opt) {
        var relPosMovement;
        // check mousedown
        if (thisView.bMouseDown) {
            // get relative x and y values (offset)
            relPosMovement = getOffset(thisView, 'point');
            // move the sprite to the position of the window
            thisView.shadowSprite.onDrag(relPosMovement);
            // check if the sprite has any connections
            if (thisView.shadowSprite.bConnections) {
                // also move the associated connections
                for (var i = OJ.sql.builder.connections.length; i--;) {
                    connection(thisView, OJ.sql.builder.connections[i]);
                }
            }
        }
    };
    
    var getLeftRightCoordinates = function(thisView, obj1, obj2, aBBPos) {
        var bb1, bb2, p = [], dx, leftBoxConnectionPoint, rightBoxConnectionPoint, dis, columHeight = 21, headerHeight = 46, LeftRightCoordinates = {};

        // Get bounding coordinates for both sprites

        bb1 = obj1.getBBox();
        // Y value for the connection points on the left and right side of bb1
        bb1.pY = bb1.y + headerHeight + ((aBBPos[0] - 1) * columHeight) + (columHeight / 2) - obj1.scrollTop;

        bb2 = obj2.getBBox();
        // Y value for the connection points on the left and right side of bb2
        bb2.pY = bb2.y + headerHeight + ((aBBPos[1] - 1) * columHeight) + (columHeight / 2) - obj2.scrollTop;

        // Left bounding box
        if (bb1.pY > (bb1.y + 4) && bb1.pY < (bb1.y + bb1.height - 4)) {
            p.push({
                x: bb1.x - 1, // Point on the left side of the preview column
                y: bb1.pY
            });
            p.push({
                x: bb1.x + bb1.width + 1, // Point on the right side of the preview column
                y: bb1.pY
            });
        } else {
            if (bb1.pY < (bb1.y + 4)) {
                p.push({
                    x: bb1.x - 1, // Highest point on the left side
                    y: bb1.y + 4
                });
                p.push({
                    x: bb1.x + bb1.width + 1, // Highest point on the right side
                    y: bb1.y + 4
                });
            } else {
                p.push({
                    x: bb1.x - 1, // Lowest point on the left side
                    y: bb1.y + bb1.height - 4
                });
                p.push({
                    x: bb1.x + bb1.width + 1, // Lowest point on the right side
                    y: bb1.y + bb1.height - 4
                });
            }
            
        }
        

        // The right bounding box
        if (bb2.pY > (bb2.y + 4) && bb2.pY < (bb2.y + bb2.height - 4)) {
            p.push({
                x: bb2.x - 1, // Point on the left side of the preview column
                y: bb2.pY
            });
            p.push({
                x: bb2.x + bb2.width + 1, // Point on the right side of the preview column
                y: bb2.pY
            });
        } else {
            if (bb2.pY < (bb2.y + 4)) {
                p.push({
                    x: bb2.x - 1, // Highest point on the left side.
                    y: bb2.y + 4
                });
                p.push({
                    x: bb2.x + bb2.width + 1, // Highest point on the right side.
                    y: bb2.y + 4
                });
            } else {
                p.push({
                    x: bb2.x - 1, // Lowest point on the the left side.
                    y: bb2.y + bb2.height - 4
                });

                p.push({
                    x: bb2.x + bb2.width + 1, // Lowest point on the right side.
                    y: bb2.y + bb2.height - 4
                });
            }
        }
        

        // A loop over the points of the first BoundingBox
        for (var i = 0; i < 2; i++) {
            // A loop over the points of the second BoundingBox
            for (var j = 2; j < 4; j++) {
                // Calculation of the offsets between the four points of both BoundingBoxes
                dx = Math.abs(p[i].x - p[j].x), dy = Math.abs(p[i].y - p[j].y);
                // bb1 left with bb2 right
                if (((i == 0 && j == 3) && dx < Math.abs(p[1].x - p[2].x)) || ((i == 1 && j == 2) && dx < Math.abs(p[0].x - p[3].x))) {
                    leftBoxConnectionPoint = p[i];
                    rightBoxConnectionPoint = p[j];
                }
            }
        }
        

        return {
            leftBoxConnectionPoint: leftBoxConnectionPoint,
            rightBoxConnectionPoint: rightBoxConnectionPoint
        };

    };
    
    var connection = function(thisView, obj1, obj2, line, aBBPos) {
        var LeftRightCoordinates, line1, line2, miniLine1, miniLine2, path, surface, color = typeof line == "string" ? line : "#000";

        if (obj1.line && obj1.from && obj1.to && obj1.aBBPos) {
            line = obj1;
            obj1 = line.from;
            obj2 = line.to;
            aBBPos = line.aBBPos;
        }

        // set reference to the wright surface
        surface = obj1.surface;

        // get coordinates for the left and right box
        LeftRightCoordinates = getLeftRightCoordinates(thisView, obj1, obj2, aBBPos);

        // check if the LeftBox is still on the left side or not
        if (LeftRightCoordinates.leftBoxConnectionPoint.x - LeftRightCoordinates.rightBoxConnectionPoint.x < 0) {
            line1 = 12;
            line2 = 12;
        } else {
            line1 = -12;
            line2 = -12;
        }
        // define the path between the left and the right box
        path = ["M", LeftRightCoordinates.leftBoxConnectionPoint.x, LeftRightCoordinates.leftBoxConnectionPoint.y, "H", LeftRightCoordinates.leftBoxConnectionPoint.x + line1, "L", LeftRightCoordinates.rightBoxConnectionPoint.x - line2, LeftRightCoordinates.rightBoxConnectionPoint.y, "H", LeftRightCoordinates.rightBoxConnectionPoint.x].join(",");

        miniLine1 = ["M", LeftRightCoordinates.leftBoxConnectionPoint.x, LeftRightCoordinates.leftBoxConnectionPoint.y, "H", LeftRightCoordinates.leftBoxConnectionPoint.x + line1].join(",");

        miniLine2 = ["M", LeftRightCoordinates.rightBoxConnectionPoint.x - line2, LeftRightCoordinates.rightBoxConnectionPoint.y, "H", LeftRightCoordinates.rightBoxConnectionPoint.x].join(",");

        //check if it is a new connection or not
        if (line && line.line) {
            // old connection, only change path
            line.bgLine &&
                line.bgLine.setAttributes({
                    path: path
                }, true);
            line.line.setAttributes({
                path: path
            }, true);
            line.miniLine1.setAttributes({
                path: miniLine1
            }, true);
            line.miniLine2.setAttributes({
                path: miniLine2
            }, true);
        } else {
            // new connction, return new connection object
            return {
                line: Ext.create('Ext.draw.Sprite', {
                    type: 'path',
                    path: path,
                    stroke: color,
                    fill: 'none',
                    'stroke-width': 1,
                    surface: surface
                }).show(true),
                miniLine1: Ext.create('Ext.draw.Sprite', {
                    type: 'path',
                    path: miniLine1,
                    stroke: color,
                    fill: 'none',
                    'stroke-width': 2,
                    surface: surface
                }).show(true),
                miniLine2: Ext.create('Ext.draw.Sprite', {
                    type: 'path',
                    path: miniLine2,
                    stroke: color,
                    fill: 'none',
                    'stroke-width': 2,
                    surface: surface
                }).show(true),
                bgLine: Ext.create('Ext.draw.Sprite', {
                    type: 'path',
                    path: path,
                    opacity: 0,
                    stroke: '#fff',
                    fill: 'none',
                    'stroke-width': 10,
                    surface: surface
                }).show(true),
                from: obj1,
                to: obj2,
                aBBPos: aBBPos,
                uuid: OJ.createUUID()
            };
        }
    };

    Ext.define('Ext.OJ.SqlTable', {
    extend: 'Ext.window.Window',
    minWidth: 120,
    alias: ['widget.sqltable'],
    cascadeOnFirstShow: 20,
    height: 180,
    width: 140,
    shadowSprite: {},
    layout: {
        type: 'fit'
    },
    closable: true,
    listeners: {
        show: function() {
            var thisView = this;
            initSQLTable(thisView);
        },
        beforeclose: function() {
            var thisView = this;
            closeSQLTable(thisView);
        }
    },
    initComponent: function(){
        var store, tableModel;

        this.connectionUUIDs = [];
        this.bMouseDown = false;

        // asign a uuid to the window, this builds relationship with sqlTable
        this.tableId = OJ.createUUID();


        store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: [{
                name: 'id',
                type: 'string'
            }, {
                name: 'tableName',
                type: 'string'
            }, {
                name: 'tableId',
                type: 'string',
                defaultValue: this.tableId
            }, {
                name: 'field',
                type: 'string'
            }, {
                name: 'extCmpId',
                type: 'string',
                defaultValue: this.id
            }, {
                name: 'type',
                type: 'string'
            }, {
                name: 'null',
                type: 'string'
            }, {
                name: 'key',
                type: 'string'
            }, {
                name: 'default',
                type: 'string'
            }, {
                name: 'extra',
                type: 'string'
            }],
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            },
            data: { items: [{ "field": "*", "extra": "", "id": "D04A39CB-AF22-A5F3-0246BA11FD51BCD8", "key": "", "tableName": "library", "null": "", "default": "", "type": "" }, { "field": "libraryid", "extra": "auto_increment", "id": "D04A39CC-E436-C0BE-1D51AEF07A7A5AAF", "key": "PRI", "tableName": "library", "null": false, "default": "", "type": "int(11)" }, { "field": "opened", "extra": "", "id": "D04A39CD-E13A-7228-81930472A5FC49AE", "key": "", "tableName": "library", "null": true, "default": "", "type": "datetime" }, { "field": "name", "extra": "", "id": "D04A39CE-04F3-D1CE-A1D72B04F40920C2", "key": "MUL", "tableName": "library", "null": true, "default": "", "type": "varchar(255)" }] }
        });

        // add sql table to OJ.sql.builder.sqlSelect tables store
        // also asign same id as stores uuid
        tableModel = Ext.create('Ext.OJ.SqlTableModel', {
            id: this.tableId,
            tableName: this.title,
            tableAlias: ''
        });
        OJ.sql.builder.sqlSelect.addTable(tableModel);

        this.items = [{
            xtype: 'sqltablegrid',
            store: store
        }];

        this.callParent(arguments);
    },
    
    beforeShow: function(){
        var aWin, prev, o;
        // cascading window positions
        if (this.cascadeOnFirstShow) {
            o = (typeof this.cascadeOnFirstShow == 'number') ? this.cascadeOnFirstShow : 20;
            // get all instances from xtype sqltable
            aWin = Ext.ComponentQuery.query('sqltable');
            // start position if there is only one table
            if (aWin.length == 1) {
                this.x = o;
                this.y = o;
            }
            else {
                // loop through all instances from xtype sqltable
                for (var i = 0, l = aWin.length; i < l; i++) {
                    if (aWin[i] == this) {
                        if (prev) {
                            this.x = prev.x + o;
                            this.y = prev.y + o;
                        }
                    }
                    if (aWin[i].isVisible()) {
                        prev = aWin[i];
                    }
                }
            }
            this.setPosition(this.x, this.y);
        }
    }
});

}());