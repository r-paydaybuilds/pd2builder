import * as THREE from "https://unpkg.com/three@0.110.0/build/three.module.js";
import MaskControls from "./MaskControls.js";

const canvas = document.getElementById("sim");
const renderer = new THREE.WebGLRenderer({ 
    canvas,
    alpha: true,
    premultipliedAlpha: false
});
  
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();
  
{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 0, 2);
    scene.add(light);
}
  
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  
const material = new THREE.MeshPhongMaterial({color: 0x44aa88});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

cube.position.x = 0;

const controls = new MaskControls(camera, canvas, cube);

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
}
  
render(); 

controls.addEventListener("move", render);
window.addEventListener("resize", render);