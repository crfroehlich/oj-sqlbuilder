(function _fieldIIFE(){

     /**
      * The private constructor for a Field object.
      * @param defaultValue {String} [defaultValue] A default value
     */
      var Field = function (defaultValue) {
          var that = this;
          Object.defineProperties(that, {
              id: {
                  value: '',
                  writable: true,
                  configurable: true,
                  enumerable: true
              },
              name: {
                  value: '',
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

      OJ.instanceof.lift('Field', Field);

     /**
      * Create a new field
      * @param id {String} The unique ID for this field
      * @param name {String} The display name of this field
      * @param defaultValue {String} [defaultValue] A default value
     */
      OJ.fields.lift('field', function (id, name, defaultValue){
          var ret = new Field(defaultValue);
          ret.id = id;
          ret.name = name;
          return ret;
      });


      }());