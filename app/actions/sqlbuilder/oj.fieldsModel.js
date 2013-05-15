/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function() {

    //OJ.dependsOn(['OJ.fields.field'], function () {

        var fields = OJ.grids.fields.fields();
        fields.add(OJ.grids.fields.field('id', 'string'))
              .add(OJ.grids.fields.field('tableName', 'string'))
              .add(OJ.grids.fields.field('tableId', 'string'))
              .add(OJ.grids.fields.field('extCmpId', 'string'))
              .add(OJ.grids.fields.field('tableAlias', 'string'))
              .add(OJ.grids.fields.field('field', 'string'))
              .add(OJ.grids.fields.field('output', 'boolean'))
              .add(OJ.grids.fields.field('expression', 'string'))
              .add(OJ.grids.fields.field('aggregate', 'string'))
              .add(OJ.grids.fields.field('alias', 'string'))
              .add(OJ.grids.fields.field('sortType', 'string'))
              .add(OJ.grids.fields.field('sortOrder', 'string'))
              .add(OJ.grids.fields.field('grouping', 'boolean'))
              .add(OJ.grids.fields.field('criteria', 'string'));

        var fieldDef = OJ.classDefinition({
            name: 'Ext.OJ.SQLFieldsModel',
            extend: 'Ext.data.Model'
        });
        fieldDef.fields = fields.value;

        /**
         * Instance a collection of fields to describe a row in the SQL output table
        */
        var fieldsModel = fieldDef.init();

        OJ.lift('fieldsModel', fieldsModel);


 //   });

}());