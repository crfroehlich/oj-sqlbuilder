/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function _gridIIFE() {

    /**
     * Define the properties which are available to Grid.
    */
    var gridProperties = Object.create(null);
    gridProperties.columnLines = 'columnLines';
    gridProperties.border = 'border';
    gridProperties.hideHeaders = 'hideHeaders';
    gridProperties.selModel = 'selModel';
    OJ.constant('gridProperties', gridProperties);

    /**
     * Private class representing the construnction of a grid. It returns a OJ.grid.grid instance with collections for adding columns and listeners.
     * @param gridName {String} The ClassName of the grid to associate with ExtJS
     * @param requires {Array} An array of ExtJS dependencies
     * @param extend {String} [extend='Ext.grid.Panel'] An ExtJs class name to extend, usually the grid panel
     * @param alias {Array} [alias] An array of aliases to reference the grid
     * @param id {String} An id to uniquely identify the grid
     * @param store {OJ.grids.stores.store} A store to provide data to the grid
     * @param plugins {Array} An array of plugins to load with the grid
     * @param columnLines {Boolean} 
    */
    var Grid = function(name, requires, extend, alias, id, store, plugins, columnLines, onInit) {
        var that = window.OJ.classDefinition({
            name: name,
            requires: requires,
            extend: extend || 'Ext.grid.Panel',
            alias: alias,
            id: id,
            store: store,
            plugins: plugins,
            constant: 'gridProperties',
            namespace: 'grids',
            onDefine: function(classDef) {
                OJ.property(classDef, 'columns', columns.value);
            }
        });
        
        if (columnLines === true || columnLines === false) {
            OJ.property(that, OJ.constants.gridProperties.columnLines, columnLines);
        }

        if (onInit) {
            that.addInitComponent(function(them) {
                onInit(them);
            });
        }
        var columns = OJ.grids.columns.columns();
        OJ.property(that, 'columnCollection', columns, false, false, false);
        
        return that;
    };

    OJ.instanceof.lift('Grid', Grid);

    /**
     * Create a grid object.
     * @returns {Csw.grids.grid} A grid object. Exposese listeners and columns collections. Call init when ready to construct the grid. 
    */
    OJ.grids.lift('grid', function(gridDef) {
        if(!(gridDef)) {
            throw new Error('Cannot instance a Grid without properties');
        }
        if (!(gridDef.name)) {
            throw new Error('Cannot instance a Grid without a classname');
        }
        var grid = new Grid(gridDef.name, gridDef.requires, gridDef.extend, gridDef.alias, gridDef.id, gridDef.store, gridDef.plugins, gridDef.columnLines, gridDef.onInit);
        return grid;
    });


}());