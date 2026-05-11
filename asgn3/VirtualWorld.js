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
    // console.log(ev);
    if (mouseDown) {
      let moveAmntH = initial_x - ev.clientX;
      let moveAmntV = initial_y - ev.clientY;
      cam.turnCamera(-moveAmntH / 100, -moveAmntV / 100);
      initial_x = ev.clientX;
      initial_y = ev.clientY;
    }
  }
  document.onkeydown = (ev) => { 
    console.log('key down');
    cam.onKeyDown(ev);
    if (ev.key === "z") {
      deleteCubeLookingAt();
      console.log("z pressed");
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
        console.log("AAAA");
        xm += 1;
        if (deleteCubeAt(xm, ym, zm)) {
          return;
        }
        continue;
      }
      // let new_xm = xm + 1;
      // // get xyz of the corner of the next cube face in the x direction
      // let [next_xw, next_yw, next_zw] = getCoordsFromMapLoc(new_xm, ym, zm);
      // console.log("next x: ("+next_xw+", "+next_yw+", "+next_zw+")");
      // console.log("next xm: ("+new_xm+", "+ym+", "+zm+")");
      // // get the position of the ray at this x position
      // let [ray_x, ray_y, ray_z] = ray.getPointFromX(next_xw);
      // // check if this point is in the next cube face in the x direction
      // console.log("ray x: ("+ray_x+", "+ray_y+", "+ray_z+")");
      // if (ray_y >= next_yw && ray_y < next_yw + cubeScale && ray_z >= next_zw && ray_z < next_zw + cubeScale) {
      //   // if it is, move to this cube
      //   ray.setPoint(ray_x, ray_y, ray_z);
      //   console.log("new ray x: ("+ray.x+", "+ray.y+", "+ray.z+")");
      //   xm = new_xm;
      //   // check if there is a cube here
      //   if (xm >= 0 && xm < 32 && ym >= 0 && ym < 2 && zm >= 0 && zm < 32) {
      //     if (map[ym][xm][zm] === 1) {
      //       map[ym][xm][zm] = 0;
      //       deleteCube();
      //       console.log("DELETEEEE");
      //       return;
      //     }
      //   }
      //   continue;
      // }
    } else if (ray.delta_x < 0) {
      let new_xm = xm - 1;
      // get xyz of the corner of the next cube face in the neg x direction
      let [next_xw, next_yw, next_zw] = getCoordsFromMapLoc(new_xm, ym, zm);
      console.log("next x: ("+next_xw+", "+next_yw+", "+next_zw+")");
      console.log("next xm: ("+new_xm+", "+ym+", "+zm+")");
      // get the position of the ray at this x position
      let [ray_x, ray_y, ray_z] = ray.getPointFromX(next_xw + cubeScale);
      // check if this point is in the next cube face in the x direction
      console.log("ray x: ("+ray_x+", "+ray_y+", "+ray_z+")");
      if (ray_y >= next_yw && ray_y < next_yw + cubeScale && ray_z >= next_zw && ray_z < next_zw + cubeScale) {
        // if it is, move to this cube
        ray.setPoint(ray_x, ray_y, ray_z);
        console.log("new ray x: ("+ray.x+", "+ray.y+", "+ray.z+")");
        xm = new_xm;
        // check if there is a cube here
        if (deleteCubeAt(xm, ym, zm)) return;
        continue;
      }
    }
    if (ray.delta_z > 0) {
      let new_zm = zm + 1;
      // get xyz of the corner of the next cube face in the z direction
      let [next_xw, next_yw, next_zw] = getCoordsFromMapLoc(xm, ym, new_zm);
      // get the position of the ray at this z position
      let [ray_x, ray_y, ray_z] = ray.getPointFromZ(next_zw);
      // check if this point is in the next cube face in the z direction
      console.log("IN Z");
      if (ray_y >= next_yw && ray_y < next_yw + cubeScale && ray_x >= next_xw && ray_x < next_xw + cubeScale) {
        // if it is, move to this cube
        ray.setPoint(ray_x, ray_y, ray_z);
        zm = new_zm
        console.log("NEW Z");
        // check if there is a cube here
        if (xm >= 0 && xm < 32 && ym >= 0 && ym < 2 && zm >= 0 && zm < 32) {
          if (map[ym][xm][zm] === 1) {
            map[ym][xm][zm] = 0;
            deleteCube();
            console.log("DELETEEEE");
            return;
          }
        }
        continue;
      }
    }
    if (ray.delta_y < 0) {
      let new_ym = ym - 1;
      // get xyz of the corner of the next cube face in the y direction
      let [next_xw, next_yw, next_zw] = getCoordsFromMapLoc(xm, new_ym, zm);
      console.log("NEXT y: ("+next_xw+", "+next_yw+", "+next_zw+")");
      console.log("next ym: ("+xm+", "+new_ym+", "+zm+")");
      // get the position of the ray at this y position
      let [ray_x, ray_y, ray_z] = ray.getPointFromY(next_yw + cubeScale);
      console.log("RAY y: ("+ray_x+", "+ray_y+", "+ray_z+")");
      // check if this point is in the next cube face in the y direction
      if (ray_x >= next_xw && ray_x < next_xw + cubeScale && ray_z >= next_zw && ray_z < next_zw + cubeScale) {
        // if it is, move to this cube
        ray.setPoint(ray_x, ray_y, ray_z);
        console.log("NEW RAY y: ("+ray.x+", "+ray.y+", "+ray.z+")");
        ym = new_ym;
        // check if there is a cube here
        if (xm >= 0 && xm < 32 && ym >= 0 && ym < 2 && zm >= 0 && zm < 32) {
          if (map[ym][xm][zm] === 1) {
            map[ym][xm][zm] = 0;
            deleteCube();
            console.log("DELETEEEE");
            return;
          }
        }
        continue;
      }
    }
    
  }
  // console.log(...e.elements);
  // console.log(ray.getPoint0());
  // console.log("("+x+", "+y+", "+z+")");

  // let [x, y, z] = getMapLocFromCoords(...e.elements);
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
function deleteCubeAt(x, y, z) {
  if (x >= 0 && x < 32 && y >= 0 && y < 2 && z >= 0 && z < 32) {
    if (map[y][x][z] === 1) {
      map[y][x][z] = 0;
      deleteCube();
      console.log("DELETEEEE");
      return true;
    }
  }
  return false;
}

