// Main 3D environment setup with desert colors, lighting, shadows, touch controls optimized for iPhone,
// ability to add primitives, apply textures from photo or file, toggle slow spin on objects.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

(() => {
  // Scene setup
  const scene = new THREE.Scene();

  // Desert floor color (Mars/Sahara)
  const desertColor = 0xcc6633;
  const desertGround = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: desertColor })
  );
  desertGround.rotation.x = -Math.PI / 2;
  desertGround.receiveShadow = true;
  scene.add(desertGround);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 15, 25);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xb35f3b); // Martian sky color
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Lighting
  const directionalLight = new THREE.DirectionalLight(0xffa95c, 1.2);
  directionalLight.position.set(40, 60, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffccaa, 0.3);
  scene.add(ambientLight);

  // Controls optimized for touch (OrbitControls supports touch)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 5;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below ground

  // Objects container
  const objects = [];
  const spinningObjects = new Set();

  // Primitive creation parameters
  const primitiveSelect = document.getElementById('primitive-select');
  const addPrimitiveBtn = document.getElementById('add-primitive-btn');
  const applyTextureSelect = document.getElementById('apply-texture-select');
  const applyTextureBtn = document.getElementById('apply-texture-btn');
  const spinObjectsSelect = document.getElementById('spin-objects-select');
  const toggleSpinBtn = document.getElementById('toggle-spin-btn');
  const textureInput = document.getElementById('texture-input');
  const capturePhotoBtn = document.getElementById('capture-photo-btn');
  const video = document.getElementById('video');

  // Texture loader
  const textureLoader = new THREE.TextureLoader();

  // Utility: Add object to scene and UI selects
  function addObject(obj, name) {
    obj.castShadow = true;
    obj.receiveShadow = true;
    scene.add(obj);
    objects.push({ obj, name });

    // Add to selects
    const opt1 = document.createElement('option');
    opt1.value = name;
    opt1.textContent = name;
    applyTextureSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = name;
    opt2.textContent = name;
    spinObjectsSelect.appendChild(opt2);
  }

  // Create primitive mesh by type
  function createPrimitive(type) {
    let geometry;
    switch (type) {
      case 'box':
        geometry = new THREE.BoxGeometry(3, 3, 3);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(1.5, 4, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(4, 3);
        break;
      default:
        geometry = new THREE.BoxGeometry(3, 3, 3);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0xd17e4f,
      roughness: 0.8,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 30,
      geometry.parameters.height ? geometry.parameters.height / 2 : 1.5,
      (Math.random() - 0.5) * 30
    );
    return mesh;
  }

  // Add primitive button handler
  addPrimitiveBtn.addEventListener('click', () => {
    const type = primitiveSelect.value;
    const mesh = createPrimitive(type);
    const name = `obj${objects.length + 1}_${type}`;
    mesh.name = name;
    addObject(mesh, name);
  });

  // Apply texture from image file input
  let loadedTexture = null;

  textureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    textureLoader.load(
      url,
      (texture) => {
        loadedTexture = texture;
        URL.revokeObjectURL(url);
        alert('Texture loaded. Select an object and click "Apply Texture"');
      },
      undefined,
      (err) => {
        alert('Error loading texture image.');
      }
    );
  });

  // Apply texture button handler
  applyTextureBtn.addEventListener('click', () => {
    const objName = applyTextureSelect.value;
    if (!objName) {
      alert('Please select an object to apply texture.');
      return;
    }
    if (!loadedTexture) {
      alert('Please load a texture image first.');
      return;
    }
    const objectData = objects.find((o) => o.name === objName);
    if (!objectData) return;

    objectData.obj.material.map = loadedTexture;
    objectData.obj.material.needsUpdate = true;
  });

  // Spin toggle button handler
  toggleSpinBtn.addEventListener('click', () => {
    const objName = spinObjectsSelect.value;
    if (!objName) {
      alert('Please select an object to toggle spin.');
      return;
    }
    const objData = objects.find((o) => o.name === objName);
    if (!objData) return;

    if (spinningObjects.has(objData.obj)) {
      spinningObjects.delete(objData.obj);
    } else {
      spinningObjects.add(objData.obj);
    }
  });

  // Capture photo button handler
  capturePhotoBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera API not supported on this device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      // Show video briefly for capture
      video.style.display = 'block';

      // Wait for video to be ready
      await new Promise((res) => {
        video.onloadedmetadata = () => res();
      });

      // Capture frame to canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop video stream
      stream.getTracks().forEach((track) => track.stop());
      video.style.display = 'none';

      // Load texture from canvas
      const dataUrl = canvas.toDataURL();
      textureLoader.load(
        dataUrl,
        (texture) => {
          loadedTexture = texture;
          alert('Photo captured and texture loaded. Select an object and click "Apply Texture".');
        },
        undefined,
        (err) => {
          alert('Failed to load texture from photo.');
        }
      );
    } catch (e) {
      alert('Camera access denied or error occurred.');
    }
  });

  // Animate loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // Rotate spinning objects slowly
    const delta = clock.getDelta();
    spinningObjects.forEach((obj) => {
      obj.rotation.y += delta * 0.2;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
