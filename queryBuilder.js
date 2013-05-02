
Ext.define('OJ.sqlbuilder.SQLTableSprite', {
    extend: 'Ext.draw.Sprite',
    alias: ['widget.sqltablesprite'],
    bConnections: false,
    startDrag: function(id){
        var me = this, win, sqlTablePanel, xyParentPos, xyChildPos;

        // get a reference to a sqltable
        win = Ext.getCmp(id);

        // get the main sqlTablePanel
        sqlTablePanel = Ext.getCmp('SQLTablePanel');

        // get the main sqlTablePanel position
        xyParentPos = sqlTablePanel.el.getXY();

        // get the size of the previously added sqltable
        xyChildPos = win.el.getXY();

        me.prev = me.surface.transformToViewBox(xyChildPos[0] - xyParentPos[0] + 2, xyChildPos[1] - xyParentPos[1] + 2);
    },

    onDrag: function(relPosMovement){
        var xy, me = this, attr = this.attr, newX, newY;
        // move the sprite
        // calculate new x and y position
        newX = me.prev[0] + relPosMovement[0];
        newY = me.prev[1] + relPosMovement[1];
        // set new x and y position and redraw sprite
        me.setAttributes({
            x: newX,
            y: newY

        }, true);
    }
});

Ext.define('OJ.sqlbuilder.SQLTableModel', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'string'
    }, {
        name: 'tableName',
        type: 'string'
    }, {
        name: 'tableAlias',
        type: 'string'
    }]
});

Ext.define('OJ.sqlbuilder.SQLTableStore', {
    extend: 'Ext.data.Store',
    autoSync: true,
    model: 'OJ.sqlbuilder.SQLTableModel',
    proxy: {
        type: 'memory'
    }
});

Ext.define('OJ.sqlbuilder.SQLJoin', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'string'
    }, {
        name: 'leftTableId',
        type: 'string'
    }, {
        name: 'rightTableId',
        type: 'string'
    }, {
        name: 'leftTableField',
        type: 'string'
    }, {
        name: 'rightTableField',
        type: 'string'
    }, {
        name: 'joinCondition',
        type: 'string'
    }, {
        name: 'joinType',
        type: 'string'
    }],
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
    }
});

Ext.define('OJ.sqlbuilder.JoinStore', {
    extend: 'Ext.data.Store',
    autoSync: true,
    model: 'OJ.sqlbuilder.SQLJoin',
    proxy: {
        type: 'memory'
    }
});

Ext.define('OJ.sqlbuilder.SQLFieldsModel', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'string'
    }, {
        name: 'tableName',
        type: 'string'
    }, {
        name: 'tableId',
        type: 'string'
    }, {
        name: 'extCmpId',
        type: 'string'
    }, {
        name: 'tableAlias',
        type: 'string'
    }, {
        name: 'field',
        type: 'string'
    }, {
        name: 'output',
        type: 'boolean'
    }, {
        name: 'expression',
        type: 'string'
    }, {
        name: 'aggregate',
        type: 'string'
    }, {
        name: 'alias',
        type: 'string'
    }, {
        name: 'sortType',
        type: 'string'
    }, {
        name: 'sortOrder',
        type: 'int'
    }, {
        name: 'grouping',
        type: 'boolean'
    }, {
        name: 'criteria',
        type: 'string'
    }]
});

Ext.define('OJ.sqlbuilder.SQLFieldsStore', {
    extend: 'Ext.data.Store',
    autoSync: true,
    model: 'OJ.sqlbuilder.SQLFieldsModel',
    proxy: {
        type: 'memory'
    }
});

