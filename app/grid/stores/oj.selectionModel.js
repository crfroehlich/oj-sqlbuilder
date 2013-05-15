/* jshint undef: true, unused: true */
/* global Csw2:true, window:true, Ext:true, $: true */

(function _selectionModelClassIIFE() {

    var gridSelectionMode = Object.create(null);
    gridSelectionMode.simple = 'SIMPLE';
    gridSelectionMode.single = 'SINGLE';
    gridSelectionMode.multi = 'MULTI';
    Csw2.constant('gridSelectionMode', gridSelectionMode);

    /**
     * Internal class to define a Proxy. This class cannot be directly instanced.
     */
    var SelectionModel = function(mode, checkOnly, onSelect, onDeselect) {
        if (!(Csw2.constants.gridSelectionMode.has(mode))) {
            throw new Error('Grid selection model does not support mode "' + mode + '".');
        }
        var that = this;
        Csw2.property(that, 'mode', mode);
        Csw2.property(that, 'checkOnly', checkOnly);

        //Until we need more listeners on the Selection Model, let's define them ad hoc.
        //This'll be right until it isn't.
        if (onSelect || onDeselect) {
            Csw2.property(that, 'listeners', {});
            if (onSelect) {
                Csw2.property(that.listeners, 'select', onSelect);
            }
            if (onDeselect) {
                Csw2.property(that.listeners, 'deselect', onDeselect);
            }
        }

        Csw2.property(that, 'ExtSelModel', Ext.create('Ext.selection.CheckboxModel', that));

        return that;
    };

    Csw2.instanceof.lift('SelectionModel', SelectionModel);

    /**
     * Instance a new Selection Model. Selection Models are the constraints upon which elements from grids can be selected.
     * @param selDef {Object} Object describing the model
     */
    Csw2.grids.stores.lift('selectionModel', function(selDef) {
        if (!selDef) {
            throw new Error('Cannot create a selection model without a definition.');
        }
        selDef.mode = selDef.mode || Csw2.constants.gridSelectionMode.simple;
        var ret = new SelectionModel(selDef.mode, selDef.checkOnly, selDef.onSelect, selDef.onDeselect);

        return ret;
    });

}());