/* global window, OJ, Ext:true */

(function _defineIIFE() {

    /**
     * Define declares a new class on the ExtJs namespace
     * @param name {String} The name of this class
     * @param props {OJ.classDefinition} An instance of a definiton object to augment this class.
    */
    OJ.lift('define', function _OjDefine(name, props) {
        if(!(props instanceof OJ.instanceof.ClassDefinition)) {
            throw new Error('Cannot define a class without a valid definition');
        }
        if(!(typeof name === 'string')) {
            throw new Error('Cannot define a class without a name');
        }
        var ret = Ext.define(name, props);
        return ret;

    });

}());