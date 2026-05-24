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
  attribute vec3 a_Normal;

  varying vec2 v_UVCoord;
  varying vec3 v_Normal;
  varying float v_NormalsOn;
  varying vec4 v_VertPos;
  // varying vec3 v_SpotlightPos;

  uniform float u_NormalsOn;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;

  uniform vec3 u_LightPos;
  uniform vec3 u_SpotlightPos;
  uniform vec3 u_CameraPos;
  uniform int u_Shiny; // 1=shiny, 0=not shiny
  uniform int u_LightOn; // 1=on, 0=off
  uniform int u_SpotlightOn;


  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UVCoord = a_UVCoord;

    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_NormalsOn = u_NormalsOn;
    v_VertPos = u_ModelMatrix * a_Position;
    // v_SpotlightPos = vec3(u_ModelMatrix * vec4(u_SpotlightPos, 1));
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;

  uniform vec4 u_FragColor;
  uniform float u_texColorWeight;
  uniform sampler2D u_Sampler;

  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  uniform vec3 u_SpotlightPos;
  uniform int u_Shiny;
  uniform int u_LightOn;
  uniform int u_SpotlightOn;
  uniform vec4 u_LightColor;
  uniform vec4 u_SpotlightColor;

  varying vec2 v_UVCoord;
  varying vec3 v_Normal;
  varying float v_NormalsOn;
  varying vec4 v_VertPos;
  varying vec3 v_SpotlightPos;

  void main() {
    gl_FragColor = (1.0-u_texColorWeight) * u_FragColor + u_texColorWeight * texture2D(u_Sampler, v_UVCoord);
    if (v_NormalsOn == 1.0) {
      gl_FragColor = vec4(((v_Normal + 1.0) / 2.0), 1.0);
    }

    // LIGHT
    if (u_LightOn == 1) {
      vec3 lightVector = u_LightPos - vec3(v_VertPos);
      float r = length(lightVector);

      // n dot l
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N, L), 0.0);

      // reflection
      vec3 R = reflect(-L, N);

      // eye
      vec3 E = normalize(u_CameraPos - vec3(v_VertPos));

      vec3 diffuse = vec3(gl_FragColor) * vec3(u_LightColor) * nDotL;
      vec3 ambient = vec3(gl_FragColor) * vec3(u_LightColor) * 0.3;

      if (u_Shiny == 0) {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      } else {
        vec3 specular = vec3(gl_FragColor) * vec3(u_LightColor) * pow(max(dot(E, R), 0.0), 100.0);
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      }
    }
    
    // SPOTLIGHT
    if (u_SpotlightOn == 1) {
      float cosCutoffAngle = 0.9;
      float intensity = 0.0;
      vec3 D = normalize(vec3(-0.3, -1, 0.2));
      vec3 L = normalize(vec3(u_SpotlightPos - vec3(v_VertPos)));	
      
      // check if we are inside spotlight cone
      if (dot(-D,L) > cosCutoffAngle) {
        vec3 N = normalize(v_Normal);
        intensity = max(dot(N,L), 0.0);
      }

      gl_FragColor += u_SpotlightColor * intensity * 0.5;
    }
  }`
// global vars
let canvas;
let gl;
// shader vars
let a_Position;
let a_Normal;
let a_UVCoord;
let u_NormalsOn;
let u_FragColor;
let u_texColorWeight;
let u_Sampler;  
let u_ModelMatrix;
let u_NormalMatrix;
let u_LightPos;
let u_SpotlightPos;
let u_CameraPos;
let u_Shiny;
let u_LightOn;
let u_SpotlightOn;
let u_LightColor;
let u_SpotlightColor;
// webgl obj to pass to cubes
let wgl;
// params
// let g_middleAngle = 0;
// let g_topAngle = 0;
let g_normalOn = 0.0;
let g_lightPos = [0, 2, 0];
let g_LightOn = 1;
let g_SpotlightPos = [1, 2, 1];
let g_SpotlightOn = 1;
let g_LightColor = [1, 1, 1, 1];
let g_SpotlightColor = [0, 0, 1, 1];

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

// let puppycat;
let sphere;
let teapot;

function main() {

  // set up webgl
  setupWebGL();

  // Initialize shaders, connect variables to glsl
  connectVariablesToGLSL();

  // EVENT HANDLERS
  // click function to be called on a mouse down event
  document.getElementById("canvas2D").onmousedown = (ev) => {
    mouseDown = true
    initial_x = ev.clientX;
    initial_y = ev.clientY;
  };
  document.getElementById("canvas2D").onmouseup = (ev) => {mouseDown = false;}
  document.getElementById("canvas2D").onmousemove = (ev) => {
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
    } else if (ev.key === "x") {
      placeCubeOnCubeLookingAt();
    }
  }
  document.onkeyup = (ev) => {
    cam.onKeyUp(ev);
  }

  cam = new Camera();
  tex = new TextureManager();
  initTextures();

  // set up puppycat
  // puppycat = new PuppyCat(wgl);
  // puppycat.position = [0, -0.35, 0];
  // puppycat.direction = 270;
  // puppycat.tripped = false;
  // setPuppyCatMatrix(puppycat.position, puppycat.direction);
  // puppycat.playAnim('walkAnim');

  sphere = new Sphere([255, 200, 200, 1], 1);
  sphere.matrix.setTranslate(0, 0.5, 0);
  sphere.matrix.setScale(0.7, 0.7, 0.7);

  teapot = new Model("teapot.obj");

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

// function setPuppyCatMatrix(pos, dir) {
//   puppycat.matrix = new Matrix4();
//   puppycat.matrix.setTranslate(...pos);
//   puppycat.matrix.rotate(dir, 0, 1, 0);
//   puppycat.matrix.scale(0.5, 0.5, 0.5);
// }

// function walk() {
//   if (puppycat.direction === 270 && !puppycat.tripped) { // right
//     puppycat.position[0] += 0.013;
//   } else if (puppycat.direction === 90 && !puppycat.tripped) { // left
//     puppycat.position[0] -= 0.013;
//   }
//   if ((puppycat.position[0] > 4.01  || puppycat.position[0] < -4.01)&& !puppycat.tripped) {
//     puppycat.tripped = true;
//     puppycat.playAnim('tripAnim');
//     g_startTime = performance.now();
//     g_currentTime = performance.now();
//   }
//   if (puppycat.tripped) {
//     // are we going left or right? turn dif direction based on this
//     if (puppycat.direction >= 270) {
//       puppycat.direction += 2;
//     } else if (puppycat.direction <= 90) {
//       puppycat.direction -= 2;
//     }
//     // if we have completed the turn (180 deg) in that direction, set to other direction
//     // we are just using 270-450 for right and 90-neg90 for left which is so messy but it works for now...
//     if (puppycat.direction > 450) {
//       puppycat.direction = 90;
//       puppycat.tripped = false;
//     } else if (puppycat.direction < -90) {
//       puppycat.direction = 270;
//       puppycat.tripped = false;
//     }
//   }
//   setPuppyCatMatrix(puppycat.position, puppycat.direction);
// }

function initTextures() {
  tex.initTexture('grass', './textures/grass.png', 0, gl.TEXTURE0);
  tex.initTexture('sky', './textures/sky.png', 1, gl.TEXTURE1);
}

function addUIEvents() {
  let printMapButton = document.getElementById("printMapButton");
  printMapButton.addEventListener('click', () => { 
    let str = "[";
    for (let y = 0; y < mapHeight; y++) {
      str += "[\n";
      for (let x = 0; x < mapWidth; x++) {
        str += "[";
        for (let z = 0; z < mapWidth; z++) {
          str += map[y][x][z] + ", ";
        }
        str += "],\n";
      }
      str+="],";
    }
    str += "]"
    console.log(str);
  });
  let normalButton = document.getElementById("normalButton");
  normalButton.addEventListener('click', () => { 
    if (g_normalOn === 1.0) {
      g_normalOn = 0.0;
    } else {
      g_normalOn = 1.0;
    }
  });
  let lightButton = document.getElementById("lightButton");
  lightButton.addEventListener('click', () => { 
    if (g_LightOn === 1) {
      g_LightOn = 0;
    } else {
      g_LightOn = 1;
    }
  });
  let spotlightButton = document.getElementById("spotlightButton");
  spotlightButton.addEventListener('click', () => { 
    if (g_SpotlightOn === 1) {
      g_SpotlightOn = 0;
    } else {
      g_SpotlightOn = 1;
    }
  });

  // LIGHT SLIDERS
  let lightSlideRed = document.getElementById("lightSlideRed");
  lightSlideRed.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_LightColor[0] = lightSlideRed.value / 100;
    }
  });
  let lightSlideGreen = document.getElementById("lightSlideGreen");
  lightSlideGreen.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_LightColor[1] = lightSlideGreen.value / 100;
    }
  });
  let lightSlideBlue = document.getElementById("lightSlideBlue");
  lightSlideBlue.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_LightColor[2] = lightSlideBlue.value / 100;
    }
  });

  let spotlightSlideRed = document.getElementById("spotlightSlideRed");
  spotlightSlideRed.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_SpotlightColor[0] = spotlightSlideRed.value / 100;
    }
  });
  let spotlightSlideGreen = document.getElementById("spotlightSlideGreen");
  spotlightSlideGreen.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_SpotlightColor[1] = spotlightSlideGreen.value / 100;
    }
  });
  let spotlightSlideBlue = document.getElementById("spotlightSlideBlue");
  spotlightSlideBlue.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_SpotlightColor[2] = spotlightSlideBlue.value / 100;
    }
  });

  let lightSlideX = document.getElementById("lightSlideX");
  lightSlideX.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_lightPos[0] = lightSlideX.value / 100;
    }
  });
  let lightSlideY = document.getElementById("lightSlideY");
  lightSlideY.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_lightPos[1] = lightSlideY.value / 100; 
    }
  });
  let lightSlideZ = document.getElementById("lightSlideZ");
  lightSlideZ.addEventListener('mousemove', (ev) => {
    if (ev.buttons == 1) {
      g_lightPos[2] = lightSlideZ.value / 100; 
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

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of a_Normal
  u_NormalsOn = gl.getUniformLocation(gl.program, 'u_NormalsOn');
  if (u_NormalsOn < 0) {
    console.log('Failed to get the storage location of u_NormalsOn');
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

  // Get the storage location of u_LightPos
  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (u_LightPos < 0) {
    console.log('Failed to get the storage location of u_LightPos');
    return;
  }

  // Get the storage location of u_SpotlightPos
  u_SpotlightPos = gl.getUniformLocation(gl.program, 'u_SpotlightPos');
  if (u_SpotlightPos < 0) {
    console.log('Failed to get the storage location of u_SpotlightPos');
    return;
  }

  // Get the storage location of u_CameraPos
  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (u_CameraPos < 0) {
    console.log('Failed to get the storage location of u_CameraPos');
    return;
  }

  // Get the storage location of u_Shiny
  u_Shiny = gl.getUniformLocation(gl.program, 'u_Shiny');
  if (u_Shiny < 0) {
    console.log('Failed to get the storage location of u_Shiny');
    return;
  }

  // Get the storage location of u_LightOn
  u_LightOn = gl.getUniformLocation(gl.program, 'u_LightOn');
  if (u_LightOn < 0) {
    console.log('Failed to get the storage location of u_LightOn');
    return;
  }

  // Get the storage location of u_SpotlightOn
  u_SpotlightOn = gl.getUniformLocation(gl.program, 'u_SpotlightOn');
  if (u_SpotlightOn < 0) {
    console.log('Failed to get the storage location of u_SpotlightOn');
    return;
  }

  // Get the storage location of u_LightColor
  u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  if (u_LightColor < 0) {
    console.log('Failed to get the storage location of u_LightColor');
    return;
  }

  // Get the storage location of u_SpotlightColor
  u_SpotlightColor = gl.getUniformLocation(gl.program, 'u_SpotlightColor');
  if (u_SpotlightColor < 0) {
    console.log('Failed to get the storage location of u_SpotlightColor');
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

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (u_NormalMatrix < 0) {
    console.log('Failed to get the storage location of u_NormalMatrix');
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
let mapHeight = 3;
let mapWidth = 32;
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
function placeCubeOnCubeLookingAt() {
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
        // console.log("(" + xm + ", " + ym + ", " + zm + ")")
        if (cubeAt(xm+1, ym, zm)) { 
          if (addCubeAt(xm, ym, zm)) {
            // console.log("added cube x: (" + xm + ", " + ym + ", " + zm + ")");
            return;
          }
        }
        // console.log("aa");
        xm += 1;
        continue;
      }
    } else if (ray.delta_x < 0) {
      if (castX(xm, ym, zm, ray, -1)) {
        if (cubeAt(xm-1, ym, zm)) {
          if (addCubeAt(xm, ym, zm)) {
            // console.log("added cube x: (" + xm + ", " + ym + ", " + zm + ")");
            return;
          }
        }
        xm -= 1;
        continue;
      }
    }
    if (ray.delta_z > 0) {
      if (castZ(xm, ym, zm, ray, 1)) {
        if (cubeAt(xm, ym, zm+1)) {
          if (addCubeAt(xm, ym, zm)) {
            return;
          }
        }
        zm += 1;
        continue;
      }
    } else if (ray.delta_z < 0) {
      if (castZ(xm, ym, zm, ray, -1)) {
        if (cubeAt(xm, ym, zm-1)) {
          if (addCubeAt(xm, ym, zm)) {
            return;
          }
        }
        zm -= 1;
        continue;
      }
    }
    if (ray.delta_y > 0) {
      if (castY(xm, ym, zm, ray, 1)) {
        if (cubeAt(xm, ym+1, zm)) {
          if (addCubeAt(xm, ym, zm)) {
            return;
          }
        }
        ym += 1;
        continue;
      }
    } else if (ray.delta_y < 0) {
      if (castY(xm, ym, zm, ray, -1)) {
        if (cubeAt(xm, ym-1, zm) || ym-1 === -1) {
          if (addCubeAt(xm, ym, zm)) {
            // console.log("added cube Y: (" + xm + ", " + ym + ", " + zm + ")");
            return;
          }
        }
        ym -= 1;
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
  if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight && z >= 0 && z < mapWidth) {
    if (map[y][x][z] === 1) {
      map[y][x][z] = 0;
      deleteCube();
      return true;
    }
  }
  return false;
}
function addCubeAt(x, y, z) {
  if (inRange(x, y, z)) {
    if (!cubeAt()) {
      map[y][x][z] = 1;
      addCube(x, y, z);
      return true;
    }
  }
  return false;
}
function inRange(x, y, z) {
  if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight && z >= 0 && z < mapWidth) {
    return true;
  }
  return false;
}
function cubeAt(x, y, z) {
  if (inRange(x, y, z)) {
    if (map[y][x][z] === 1) {
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
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
],[
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
],[
[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ],
[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, ],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, ],
[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, ],
[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, ],
]
  ];
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      for (let z = 0; z < mapWidth; z++) {
        if (map[y][x][z] === 1) {
          addCube(x, y, z);
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
function addCube(x, y, z) {
  let c = new Cube([151, 191, 82, 1], 'grass', 0.5);
  c.matrix.translate((x-16)*cubeScale, -1 + cubeScale*y, (z-16)*cubeScale);
  c.matrix.scale(cubeScale, cubeScale, cubeScale);
  mapCubes.push([c, [x, y, z]]);
}
function renderMap() {
  for(let i = 0; i < mapCubes.length; i++) {
    mapCubes[i][0].render();
  }
}

function updateAnimationAngles() {
  g_lightPos[0] = Math.cos(g_currentTime / 1000) * 2;
}

// render everything !
function renderScene() {

  cam.sendProjMat();

  cam.updateAndSendViewMat();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // pass in light position
  gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  // pass in spotlight position
  gl.uniform3f(u_SpotlightPos, g_SpotlightPos[0], g_SpotlightPos[1], g_SpotlightPos[2]);
  // pass in camera position
  gl.uniform3f(u_CameraPos, cam.eye.elements[0], cam.eye.elements[1], cam.eye.elements[2]);
  // pass in light on
  gl.uniform1i(u_LightOn, g_LightOn);
  // pass in spotlight on
  gl.uniform1i(u_SpotlightOn, g_SpotlightOn);
  // pass in light colors
  gl.uniform4f(u_LightColor, ...g_LightColor);
  gl.uniform4f(u_SpotlightColor, ...g_SpotlightColor);

  // floor
  let floor = new Cube([132, 177, 76, 1], 'sky', 0, 1);
  floor.setOrigin([0.5, 1, 0.5]);
  floor.matrix.translate(0, -1, 0);
  floor.matrix.scale(10, 0.1, 10);
  floor.render();

  // sky box
  let sky = new Cube([255, 0, 0, 1], 'sky', 1, 1)
  sky.setOrigin([0.5, 0.5, 0.5]);
  sky.matrix.scale(-50, -50, -50);
  sky.normalMatrix.setScale(10, 10, 10);
  sky.normalMatrix.setInverseOf(sky.normalMatrix).transpose();
  sky.render();

  sphere.render();

  // draw the light
  let light = new Cube([255, 255, 100, 1], 'sky', 0);
  light.setOrigin([0.5, 0.5, 0.5]);
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.normalMatrix.setScale(10, 10, 10);
  light.normalMatrix.setInverseOf(light.normalMatrix).transpose();
  light.render();

  // draw the spotlight
  let spotlight = new Cube([255, 255, 100, 1], 'sky');
  spotlight.setOrigin([0.5, 0.5, 0.5]);
  spotlight.matrix.translate(g_SpotlightPos[0], g_SpotlightPos[1], g_SpotlightPos[2]);
  spotlight.matrix.scale(-0.1, -0.1, -0.1);
  spotlight.normalMatrix.setScale(10, 10, 10);
  spotlight.normalMatrix.setInverseOf(spotlight.normalMatrix).transpose();
  spotlight.render();

  teapot.color = [0, 0.5, 0.5, 1.0];
  teapot.matrix.setTranslate(1, -1, 0.5);
  // teapot.matrix.rotate(-30, 0, 1, 0);
  teapot.matrix.scale(0.3, 0.3, 0.3);
  teapot.render();

  // puppycat.render(g_startTime, g_currentTime);

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

  updateAnimationAngles();

  // if (puppycat.currentAnim === 'walkAnim') {
  //   walk();
  // }
  // draw everything
  renderScene();
  renderUI();

  let msElapsed = performance.now() - g_currentTime;
  fpsCounter.textContent = "FPS: " + (1000 / msElapsed).toFixed(0);

  // tell browser to update again when it has time
  requestAnimationFrame(tick);
}

function renderUI() {
  const ctx = document.getElementById("canvas2D").getContext("2d");
  ctx.fillStyle = "#52302a";
  ctx.fillRect(200, 200-25/2, 1, 25);
  ctx.fillRect(200-25/2, 200, 25, 1);
}
