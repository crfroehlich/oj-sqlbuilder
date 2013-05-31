///* jshint undef: true, unused: true */
///* global OJ:true, window:true, Ext:true, $: true */

//(function () {

//    var spriteDef = OJ.classDefinition({
//        name: 'Ext.OJ.SqlTableSprite',
//        extend: 'Ext.draw.Sprite',
//        alias: ['widget.sqltablesprite']
            
//    });
    
//    spriteDef.addProp('bConnections', false);
//    spriteDef.addProp('startDrag', function(id) {
//        var me = this,
//            win, sqlTablePanel, xyParentPos, xyChildPos;

//        // get a reference to a sqltable
//        win = Ext.getCmp(id);

//        // get the main sqlTablePanel
//        sqlTablePanel = Ext.getCmp('SQLTablePanel');

//        // get the main sqlTablePanel position
//        xyParentPos = sqlTablePanel.el.getXY();

//        // get the size of the previously added sqltable
//        xyChildPos = win.el.getXY();

//        me.prev = me.surface.transformToViewBox(xyChildPos[0] - xyParentPos[0] + 2, xyChildPos[1] - xyParentPos[1] + 2);
//    });

//    spriteDef.addProp('onDrag', function(relPosMovement) {
//        var xy, me = this,
//            attr = this.attr,
//            newX, newY;
//        // move the sprite
//        // calculate new x and y position
//        newX = me.prev[0] + relPosMovement[0];
//        newY = me.prev[1] + relPosMovement[1];
//        // set new x and y position and redraw sprite
//        me.setAttributes({
//            x: newX,
//            y: newY
//        }, true);
//    });

//    var sprite = spriteDef.init();

//    OJ.lift('tableSprite', sprite);


//    //   });

//}());


/* global window, Ext:true */

(function () {

    Ext.define('Ext.OJ.SqlTableSprite', {
        extend: 'Ext.draw.Sprite',
        alias: ['widget.sqltablesprite'],
        bConnections: false,
        startDrag: function (id) {
            var me = this,
                win, sqlTablePanel, xyParentPos, xyChildPos;

            // get a reference to a sqltable
            win = Ext.getCmp(id);

            // get the main sqlTablePanel
            sqlTablePanel = Ext.getCmp('SQLTablePanel');

            // get the main sqlTablePanel position
            xyParentPos = sqlTablePanel.el.getXY();

            // get the size of the previously added sqltable
            xyChildPos = win.el.getXY();

            me.prev = me.surface.transformToViewBox(xyChildPos[0] - xyParentPos[0] + 2, xyChildPos[1] - xyParentPos[1] + 2);
        },

        onDrag: function (relPosMovement) {
            var xy, me = this,
                attr = this.attr,
                newX, newY;
            // move the sprite
            // calculate new x and y position
            newX = me.prev[0] + relPosMovement[0];
            newY = me.prev[1] + relPosMovement[1];
            // set new x and y position and redraw sprite
            me.setAttributes({
                x: newX,
                y: newY

            }, true);
        }
    });

}());