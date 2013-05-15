/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function _columnIIFE(){

    /**
     * Ext xtypes constant. Possible values: 'checkcolumn', 'actioncolumn', 'gridcolumn'
    */
    var xtypes = Object.create(null);
    xtypes.checkcolumn = 'checkcolumn';
    xtypes.gridcolumn = 'gridcolumn';
    xtypes.actioncolumn = 'actioncolumn';
    OJ.constant('xtypes', xtypes);


    /**
     * Private column constructor class
     * @param xtyle {OJ.constants.xtype} [xtype=OJ.constants.xtypes.gridcolumn] The type of column
     * @param sortable {Boolean} [sortable=true] Is Column Sortable
     * @param text {String} Column name
     * @param flex {Number} [flex=0.125] relative Column width
     * @param menuDisabled {Boolean} [menuDisabled=false] Is Menu disabled?
     * @param dataIndex {String} [dataIndex=text] Unique Index Id for the column
     * @param editor {String} If the column is editable, type of editor
    */
    var Column = function (xtype, sortable, text, flex, menuDisabled, dataIndex, editor) {
        var that = this;

        if(false === OJ.constants.xtypes.has(xtype)) {
            xtype = OJ.constants.xtypes.gridcolumn;
        }
        if(!text) {
           // throw new Error('Text is required for column construction.');
        }

        OJ.property(that, 'xtype', xtype);

        if (sortable === true || sortable === false) {
            OJ.property(that, 'sortable', sortable);
        }
        if (text && text !== '' ) {
            OJ.property(that, 'text', text);
        }
        if (flex && flex !== 0) {
            OJ.property(that, 'flex', flex);
        }
        if (menuDisabled === true || menuDisabled === false) {
            OJ.property(that, 'menuDisabled', menuDisabled);
        }
        OJ.property(that, 'dataIndex', dataIndex || text);

        if(editor) {
            OJ.property(that, 'editor', editor);
        }

        return that;
    };

    OJ.instanceof.lift('Column', Column);

    /**
     * Create a column definition.
     * @param def {Object} Possible property members: def.xtype, def.sortable, def.text, def.flex, def.menuDisabled, def.dataIndex, def.editor
    */
    OJ.grids.columns.lift('column', function (def){
        if(!def) {
            throw new Error('Cannot create a column without parameters');
        }
        var ret = new Column(def.xtype, def.sortable, def.text, def.flex, def.menuDisabled, def.dataIndex, def.editor);
        return ret;
    });


    }());