Ext.define('OJ.sqlbuilder.SQLSelect', {
    config: {
        tables: '',
        fields: '',
        joins: ''
    },
    constructor: function(){

        this.tables = Ext.create('OJ.sqlbuilder.SQLTableStore', {
            storeId: 'SQLTableStore'
        });

        // handle all updates on sql tables
        this.tables.on('update', this.handleSQLTableUpdate, this);
        this.tables.on('add', this.handleSQLTableAdd, this);
        this.tables.on('remove', this.handleSQLTableRemove, this);

        this.fields = Ext.create('OJ.sqlbuilder.SQLFieldsStore', {
            storeId: 'SQLFieldsStore'
        });

        this.fields.on('update', this.handleSQLFieldChanges, this);
        this.fields.on('remove', this.handleSQLFieldRemove, this);

        this.joins = Ext.create('OJ.sqlbuilder.JoinStore', {
            storeId: 'JoinStore'
        });

        // this.joins.on('update', this.handleSQLJoinChanges, this);
        this.joins.on('add', this.handleSQLJoinChanges, this);
        this.joins.on('remove', this.handleSQLJoinChanges, this);

        this.callParent(arguments);
    },
    handleSQLTableUpdate: function(tableStore, table, operation){
        if (operation == 'commit') {
            this.updateFieldTableData(table);
            this.updateJoinTableData(table);
            this.updateSQLOutput();
        }
    },
    handleSQLTableAdd: function(tableStore, table, index){
        this.updateSQLOutput();
    },
    handleSQLTableRemove: function(tableStore, table, index){
        var aJoins = [];
        // get table joins and remove them
        aJoins = this.getJoinsByTableId(table.get('id'));
        // loop over the joins array
        for (var i = 0, l = aJoins.length; i < l; i++) {
            // remove join from store
            this.removeJoinById(aJoins[i].get('id'));
        }
        this.updateSQLOutput();
    },
    handleSQLJoinChanges: function(joinStore, join){
        this.updateSQLOutput();
    },
    updateFieldTableData: function(table){
        var tableId, expression, tableAlias, tableName;
        tableId = table.get('id');
        tableAlias = table.get('tableAlias');
        tableName = table.get('tableName');
        // loop over all fields of the fields store
        this.fields.each(function(field){
            // check if current field belongs to sql table
            if (field.get('tableId') == tableId) {
                if (tableAlias != '') {
                    // we have a table alias
                    expression = tableAlias + '.' + field.get('field');
                }
                else {
                    // no table alias
                    expression = tableName + '.' + field.get('field');
                };
                field.beginEdit();
                // update the field table alias
                field.set('tableAlias', tableAlias);
                // update the field expression
                field.set('expression', expression);
                field.commit(true);
                field.endEdit();
            }
        });
        return;
    },
    updateJoinTableData: function(table){
        var joins, tableId;
        tableId = table.get('id');
        joins = this.getJoinsByTableId(tableId);
        for (var i = 0, rightTable, leftTable, joinCondition = '',l = joins.length; i < l; i++) {
            leftTable = this.getTableById(joins[i].get('leftTableId'));
            rightTable = this.getTableById(joins[i].get('rightTableId'));

            if (leftTable.get('tableAlias') != '') {
                joinCondition = joinCondition + leftTable.get('tableAlias') + '.' + joins[i].get('leftTableField') + '=';
            }
            else {
                joinCondition = joinCondition + leftTable.get('tableName') + '.' + joins[i].get('leftTableField') + '=';
            }

            if (rightTable.get('tableAlias') != '') {
                joinCondition = joinCondition + rightTable.get('tableAlias') + '.' + joins[i].get('rightTableField');
            }
            else {
                joinCondition = joinCondition + rightTable.get('tableName') + '.' + joins[i].get('rightTableField');
            }
            joins[i].beginEdit();
            joins[i].set('joinCondition', joinCondition);
            joins[i].commit(true);
            joins[i].endEdit();
        }
    },
    handleSQLFieldChanges: function(fieldStore, model, operation){
        if (operation == 'commit') {
            this.updateSQLOutput();
        }
    },
    handleSQLFieldRemove: function(fieldStore){
        this.updateSQLOutput();
    },
    updateSQLOutput: function(){
        var sqlOutput, sqlHTML, sqlQutputPanel;
        sqlOutput = this.toString();
        sqlHTML = '<pre class="brush: sql">' + sqlOutput + '</pre>';
        sqlQutputPanel = Ext.getCmp('SQLOutputPanel');

        sqlQutputPanel.update(sqlHTML);
    },
    sortTablesByJoins: function(tables, oUsedTables){
        var aTables = [], aJoins = [], oUsedTables = oUsedTables ||
        {};
        // loop over tables
        for (var i = 0, aCondition = [], aJoin, l = tables.length; i < l; i++) {
            // check if current table is a new one
            if (!oUsedTables.hasOwnProperty(tables[i].get('id'))) {
                // it is a new one
                aTables.push(tables[i]);
                // mark table as used
                oUsedTables[tables[i].get('id')] = true;
                // get any joins for the current table
                aJoin = this.getJoinsByTableId(tables[i].get('id'));
                // loop over the join tables
                for (var j = 0, joinTable, len = aJoin.length; j < len; j++) {
                    // check if it is a new join
                    if (!oUsedTables.hasOwnProperty(aJoin[j].get('id'))) {
                        // mark join as used
                        oUsedTables[aJoin[j].get('id')] = true;
                        if (tables[i].get('id') != aJoin[j].get('leftTableId')) {
                            joinTable = this.getTableById(aJoin[j].get('leftTableId'));
                            this.changeLeftRightOnJoin(aJoin[j]);
                        }
                        else {
                            joinTable = this.getTableById(aJoin[j].get('rightTableId'));
                        }
                        oTemp = this.sortTablesByJoins([joinTable], oUsedTables);
                        oUsedTables = oTemp.oUsedTables;
                        aTables = aTables.concat(oTemp.aTables);
                    }
                }
            }
        }

        return {
            aTables: aTables,
            oUsedTables: oUsedTables
        };
    },
    changeLeftRightOnJoin: function(join){
        var leftTable, leftTableField, rightTable, rightTableField, joinCondition = '';
        // prepare new data
        leftTable = this.getTableById(join.get('rightTableId'));
        leftTableField = join.get('rightTableField');
        rightTable = this.getTableById(join.get('leftTableId'));
        rightTableField = join.get('leftTableField');

        // construct new joinCondition
        if (leftTable.get('tableAlias') != '') {
            joinCondition = joinCondition + leftTable.get('tableAlias') + '.' + join.get('rightTableField') + '=';
        }
        else {
            joinCondition = joinCondition + leftTable.get('tableName') + '.' + join.get('rightTableField') + '=';
        }

        if (rightTable.get('tableAlias') != '') {
            joinCondition = joinCondition + rightTable.get('tableAlias') + '.' + join.get('leftTableField');
        }
        else {
            joinCondition = joinCondition + rightTable.get('tableName') + '.' + join.get('leftTableField');
        }

        // start transaction
        join.beginEdit();
        // change left and right join table data
        join.set('leftTableId', leftTable.get('id'));
        join.set('leftTableField', leftTableField);
        join.set('rightTableId', rightTable.get('id'));
        join.set('rightTableField', rightTableField);
        join.set('joinCondition', joinCondition);
        // silent commit without firing store events
        // this prevents endless loop
        join.commit(true);
        join.endEdit();
        // end transaction
        return;
    },
    toString: function(){
        var sqlOutput = 'SELECT ', aJoins = [], aOutputFields = [], oJoinTables = {}, aTables = [], aJoinTables = [], aCriteriaFields = [], aGroupFields = [], aOrderFields = [], selectFieldsSQL = '', fromSQL = '', aFromSQL = [], criteriaSQL = '', orderBySQL = '', groupBySQL = '', fieldSeperator = ', ', joinSQL = '', bFirst = true, bPartOfJoin = false;
        this.fields.each(function(field){
            // should the field be a part of the output
            if (field.get('output')) {
                aOutputFields.push(field);
            }
            // any criteria
            if (field.get('criteria') != '') {
                aCriteriaFields.push(field);
            }
            // check for grouping
            if (field.get('grouping')) {
                aGroupFields.push(field);
            }
            // check for sorting
            if (field.get('sortType') != '') {
                aOrderFields.push(field);
            }
        });

        // tables
        // sorting of tables
        this.tables.each(function(table){
            aTables.push(table);
        });

        aTables = this.sortTablesByJoins(aTables).aTables;


        this.joins.each(function(join){
            aJoins.push(join);
        });

        //create fromSQL
        for (var k = 0, aJoin = [], oJoinTables = {}, joinCondition = '', joinType, leftTable, rightTable, l = aTables.length; k < l; k++) {
            if (k == aTables.length - 1) {
                fieldSeperator = '';
            }
            else {
                fieldSeperator = ', ';
            };

            // is the current table the first one
            if (bFirst) {
                // yes it is the first

                // table id merken
                oJoinTables[aTables[k].get('id')] = true;

                bFirst = false;

                // check if current table is not the last one in the loop
                if ((k + 1) < aTables.length) {
                    // get joins where joins leftTableID is a property of oJoinTables and joins rightTableID equal to aTables[i+1].get('id')
                    for (var h = 0, len = aJoins.length; h < len; h++) {
                        if (oJoinTables.hasOwnProperty(aJoins[h].get('leftTableId')) && aJoins[h].get('rightTableId') == aTables[k + 1].get('id')) {
                            aJoin.push(aJoins[h]);
                        }
                        if (oJoinTables.hasOwnProperty(aJoins[h].get('rightTableId')) && aJoins[h].get('leftTableId') == aTables[k + 1].get('id')) {
                            this.changeLeftRightOnJoin(aJoins[h]);
                            aJoin.push(aJoins[h]);
                        }
                    }

                    // check if we have a join
                    if (aJoin.length > 0) {
                        // yes we have a join between aTables[k] and aTables[k+1] with at least one join condition

                        leftTable = aTables[k];
                        rightTable = aTables[k + 1];

                        // table id merken
                        oJoinTables[rightTable.get('id')] = true;

                        for (var j = 0, fieldSeperator = '', ln = aJoin.length; j < ln; j++) {
                            if (j == aJoin.length - 1) {
                                fieldSeperator = '';
                            }
                            else {
                                fieldSeperator = '\nAND ';
                            };
                            joinType = aJoin[j].get('joinType');
                            joinCondition = joinCondition + aJoin[j].get('joinCondition') + fieldSeperator;
                        }

                        // reset the join array
                        aJoin = [];

                        if (joinSQL != '') {
                            joinSQL = joinSQL + ',\n';
                        }

                        if (leftTable.get('tableAlias') != '') {
                            // we have an leftTable alias
                            joinSQL = joinSQL + leftTable.get('tableName') + ' ' + leftTable.get('tableAlias') + ' ' + joinType + ' JOIN ';
                        }
                        else {
                            //no alias
                            joinSQL = joinSQL + leftTable.get('tableName') + ' ' + joinType + ' JOIN ';
                        }

                        if (rightTable.get('tableAlias') != '') {
                            // we have an rightTable alias
                            joinSQL = joinSQL + rightTable.get('tableName') + ' ' + rightTable.get('tableAlias') + ' ON ' + joinCondition;
                        }
                        else {
                            //no alias
                            joinSQL = joinSQL + rightTable.get('tableName') + ' ON ' + joinCondition;
                        }

                        // clear joinCondition
                        joinCondition = '';

                    }
                    else {
                        // no join between aTables[i+1] and the one before
                        bFirst = true;
                        oJoinTables = {};
                        // check for tableAlias
                        if (aTables[k].get('tableAlias') != '') {
                            fromSQL = aTables[k].get('tableName') + ' ' + aTables[k].get('tableAlias');
                        }
                        else {
                            fromSQL = aTables[k].get('tableName');
                        }
                        aFromSQL.push(fromSQL);
                    }
                }
                else {
                    // its the last and only one in the loop
                    // check for tableAlias
                    if (aTables[k].get('tableAlias') != '') {
                        fromSQL = aTables[k].get('tableName') + ' ' + aTables[k].get('tableAlias');
                    }
                    else {
                        fromSQL = aTables[k].get('tableName');
                    }
                    aFromSQL.push(fromSQL);
                }
            }
            else {
                // no, it is not the first table

                bFirst = true;

                // check if current table is not the last one in the loop
                if ((k + 1) < aTables.length) {
                    // get joins where joins leftTableID is a property of oJoinTables and joins rightTableID equal to aTables[i+1].get('id')
                    for (var h = 0, len = aJoins.length; h < len; h++) {
                        if (oJoinTables.hasOwnProperty(aJoins[h].get('leftTableId')) && aJoins[h].get('rightTableId') == aTables[k + 1].get('id')) {
                            aJoin.push(aJoins[h]);
                        }
                        if (oJoinTables.hasOwnProperty(aJoins[h].get('rightTableId')) && aJoins[h].get('leftTableId') == aTables[k + 1].get('id')) {
                            this.changeLeftRightOnJoin(aJoins[h]);
                            aJoin.push(aJoins[h]);
                        }
                    }

                    // check if we have a join
                    if (aJoin.length > 0) {
                        // yes we have a join between aTables[k] and aTables[k+1] with at least one join condition

                        rightTable = aTables[k + 1];

                        // table id merken
                        oJoinTables[rightTable.get('id')] = true;

                        for (var j = 0, fieldSeperator = '', ln = aJoin.length; j < ln; j++) {
                            if (j == aJoin.length - 1) {
                                fieldSeperator = '';
                            }
                            else {
                                fieldSeperator = '\nAND ';
                            };
                            joinType = aJoin[j].get('joinType');
                            joinCondition = joinCondition + aJoin[j].get('joinCondition') + fieldSeperator;
                        }

                        // reset the join array
                        aJoin = [];

                        bFirst = false;

                        if (rightTable.get('tableAlias') != '') {
                            // we have an rightTable alias
                            joinSQL = joinSQL + '\n' + joinType + ' JOIN ' + rightTable.get('tableName') + ' ' + rightTable.get('tableAlias') + ' ON ' + joinCondition;
                        }
                        else {
                            //no alias
                            joinSQL = joinSQL + '\n' + joinType + ' JOIN ' + rightTable.get('tableName') + ' ON ' + joinCondition;
                        }

                        // clear joinCondition
                        joinCondition = '';
                    }
                    else {
                        bFirst = true;
                        oJoinTables = {};
                    }
                }
                else {
                    // its the last and only one
                    // check for tableAlias
                    oJoinTables = {};
                }
            }
        }

        fromSQL = aFromSQL.join(', ');

        if (joinSQL != '' && fromSQL != '') {
            joinSQL = joinSQL + ', ';
        }

        fromSQL = '\nFROM ' + joinSQL + fromSQL;

        // output fields
        for (var i = 0, l = aOutputFields.length; i < l; i++) {
            // check if it is the last array member
            if (i == aOutputFields.length - 1) {
                fieldSeperator = '';
            }
            else {
                fieldSeperator = ', ';
            };
            // yes, output
            // check alias
            if (aOutputFields[i].get('alias') != '') {
                // yes, we have an field alias
                selectFieldsSQL = selectFieldsSQL + aOutputFields[i].get('expression') + ' AS ' + aOutputFields[i].get('alias') + fieldSeperator;
            }
            else {
                // no field alias
                selectFieldsSQL = selectFieldsSQL + aOutputFields[i].get('expression') + fieldSeperator;
            }
        }

        // criteria
        for (var i = 0, l = aCriteriaFields.length; i < l; i++) {
            if (i == 0) {
                criteriaSQL = criteriaSQL + '\nWHERE ';
            }
            else {
                criteriaSQL = criteriaSQL + 'AND ';
            }
            if (i == aCriteriaFields.length - 1) {
                fieldSeperator = '';
            }
            else {
                fieldSeperator = '\n';
            }
            criteriaSQL = criteriaSQL + aCriteriaFields[i].get('expression') + ' ' + aCriteriaFields[i].get('criteria') + fieldSeperator;
        }

        // group by
        for (var i = 0, l = aGroupFields.length; i < l; i++) {
            // check if it is the last array member
            if (i == aGroupFields.length - 1) {
                fieldSeperator = '';
            }
            else {
                fieldSeperator = ', ';
            }
            if (i == 0) {
                groupBySQL = '\nGROUP BY ';
            }
            groupBySQL = groupBySQL + aGroupFields[i].get('expression') + fieldSeperator;
        }

        // order by
        for (var i = 0, l = aOrderFields.length; i < l; i++) {
            // check if it is the last array member
            if (i == aOrderFields.length - 1) {
                fieldSeperator = '';
            }
            else {
                fieldSeperator = ', ';
            }
        }

        return sqlOutput + selectFieldsSQL + fromSQL + criteriaSQL + groupBySQL + orderBySQL;
    },
    getJoinsByTableId: function(tableId){
        var aReturn = [];
        this.joins.each(function(join){
            if (join.get('leftTableId') == tableId || join.get('rightTableId') == tableId) {
                aReturn.push(join);
            }
        });
        return aReturn;
    },
    removeTableById: function(tableID){
        var table;
        table = this.tables.getById(tableID);
        this.tables.remove(table);
    },
    getTableById: function(tableID){
        return this.tables.getById(tableID);
    },
    removeFieldById: function(id){
        var field;
        field = this.fields.getById(id);
        this.fields.remove(field);
    },
    removeFieldsByTableId: function(tableId){
        var aRecords = [];
        this.fields.each(function(model){
            if (model.get('tableId') == tableId) {
                aRecords.push(model);
            }
        });
        this.fields.remove(aRecords);
    },
    addTable: function(table){
        this.tables.add(table);
    },
    addFieldRecord: function(record, bOutput){
        var tableAlias, model, expression;
        // get the tableAlias
        tableAlias = this.getTableById(record.get('tableId')).get('tableAlias');
        // build the expression
        // check if the tableAlias is not an empty string
        if (tableAlias != '') {
            // alias is not an empty string
            expression = tableAlias + '.' + record.get('field');
        }
        else {
            // alias is an empty string
            expression = record.get('tableName') + '.' + record.get('field');
        };
        // get a new field instance
        model = this.getNewField();
        // set the expression
        model.set('expression', expression);
        // set output to false per default
        model.set('output', bOutput);
        // set an id, so it is possible to remove rows if the associated table is removed
        model.set('id', record.get('id'));
        // set the field
        model.set('field', record.get('field'));
        // copy tableId to the new model instance
        model.set('tableId', record.get('tableId'));
        // copy cmp id of origin sqltable to the new model instance
        model.set('extCmpId', record.get('extCmpId'));
        this.addField(model);
    },
    addField: function(field){
        this.fields.add(field);
    },
    getNewField: function(){
        return Ext.create('OJ.sqlbuilder.SQLFieldsModel');
    },
    removeJoinById: function(joinID){
        var join;
        join = this.joins.getById(joinID);
        this.joins.remove(join);
    },
    addJoin: function(join){
        this.joins.add(join);
    },
    arrayRemove: function(array, filterProperty, filterValue){
        var aReturn;
        aReturn = Ext.Array.filter(array, function(item){
            var bRemove = true;
            if (item[filterProperty] == filtervalue) {
                bRemove = false;
            }
            return bRemove;
        });
        return aReturn
    }
});

