import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURATION ---
const partData = {
    'Ear_Pad': { name: 'Memory Foam Cushion', desc: 'Protein leather with high-density foam for passive noise isolation.', color: '#3b82f6', offset: [0, 0, 5] },
    'Speaker_Driver': { name: '40mm Neodymium Driver', desc: 'Custom-tuned diaphragm delivering 5Hz-40kHz hi-res audio.', color: '#ef4444', offset: [0, 0, 8] },
    'Headband': { name: 'Aerospace Grade Steel', desc: 'Tension-tested headband with soft silicone pressure relief.', color: '#10b981', offset: [0, 5, 0] }
};

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('container').appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 50);
spotLight.position.set(5, 10, 5);
scene.add(spotLight);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 15);

// --- MODEL LOADING ---
const loader = new GLTFLoader();
let headphoneModel;

loader.load('path_to_your_model.glb', (gltf) => {
    headphoneModel = gltf.scene;
    scene.add(headphoneModel);
    
    // Apply PBR materials if they aren't in the file
    headphoneModel.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.userData.originalPos = node.position.clone();
        }
    });
});

// --- INTERACTION ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(headphoneModel.children, true);

    if (intersects.length > 0) {
        const clickedPart = intersects[0].object;
        const data = partData[clickedPart.name];

        if (data) {
            showInfo(data);
            animatePart(clickedPart, data.offset);
        }
    } else {
        resetParts();
    }
});

function animatePart(part, offset) {
    gsap.to(part.position, {
        x: part.userData.originalPos.x + offset[0],
        y: part.userData.originalPos.y + offset[1],
        z: part.userData.originalPos.z + offset[2],
        duration: 1,
        ease: "expo.out"
    });
}

function resetParts() {
    headphoneModel.traverse((node) => {
        if (node.isMesh && node.userData.originalPos) {
            gsap.to(node.position, {
                x: node.userData.originalPos.x,
                y: node.userData.originalPos.y,
                z: node.userData.originalPos.z,
                duration: 1,
                ease: "expo.out"
            });
        }
    });
    document.getElementById('info-card').classList.remove('active');
}

function showInfo(data) {
    const card = document.getElementById('info-card');
    document.getElementById('part-name').innerText = data.name;
    document.getElementById('part-desc').innerText = data.desc;
    document.getElementById('accent-bar').style.backgroundColor = data.color;
    card.classList.add('active');
}

// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();