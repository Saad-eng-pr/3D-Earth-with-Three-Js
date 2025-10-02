
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import getStarfield from "./getStarfield.js";
import { getFresnelMat } from "./getFresnelMat.js";


const w = window.innerWidth;
const h = window.innerHeight;

// Add scene
const scene = new THREE.Scene();

// Add camera
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 9;

// Add renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Create the earth group
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);

// Add orbits controls
const orbitControls = new OrbitControls(camera, renderer.domElement);

// Optional configs:
orbitControls.enableDamping = true;   // smooth movement
orbitControls.dampingFactor = 0.05;
orbitControls.minDistance = 1;        // min zoom-in
orbitControls.maxDistance = 1000;     // max zoom-out
orbitControls.enablePan = true;       // allow moving sideways
orbitControls.target.set(0, 0, 0);

// Create the earth mesh
const detail = 12;
const loader = new THREE.TextureLoader(); // loads the textures into the mesh
const geometry = new THREE.IcosahedronGeometry(2, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/8k_earth_daymap.jpg"),
  specularMap: loader.load("./textures/8K_earth_specular_map.jpg"),
  bumpMap: loader.load("./textures/0k_earth_bumps.jpg"),
  bumpScale: 0.04,
});
material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// Add earth with lights at night
const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/8k_earth_nightmap.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

// Add clouds to the earth
const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/8k_earth_clouds.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

// Add the fresnel effect to the earth (the glow earth has when seen from space)
const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

// Add stars to the dark spaces just like the fault in our stars
const stars = getStarfield({numStars: 2000});
scene.add(stars);

// Add sun light
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// // Add the moon orbiting the earth
// const moonGeometry = new THREE.IcosahedronGeometry(0.35, detail);
// const moonMaterial = new THREE.MeshBasicMaterial({
//   map: loader.load("./textures/8K_moon.jpg"),
// });

// const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
// moonMesh.position.set(8, -0.5, -1.5);

// scene.add(moonMesh);
// let moonAngle = 0;
// const moonDistance = 16;

function animate() {
  requestAnimationFrame(animate);

  
  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;
  // moonMesh.rotation.y += 0.006;

  // moonAngle -= 0.002; // speed of orbit

  // // position Moon relative to Earth
  // moonMesh.position.x = earthMesh.position.x - (Math.cos(moonAngle) * moonDistance) * 0.5;
  // moonMesh.position.z = earthMesh.position.z - (Math.sin(moonAngle) * moonDistance) * 0.5;

  orbitControls.update();

  renderer.render(scene, camera);
}

animate();


function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);