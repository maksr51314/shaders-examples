var utils = {

    //clone object
    clone : function (obj) {
        var me = this;

        if(obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        var temp = obj.constructor(); // changed

        for(var key in obj) {
            if(Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = me.clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    }

};