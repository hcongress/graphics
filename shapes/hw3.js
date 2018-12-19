"use strict";

let canvas;

/** @type {WebGLRenderingContext} */
let gl;

let program;

let rot1;
let rot2;
let rot3;
let scale1;
let tz;
let tx=0;
let ty=0;

let shapes = [];
let points = [];
let colors = []; 

let status;

// Represents a shape to be drawn to the screen, and maintains the relevant
// GPU buffers
class Shape {
    constructor() {
        if (!gl) {
            console.log("Shape constructor must be called after WebGL is initialized");
        }
        // Buffer for vertex positions
        this.vBuffer = gl.createBuffer();

        // Buffer for vertex colors
        this.cBuffer = gl.createBuffer();

        // Transformation matrix
        this.mat = mat4();

        // Number of vertices in this shape
        this.numVertices = 0;

        // What draw mode to use
        this.drawMode = gl.TRIANGLES;
    }

    // Render the shape to the screen
    draw() {
        
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer );
        let vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer ); 
        let vColor = gl.getAttribLocation( program, "vColor" );
         gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
         gl.enableVertexAttribArray( vColor );

         let location = gl.getUniformLocation(program, "mat");
         gl.uniformMatrix4fv(location, false, flatten(this.mat));
    

         gl.drawArrays(this.drawMode, 0 , this.numVertices);

    }

    // Set the positions and colors to be used for this shape.  Both positions
    // and colors should be arrays of vec4s.
    setData(positions, colors) {
        if (positions.length != colors.length) {
            console.log("Positions and colors not the same length");
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

        this.numVertices = positions.length;

        colors = [];
        points = [];
        
    }

    // Set transformation matrix
    setMat(mat) {
        this.mat = mat;
    }
}

window.onload = function init()
{
    status = document.getElementById("status");
    rot1 = document.getElementById("rot1");
    rot2 = document.getElementById("rot2");
    rot3 = document.getElementById("rot3");
    scale1 = document.getElementById("scale1");
    tz = document.getElementById("tz");
    [rot1, rot2, rot3, scale1, tz].forEach(function(elem) {
        elem.initValue = elem.value;
        elem.addEventListener("input", render);
        elem.addEventListener("dblclick", function() {
            elem.value = elem.initValue;
            render();
        });
    });
    let addCube = document.getElementById("addCube");
    addCube.addEventListener("click", function() {
        let Cube = new Shape();

        colorCube();

        Cube.setData(points, colors);
        
        shapes.push(Cube);


        render();

        colors = [];
        points = [];

    });


    let addTetreha = document.getElementById("addTetreha");
    addTetreha.addEventListener("click", function() {
        let Tethrahedron = new Shape();

        colorTreha();

        Tethrahedron.setData(points, colors);
        
        shapes.push(Tethrahedron);


        render();
        colors = [];
        points = [];

    });

    let addTorus = document.getElementById("addShapeTwo");
    addShapeTwo.addEventListener("click", function() {
        let Torus = new Shape();

        const NUM_DIVS = 50;
    for (let u=0; u<NUM_DIVS; u++) {
        for (let v=0; v<NUM_DIVS; v++) {
            let uf = u / NUM_DIVS;
            let vf = v / NUM_DIVS;
            let upf = (u+1)/NUM_DIVS;
            let vpf = (v+1)/NUM_DIVS;
            points.push(vec4(xTorus(uf, vf), yTorus(uf, vf), zTorus(uf, vf)));
            points.push(vec4(xTorus(upf, vf), yTorus(upf, vf), zTorus(upf, vf)));
            points.push(vec4(xTorus(upf, vpf), yTorus(upf, vpf), zTorus(upf, vpf)));
            
            points.push(vec4(xTorus(uf, vf), yTorus(uf, vf), zTorus(uf, vf)));
            points.push(vec4(xTorus(upf, vpf), yTorus(upf, vpf), zTorus(upf, vpf)));
            points.push(vec4(xTorus(uf, vpf), yTorus(uf, vpf), zTorus(uf, vpf)));
            for (let i=0; i<6; i++) {
                if ((u + v) % 2 === 0) {
                    colors.push(vec4(1,1,1,1));
                } else {
                    colors.push(vec4(1,0,0,1));
                }
            }
        }
    }
        

        Torus.setData(points, colors);
        
        shapes.push(Torus);


        render();

        colors = [];
        points = [];

    });

    let addSphere = document.getElementById("addShapeOne");
    addShapeOne.addEventListener("click", function() {
        let Sphere = new Shape();

        const NUM_DIVS = 50;
    for (let u=0; u<NUM_DIVS; u++) {
        for (let v=0; v<NUM_DIVS; v++) {
            let uf = u / NUM_DIVS;
            let vf = v / NUM_DIVS;
            let upf = (u+1)/NUM_DIVS;
            let vpf = (v+1)/NUM_DIVS;
            points.push(vec4(xc(uf, vf), yc(uf, vf), zc(uf, vf)));
            points.push(vec4(xc(upf, vf), yc(upf, vf), zc(upf, vf)));
            points.push(vec4(xc(upf, vpf), yc(upf, vpf), zc(upf, vpf)));
            
            points.push(vec4(xc(uf, vf), yc(uf, vf), zc(uf, vf)));
            points.push(vec4(xc(upf, vpf), yc(upf, vpf), zc(upf, vpf)));
            points.push(vec4(xc(uf, vpf), yc(uf, vpf), zc(uf, vpf)));
            for (let i=0; i<6; i++) {
                if ((u + v) % 2 === 0) {
                    colors.push(vec4(0,0,0,1));
                } else {
                    colors.push(vec4(0,0,1,1));
                }
            }
        }
    }
        

        Sphere.setData(points, colors);
        
        shapes.push(Sphere);


        render();

        colors = [];
        points = [];

    });

    


    // TODO: probably set up buttons here

    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousedown", function(event) {
        tx = 2 * event.clientX / canvas.width - 1;
        ty = 1 - 2 * event.clientY / canvas.height;
        render();
    });
    canvas.addEventListener("mousemove", function() {
        if (event.buttons & 1 === 1) {
            tx = 2 * event.clientX / canvas.width - 1;
            ty = 1 - 2 * event.clientY / canvas.height;
            render();
        }
    });
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    render();
};
//code take from esangel in chapter 4 cube
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        //colors.push(vertexColors[a]);

    }
}
function colorTreha()
{
    trips( 1, 2 , 3 );
    trips( 2, 3 , 0 );
    trips( 3 , 0 , 1);
    trips( 0 , 1 , 2);
   
}

