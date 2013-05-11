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

    /*
     * The constant is immutable
    */
    Object.seal(xtypes);
    Object.freeze(xtypes);

    OJ.constants.lift('xtypes', xtypes);

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

        if(-1 === Object.keys(OJ.constants.xtypes).indexOf(xtype)) {
            xtype = OJ.constants.xtypes.gridcolumn;
        }
        if(!text) {
            throw new Error('Text is required for column construction.');
        }

        Object.defineProperties(that, {
            xtype: {
                value: xtype,
                writable: true,
                configurable: true,
                enumerable: true
            },
            sortable: {
                value: false !== sortable,
                writable: true,
                configurable: true,
                enumerable: true
            },
            text: {
                value: text || '',
                writable: true,
                configurable: true,
                enumerable: true
            },
            flex: {
                value: flex || 0.125,
                writable: true,
                configurable: true,
                enumerable: true
            },
            menuDisabled: {
                value: false !== menuDisabled,
                writable: true,
                configurable: true,
                enumerable: true
            },
            dataIndex: {
                value: dataIndex || text.toLowerCase(),
                writable: true,
                configurable: true,
                enumerable: true
            }
        });
        if(editor) {
            Object.defineProperties(that, {
                editor: {
                    value: editor,
                    writable: true,
                    configurable: true,
                    enumerable: true
                }
            })
        }

        return that;
    };

    OJ.instanceof.lift('Column', Column);

    /**
     * Create a column definition.
     * @param def {Object} Possible property members: def.xtype, def.sortable, def.text, def.flex, def.menuDisabled, def.dataIndex, def.editor
    */
    OJ.columns.lift('column', function (def){
        if(!def) {
            throw new Error('Cannot create a column without parameters');
        }
        var ret = new Column(def.xtype, def.sortable, def.text, def.flex, def.menuDisabled, def.dataIndex, def.editor)
        return ret;
    });


    }());