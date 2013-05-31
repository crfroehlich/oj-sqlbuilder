/* global window:true, Ext:true */

(function() {

    Ext.define('Ext.OJ.SqlSelect', {
        config: {
            tables: '',
            fields: '',
            joins: ''
        },
        constructor: function() {

            this.tables = Ext.create('Ext.OJ.SqlTableStore', {
                storeId: 'SQLTableStore'
            });

            // handle all updates on sql tables
            this.tables.on('update', this.handleSQLTableUpdate, this);
            this.tables.on('add', this.handleSQLTableAdd, this);
            this.tables.on('remove', this.handleSQLTableRemove, this);

            this.fields = Ext.create('Ext.OJ.SQLFieldsStore', {
                storeId: 'SQLFieldsStore'
            });

            this.fields.on('update', this.handleSQLFieldChanges, this);
            this.fields.on('remove', this.handleSQLFieldRemove, this);

            this.joins = Ext.create('Ext.OJ.JoinStore', {
                storeId: 'JoinStore'
            });

            // this.joins.on('update', this.handleSQLJoinChanges, this);
            this.joins.on('add', this.handleSQLJoinChanges, this);
            this.joins.on('remove', this.handleSQLJoinChanges, this);

            this.callParent(arguments);
        },
        handleSQLTableUpdate: function(tableStore, table, operation) {
            if (operation == 'commit') {
                this.updateFieldTableData(table);
                this.updateJoinTableData(table);
                this.updateSQLOutput();
            }
        },
        handleSQLTableAdd: function(tableStore, table, index) {
            this.updateSQLOutput();
        },
        handleSQLTableRemove: function(tableStore, table, index) {
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
        handleSQLJoinChanges: function(joinStore, join) {
            this.updateSQLOutput();
        },
        updateFieldTableData: function(table) {
            var tableId, expression, tableAlias, tableName;
            tableId = table.get('id');
            tableAlias = table.get('tableAlias');
            tableName = table.get('tableName');
            // loop over all fields of the fields store
            this.fields.each(function(field) {
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
        updateJoinTableData: function(table) {
            var joins, tableId;
            tableId = table.get('id');
            joins = this.getJoinsByTableId(tableId);
            for (var i = 0, rightTable, leftTable, joinCondition = '', l = joins.length; i < l; i++) {
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
        handleSQLFieldChanges: function(fieldStore, model, operation) {
            if (operation == 'commit') {
                this.updateSQLOutput();
            }
        },
        handleSQLFieldRemove: function(fieldStore) {
            this.updateSQLOutput();
        },
        updateSQLOutput: function() {
            var sqlOutput, sqlHTML, sqlQutputPanel;
            sqlOutput = this.toString();
            sqlHTML = '<pre class="brush: sql">' + sqlOutput + '</pre>';
            sqlQutputPanel = Ext.getCmp('SQLOutputPanel');

            sqlQutputPanel.update(sqlHTML);
        },
        sortTablesByJoins: function(tables, oUsedTables) {
            var aTables = [],
                aJoins = [],
                oUsedTables = oUsedTables || {};
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
        changeLeftRightOnJoin: function(join) {
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
        toString: function() {
            var sqlOutput = 'SELECT ',
                aJoins = [],
                aOutputFields = [],
                oJoinTables = {}, aTables = [],
                aJoinTables = [],
                aCriteriaFields = [],
                aGroupFields = [],
                aOrderFields = [],
                selectFieldsSQL = '',
                fromSQL = '',
                aFromSQL = [],
                criteriaSQL = '',
                orderBySQL = '',
                groupBySQL = '',
                fieldSeperator = ', ',
                joinSQL = '',
                bFirst = true,
                bPartOfJoin = false;
            this.fields.each(function(field) {
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
            this.tables.each(function(table) {
                aTables.push(table);
            });

            aTables = this.sortTablesByJoins(aTables).aTables;


            this.joins.each(function(join) {
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
        getJoinsByTableId: function(tableId) {
            var aReturn = [];
            this.joins.each(function(join) {
                if (join.get('leftTableId') == tableId || join.get('rightTableId') == tableId) {
                    aReturn.push(join);
                }
            });
            return aReturn;
        },
        removeTableById: function(tableID) {
            var table;
            table = this.tables.getById(tableID);
            this.tables.remove(table);
        },
        getTableById: function(tableID) {
            return this.tables.getById(tableID);
        },
        removeFieldById: function(id) {
            var field;
            field = this.fields.getById(id);
            this.fields.remove(field);
        },
        removeFieldsByTableId: function(tableId) {
            var aRecords = [];
            this.fields.each(function(model) {
                if (model.get('tableId') == tableId) {
                    aRecords.push(model);
                }
            });
            this.fields.remove(aRecords);
        },
        addTable: function(table) {
            this.tables.add(table);
        },
        addFieldRecord: function(record, bOutput) {
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
        addField: function(field) {
            this.fields.add(field);
        },
        getNewField: function() {
            return Ext.create('Ext.OJ.SQLFieldsModel');
        },
        removeJoinById: function(joinID) {
            var join;
            join = this.joins.getById(joinID);
            this.joins.remove(join);
        },
        addJoin: function(join) {
            this.joins.add(join);
        },
        arrayRemove: function(array, filterProperty, filterValue) {
            var aReturn;
            aReturn = Ext.Array.filter(array, function(item) {
                var bRemove = true;
                if (item[filterProperty] == filtervalue) {
                    bRemove = false;
                }
                return bRemove;
            });
            return aReturn
        }
    });

}());