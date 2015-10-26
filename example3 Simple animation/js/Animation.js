/**
 * Animation class for webGl
 * TODO : we use only FIRST SHADER
 *
 * @constructor
 */
function Animation(shaders) {
    var me = this;

    /**
     * Canvas that we use for drawing
     */
    me.canvas = me.getCanvas();

    /**
     * Init GL in canvas
     */
    me.gl = me.initGl(me.canvas);

    /**
     * Init shaders in the webGl scope
     */
    //TODO : only for the first shader
    me.shaderProgram = me.initShaders(me.gl, me.getShaders(shaders, me.gl));

    /**
     * Init elements that we use for drawing
     */
    me.buffers = me.initBuffers(me.gl);

    //clear all before draw
    me.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    me.gl.enable(me.gl.DEPTH_TEST); //TODO :WTF ??

    //start position for rotation
    me.rTri = 30;
    me.axis = [0, 1, 0];

    /**
     * Run animation after WEBGL init
     */
    me.animate(me.gl, me.buffers, me.shaderProgram);
}

Animation.prototype.animate = function(gl, buffers, shaderProgram) {
    var me = this,
        pMatrix = mat4.create(),
        mvMatrix = mat4.create();

    me.rTri = me.rTri + 10;

    //set correct data to the viewport
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); //x , y , width , height
    //clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //TODO : WTF?

    //https://github.com/gpjt/webgl-lessons/issues/8
    mat4.perspective(pMatrix, 45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    //create identity matrix for multiplying
    mat4.identity(mvMatrix);

    //vec3 - basically the part of mat4
    var translation = vec3.create();

    //set data in vec3
    vec3.set(translation, -1.5, 0.0, -7.0);

    //* @param {mat4} out the receiving matrix
    //* @param {mat4} a the matrix to translate
    //* @param {vec3} v vector to translate by
    mat4.translate(mvMatrix, mvMatrix, translation);


    mat4.rotate(mvMatrix, mvMatrix, utils.degToRad(me.rTri), me.axis);

    // Buffers are the way of getting vertex and other per vertex data onto the GPU.
    // gl.createBuffer creates a buffer.
    // gl.bindBuffer sets that buffer as the buffer to be worked on.
    // gl.bufferData copies data into the buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.triangle);

    // this command tells WebGL to get data from the buffer that was last bound with gl.bindBuffer,
    // how many components per vertex (1 - 4),
    // what the type of data is (BYTE, FLOAT, INT, UNSIGNED_SHORT, etc...),
    // the stride which means how many bytes to skip to get from one piece of data to the next piece of data,
    // and an offset for how far into the buffer our data is.
    gl.vertexAttribPointer(
        shaderProgram.vertexPositionAttribute,
        buffers.triangle.itemSize,
        gl.FLOAT,
        false, 0, 0);


    //ADDED COLOR
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.triangleColor);

    gl.vertexAttribPointer(
        shaderProgram.vertexColorAttribute,
        buffers.triangleColor.itemSize,
        gl.FLOAT,
        false, 0, 0
    );

    //set matrix uniform

    //void glUniformMatrix4fv(	GLint location,
    //    GLsizei count,
    //    GLboolean transpose,
    //    const GLfloat *value);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    //http://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html
    gl.drawArrays(gl.TRIANGLES, 0, buffers.triangle.numItems);


    window.requestAnimationFrame(me.animate.bind(me, gl, buffers, shaderProgram));
};

/**
 * Get canvas from DOM
 * @returns {Element}
 */
Animation.prototype.getCanvas = function() {
    return document.getElementById(Config.CANVAS_ID);
};

/**
 * Init GL in canvas
 * @param canvas
 * @returns {CanvasRenderingContext2D}
 */
Animation.prototype.initGl = function(canvas) {
    var gl = canvas.getContext('experimental-webgl');

    //set correct viewport size to the gl
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    return gl;
};

/**
 * Create shader program
 * @param gl
 * @param shaders
 */
Animation.prototype.initShaders = function(gl, shaders) {
   //TODO : use only first SHADER. FIX ME!

    var shader = shaders[0],
        shaderProgram = gl.createProgram();

    //The WebGLRenderingContext.attachShader() method
    // of the WebGL API attaches either a fragment or vertex WebGLShader to a WebGLProgram.
    gl.attachShader(shaderProgram, shader.vertex.shader);
    gl.attachShader(shaderProgram, shader.fragment.shader);

    //Links an attached vertex shader and an attached fragment shader
    // to a program so it can be used by the graphics processing unit (GPU).
    gl.linkProgram(shaderProgram);

    //check status on prev action
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('could not init shader');
    }

    gl.useProgram(shaderProgram);

    //http://metanit.com/web/webgl/2.4.php
    //set properties to the vertex shader
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    //gl.getAttriblocation - Returns an index to the location in a program of a named attribute variable.
    //WebGLRenderingContext.getAttribLocation(program, name);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);


    //ADDED new color attribute to the VERTEX shader
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    //Returns a WebGLUniformLocation object for the location of a uniform variable within a WebGLProgram object.
    //function(program,name)
    //TODO  : check
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');

    return shaderProgram;
};

/**
 * Compile shaders
 * @param data
 * @param gl
 * @returns {*}
 */
Animation.prototype.getShaders = function(data, gl) {
    var me = this;

    data.forEach(function(el) {
        /** FRAGMENT **/
        el.fragment.shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(el.fragment.shader, el.fragment.txt);
        gl.compileShader(el.fragment.shader);

        if (!gl.getShaderParameter(el.fragment.shader, gl.COMPILE_STATUS)) {
            console.error(el.fragment, el.fragment.shader)
        }

        /** VERTEX **/
        el.vertex.shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(el.vertex.shader, el.vertex.txt);
        gl.compileShader(el.vertex.shader);

        if (!gl.getShaderParameter(el.vertex.shader, gl.COMPILE_STATUS)) {
            console.error(el.vertex, el.vertex.shader)
        }
    });

    return data;
};

/**
 * Craete simple buffer
 * @param gl
 * @returns {{triangle: WebGLBuffer, square: WebGLBuffer}}
 */
Animation.prototype.initBuffers = function(gl) {

    //TRIANGLE BUFFER
    var triangleVertexPositionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

    var vertices = [
        // Front face
        0.0,  1.0,  0.0,
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        // Right face
        0.0,  1.0,  0.0,
        1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,
        // Back face
        0.0,  1.0,  0.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        // Left face
        0.0,  1.0,  0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    triangleVertexPositionBuffer.itemSize = 3; // coordinate count for number
    triangleVertexPositionBuffer.numItems = 12; // points count

    var triangleVertexColorBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);

    var colors = [
        // Front face
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        // Right face
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        // Back face
        0.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        // Left face
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4; //because matrix is 4x4 rgba
    triangleVertexColorBuffer.numItems = 12;

    //TODO : squre init
    //SQUARE BUFFER
    //var squareVertexPositionBuffer = gl.createBuffer();
    //
    //gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    //
    //var verticesSquare = [
    //    1.0,  1.0,  0.0,
    //    -1.0, 1.0,  0.0,
    //    1.0, -1.0,  0.0,
    //    -1.0, -1.0,  0.0
    //];
    //
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesSquare), gl.STATIC_DRAW);
    //
    //triangleVertexPositionBuffer.itemSize = 3; // coordinate count for number
    //triangleVertexPositionBuffer.numItems = 4; // points count

    return {
        triangle : triangleVertexPositionBuffer,
        triangleColor : triangleVertexColorBuffer
        //square : squareVertexPositionBuffer
    }
};

