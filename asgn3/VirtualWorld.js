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
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UVCoord;
  varying vec2 v_UVCoord;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
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
// webgl obj to pass to cubes
let wgl;
// params
let g_middleAngle = 0;
let g_topAngle = 0;

let cam;
let tex;

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
    mouseDown = true
    initial_x = ev.clientX;
    initial_y = ev.clientY;
  };
  canvas.onmouseup = (ev) => {mouseDown = false;}
  canvas.onmousemove = (ev) => {
    if (mouseDown) {
      let moveAmntH = initial_x - ev.clientX;
      let moveAmntV = initial_y - ev.clientY;
      cam.turnCamera(-moveAmntH / 100, -moveAmntV / 100);
      initial_x = ev.clientX;
      initial_y = ev.clientY;
    }
  }
  document.onkeydown = (ev) => { 
    cam.onKeyDown(ev);
    if (ev.key === "z") {
      deleteCubeLookingAt();
    }
  }
  document.onkeyup = (ev) => {
    cam.onKeyUp(ev);
  }

  cam = new Camera();
  tex = new TextureManager();
  initTextures();

  // ui events
  addUIEvents();

  // Specify the color for clearing <canvas>
  gl.clearColor(113/255, 138/255, 209/255, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // make objects
  makeMap();

  // render
  requestAnimationFrame(tick);
}

function initTextures() {
  tex.initTexture('theodore', './textures/theodore.png', 0, gl.TEXTURE0);
  tex.initTexture('sky', './textures/sky.png', 1, gl.TEXTURE1);
}

function addUIEvents() {}

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
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (u_ViewMatrix < 0) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (u_ProjectionMatrix < 0) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

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

let mapCubes = [];
let cubeScale = 0.3;
let map;
function deleteCubeLookingAt() {
  let d = cam.getDirectionVector();
  // d.mul(cubeScale);
  let e = cam.getEyeVector();
  let ray = new Ray(...d.elements, ...e.elements);
  // find first cube we would intersect with
  // (cube at e, also cube at initial ray point)
  let [xw, yw, zw] = ray.getPoint(); // current world coords
  let [xm, ym, zm] = getMapLocFromCoords(...ray.getPoint());
  // we would check if there is a cube here, but rn there will never be
  // find next cube we would intersect with until we find an actual cube
  // or we have tried 10 times
  for (let i = 0; i < 10; i++) {
    if (ray.delta_x > 0) {
      if (castX(xm, ym, zm, ray, 1)) {
        xm += 1;
        if (deleteCubeAt(xm, ym, zm)) {
          return;
        }
        continue;
      }
    } else if (ray.delta_x < 0) {
      if (castX(xm, ym, zm, ray, -1)) {
        xm -= 1;
        if (deleteCubeAt(xm, ym, zm)) {
          return;
        }
        continue;
      }
    }
    if (ray.delta_z > 0) {
      if (castZ(xm, ym, zm, ray, 1)) {
        zm += 1;
        if (deleteCubeAt(xm, ym, zm)) {
          return;
        }
        continue;
      }
    } else if (ray.delta_z < 0) {
      if (castZ(xm, ym, zm, ray, -1)) {
        zm -= 1;
        if (deleteCubeAt(xm, ym, zm)) {
          return;
        }
        continue;
      }
    }
    if (ray.delta_y > 0) {
      if (castY(xm, ym, zm, ray, 1)) {
        ym += 1;
        if (deleteCubeAt(xm, ym, zm)) {
          return;
        }
        continue;
      }
    } else if (ray.delta_y < 0) {
      if (castY(xm, ym, zm, ray, -1)) {
        ym -= 1;
        if (deleteCubeAt(xm, ym, zm)) {
          return;
        }
        continue;
      }
    }
    
  }
}
function castX(xm, ym, zm, ray, dir) {
  if (dir === 1) {
    xm += 1;
  } else {
    xm -= 1;
  }
  // get xyz of the corner of the next cube face in the neg x direction
  let [next_xw, next_yw, next_zw] = getCoordsFromMapLoc(xm, ym, zm);
  // get the position of the ray at this x position
  let [ray_x, ray_y, ray_z] = [0, 0, 0];
  if (dir === 1) {
    [ray_x, ray_y, ray_z] = ray.getPointFromX(next_xw);
  } else {
    [ray_x, ray_y, ray_z] = ray.getPointFromX(next_xw + cubeScale);
  }
  // check if this point is in the next cube face in the x direction
  if (ray_y >= next_yw && ray_y < next_yw + cubeScale && ray_z >= next_zw && ray_z < next_zw + cubeScale) {
    // if it is, move to this cube
    ray.setPoint(ray_x, ray_y, ray_z);
    return true;
  }
  return false;
}
function castY(xm, ym, zm, ray, dir) {
  if (dir === 1) {
    ym += 1;
  } else {
    ym -= 1;
  }
  // get xyz of the corner of the next cube face in the y direction
  let [next_xw, next_yw, next_zw] = getCoordsFromMapLoc(xm, ym, zm);
  // get the position of the ray at this y position
  let [ray_x, ray_y, ray_z] = [0, 0, 0];
  if (dir === 1) {
    [ray_x, ray_y, ray_z] = ray.getPointFromY(next_yw);
  } else {
    [ray_x, ray_y, ray_z] = ray.getPointFromY(next_yw + cubeScale);
  }
  // check if this point is in the next cube face in the y direction
  if (ray_x >= next_xw && ray_x < next_xw + cubeScale && ray_z >= next_zw && ray_z < next_zw + cubeScale) {
    // if it is, move to this cube
    ray.setPoint(ray_x, ray_y, ray_z);
    return true;
  }
  return false;
}
function castZ(xm, ym, zm, ray, dir) {
  if (dir === 1) {
    zm += 1;
  } else {
    zm -= 1;
  }
  // get xyz of the corner of the next cube face in the z direction
  let [next_xw, next_yw, next_zw] = getCoordsFromMapLoc(xm, ym, zm);
  // get the position of the ray at this z position
  let [ray_x, ray_y, ray_z] = [0, 0, 0];
  if (dir === 1) {
    [ray_x, ray_y, ray_z] = ray.getPointFromZ(next_zw);
  } else {
    [ray_x, ray_y, ray_z] = ray.getPointFromZ(next_zw + cubeScale);
  }
  // check if this point is in the next cube face in the z direction
  if (ray_y >= next_yw && ray_y < next_yw + cubeScale && ray_x >= next_xw && ray_x < next_xw + cubeScale) {
    // if it is, move to this cube
    ray.setPoint(ray_x, ray_y, ray_z);
    return true;
  }
  return false;
}