function trips(a, b, c )
{
    var vertices = [
        vec4( 0.0, 1.0, -0.5,  1.0 ),
        vec4( -1.0, -0.5, -0.5, 1.0 ),
        vec4(  1.0, -0.5, -0.5, 1.0 ),
        vec4(  0.0,  0.0,  1.0, 1.0 ),
    ];

    var vertexColors = [
        //[ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
       // colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}
function xc(u, v) {
    return   Math.sin(Math.PI* u) * Math.cos(v*2*Math.PI);
}
function yc(u, v) {
    return  Math.cos(Math.PI*u) * Math.cos(v*2*Math.PI);
}
function zc(u, v) {
    return Math.sin(v*2*Math.PI);
}


function xTorus(u, v) {
    return  ( 0.5 + 0.1* Math.cos(2 * Math.PI* v)) * Math.cos(u*2*Math.PI);
}
function yTorus(u, v) {
    return  ( 0.5 +0.1* Math.cos(2 * Math.PI* v)) * Math.sin(u*2*Math.PI);
}
function zTorus(u, v) {
    return 0.1 * Math.sin(v*2*Math.PI);
}

function render()
{
    status.innerHTML = "Angles: " + (+rot1.value).toFixed()
        + ", " + (+rot2.value).toFixed()
        + ", " + (+rot3.value).toFixed()
        + ". Scale: " + (+scale1.value).toFixed(2)
        + ". Translation: " + (+tz.value).toFixed(2);
    
    let r1 = rotateX(rot1.value);
    let r2 = rotateY(rot2.value);
    let r3 = rotateZ(rot3.value);
    let s1 = scalem(scale1.value, scale1.value, scale1.value);
    let t1 = translate(tx, ty, tz.value);
    
    
    let mat = mult(r1, mult(r2, mult( r3, mult(s1, t1))));
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (let i=0; i<shapes.length; i++) {
        if (i === shapes.length - 1) {
            shapes[i].setMat(mat);
        }
        shapes[i].draw();
    }
}