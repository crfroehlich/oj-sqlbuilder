(function(){

    OJ.makeSubNameSpace('models');

    var model = function() {
        var that = this;
        Object.defineProperties(that, {
            id: {
                value: '',
                writable: true
            },
            name: {
                value: '',
                writable: true
            },
            defaultValue: {
                value: '',
                writable: true
            }
        });
        return that;
    };

    OJ.models.lift('field', function(id, name, defaultValue){
        var ret = Object.create(model);
        ret.id = id;
        ret.name = name;
        ret.defaultValue = defaultValue;
        return ret;
    });


    }());