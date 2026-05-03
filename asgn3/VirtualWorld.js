// todo (stretch goals)
/*
[] make sliders update with angles while animation plays so that things don't snap
[] make him blink occasionally.. 
[] rotate right ear bc it's darker oops
[] it would be really cute to have little confetti on click ..
[] rotation sliders on click instead of on move
*/
// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
  // uniform mat4 u_ViewMatrix;
  // uniform mat4 u_ProjectionMatrix;
  // u_ProjectionMatrix * u_ViewMatrix * 
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UVCoord;
  varying vec2 v_UVCoord;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * a_Position;
    v_UVCoord = a_UVCoord;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  uniform float u_texColorWeight;
  uniform sampler2D u_Sampler;
  varying vec2 v_UVCoord;
  void main() {
    gl_FragColor = (1.0-u_texColorWeight) * u_FragColor + u_texColorWeight * texture2D(u_Sampler, v_UVCoord);
  }`
// global vars
let canvas;
let gl;
// shader vars
let a_Position;
let a_UVCoord;
let u_FragColor;
let u_texColorWeight;
let u_Sampler;  
let u_ModelMatrix;
let u_GlobalRotateMatrix;
// let u_ViewMatrix;
// let u_ProjectionMatrix;
// webgl obj to pass to cubes
let wgl;
// params
let g_globalAngle_y = 0;
let g_globalAngle_x = 0;
let g_middleAngle = 0;
let g_topAngle = 0;

let puppycat;

// TIME
var g_startTime = performance.now();
var g_currentTime = performance.now();

// mouse pos
let mouseDown = false;
let initial_x = 0;
let initial_y = 0;
let initialAngle_x = 0;
let initialAngle_y = 0;
function main() {

  // set up webgl
  setupWebGL();

  // Initialize shaders, connect variables to glsl
  connectVariablesToGLSL();

  // EVENT HANDLERS
  // click function to be called on a mouse down event
  canvas.onmousedown = (ev) => {
    if (ev.shiftKey) {
      if (puppycat.currentAnim != 'tripAnim') {
        puppycat.playAnim('tripAnim');
        g_startTime = performance.now();
        g_currentTime = performance.now();
        requestAnimationFrame(tick);
      }
    } else {
      mouseDown = true
      initial_x = ev.clientX;
      initial_y = ev.clientY;
      initialAngle_y = g_globalAngle_y;
      initialAngle_x = g_globalAngle_x;
    }
  };
  canvas.onmouseup = (ev) => {mouseDown = false;}
  canvas.onmousemove = (ev) => {
    if (mouseDown) {
      g_globalAngle_y = initialAngle_y + (initial_x - ev.clientX);
      g_globalAngle_x = initialAngle_x + (initial_y - ev.clientY);
      if (!puppycat.animating) {
        renderScene();
      }
    }
  }

  // ui events
  addUIEvents();

  // Specify the color for clearing <canvas>
  gl.clearColor(113/255, 138/255, 209/255, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  puppycat = new PuppyCat(wgl);

  // render
  requestAnimationFrame(tick);
}

function addUIEvents() {
  // ANGLE SLIDERS
  let angle_y_slider = document.getElementById("angle_y_slider");
  angle_y_slider.addEventListener('mousemove', () => { g_globalAngle_y = parseInt(angle_y_slider.value); renderScene(); });

  let angle_x_slider = document.getElementById("angle_x_slider");
  angle_x_slider.addEventListener('mousemove', () => { g_globalAngle_x = parseInt(angle_x_slider.value); renderScene(); });

  // HEAD
  let head_slider = document.getElementById("head_slider");
  head_slider.addEventListener('mousemove', () => { puppycat.angles.head = [parseInt(head_slider.value), 0, 0]; renderScene(); });

  // BELL
  let bell_slider = document.getElementById("bell_slider");
  bell_slider.addEventListener('mousemove', () => { puppycat.angles.bell = [parseInt(bell_slider.value), 0, 0]; renderScene(); });

  // TAIL
  let tail_base_slider = document.getElementById("tail_base_slider");
  tail_base_slider.addEventListener('mousemove', () => { puppycat.angles.tail_base = [parseInt(tail_base_slider.value), 0, 0]; renderScene(); });
  let tail_end_slider = document.getElementById("tail_end_slider");
  tail_end_slider.addEventListener('mousemove', () => { puppycat.angles.tail_end = [parseInt(tail_end_slider.value), 0, 0]; renderScene(); });

  // ARMS
  // RIGHT ARM
  let right_arm_slider = document.getElementById("right_arm_slider");
  right_arm_slider.addEventListener('mousemove', () => { puppycat.angles.arm_right = [0, 0, parseInt(right_arm_slider.value)]; renderScene(); });
  // LEFT ARM
  let left_arm_slider = document.getElementById("left_arm_slider");
  left_arm_slider.addEventListener('mousemove', () => { puppycat.angles.arm_left = [parseInt(left_arm_slider.value), 0, 0]; renderScene(); });

  // LEGS
  // RIGHT
  let right_leg_slider = document.getElementById("right_leg_slider");
  right_leg_slider.addEventListener('mousemove', () => { puppycat.angles.leg_right_top = [0, 0, parseInt(right_leg_slider.value)]; renderScene(); });
  
  let right_knee_slider = document.getElementById("right_knee_slider");
  right_knee_slider.addEventListener('mousemove', () => { puppycat.angles.leg_right_bottom = [0, 0, parseInt(right_knee_slider.value)]; renderScene(); });

  let right_ankle_slider = document.getElementById("right_ankle_slider");
  right_ankle_slider.addEventListener('mousemove', () => { puppycat.angles.foot_right = [0, 0, parseInt(right_ankle_slider.value)]; renderScene(); });

  // LEFT
  let left_leg_slider = document.getElementById("left_leg_slider");
  left_leg_slider.addEventListener('mousemove', () => { puppycat.angles.leg_left_top = [0, 0, parseInt(left_leg_slider.value)]; renderScene(); });
  
  let left_knee_slider = document.getElementById("left_knee_slider");
  left_knee_slider.addEventListener('mousemove', () => { puppycat.angles.leg_left_bottom = [0, 0, parseInt(left_knee_slider.value)]; renderScene(); });

  let left_ankle_slider = document.getElementById("left_ankle_slider");
  left_ankle_slider.addEventListener('mousemove', () => { puppycat.angles.foot_left = [parseInt(left_ankle_slider.value), 0, 0]; renderScene(); });
  

  let anim_toggle_button = document.getElementById("anim_toggle_button");
  anim_toggle_button.addEventListener('click', () => { 
    if (puppycat.animating) {
      puppycat.stopAnim();
    } else {
      puppycat.playAnim('walkAnim');
      requestAnimationFrame(tick);
    }
  });
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
  if (u_FragColor < 0) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_texColorWeight
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (u_texColorWeight < 0) {
    console.log('Failed to get the storage location of u_texColorWeight');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (u_Sampler < 0) {
    console.log('Failed to get the storage location of u_Sampler');
    return;
  }

  // Get the storage location of a_UVCoord
  a_UVCoord = gl.getAttribLocation(gl.program, 'a_UVCoord');
  if (a_UVCoord < 0) {
    console.log('Failed to get the storage location of a_UVCoord');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (u_ModelMatrix < 0) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (u_GlobalRotateMatrix < 0) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  // u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  // if (u_ViewMatrix < 0) {
  //   console.log('Failed to get the storage location of u_ViewMatrix');
  //   return;
  // }

  // // Get the storage location of u_ProjectionMatrix
  // u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  // if (u_ProjectionMatrix < 0) {
  //   console.log('Failed to get the storage location of u_ProjectionMatrix');
  //   return;
  // }

  // set up wgl var
  wgl = {
    gl: gl,
    a_Position: a_Position,
    u_FragColor: u_FragColor,
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

// function initVertexBuffers() {
//   var vertexTexCoordBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

//   var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
//   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*4, 0);
//   gl.enableVertexAttribArray(a_Position);

//   gl.uniform4f(u_FragColor, 1.0, 0.3, 0.3, 1);
//   gl.uniform1f(u_texColorWeight, 0.5);

//   gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE*4, FSIZE*2);
//   gl.enableVertexAttribArray(a_TexCoord);
//   return n;
// }

// function initTextures(n) {
//   var texture = gl.createTexture();   // Create a texture object
//   if (!texture) {
//     console.log('Failed to create the texture object');
//     return false;
//   }

//   var image = new Image();  // Create the image object
//   if (!image) {
//     console.log('Failed to create the image object');
//     return false;
//   }
//   // Register the event handler to be called on loading an image
//   image.onload = function(){ loadTexture(n, texture, u_Sampler, image); };
//   // Tell the browser to load an image
//   image.src = 'theodore.png';

//   return true;
// }

// function loadTexture(n, texture, u_Sampler, image) {
//   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
//   // Enable texture unit0
//   gl.activeTexture(gl.TEXTURE0);
//   // Bind the texture object to the target
//   gl.bindTexture(gl.TEXTURE_2D, texture);

//   // Set the texture parameters
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//   // Set the texture image
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
//   // Set the texture unit 0 to the sampler
//   gl.uniform1i(u_Sampler, 0);
  
//   gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

//   gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
// }

// render everything !
function renderScene() {

  // var projMat = new Matrix4();
  // gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // var viewMat = new Matrix4();
  // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // pass matrix to u_GlobalRotateMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle_y, 0, 1, 0);
  globalRotMat.rotate(g_globalAngle_x, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let cube = new Cube(wgl, [255, 0, 0, 1]);

  let v_front = [
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0];
  let uv_coords = [
            0, 0,  1, 1,  1, 0,
            0, 0,  0, 1,  1, 1];
  let shape = new Shape(wgl, v_front, uv_coords, [255, 0, 0, 1]);

  //shape.render();

  cube.render();
}

// called by browser repeatedly whenever its time
function tick() {
  // save current time
  g_currentTime = performance.now();

  // print so we know we are running
  //console.log(performance.now());

  // track performance
  let fpsCounter = document.getElementById('fpsCounter');

  // draw everything
  renderScene();

  let msElapsed = performance.now() - g_currentTime;
  fpsCounter.textContent = "FPS: " + (1000 / msElapsed).toFixed(0);

  // tell browser to update again when it has time
  requestAnimationFrame(tick);
}