function deleteCubeAt(x, y, z) {
  if (x >= 0 && x < 32 && y >= 0 && y < 2 && z >= 0 && z < 32) {
    if (map[y][x][z] === 1) {
      map[y][x][z] = 0;
      deleteCube();
      return true;
    }
  }
  return false;
}

function getCoordsFromMapLoc(xm, ym, zm) {
  let x = (xm-16)*cubeScale
  let y = -1 + cubeScale*ym
  let z = (zm-16)*cubeScale
  return ([x, y, z]);
}
function getMapLocFromCoords(xw, yw, zw) {
  // console.log("INITIAL ("+xw+", "+yw+", "+zw+")");
  let x = Math.floor(xw / cubeScale + 16);
  let y = Math.floor((yw + 1) / cubeScale);
  let z = Math.floor(zw / cubeScale + 16);
  // console.log("("+x+", "+y+", "+z+")");
  return ([x, y, z]);
}
function makeMap() {
  map = [
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ], [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]];
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 32; x++) {
      for (let z = 0; z < 32; z++) {
        if (map[y][x][z] === 1) {
          let c = new Cube(wgl, [0, 0, 0, 1], 'theodore', 1);
          // c.setOrigin([0.5, 0, 0.5]);
          c.matrix.translate((x-16)*cubeScale, -1 + cubeScale*y, (z-16)*cubeScale);
          c.matrix.scale(cubeScale, cubeScale, cubeScale);
          mapCubes.push([c, [x, y, z]]);
        }
      }
    }
  }
}
function deleteCube() {
  for (let i = 0; i < mapCubes.length; i++) {
    let [x, y, z] = mapCubes[i][1];
    if (map[y][x][z] === 0) {
      mapCubes.splice(i, 1);
      i --;
    }
  }
}
function renderMap() {
  for(let i = 0; i < mapCubes.length; i++) {
    mapCubes[i][0].render();
  }
}

function findCubeLookingAt() {

}

// render everything !
function renderScene() {

  cam.sendProjMat();

  cam.updateAndSendViewMat();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // floor
  let floor = new Cube(wgl, [255, 128, 128, 1], 'sky', 0);
  floor.setOrigin([0.5, 1, 0.5]);
  floor.matrix.translate(0, -1, 0);
  floor.matrix.scale(10, 0.1, 10);
  floor.render();

  // sky box
  let sky = new Cube(wgl, [255, 0, 0, 1], 'sky', 1)
  sky.setOrigin([0.5, 0.5, 0.5]);
  sky.matrix.scale(50, 50, 50);
  sky.render();

  // let cube = new Cube(wgl, [255, 0, 0, 1], 'theodore', 1);
  // cube.setOrigin([0.5, 0.5, 0.5]);
  // cube.render();

  // map
  renderMap();
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
