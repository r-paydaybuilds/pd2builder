import*as e from"https://unpkg.com/three@0.113.2/build/three.module.js";import{GLTFLoader as t}from"https://unpkg.com/three@0.113.2/examples/jsm/loaders/GLTFLoader.js";import n from"./MaskControls.js";const i=(new t).setPath("models/"),o=document.getElementById("sim"),s=new e.WebGLRenderer({canvas:o,alpha:!0,premultipliedAlpha:!1});s.outputEncoding=e.sRGBEncoding;const d=new e.PerspectiveCamera(75,2,.1,5);d.position.z=2;const r=new e.Scene;{const t=16777215,n=1,i=new e.DirectionalLight(t,n);i.position.set(0,0,2),r.add(i)}function c(){if(function(e){const t=e.domElement,n=window.devicePixelRatio,i=t.clientWidth*n|0,o=t.clientHeight*n|0,s=t.width!==i||t.height!==o;return s&&e.setSize(i,o,!1),s}(s)){const e=s.domElement;d.aspect=e.clientWidth/e.clientHeight,d.updateProjectionMatrix()}s.render(r,d)}i.load("msk_alienware.gltf",(e=>{const t=e.scene;t.scale.set(5,5,5),r.add(t);new n(d,o,t).addEventListener("move",c),c()})),window.addEventListener("resize",c);