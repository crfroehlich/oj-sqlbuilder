/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function _gridColumnIIFE(){

    /**
     * Private grid column class constructor
    */
    var GridColumn = function (text, editor, flex) {
        var that = OJ.columns.column({
                xtype: OJ.constants.xtypes.gridcolumn,
                flex: flex || 0.125,
                editor: editor,
                text: text
            });

        return that;
    };

    OJ.instanceof.lift('GridColumn', GridColumn);

    /**
     * Create a check column
     * @param sortable {Boolean} [sortable=true] Is Column Sortable
     * @param text {String} Column Name
     * @param menuDisabled {Boolean} [menuDisabled=false] Is Menu Disabled
     * @param flex {Number} [flex=0.125] Relative width of the column
     * @param editor {String} If column is editable, the type of editor
    */
    OJ.columns.lift('gridColumn', function (sortable, text, menuDisabled, flex, editor){
        if(arguments.length === 0) {
            throw new Error('Cannot create a column without parameters');
        }

        var ret = new GridColumn(text, editor, flex);
        ret.menuDisabled = menuDisabled;
        ret.sortable = sortable;
        return ret;
    });


    }());