function deleteeCubeLookingAt() {
  let d = cam.getDirectionVector();
  d.mul(cubeScale);
  let e = cam.getEyeVector();
  // while in range
    // check if there is a block at e
    // move e one block in d direction
  let [x, y, z] = getMapLocFromCoords(...e.elements);
  // while we are out of the range of map
  // and d is pointing in the right direction
    // add d to get into range of map
  // this does Not Work
  // should probably do something with checking if line intersects 3d rectangular prism instead
  // while (((x < 0 && d.elements[0] > 0) ||
  //       (y < 0 && d.elements[1] > 0) ||
  //       (z < 0 && d.elements[2] > 0)) || // XOR them
  //       ((x > 32 && d.elements[0] < 0) ||
  //       (y > 2 && d.elements[1] < 0) ||
  //       (z > 32 && d.elements[2] < 0))) {
  //   e.add(d);
  //   console.log("aaaaaa");
  // }
  for (i = 0; i < 32; i++) {
    // check if there is a block at e, delete it if so
    [x, y, z] = getMapLocFromCoords(...e.elements);
    if (x >= 0 && x < 32 && y >= 0 && y < 2 && z >= 0 && z < 32) {
      if (map[y][x][z] != 0) {
        console.log(map[y][x][z]);
        map[y][x][z] = 0;
        deleteCube();
        return;
      }
      console.log(map[y][x][z]);
    }
    // move e one block in d direction
    // just going to move e the cube width, might count some cubes twice but its good enough
    e.add(d);
  }
  // while (0 <= x && x <= 32  &&  0 <= y && y <= 2  &&  0 <= z && z <= 32) {
  // }
}
function getCoordsFromMapLoc(xm, ym, zm) {
  let x = (xm-16)*cubeScale
  let y = -1 + cubeScale*ym
  let z = (zm-16)*cubeScale
  return ([x, y, z]);
}
function getMapLocFromCoords(xw, yw, zw) {
  console.log("INITIAL ("+xw+", "+yw+", "+zw+")");
  let x = Math.floor(xw / cubeScale + 16);
  let y = Math.floor((yw + 1) / cubeScale);
  let z = Math.floor(zw / cubeScale + 16);
  console.log("("+x+", "+y+", "+z+")");
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
      console.log("removed");
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
