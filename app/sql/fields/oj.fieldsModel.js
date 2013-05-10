/* global OJ: true, window:true, Ext:true */

(function() {

    //OJ.dependsOn(['OJ.fields.field'], function () {

        var fields = OJ.fields.fields();
        fields.add(OJ.fields.field('id', 'string'))
              .add(OJ.fields.field('tableName', 'string'))
              .add(OJ.fields.field('tableId', 'string'))
              .add(OJ.fields.field('extCmpId', 'string'))
              .add(OJ.fields.field('tableAlias', 'string'))
              .add(OJ.fields.field('field', 'string'))
              .add(OJ.fields.field('output', 'boolean'))
              .add(OJ.fields.field('expression', 'string'))
              .add(OJ.fields.field('aggregate', 'string'))
              .add(OJ.fields.field('alias', 'string'))
              .add(OJ.fields.field('sortType', 'string'))
              .add(OJ.fields.field('sortOrder', 'string'))
              .add(OJ.fields.field('grouping', 'boolean'))
              .add(OJ.fields.field('criteria', 'string'));

        var fieldDef = OJ.classDefinition({extend: 'Ext.data.Model'});
        fieldDef.fields = fields.value;

        /**
         * Instance a collection of fields to describe a row in the SQL output table
        */
        var fieldsModel = OJ.define('Ext.oj-sqlbuilder.SQLFieldsModel', fieldDef);

        OJ.lift('fieldsModel', fieldsModel);


 //   });

}());