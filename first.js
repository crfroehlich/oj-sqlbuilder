

window.Ext.Loader.setConfig({ enabled: true });

window.Ext.Loader.setPath('Ext', 'extjs');
window.Ext.state.Manager.setProvider(new Ext.state.LocalStorageProvider());

window.Ext.require([
    'Ext.ux.CheckColumn',
    'Ext.tip.QuickTipManager',
    'Ext.window.Window',
    'Ext.tab.Panel',
    'Ext.selection.CellModel',
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*',
    'Ext.ux.CheckColumn'
]);