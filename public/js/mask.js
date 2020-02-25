import * as THREE from "https://unpkg.com/three@0.113.2/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.113.2/examples/jsm/loaders/GLTFLoader.js";
import MaskControls from "./MaskControls.js";

const loader = new GLTFLoader().setPath("models/");
const textures = new THREE.TextureLoader().setPath("models/");
const canvas = document.getElementById("sim");
const renderer = new THREE.WebGLRenderer({ 
    canvas,
    alpha: true,
    premultipliedAlpha: false
});

renderer.outputEncoding = THREE.sRGBEncoding;
  
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
  
loader.load("msk_alienware.gltf", gltf => {
    const scen = gltf.scene;
    const mesh = scen.children[0].children[0];
    const df = textures.load("alienware_df.png", () => render()), nm = textures.load("alienware_nm.png", () => render()), mc = textures.load("matcap_plastic_df.png", () => render());
    df.flipY = false, nm.flipY = false, mc.flipY = false;
    mesh.material = new THREE.MeshMatcapMaterial({ map: df, bumpMap: nm, bumpScale: 1, matcap: mc });
    scen.scale.set(5, 5, 5);
    scene.add(scen);
    const controls = new MaskControls(camera, canvas, scen);
    controls.addEventListener("move", render);
    render();
});

window.addEventListener("resize", render);