Ext.define('OJ.sqlbuilder.SQLTablePanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.sqltablepanel'],
    id: 'SQLTablePanel',
    items: [{
        xtype: 'draw',
        listeners: {
            afterrender: function(){
                this.initDropTarget();
            }
        },
        initDropTarget: function(){
            // init draw component inside qbwindow as a DropTarget
            this.dropTarget = Ext.create('Ext.dd.DropTarget', this.el, {
                ddGroup: 'sqlDDGroup',
                notifyDrop: function(source, event, data){
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
        }
    }]
});

Ext.define('OJ.sqlbuilder.SQLOutputPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.sqloutputpanel'],
    id: 'SQLOutputPanel',
    listeners: {
        afterlayout: function(){
            SyntaxHighlighter.highlight();
        }
    },
    initComponent: function(){
        this.callParent(arguments);
    }
});

Ext.define('OJ.sqlbuilder.SQLFieldsGrid', {
    requires: ['Ext.ux.CheckColumn'],
    extend: 'Ext.grid.Panel',
    alias: ['widget.sqlfieldsgrid'],
    id: 'SQLFieldsGrid',
    store: 'SQLFieldsStore',
    columnLines: true,
    plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    })],
    viewConfig: {
        listeners: {
            render: function(view){
                this.dd = {};
                this.dd.dropZone = new Ext.grid.ViewDropZone({
                    view: view,
                    ddGroup: 'SQLTableGridDDGroup',
                    handleNodeDrop: function(data, record, position){
                        // Was soll nach dem Drop passieren?
                    }
                });
            },
            drop: function(node, data, dropRec, dropPosition){
                // add new rows to the SQLFieldsGrid after a drop
                for (var i = 0, l = data.records.length; i < l; i++) {
                    ux.vqbuilder.sqlSelect.addFieldRecord(data.records[i], false);
                }
            }
        }
    },
    columns: [{
        xtype: 'actioncolumn',
        menuDisabled: true,
        text: 'Action',
        width: 60,
        moveGridRow: function(grid, record, index, direction){
            var store = grid.getStore();
            if (direction < 0) {
                index--;
                if (index < 0) {
                    return;
                }
            }
            else {
                index++;
                if (index >= grid.getStore().getCount()) {
                    return;
                }
            }
            // prepare manual syncing
            store.suspendAutoSync();
            // disable firing store events
            store.suspendEvents();
            // remove record and insert record at new index
            store.remove(record);
            store.insert(index, record);
            // enable firing store events
            store.resumeEvents();
            store.resumeAutoSync();
            // manual sync the store
            store.sync();
        },
        items: [{
            icon: 'resources/images/up_arrow.gif',
            tooltip: 'Move Column Up',
            getClass: function(value, metadata, record){
                var store, index;
                store = record.store;
                index = store.indexOf(record);
                if (index == 0) {
                    return 'x-action-icon-disabled';
                }
                else {
                    return 'x-grid-center-icon';
                }
            },
            handler: function(grid, rowIndex, colIndex){
                var rec = grid.getStore().getAt(rowIndex);
                this.moveGridRow(grid, rec, rowIndex, -1);
            }
        }, {
            icon: 'resources/images/down_arrow.gif',
            getClass: function(value, metadata, record){
                var store, index;
                store = record.store;
                index = store.indexOf(record);
                if ((index + 1) == store.getCount()) {
                    return 'x-action-icon-disabled';
                }
                else {
                    return 'x-grid-center-icon';
                }
            },
            tooltip: 'Move Column Down',
            handler: function(grid, rowIndex, colIndex){
                var rec = grid.getStore().getAt(rowIndex);
                this.moveGridRow(grid, rec, rowIndex, 1);
            }
        }, {
            icon: 'resources/images/remove.gif',
            iconCls: 'x-grid-center-icon',
            tooltip: 'Delete Column',
            handler: function(grid, rowIndex, colIndex){
                var rec = grid.getStore().getAt(rowIndex), store, tableId, tableGrid, selectionModel, bDel = true;
                // rec contains column grid model, the one to remove
                // get tableId of original sqltable
                tableId = rec.get('extCmpId');
                // get the sql tables grid and its selection
                tableGrid = Ext.getCmp(tableId).down('gridpanel');
                selectionModel = tableGrid.getSelectionModel();
                Ext.Array.each(selectionModel.getSelection(), function(selection){
                    // deselect the selection wich corresponds to the column
                    // we want to remove from the column grid
                    if (rec.get('id') == selection.get('id')) {
                        // deselect current selection
                        // deselection will lead to removal, look for method deselect at the SQLTableGrid
                        selectionModel.deselect(selection);
                        bDel = false;
                    }
                });
                if (bDel) {
                    store = grid.getStore();
                    store.remove(rec);
                }
            }
        }]
    }, {
        xtype: 'checkcolumn',
        sortable: false,
        text: 'Output',
        flex: 0.075,
        menuDisabled: true,
        dataIndex: 'output',
        align: 'center'
    }, {
        xtype: 'gridcolumn',
        text: 'Expression',
        sortable: false,
        menuDisabled: true,
        flex: 0.225,
        dataIndex: 'expression',
        editor: 'textfield'
    }, {
        xtype: 'gridcolumn',
        text: 'Aggregate',
        flex: 0.125,
        sortable: false,
        menuDisabled: true,
        dataIndex: 'aggregate',
        editor: 'textfield'
    }, {
        xtype: 'gridcolumn',
        text: 'Alias',
        flex: 0.125,
        sortable: false,
        menuDisabled: true,
        dataIndex: 'alias',
        editor: 'textfield'
    }, {
        xtype: 'gridcolumn',
        text: 'Sort Type',
        flex: 0.125,
        sortable: false,
        menuDisabled: true,
        dataIndex: 'sorttype'
    }, {
        xtype: 'gridcolumn',
        text: 'Sort Order',
        flex: 0.125,
        sortable: false,
        menuDisabled: true,
        dataIndex: 'sortorder'
    }, {
        xtype: 'checkcolumn',
        text: 'Grouping',
        flex: 0.075,
        sortable: false,
        menuDisabled: true,
        dataIndex: 'grouping',
        align: 'center'
    }, {
        xtype: 'gridcolumn',
        text: 'Criteria',
        flex: 0.125,
        sortable: false,
        menuDisabled: true,
        dataIndex: 'criteria',
        editor: 'textfield'
    }],
    initComponent: function(){
        this.callParent(arguments);
    }
});

