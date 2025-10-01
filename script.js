// https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
/**
 * # Table of Contents
 * 1.05 - Setup: Scene, Camera, Renderer (Force LookAt Fix)
 * 2.00 - Helper Functions
 * 3.00 - Data Generation and Geometry (Increased Particle Size & Background Mesh)
 * 4.00 - Lighting and Aesthetics
 * 5.00 - Controls and Responsiveness
 * 6.00 - Animation Loop (Initial Rotation Fix)
 */

- - - >> 1.05 - Setup: Scene, Camera, Renderer (Force LookAt Fix)
let scene, camera, renderer, controls;
const container = document.body;

function updateVersionOverlay(version, status) {
    const overlay = document.getElementById('version-overlay');
    if (overlay) {
        overlay.innerText = 'Project Version: ' + version + ' | Status: ' + status;
    }
}

function init() {
    try {
        scene = new THREE.Scene();
1.05.00
        // ADD FOG for a dreamy, deep-space effect and better depth
        scene.fog = new THREE.Fog(0x000000, 1, 150);
        
        // Camera Setup (Metric: field of view in degrees, aspect ratio, near, far in meters)
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 80; // Camera closer
        camera.lookAt(scene.position); // CRITICAL FIX: Ensure camera is looking at the center (0,0,0)

        // Renderer Setup - CRITICAL MOBILE FIXES APPLIED HERE
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false, 
            powerPreference: "high-performance" 
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 1); // Black background
        container.appendChild(renderer.domElement);

        // Update the HTML overlay to confirm script execution
        updateVersionOverlay('1.05.00', 'Initialized'); 
1.05.01
    } catch (error) {
        updateVersionOverlay('1.05.00', 'ERROR');
        console.error("Initialization Failed:", error);
    }
}

- - - >> 2.00 - Helper Functions
// Function to generate a point on a Torus (organic, curved shape)
function getPointOnTorus(radius, tube, radialSegments, tubularSegments, i) {
    const u = (i / tubularSegments) * Math.PI * 2;
2.00.00
    const v = (i / radialSegments) * Math.PI * 2;
    const x = (radius + tube * Math.cos(v)) * Math.cos(u);
    const y = (radius + tube * Math.cos(v)) * Math.sin(u);
    const z = tube * Math.sin(v);
    return { x, y, z };
}

- - - >> 3.00 - Data Generation and Geometry (Increased Particle Size & Background Mesh)
const DATA_POINTS_COUNT = 500;
const data = [];
const positions = new Float32Array(DATA_POINTS_COUNT * 3);
const colors = new Float32Array(DATA_POINTS_COUNT * 3);
const color1 = new THREE.Color(0x9900FF); // Neon Purple
const color2 = new THREE.Color(0x00FFFF); // Turquoise
const color3 = new THREE.Color(0x39FF14); // Neon Green
const radius = 50; // Metric: Radius in meters
const tube = 10;   // Metric: Tube radius in meters

for (let i = 0; i < DATA_POINTS_COUNT; i++) {
    const point = getPointOnTorus(radius, tube, DATA_POINTS_COUNT, DATA_POINTS_COUNT, i);
3.00.00
    // Introduce a slight random offset for a 'dreamy, trippy' cloud effect
    point.x += (Math.random() - 0.5) * tube * 2;
    point.y += (Math.random() - 0.5) * tube * 2;
    point.z += (Math.random() - 0.5) * tube * 2;

    data.push({
        x: point.x,
        y: point.y,
        z: point.z,
        value: Math.random() // Dummy value
    });

    // Populate BufferGeometry arrays
    positions[i * 3]     = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;

    // Assign a color based on the point's Z-position to blend the neon colors
    let color = new THREE.Color();
    if (point.z > 0) {
        color.lerpColors(color1, color2, (point.z / tube) * 0.5 + 0.5);
    } else {
        color.lerpColors(color2, color3, (Math.abs(point.z) / tube) * 0.5 + 0.5);
    }

    colors[i * 3]     = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
3.00.01
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material for the glowing particles
const material = new THREE.PointsMaterial({
    size: 5.0, // Increased size for visibility
    vertexColors: true,
    sizeAttenuation: true, 
    transparent: true,
    opacity: 0.8
});

const dataPoints = new THREE.Points(geometry, material);
scene.add(dataPoints);

// Add a large, subtle sphere for background reference
const backgroundGeometry = new THREE.SphereGeometry(65, 32, 32);
const backgroundMaterial = new THREE.MeshBasicMaterial({
    color: 0x9900FF, // Neon Purple
    wireframe: true,
    transparent: true,
    opacity: 0.05 // Very subtle
});
const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundSphere);
3.01.00

- - - >> 4.00 - Lighting and Aesthetics
// Ambient Light for overall soft glow
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
scene.add(ambientLight);
4.00.00

// Point Light for enhanced glow effect (Neon Purple)
const pointLight = new THREE.PointLight(0xAA00FF, 5, 200); // Color, Intensity, Distance
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// Secondary Point Light (Turquoise)
const pointLight2 = new THREE.PointLight(0x00FFFF, 3, 150);
pointLight2.position.set(-50, -50, -50);
scene.add(pointLight2);

- - - >> 5.00 - Controls and Responsiveness
// OrbitControls optimized for mobile/touch
function setupControls() {
    // Requires THREE.js OrbitControls to be included (now verified via CDN)
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
5.00.00
        controls.enableDamping = true; // Smooth motion
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 20;
        controls.maxDistance = 200;
        updateVersionOverlay('1.05.00', 'Controls Active');
    } else {
        updateVersionOverlay('1.05.00', 'Controls FAIL');
        console.warn("OrbitControls not loaded! Interaction disabled.");
    }
}

// Responsiveness: Handle screen rotation and resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
5.00.01
}

window.addEventListener('resize', onWindowResize, false);

- - - >> 6.00 - Animation Loop (Initial Rotation Fix)
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Subtle rotation of the entire data cloud for a dreamy effect
    dataPoints.rotation.y += 0.1 * delta;
6.00.00
    dataPoints.rotation.x += 0.05 * delta;
    
    // Rotate the background sphere slowly
    backgroundSphere.rotation.y -= 0.02 * delta;

    // Move the purple light for dynamic effect
    pointLight.position.x = 75 * Math.cos(clock.getElapsedTime() * 0.5);
    pointLight.position.z = 75 * Math.sin(clock.getElapsedTime() * 0.5);

    controls.update(); // only required if controls.enableDamping is set to true
    renderer.render(scene, camera);
}

// Initial setup to guarantee a non-zero starting view (Added in V1.05)
dataPoints.rotation.y = Math.PI / 4; // Rotate 45 degrees
dataPoints.rotation.x = Math.PI / 8; // Rotate 22.5 degrees

// Initialize and Start
init();
setupControls();
animate();
// https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
