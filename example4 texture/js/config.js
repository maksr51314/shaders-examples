var Config = {

    CANVAS_ID : 'canvas',

    Images : {
        FROG : 'assets/nehe.gif'
    },

    Shader : {
        ROOT_PATH : 'shaders/',
        FILE_TYPE : '.glsl',
        elements : [
            {
                vertex : {
                    path : 'vertexShader'
                },
                fragment : {
                    path : 'fragmentShader'
                }
            }
        ]
    }

};