Ext.define('OJ.sqlbuilder.SQLTableTree', {
    extend: 'Ext.tree.Panel',
    alias: ['widget.sqltabletree'],
    id: 'SQLTableTree',
    listeners: {
        afterrender: function(){
            this.initTreeDragZone();
        },
        itemdblclick: function(view, record, el, index, event){
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
    initTreeDragZone: function(){
        // init tree view as a ViewDragZone
        this.view.dragZone = new Ext.tree.ViewDragZone({
            view: this.view,
            ddGroup: 'sqlDDGroup',
            dragText: '{0} ausgewählte Tabelle{1}',
            repairHighlightColor: 'c3daf9',
            repairHighlight: Ext.enableFx
        });
    },
    initComponent: function(){

        this.store = Ext.create('Ext.data.TreeStore', {
            root: {
                text: 'Tables',
                expanded: true,
                children: [{ "allowDrop": false, "text": "bestellpos", "leaf": true }, { "allowDrop": false, "text": "bestellung", "leaf": true }, { "allowDrop": false, "text": "bilder", "leaf": true }, { "allowDrop": false, "text": "category", "leaf": true }, { "allowDrop": false, "text": "categorynst", "leaf": true }, { "allowDrop": false, "text": "hersteller", "leaf": true }, { "allowDrop": false, "text": "histpreise", "leaf": true }, { "allowDrop": false, "text": "inventar", "leaf": true }, { "allowDrop": false, "text": "inventur", "leaf": true }, { "allowDrop": false, "text": "prod2cat", "leaf": true }, { "allowDrop": false, "text": "produkt", "leaf": true }]
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


Ext.define('OJ.sqlbuilder.SQLTableGrid', {
    extend: 'Ext.grid.Panel',
    alias: ['widget.sqltablegrid'],
    border: false,
    hideHeaders: true,
    viewConfig: {
        listeners: {
            bodyscroll: function(){
                var scrollOffset, sqlTable;
                // the bodyscroll event of the view was fired
                // get scroll information
                scrollOffset = this.el.getScroll();
                // get the parent sqltable
                sqlTable = this.up('sqltable');
                // change shadowSprites scrollTop property
                sqlTable.shadowSprite.scrollTop = scrollOffset.top;
                // redraw all connections to reflect scroll action
                for (var i = ux.vqbuilder.connections.length; i--;) {
                    sqlTable.connection(ux.vqbuilder.connections[i]);
                }
            },
            render: function(view){
                this.dd = {};
                // init the view as a DragZone
                this.dd.dragZone = new Ext.view.DragZone({
                    view: view,
                    ddGroup: 'SQLTableGridDDGroup',
                    dragText: '{0} selected table column{1}',
                    onInitDrag: function(x, y){
                        var me = this, data = me.dragData, view = data.view, selectionModel = view.getSelectionModel(), record = view.getRecord(data.item), e = data.event;
                        data.records = [record];
                        me.ddel.update(me.getDragText());
                        me.proxy.update(me.ddel.dom);
                        me.onStartDrag(x, y);
                        return true;
                    }
                });
                // init the view as a DropZone
                this.dd.dropZone = new Ext.grid.ViewDropZone({
                    view: view,
                    ddGroup: 'SQLTableGridDDGroup',
                    handleNodeDrop: function(data, record, position){
                        // Was soll nach dem Drop passieren?
                    },
                    onNodeOver: function(node, dragZone, e, data){
                        var me = this, view = me.view, pos = me.getPosition(e, node), overRecord = view.getRecord(node), draggingRecords = data.records;

                        if (!Ext.Array.contains(data.records, me.view.getRecord(node))) {
                            if (!Ext.Array.contains(draggingRecords, overRecord) && data.records[0].get('field') != '*') {
                                me.valid = true;
                                // valid drop target
                                // todo show drop invitation
                            }
                            else {
                                // invalid drop target
                                me.valid = false;
                            }
                        }
                        return me.valid ? me.dropAllowed : me.dropNotAllowed;
                    },
                    onContainerOver: function(dd, e, data){
                        var me = this;
                        // invalid drop target
                        me.valid = false;
                        return me.dropNotAllowed;
                    }
                });
            },
            drop: function(node, data, dropRec, dropPosition){
                var sqlTable1, sqlTable2, showJoinCM, connection, aBBPos, join, joinCondition = '', dropTable, targetTable;

                showJoinCM = function(event, el){
                    var cm;
                    // stop the browsers event bubbling
                    event.stopEvent();
                    // create context menu
                    cm = Ext.create('Ext.menu.Menu', {
                        items: [{
                            text: 'Edit Join',
                            icon: 'resources/images/document_edit16x16.gif',
                            handler: Ext.Function.bind(function(){

                            }, this)
                        }, {
                            text: 'Remove Join',
                            icon: 'resources/images/remove.gif',
                            handler: Ext.Function.bind(function(){
                                // remove any connection lines from surface and from array ux.vqbuilder.connections
                                ux.vqbuilder.connections = Ext.Array.filter(ux.vqbuilder.connections, function(connection){
                                    var bRemove = true;
                                    if (this.uuid == connection.uuid) {
                                        this.line.remove();
                                        this.bgLine.remove();
                                        this.miniLine1.remove();
                                        this.miniLine2.remove();
                                        bRemove = false;
                                    }
                                    return bRemove;
                                }, this);
                                ux.vqbuilder.sqlSelect.removeJoinById(this.uuid);
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

                if (node.boundView) {
                    sqlTable1 = data.view.up('window');
                    sqlTable1.shadowSprite.bConnections = true;

                    sqlTable2 = Ext.getCmp(node.boundView).up('window');
                    sqlTable2.shadowSprite.bConnections = true;

                    dropTable = ux.vqbuilder.sqlSelect.getTableById(sqlTable1.tableId);
                    targetTable = ux.vqbuilder.sqlSelect.getTableById(sqlTable2.tableId);

                    aBBPos = [data.item.viewIndex, node.viewIndex];

                    connection = sqlTable2.connection(sqlTable1.shadowSprite, sqlTable2.shadowSprite, "#000", aBBPos);

                    sqlTable1.connectionUUIDs.push(connection.uuid);
                    sqlTable2.connectionUUIDs.push(connection.uuid);

                    ux.vqbuilder.connections.push(connection);

                    // bgLine is white(invisble) and its stroke-width is 10
                    // so it is easier to capture the dblclick event
                    connection.bgLine.el.on('contextmenu', showJoinCM, connection);

                    // line is black and its stroke-width is 1
                    connection.line.el.on('contextmenu', showJoinCM, connection);

                    // create an instance of the join model
                    join = Ext.create('OJ.sqlbuilder.SQLJoin');
                    // set join id
                    join.set('id', connection.uuid);
                    // sqlTable1 is the left table
                    join.set('leftTableId', sqlTable1.tableId);
                    // data.records[0] represents the model of the dragged node
                    join.set('leftTableField', data.records[0].get('field'));
                    // sqlTable1 is the left table
                    join.set('rightTableId', sqlTable2.tableId);
                    // node.viewIndex is the index of the target node
                    join.set('rightTableField', sqlTable2.down('grid').store.getAt(node.viewIndex).get('field'));
                    // set the defaul join type to INNER
                    join.set('joinType', 'INNER');

                    if (dropTable.get('tableAlias') != '') {
                        joinCondition = joinCondition + dropTable.get('tableAlias') + '.' + join.get('leftTableField') + '=';
                    }
                    else {
                        joinCondition = joinCondition + dropTable.get('tableName') + '.' + join.get('leftTableField') + '=';
                    }

                    if (targetTable.get('tableAlias') != '') {
                        joinCondition = joinCondition + targetTable.get('tableAlias') + '.' + join.get('rightTableField');
                    }
                    else {
                        joinCondition = joinCondition + targetTable.get('tableName') + '.' + join.get('rightTableField');
                    }

                    join.set('joinCondition', joinCondition);
                    ux.vqbuilder.sqlSelect.addJoin(join);
                }

            }
        }
    },
    initComponent: function(){

        this.columns = [{
            xtype: 'gridcolumn',
            width: 16,
            dataIndex: 'key',
            renderer: function(val, meta, model){
                if (val == 'PRI') {
                    meta.style = 'background-image:url(resources/images/key.gif) !important;background-position:2px 3px;background-repeat:no-repeat;';
                }
                return '&nbsp;';
            }
        }, {
            xtype: 'gridcolumn',
            flex: 1,
            dataIndex: 'field',
            renderer: function(val, meta, model){
                if (model.get('key') == 'PRI') {
                    return '<span style="font-weight: bold;">' + val + '</span>&nbsp;&nbsp;<span style="color:#aaa;">' + model.get('type') + '</span>';
                }
                return val + '&nbsp;&nbsp;<span style="color:#999;">' + model.get('type') + '</span>';

            }
        }];

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode: 'SIMPLE',
            checkOnly: true,
            listeners: {
                select: function(selModel, data){
                    // add new rows to the SQLFieldsGrid after a selection change
                    ux.vqbuilder.sqlSelect.addFieldRecord(data, true);
                },
                deselect: function(selModel, data){
                    var store, model;
                    // remove row from SQLFieldsGrid after deselection
                    ux.vqbuilder.sqlSelect.removeFieldById(data.get('id'));
                }
            }
        });

        this.callParent(arguments);
    }
});

Ext.define('OJ.sqlbuilder.SQLTable', {
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
        ux.vqbuilder.sqlSelect.removeFieldsByTableId(this.tableId);

        // remove table from sqlTables store inside ux.vqbuilder.sqlSelect
        ux.vqbuilder.sqlSelect.removeTableById(this.tableId);

        // unregister mousedown event
        this.getHeader().el.un('mousedown', this.regStartDrag, this);
        // unregister mousemove event
        Ext.EventManager.un(document, 'mousemove', this.moveWindow, this);
        // remove sprite from surface
        Ext.getCmp('SQLTablePanel').down('draw').surface.remove(this.shadowSprite, false);
        // remove any connection lines from surface and from array ux.vqbuilder.connections
        ux.vqbuilder.connections = Ext.Array.filter(ux.vqbuilder.connections, function(connection){
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
        sprite = Ext.create('OJ.sqlbuilder.SQLTableSprite', {
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
            for (var i = ux.vqbuilder.connections.length; i--;) {
                this.connection(ux.vqbuilder.connections[i]);
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
        table = ux.vqbuilder.sqlSelect.getTableById(this.tableId);
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
                for (var i = ux.vqbuilder.connections.length; i--;) {
                    this.connection(ux.vqbuilder.connections[i]);
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
                type: 'local',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            },
            data: { items: [{ "field": "*", "extra": "", "id": "D04A39CB-AF22-A5F3-0246BA11FD51BCD8", "key": "", "tableName": "bestellung", "null": "", "default": "", "type": "" }, { "field": "bestell_id", "extra": "auto_increment", "id": "D04A39CC-E436-C0BE-1D51AEF07A7A5AAF", "key": "PRI", "tableName": "bestellung", "null": false, "default": "", "type": "int(11)" }, { "field": "bestell_datum", "extra": "", "id": "D04A39CD-E13A-7228-81930472A5FC49AE", "key": "", "tableName": "bestellung", "null": true, "default": "", "type": "datetime" }, { "field": "bname", "extra": "", "id": "D04A39CE-04F3-D1CE-A1D72B04F40920C2", "key": "MUL", "tableName": "bestellung", "null": true, "default": "", "type": "varchar(255)" }] }
        });

        // add sql table to ux.vqbuilder.sqlSelect tables store
        // also asign same id as stores uuid
        tableModel = Ext.create('OJ.sqlbuilder.SQLTableModel', {
            id: this.tableId,
            tableName: this.title,
            tableAlias: ''
        });
        ux.vqbuilder.sqlSelect.addTable(tableModel);

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

Ext.define('OJ.sqlbuilder', {
    extend: 'Ext.window.Window',
    alias: ['widget.qbwindow'],
    height: 620,
    width: 1000,
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
            split: true
        }]
    }],
    initComponent: function(){

        // create user extension namespace ux.vqbuilder
        Ext.namespace('ux.vqbuilder');

        // disable gutter (linenumbers) and toolbar for SyntaxHighlighter
        SyntaxHighlighter.defaults['gutter'] = false;
        SyntaxHighlighter.defaults['toolbar'] = false;

        ux.vqbuilder.connections = [];

        ux.vqbuilder.sqlSelect = Ext.create('OJ.sqlbuilder.SQLSelect');

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

//@ sourceURL=extjs/src/ux/window/VisualSQLQueryBuilder.js