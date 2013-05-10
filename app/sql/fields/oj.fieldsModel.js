/* global OJ: true, window:true, Ext:true */

(function() {

    //OJ.dependsOn(['OJ.models.field'], function () {

        var fields = OJ.models.fields();
        fields.add(OJ.models.field('id', 'string'))
              .add(OJ.models.field('tableName', 'string'))
              .add(OJ.models.field('tableId', 'string'))
              .add(OJ.models.field('extCmpId', 'string'))
              .add(OJ.models.field('tableAlias', 'string'))
              .add(OJ.models.field('field', 'string'))
              .add(OJ.models.field('output', 'boolean'))
              .add(OJ.models.field('expression', 'string'))
              .add(OJ.models.field('aggregate', 'string'))
              .add(OJ.models.field('alias', 'string'))
              .add(OJ.models.field('sortType', 'string'))
              .add(OJ.models.field('sortOrder', 'string'))
              .add(OJ.models.field('grouping', 'boolean'))
              .add(OJ.models.field('criteria', 'string'));

        var fieldsModel = OJ.define('Ext.oj-sqlbuilder.SQLFieldsModel', {
            extend: 'Ext.data.Model',
            fields: fields.value
        });

        OJ.lift('fieldsModel', fieldsModel);

       /* Ext.define('Ext.oj-sqlbuilder.SQLFieldsModel', {
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
        });*/
 //   });

}());