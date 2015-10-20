/**
 * Canvas - it's a simple realization of webGl init
 * @constructor
 */
var Canvas = function() {
    var me = this;

    this.index = 0;

    this.vertexShader = '';
    this.fragmentShader = '';

    this.loadGLSL('shaders/simpleFragment', me.loadFileCb.bind(me), 'fragment');
    this.loadGLSL('shaders/simpleVertex', me.loadFileCb.bind(me), 'vertex');
};

Canvas.prototype.loadFileCb = function(content, type) {
    this.index = this.index - 1;

    if (type === 'fragment') {
        this.fragmentShader = content;
    } else if (type === 'vertex') {
        this.vertexShader = content;
    }


    if (this.index === 0) {
        this.init();
    }
};

Canvas.prototype.init = function() {
    var canvas = document.getElementById('myCanvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.canvas = canvas;

    this.gl = this.getGl();

    var glsl = this.getGLSL();

    var shader_vertex = this.getShader(glsl.vertex, this.gl.VERTEX_SHADER, "VERTEX");
    var shader_fragment = this.getShader(glsl.fragment, this.gl.FRAGMENT_SHADER, "FRAGMENT");

    var shaderProgram = this.gl.createProgram();

    this.gl.attachShader( shaderProgram, shader_vertex );
    this.gl.attachShader( shaderProgram, shader_fragment );

    this.gl.linkProgram(shaderProgram);

    var _position = this.gl.getAttribLocation(shaderProgram, 'position');
    this.gl.enableVertexAttribArray(_position);
    this.gl.useProgram(shaderProgram);

    var triangle_vertex=[
        -1,-1, //first summit -> bottom left of the viewport
        1,-1, //bottom right of the viewport
        1,1  //top right of the viewport
    ];

    var TRIANGLE_VERTEX = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), this.gl.STATIC_DRAW);

    var triangle_faces = [0,1,2];
    var TRIANGLE_FACES = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_faces), this.gl.STATIC_DRAW);

    this.gl.clearColor(0.0,0.0,0.0,0.0);

    this.TRIANGLE_VERTEX = TRIANGLE_VERTEX;
    this.TRIANGLE_FACES = TRIANGLE_FACES;
    this._position = _position;

    this.animate();
};

Canvas.prototype.animate = function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
    this.gl.vertexAttribPointer(this._position, 2, this.gl.FLOAT, false,4*2,0) ;

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
    this.gl.drawElements(this.gl.TRIANGLES, 3, this.gl.UNSIGNED_SHORT, 0);

    this.gl.flush();
    window.requestAnimationFrame(this.animate.bind(this));
};

Canvas.prototype.getCanvas = function() {
    return this.canvas;
};

Canvas.prototype.getGl = function() {
    var gl, canvas = this.getCanvas();

    try {
        //antialias helps to see real
        gl = canvas.getContext("experimental-webgl", {antialias : false})
    } catch (e) {
        alert("You are not webgl compatible :(") ;
        return undefined;
    }

    return gl;
};

Canvas.prototype.getGLSL = function() {

    return {
        vertex : this.vertexShader,
        fragment : this.fragmentShader
    }

};

Canvas.prototype.getShader = function(source, type, typeString) {

    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error(this.gl.getShaderInfoLog());
        return false;
    }

    return shader;

}

Canvas.prototype.loadGLSL = function (path, cb, type) {
    var txt = '';
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;

            cb(txt, type);
        }
    };

    xmlhttp.open("GET",path + ".glsl",true);
    xmlhttp.send();

    this.index = this.index + 1;
};

var canvas = new Canvas();