var resourceLoader = {
    /**
     * Load all resources
     * @param cb
     */
    load : function(cb) {
        var me = this,
            rootPath = Config.Shader.ROOT_PATH,
            fileType = Config.Shader.FILE_TYPE,
            els = utils.clone(Config.Shader.elements),
            allElCount = els.length*2;

        Config.Shader.elements.forEach(function(shader, index) {

            Object.keys(shader).forEach(function(type) {

                console.log(type)

                me.createRequest(rootPath + shader[type].path + fileType,
                    function(data, type) {
                        allElCount = allElCount - 1;

                        els[index][type].txt = data;

                        if (allElCount === 0) {
                            cb(els);
                        }
                    }, type);

            });

        });
    },

    //simple GET request
    createRequest : function(path, cb, type) {
        var client = new XMLHttpRequest();
        client.open('GET', path);
        client.onreadystatechange = function(xmlhttp) {

            if (client.readyState == 4 && client.status == 200) {
                cb(client.responseText, type);
            }
        };
        client.send();
    }


};