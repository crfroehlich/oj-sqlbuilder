/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.oj-sqlbuilder.SQLTable', {
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
        show: function(){
            this.initSQLTable();
        },
        beforeclose: function(){
            this.closeSQLTable();
        }
    },
    closeSQLTable: function(){
        // remove fields / columns from sqlFieldsStore
        oj.sql.builder.sqlSelect.removeFieldsByTableId(this.tableId);

        // remove table from sqlTables store inside oj.sql.builder.sqlSelect
        oj.sql.builder.sqlSelect.removeTableById(this.tableId);

        // unregister mousedown event
        this.getHeader().el.un('mousedown', this.regStartDrag, this);
        // unregister mousemove event
        Ext.EventManager.un(document, 'mousemove', this.moveWindow, this);
        // remove sprite from surface
        Ext.getCmp('SQLTablePanel').down('draw').surface.remove(this.shadowSprite, false);
        // remove any connection lines from surface and from array oj.sql.builder.connections
        oj.sql.builder.connections = Ext.Array.filter(oj.sql.builder.connections, function(connection){
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
        }, this);

    },
    initSQLTable: function(){
        var sqlTablePanel, xyParentPos, xyChildPos, childSize, sprite;

        // get the main sqlTablePanel
        sqlTablePanel = Ext.getCmp('SQLTablePanel');

        // get the main sqlTablePanel position
        xyParentPos = sqlTablePanel.el.getXY();

        // get position of the previously added sqltable
        xyChildPos = this.el.getXY();

        // get the size of the previously added sqltable
        childSize = this.el.getSize();

        // create a sprite of type rectangle and set its position and size
        // to position and size of the the sqltable
        sprite = Ext.create('Ext.oj-sqlbuilder.SQLTableSprite', {
            type: 'rect',
            stroke: '#fff',
            height: childSize.height - 4,
            width: childSize.width - 4,
            x: xyChildPos[0] - xyParentPos[0] + 2,
            y: xyChildPos[1] - xyParentPos[1] + 2,
            scrollTop: 0
        });

        // add the sprite to the surface of the sqlTablePanel
        this.shadowSprite = sqlTablePanel.down('draw').surface.add(sprite).show(true);

        // handle resizeing of sqltabel
        this.resizer.on('resize', function(resizer, width, height, event){
            this.shadowSprite.setAttributes({
                width: width - 6,
                height: height - 6
            }, true);
            // also move the associated connections
            for (var i = oj.sql.builder.connections.length; i--;) {
                this.connection(oj.sql.builder.connections[i]);
            }
        }, this);

        // register a function for the mousedown event on the previously added sqltable and bind to this scope
        this.getHeader().el.on('mousedown', this.regStartDrag, this);

        this.getHeader().el.on('contextmenu', this.showSQLTableCM, this);

        this.getHeader().el.on('dblclick', this.showTableAliasEditForm, this);

        this.getHeader().origValue = '';

        // register method this.moveWindow for the mousemove event on the document and bind to this scope
        Ext.EventManager.on(document, 'mousemove', this.moveWindow, this);

        // register a function for the mouseup event on the document and add the this scope
        Ext.EventManager.on(document, 'mouseup', function(){
            // save the mousedown state
            this.bMouseDown = false;
        }, this);


    },
    showSQLTableCM: function(event, el){
        var cm;
        // stop the browsers event bubbling
        event.stopEvent();
        // create context menu
        cm = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Add/Edit Alias',
                icon: 'resources/images/document_edit16x16.gif',
                handler: Ext.Function.bind(function(){
                    this.showTableAliasEditForm();
                }, this)
            }, {
                text: 'Remove Table',
                icon: 'resources/images/delete.gif',
                handler: Ext.Function.bind(function(){
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
    },
    showTableAliasEditForm: function(event, el){
        var table, header, title, titleId;
        table = oj.sql.builder.sqlSelect.getTableById(this.tableId);
        header = this.getHeader();
        titleId = '#' + header.getId() + '_hd';
        title = this.down(titleId);
        header.remove(title);
        header.insert(0, [{
            xtype: 'textfield',
            flex: 0.95,
            parentCmp: header,
            parentTableModel: table,
            initComponent: function(){

                this.setValue(this.parentTableModel.get('tableAlias'));

                this.on('render', function(field, event){
                    // set focus to the textfield Benutzerkennung
                    field.focus(true, 200);
                }, this);

                this.on('specialkey', function(field, event){
                    if (event.getKey() == event.ENTER) {
                        if (field.getValue() != this.parentCmp.origValue) {
                            this.parentTableModel.set('tableAlias', field.getValue());
                            this.parentCmp.origValue = field.getValue();
                        }
                        this.removeTextField();
                        this.addTitle();
                    }
                }, this);

                this.on('blur', function(field, event){
                    if (field.getValue() != this.parentCmp.origValue) {
                        this.parentTableModel.set('tableAlias', field.getValue());
                        this.parentCmp.origValue = field.getValue();
                    }
                    this.removeTextField();
                    this.addTitle();
                }, this);

                this.callParent(arguments);
            },
            removeTextField: function(){
                var next;
                next = this.next();
                this.parentCmp.remove(next);
                this.parentCmp.remove(this);
            },
            addTitle: function(){
                var titleText;
                if (this.parentTableModel.get('tableAlias') != '') {
                    titleText = this.parentTableModel.get('tableAlias') + ' ( ' + this.parentTableModel.get('tableName') + ' )';
                }
                else {
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
    },
    regStartDrag: function(){
        // save the mousedown state
        this.bMouseDown = true;
        // start the drag of the sprite
        this.shadowSprite.startDrag(this.getId());
    },
    moveWindow: function(event, domEl, opt){
        var relPosMovement;
        // check mousedown
        if (this.bMouseDown) {
            // get relative x and y values (offset)
            relPosMovement = this.getOffset('point');
            // move the sprite to the position of the window
            this.shadowSprite.onDrag(relPosMovement);
            // check if the sprite has any connections
            if (this.shadowSprite.bConnections) {
                // also move the associated connections
                for (var i = oj.sql.builder.connections.length; i--;) {
                    this.connection(oj.sql.builder.connections[i]);
                }
            }
        }
    },
    getLeftRightCoordinates: function(obj1, obj2, aBBPos){
        var bb1, bb2, p = [], dx, leftBoxConnectionPoint, rightBoxConnectionPoint, dis, columHeight = 21, headerHeight = 46, LeftRightCoordinates = {};

        // BoundingBox Koordinaten für beide Sprites abrufen

        bb1 = obj1.getBBox();
        // y Wert für connection Points auf der linken und rechten Seite von bb1
        bb1.pY = bb1.y + headerHeight + ((aBBPos[0] - 1) * columHeight) + (columHeight / 2) - obj1.scrollTop;

        bb2 = obj2.getBBox();
        // y Wert für connection Points auf der linken und rechten Seite von bb2
        bb2.pY = bb2.y + headerHeight + ((aBBPos[1] - 1) * columHeight) + (columHeight / 2) - obj2.scrollTop;

        // code für linke boundingBox
        if (bb1.pY > (bb1.y + 4) && bb1.pY < (bb1.y + bb1.height - 4)) {
            p.push({
                x: bb1.x - 1, // Punkt auf linker Seite auf Höhe der verknüpften Spalte
                y: bb1.pY
            });
            p.push({
                x: bb1.x + bb1.width + 1, // Punkt auf rechter Seite auf Höhe der verknüpften Spalte
                y: bb1.pY
            });
        }
        else {
            if (bb1.pY < (bb1.y + 4)) {
                p.push({
                    x: bb1.x - 1, // Punkt auf linker Seite max. obere Position
                    y: bb1.y + 4
                });
                p.push({
                    x: bb1.x + bb1.width + 1, // Punkt auf rechter Seite max. obere Position
                    y: bb1.y + 4
                });
            }
            else {
                p.push({
                    x: bb1.x - 1, // Punkt auf linker Seite max. untere Position
                    y: bb1.y + bb1.height - 4
                });
                p.push({
                    x: bb1.x + bb1.width + 1, // Punkt auf rechter Seite max. untere Position
                    y: bb1.y + bb1.height - 4
                });
            };
                    };

        //  code für rechte boundingBox
        if (bb2.pY > (bb2.y + 4) && bb2.pY < (bb2.y + bb2.height - 4)) {
            p.push({
                x: bb2.x - 1, // Punkt auf linker Seite auf Höhe der verknüpften Spalte
                y: bb2.pY
            });
            p.push({
                x: bb2.x + bb2.width + 1, // Punkt auf rechter Seite auf Höhe der verknüpften Spalte
                y: bb2.pY
            });
        }
        else {
            if (bb2.pY < (bb2.y + 4)) {
                p.push({
                    x: bb2.x - 1, // Punkt auf linker Seite max. obere Position
                    y: bb2.y + 4
                });
                p.push({
                    x: bb2.x + bb2.width + 1, // Punkt auf rechter Seite max. obere Position
                    y: bb2.y + 4
                });
            }
            else {
                p.push({
                    x: bb2.x - 1, // Punkt auf linker Seite max. untere Position
                    y: bb2.y + bb2.height - 4
                });

                p.push({
                    x: bb2.x + bb2.width + 1, // Punkt auf rechter Seite max. untere Position
                    y: bb2.y + bb2.height - 4
                });
            }
        };

        // Schleife über die Punkte der ersten BoundingBox
        for (var i = 0; i < 2; i++) {
            // Schleife über die Punkte der zweiten BoundingBox
            for (var j = 2; j < 4; j++) {
                // Berechnung der Offsets zwischen den jeweils vier Punkten beider BoundingBoxes
                dx = Math.abs(p[i].x - p[j].x), dy = Math.abs(p[i].y - p[j].y);
                // bb1 links mit bb2 rechts
                if (((i == 0 && j == 3) && dx < Math.abs(p[1].x - p[2].x)) || ((i == 1 && j == 2) && dx < Math.abs(p[0].x - p[3].x))) {
                    leftBoxConnectionPoint = p[i];
                    rightBoxConnectionPoint = p[j];
                }
            }
        };

        return {
            leftBoxConnectionPoint: leftBoxConnectionPoint,
            rightBoxConnectionPoint: rightBoxConnectionPoint
        };

    },
    connection: function(obj1, obj2, line, aBBPos){
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
        LeftRightCoordinates = this.getLeftRightCoordinates(obj1, obj2, aBBPos);

        // check if the LeftBox is still on the left side or not
        if (LeftRightCoordinates.leftBoxConnectionPoint.x - LeftRightCoordinates.rightBoxConnectionPoint.x < 0) {
            line1 = 12;
            line2 = 12;
        }
        else {
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
        }
        else {
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
                uuid: this.createUUID()
            };
        }
    },
    initComponent: function(){
        var store, tableModel;

        this.connectionUUIDs = [];
        this.bMouseDown = false;

        // asign a uuid to the window, this builds relationship with sqlTable
        this.tableId = this.createUUID();


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

        // add sql table to oj.sql.builder.sqlSelect tables store
        // also asign same id as stores uuid
        tableModel = Ext.create('Ext.oj-sqlbuilder.SQLTableModel', {
            id: this.tableId,
            tableName: this.title,
            tableAlias: ''
        });
        oj.sql.builder.sqlSelect.addTable(tableModel);

        this.items = [{
            xtype: 'sqltablegrid',
            store: store
        }];

        this.callParent(arguments);
    },
    getOffset: function(constrain){
        var xy = this.dd.getXY(constrain), s = this.dd.startXY;
        // return the the difference between the current and the drag&drop start position
        return [xy[0] - s[0], xy[1] - s[1]];
    },
    createUUID: function(){
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
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