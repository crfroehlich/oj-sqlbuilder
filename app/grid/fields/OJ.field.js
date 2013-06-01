(function _fieldIIFE(){

     /**
      * The private constructor for a Field object.
      * @param defaultValue {String} [defaultValue] A default value
     */
      var Field = function (name, type, defaultValue) {
          var that = this;
          Object.defineProperties(that, {
              type: {
                  value: type,
                  writable: true,
                  configurable: true,
                  enumerable: true
              },
              name: {
                  value: name,
                  writable: true,
                  configurable: true,
                  enumerable: true
              }
          });
          if(defaultValue) {
              Object.defineProperties(that, {
                  defaultValue: {
                      value: defaultValue,
                      writable: true,
                      configurable: true,
                      enumerable: true
                  }
              })
          }
          return that;
      };

      OJ.instanceOf.lift('Field', Field);

     /**
      * Create a new field
      * @param id {String} The unique ID for this field
      * @param name {String} The display name of this field
      * @param defaultValue {String} [defaultValue] A default value
     */
      OJ.grids.fields.lift('field', function (type, name, defaultValue){
          var ret = new Field(name, type, defaultValue);
          return ret;
      });


      }());