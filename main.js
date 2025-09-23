// - - - >> 1.00 - Table of Contents
// 1.00 Scene Setup
// 2.00 Geometry and Mesh
// 3.00 Animation Loop

// - - - >> 1.00 - Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000); // Set background to black

// 1.00.00

// - - - >> 2.00 - Geometry and Mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 3;
// 2.00.00

// - - - >> 3.00 - Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
// 3.00.00
