/* TODO
  - resizing squishes things
  - add nicer physics to movement
  - make the water foam not stretch like how u fixed the waves
  - make it water material so we get lighting?
  - turn on bilinear interpolation..
  - make a default animation / rest pose
  - something abt the rotation is still slightly off
  - can we make puppycat look slightly fluffy... slash softer 
*/

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// import { Water } from 'three/addons/objects/Water.js';

const VERTEX_SHADER = `
    varying vec3 vUv;

    void main() {
      vUv = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
    }
  `;

// water fragment shader adapted from https://tympanus.net/codrops/2025/03/04/creating-stylized-water-effects-with-react-three-fiber/
const FRAGMENT_SHADER = `
    varying vec3 vUv; 
    
    uniform float uTime;
    uniform vec3 uColorNear;
    uniform vec3 uColorFar;
    uniform float uTextureSize;
    uniform float uWaterAlpha;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                          -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));

      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      // Set the current color as the base color.
      vec3 finalColor = vec3(0.5, 0.5, 1.0); // was gl_FragColor

      // Invert texture size
      float textureSize = uTextureSize;

      // Set an initial alpha value
      vec3 alpha = vec3(1.0);

      // Generate noise for the base texture
      float noiseBase = snoise(vec2(vUv * (textureSize * 2.8) + sin(uTime * 0.3)));
      noiseBase = noiseBase * 0.5 + 0.5;
      vec3 colorBase = vec3(noiseBase);

      // Calculate foam effect using smoothstep and thresholding
      vec3 foam = smoothstep(0.08, 0.001, colorBase);
      foam = step(0.5, foam);  // binary step to create foam effect

      // Generate additional noise for waves
      float z = abs(vUv.z);
      float zScale = mix(0.7, 1.0, z);
      float noiseWaves = snoise(vec2(vUv * textureSize / zScale + sin(uTime * -0.1)));
      noiseWaves = noiseWaves * 0.5 + 0.5;
      vec3 colorWaves = vec3(noiseWaves);

      // Apply smoothstep for wave thresholding
      // Threshold for waves oscillates between 0.6 and 0.61
      float threshold = 0.65 + 0.02 * sin(uTime * 2.0); 
      vec3 waveEffect = 1.0 - (smoothstep(threshold + 0.03, threshold + 0.032, colorWaves) + 
                              smoothstep(threshold, threshold - 0.01, colorWaves));
      // vec3 waveEffect = vec3(1.0 - (smoothstep(0.5, 0.7, colorWaves) + smoothstep(0.5, 0.4, colorWaves)));

      // Binary step to increase the wave pattern thickness
      waveEffect = step(0.5, waveEffect);

      // Combine wave and foam effects
      vec3 combinedEffect = min(waveEffect + foam, 1.0);

      // calculate base color based on z depth
      vec3 baseColor = uColorNear;
      float dist = vUv.z/2.0;
      dist = min(dist, 1.0);
      dist = max (0.0, dist);
      float baseEffect = smoothstep(0.0, 1.0, dist);
      // baseColor = mix(uColorFar, uColorNear, baseEffect);

      // Sample foam and waves to maintain constant alpha of 1.0
      //vec3 foamAlphaEffect = mix(foam, vec3(0.0), baseEffect);
      //vec3 waveAlphaEffect = mix(waveEffect, vec3(0.0), baseEffect);

      vec3 foamAndWaveAmnt = foam + waveEffect;
      foamAndWaveAmnt = min(foamAndWaveAmnt, 1.0);
      alpha = mix(vec3(uWaterAlpha), vec3(1.0), foamAndWaveAmnt);
      // calculate alpha based on z depth
      // alpha = mix(alpha, vec3(1.0), dist);

      finalColor = (1.0 - combinedEffect) * baseColor + combinedEffect;
      
      // Output the final color
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;
  // use this? https://www.npmjs.com/package/three-custom-shader-material



let scene;
let camera;
let renderer;
let composer;

let planet;
let planetWater;
let waterMaterial;

let puppycat;

let crystals;

let camControl;

let totalTime = 0;

// let animationMixer;
// let walkAnim;
// let standAnim;


function main() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const params = {
    threshold: 1.,
    strength: 0.2,
    radius: 0,
  };
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.strength, params.radius, params.threshold);
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;
  composer.addPass(bloomPass);

  let material = new THREE.MeshPhongMaterial({
    color: 0xffefc9, 
    emissive: 0xffefc9,
    emissiveIntensity: 0
  });
  let radius = 1.5;  
  let detail = 5;  
  let geometry = new THREE.IcosahedronGeometry( radius, detail );
  planet = new THREE.Mesh(geometry, material);
  scene.add( planet );

  waterMaterial = new THREE.ShaderMaterial( {
    uniforms: {
      uTime: { value: totalTime / 1000 },
      uColorNear: { value: [156/255, 255/255, 250/255] },
      uColorFar: { value: [54/255, 137/255, 156/255] },
      uTextureSize: { value: 2.0 },
      uWaterAlpha: {value: 0.5}
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
  } );

  // material = new THREE.MeshPhongMaterial({color: 0x9ee5ff, transparent: true, opacity: 0.7});
  radius = 1.6;
  geometry = new THREE.IcosahedronGeometry( radius, detail );
  planetWater = new THREE.Mesh(geometry, waterMaterial);
  planet.add(planetWater);


  // STAR SHAPE !!
  const shape = new THREE.Shape();
  const x = 0;
  const y = 0;
  shape.moveTo(-3, 2);
  shape.bezierCurveTo(0, 7, 0, 7, 3, 2);
  shape.bezierCurveTo(8, 0, 8, 0, 4, -3);
  shape.bezierCurveTo(6, -9, 6, -9, 0, -6);
  shape.bezierCurveTo(-6, -9, -6, -9, -4, -3);
  shape.bezierCurveTo(-8, 0, -8, 0, -3, 2);
  const extrudeSettings = {
    steps: 2,  

    depth: 2,  

    bevelEnabled: true,  
    bevelThickness: 0.5,  

    bevelSize: 0.5,  

    bevelSegments: 2,
  };
  const geometryStar = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const materialStar = new THREE.MeshPhongMaterial({color: 0xfff6a1});
  // make stars
  let star = new THREE.Mesh(geometryStar, materialStar);
  star.position.set(0, 0, 1.5);
  // star.rotate();
  star.scale.set(0.03, 0.03, 0.03);
  planet.add(star);
  // star point light
  // let starLight = new THREE.PointLight(0xfff6a1, 0.3, 0, 2);
  // star.add(starLight);

  makeOrbitingCrystals();

  // load puppycat and set up his animation and the movement control
  const gltfLoader = new GLTFLoader();
  gltfLoader.load( '../puppycat.glb', (object) => {
    puppycat = object;
    puppycat.scene.scale.set(0.15, 0.15, 0.15);
    puppycat.scene.position.set(0, 1, 1.5);
    // let angle = Math.atan(1/1.12);
    // console.log(angle);
    puppycat.scene.rotation.set(Math.PI/4, -Math.PI / 2, 0);
    scene.add(puppycat.scene);

    let animationMixer = new THREE.AnimationMixer(puppycat.scene);
    let walkAnim = animationMixer.clipAction( puppycat.animations[1] );
    let standAnim = animationMixer.clipAction( puppycat.animations[0] );
    standAnim.play()

    let animInfo = {
      mixer: animationMixer,
      anims: [walkAnim, standAnim]
    }

    camControl = new CameraControl(planet, puppycat.scene, animInfo, THREE);
  } );


  // DIR LIGHT
  const color = 0xFFFFFF;
  const intensity = 2;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
  // AMBIENT LIGHT
  const intensity2 = 0.5;
  const light2 = new THREE.AmbientLight(color, intensity2);
  planet.add(light2);

  document.onkeydown = (ev) => {
    camControl.onKeyDown(ev);
  }
  document.onkeyup = (ev) => {
    camControl.onKeyUp(ev);
  }

  camera.position.z = 5;

  renderer.setAnimationLoop( animate );
}

function makeOrbitingCrystals() {
  crystals = [];
  makeCrystal(1, [0, 0, 3]);
  makeCrystal(0.5, [0.3, 0.2, 2.7]);
  makeCrystal(0.7, [-0.3, 0.1, 2.7]);
}

function makeCrystal(radius, position) {
  const crystalColor = 0x21a4c2;
  // let radius = 1;
  let geometry = new THREE.OctahedronGeometry(radius);
  let material = new THREE.MeshPhongMaterial({
    color: crystalColor,
    emissive: new THREE.Color(0, 0, 3),
  })
  let crystal = new THREE.Mesh(geometry, material);
  crystal.position.set(position[0], position[1], position[2]);
  crystal.scale.set(0.2, 0.2, 0.2);
  planet.add(crystal);

  // crystal light
  let crystalLight = new THREE.PointLight(crystalColor, 0.4, 10, 10);
  crystalLight.position.set(position[0], position[1], position[2]);
  crystal.add(crystalLight);

  crystals.push(crystal);
}

function orbit(obj) {
  let x = obj.position.x;
  let y = obj.position.y;
  let z = obj.position.z;
  let r = Math.sqrt(x * x + z * z); // not based on y
  
  let theta = Math.atan2(z, x);
  
  theta += 0.01;
  x = r * Math.cos(theta)
  z = r * Math.sin(theta)
  
  obj.position.set(x, y, z);
}

// function buildWaterMaterial() {
//   waterMaterial = new THREE.ShaderMaterial( {
//     uniforms: {
//       uTime: { value: totalTime / 1000 },
//       uColorNear: { value: [156/255, 255/255, 250/255] },
//       uColorFar: { value: [54/255, 137/255, 156/255] },
//       uTextureSize: { value: 2.0 }
//     },
//     vertexShader: VERTEX_SHADER,
//     fragmentShader: FRAGMENT_SHADER,
//     transparent: true
//   } );
//   planetWater.material = waterMaterial;
//   console.log(planetWater);
//   planetWater.needsUpdate = true;
// }

function animate( time ) {
  let deltaTime = time - totalTime;
  totalTime = time;
  waterMaterial.uniforms.uTime.value = totalTime / 1000;

  if (camControl != null) {
    camControl.move(deltaTime);
  }

  // orbit crystals
  for (let i = 0; i < crystals.length; i++) {
    orbit(crystals[i]);
  }
  // buildWaterMaterial();
  // waterMaterial.attributes.needsUpdate = true; // HOW DO WE UPDATE POSITION ATTRIBUTE ,,,
  // if (planet != null) {
  //   planet.rotation.x = time / 2000;
  //   planet.rotation.y = time / 1000;
  // }
  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.render();
}

main();
