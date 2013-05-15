/* jshint undef: true, unused: true */
/* global OJ:true, window:true, Ext:true, $: true */

(function _listenerIIFE() {

     /**
      * The private constructor for a Listeners object.
      * @param listenerType {String} The name of the listener to create
      * @param namespace {String} The NameSpace to which the listener belongs
     */
      var Listeners = function (listenerType, namespace) {
          if (!(OJ.constants[listenerType])) {
              throw new Error('No listener type for "' + listenerType + '" has been defined.');
          }
          if (!(OJ[namespace])) {
              throw new Error('No listener class "' + namespace + '" has been defined.');
          }

          var that = this;
          var listeners = [];
          OJ.property(that, 'add',
              /**
                   * For a known listener name, apply the appropriate arguments as defined by Ext to a method wrapper to be assigned as the listener.
                   * @param name {OJ.constants[listenerType]} Name of the listener
                   * @param method {Function} callback method
                  */
              function(name, method) {
                  if (!(OJ.constants[listenerType].has(name))) {
                      throw new Error(listenerType + ' type ' + name + ' is not supported.');
                  }
                  if (-1 !== listeners.indexOf(name)) {
                      throw new Error(namespace + ' already containts a listenere for ' + name + '.');
                  }
                  listeners.push(name);

                  var listener = OJ[namespace].listeners[name](method);

                  OJ.property(that, name, listener);

                  return that;

              });

          return that;
      };

      OJ.instanceof.lift('Listeners', Listeners);

     /**
      * Create a new listeners collection. This returns a listeners object with an add method.
      * @param listenerType {String} The name of the listener to create
      * @param namespace {String} The NameSpace to which the listener belongs
     */
      OJ.lift('makeListeners', function (listenerType, namespace) {
          var ret = new Listeners(listenerType, namespace);
          return ret;
      });


      }());