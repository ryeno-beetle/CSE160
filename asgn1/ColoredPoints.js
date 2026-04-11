// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_PointSize;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_PointSize;
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
let a_Position;
let u_PointSize;
let u_FragColor;
let g_SelectedColor = [1.0, 0.0, 0.0, 1.0];
let g_PointSize = 10.0;
let shapesList = [];
let currentShape = 'point'; // point/triangle/circle
let currentSegmentCount = 10;

function main() {

  // set up webgl
  setupWebGL();

  // Initialize shaders, connect variables to glsl
  connectVariablesToGLSL();


  // EVENT HANDLERS
  // click function to be called on a mouse down and mouse move events
  canvas.onmousedown = (ev) => {click(ev)};
  canvas.onmousemove = (ev) => { if (ev.buttons==1) {click(ev)}};
  // ui events
  addUIEvents();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// DATA ARRAYS
let g_points = [];  // The array for the position of a mouse press
let g_colors = [];  // The array to store the color of a point
let g_sizes = []; // array to store sizes of shapes

function click(ev) {
  // get gl coordinates of click
  let [x, y] = convertEventCoordsToGL(ev);

  if (currentShape === 'point') {
    // make new point object, passing in position, size, and color
    let p = new Point([x, y], g_PointSize, g_SelectedColor.slice());
    // add point to shapes list
    shapesList.push(p);
  } else if (currentShape === 'triangle') {
    // make new triangle obj
    let t = new Triangle([x, y], g_PointSize, g_SelectedColor.slice());
    // add triangle to shapes list
    shapesList.push(t);
  } else if (currentShape === 'circle') {
    // make new circle obj
    let c = new Circle([x, y], g_PointSize, g_SelectedColor.slice(), currentSegmentCount);
    // add circle to shapes list
    shapesList.push(c);
  } else if (currentShape === 'line') {
    
  }

  // re-render everything to show new point
  renderAllShapes();
}

function addUIEvents() {
  // CLEAR BUTTON
  let clear_button = document.getElementById("clear_button");
  clear_button.addEventListener('click', () => {
    shapesList = [];
    renderAllShapes();
  })

  // DRAWING MODE BUTTONS
  let squares_button = document.getElementById("squares_button");
  squares_button.addEventListener('click', () => {currentShape = 'point'});
  let triangles_button = document.getElementById("triangles_button");
  triangles_button.addEventListener('click', () => {currentShape = 'triangle'; console.log('triangle');});
  let circles_button = document.getElementById("circles_button");
  circles_button.addEventListener('click', () => {currentShape = 'circle'});
  let line_tool_button = document.getElementById("line_tool_button");
  line_tool_button.addEventListener('click', () => {currentShape = 'line'});


  // RGB SLIDERS
  let red_slider = document.getElementById("red_slider");
  let green_slider = document.getElementById("green_slider");
  let blue_slider = document.getElementById("blue_slider");

  red_slider.addEventListener('mouseup', () => { g_SelectedColor[0] = red_slider.value/100; });
  green_slider.addEventListener('mouseup', () => { g_SelectedColor[1] = green_slider.value/100; });
  blue_slider.addEventListener('mouseup', () => { g_SelectedColor[2] = blue_slider.value/100; });

  // SIZE SLIDER
  let size_slider = document.getElementById("size_slider");
  size_slider.addEventListener('mouseup', () => { g_PointSize = parseInt(size_slider.value); });

  // CIRCLE SEGMENT SLIDER
  let segment_slider = document.getElementById("segment_slider");
  segment_slider.addEventListener('mouseup', () => { currentSegmentCount = parseInt(segment_slider.value); });

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
  return gl;
}

// compile the shader programs, attach the javascript variables to the GLSL variables
function connectVariablesToGLSL() {
  // init shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_PointSize
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
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

// render everything !
function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  for (let i = 0; i < shapesList.length; i++) {
    shapesList[i].render(gl, a_Position, u_PointSize, u_FragColor);
  }
}
