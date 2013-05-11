/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function() {

    var fields = OJ.fields.fields();
        fields.add(OJ.fields.field('id', 'string'))
              .add(OJ.fields.field('leftTableId', 'string'))
              .add(OJ.fields.field('rightTableId', 'string'))
              .add(OJ.fields.field('leftTableField', 'string'))
              .add(OJ.fields.field('rightTableField', 'string'))
              .add(OJ.fields.field('joinCondition', 'string'))
              .add(OJ.fields.field('joinType', 'boolean'));

        var fieldDef = OJ.classDefinition({extend: 'Ext.data.Model'});
        fieldDef.fields = fields.value;

        /**
         * Instance a collection of fields to describe a JOIN in the SQL output table
        */

        var joinModel = OJ.define('Ext.oj-sqlbuilder.SQLJoin', fieldDef);

        OJ.lift('joinModel', joinModel);
}());