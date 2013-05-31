/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function () {

    //var fields = OJ.grids.fields.fields();
    //fields.add(OJ.grids.fields.field('id', 'string'))
    //    .add(OJ.grids.fields.field('tableName', 'string'))
    //    .add(OJ.grids.fields.field('tableAlias', 'string'));
          

    //var tableDef = OJ.classDefinition({
    //    name: 'Ext.OJ.SqlTableModel',
    //    extend: 'Ext.data.Model',
    //    onDefine: function (def) {
    //        def.fields = fields.value;
    //        delete def.initComponent;
    //    }
    //});
    
    ///**
    // * Instance a collection of fields to describe a JOIN in the SQL output table
    //*/

    //var SqlTableModel = tableDef.init();

   // OJ.lift('SqlTableModel', SqlTableModel);
    

    Ext.define('Ext.OJ.SqlTableModel', {
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

}());