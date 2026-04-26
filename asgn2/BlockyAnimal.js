//TODO!!!!!
// make sliders update with angles while animation plays so that things don't snap

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// global vars
let canvas;
let gl;
// shader vars
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
// webgl obj to pass to cubes
let wgl;
// params
let g_globalAngle_y = 0;
let g_globalAngle_x = 0;
let g_middleAngle = 0;
let g_topAngle = 0;
var animating = false;

// TIME
var g_startTime = performance.now();
var g_seconds = performance.now() - g_startTime;

function main() {

  // set up webgl
  setupWebGL();

  // Initialize shaders, connect variables to glsl
  connectVariablesToGLSL();


  // EVENT HANDLERS
  // click function to be called on a mouse down event
  //canvas.onmousedown = (ev) => {click(ev)};

  // ui events
  addUIEvents();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // render
  renderScene();
}

function addUIEvents() {
  // ANGLE SLIDER
  // TODO: add mouseup mousedown events so it's not always calling
  let angle_y_slider = document.getElementById("angle_y_slider");
  angle_y_slider.addEventListener('mousemove', () => { g_globalAngle_y = parseInt(angle_y_slider.value); renderScene(); });

   let angle_x_slider = document.getElementById("angle_x_slider");
  angle_x_slider.addEventListener('mousemove', () => { g_globalAngle_x = parseInt(angle_x_slider.value); renderScene(); });


  // MIDDLE CUBE SLIDER
  // TODO: add mouseup mousedown events so it's not always calling
  let middle_slider = document.getElementById("middle_slider");
  middle_slider.addEventListener('mousemove', () => { g_middleAngle = parseInt(middle_slider.value); renderScene(); });

  // top CUBE SLIDER
  // TODO: add mouseup mousedown events so it's not always calling
  let top_slider = document.getElementById("top_slider");
  top_slider.addEventListener('mousemove', () => { g_topAngle = parseInt(top_slider.value); renderScene(); });

  let anim_toggle_button = document.getElementById("anim_toggle_button");
  anim_toggle_button.addEventListener('click', () => { animating = !animating; requestAnimationFrame(tick); });
}

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

// compile the shader programs, attach the javascript variables to the GLSL variables
function connectVariablesToGLSL() {
  // init shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // set up wgl var
  wgl = {
    gl: gl,
    a_Position: a_Position,
    u_FragColor: u_FragColor
  }
}

// get gl x y coords from canvas coords on event call
function convertEventCoordsToGL(ev) {
  let x = ev.clientX; // x coordinate of a mouse pointer
  let y = ev.clientY; // y coordinate of a mouse pointer
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
}

// function updateAnimAngles() {
//   if (g_middleAnim) {
//     g_middleAngle = 45*Math.sin(g_seconds);
//   }
// }

// render everything !
function renderScene() {

  // pass matrix to u_GlobalRotateMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle_y, 0, 1, 0);
  globalRotMat.rotate(g_globalAngle_x, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var puppycat = new PuppyCat(wgl);
  puppycat.render(g_startTime, g_seconds);
  // draw the hand cube
  // var body = new Cube(wgl, [255, 0, 0, 1]);
  // //body.matrix.setTranslate(-.25, -.5, 0.0);
  // body.matrix.scale(0.5, 0.5, 0.5);
  // body.render(gl, a_Position, u_FragColor);

  // // draw a left arm
  // var leftArm = new Cube(wgl, [0, 255, 0, 1]);
  // leftArm.matrix.setTranslate(-.15, -.2, .1);
  // leftArm.matrix.rotate(-g_middleAngle, 0, 0, 1);
  // var middleCoords = new Matrix4(leftArm.matrix);
  // leftArm.matrix.scale(0.3, 0.6, 0.25);
  // leftArm.render(gl, a_Position, u_FragColor);
  
  // // draw a left shoulder
  // var leftShoulder = new Cube(wgl, [0, 0, 255, 1]);
  // leftShoulder.matrix = middleCoords;
  // leftShoulder.matrix.translate(.1, .4, -.1);
  // leftShoulder.matrix.rotate(45-g_topAngle, 0, 0, 1);
  // leftShoulder.matrix.scale(0.3, 0.3, 0.4);
  // leftShoulder.render(gl, a_Position, u_FragColor);

}

// called by browser repeatedly whenever its time
function tick() {
  // save current time
  g_seconds = performance.now() - g_startTime;

  // print so we know we are running
  //console.log(performance.now());

  // draw everything
  renderScene();

  // tell browser to update again when it has time
  if (animating) {
    requestAnimationFrame(tick);
  }
}
