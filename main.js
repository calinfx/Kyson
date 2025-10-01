// main.js - 3D desert environment with mobile-friendly joystick controls, crosshair selection, and object interaction

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

(() => {
  // Scene setup
  const scene = new THREE.Scene();

  // Ground plane
  const desertColor = 0xcc6633;
  const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: desertColor, roughness: 1, metalness: 0 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 15, 25);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xb35f3b);
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

  // Controls - OrbitControls for rotation/look
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 5;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;

  // Objects container and spinning set
  const objects = [];
  const spinningObjects = new Set();

  // UI elements
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

  // Raycaster for selection
  const raycaster = new THREE.Raycaster();

  // Hover and selection tracking
  let hoveredObject = null;
  let selectedObject = null;

  // Add object utility
  function addObject(obj, name) {
    obj.castShadow = true;
    obj.receiveShadow = true;
    scene.add(obj);
    objects.push({ obj, name });

    // Add to UI selects
    const opt1 = document.createElement('option');
    opt1.value = name;
    opt1.textContent = name;
    applyTextureSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = name;
    opt2.textContent = name;
    spinObjectsSelect.appendChild(opt2);
  }

  // Create primitive mesh
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

  // Prepopulate objects
  function prepopulateObjects() {
    const types = ['box', 'sphere', 'cone', 'cylinder', 'plane'];
    for (let i = 0; i < 5; i++) {
      const type = types[i % types.length];
      const mesh = createPrimitive(type);
      mesh.position.set(i * 6 - 12, mesh.geometry.parameters.height ? mesh.geometry.parameters.height / 2 : 1.5, 0);
      const name = `prepop${i + 1}_${type}`;
      mesh.name = name;
      addObject(mesh, name);
    }
  }

  prepopulateObjects();

  // Add primitive button handler
  addPrimitiveBtn.addEventListener('click', () => {
    const type = primitiveSelect.value;
    const mesh = createPrimitive(type);
    const name = `obj${objects.length + 1}_${type}`;
    mesh.name = name;
    addObject(mesh, name);
  });

  // Texture loading
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
      () => alert('Error loading texture image.')
    );
  });

  // Apply texture button
  applyTextureBtn.addEventListener('click', () => {
    const objName = applyTextureSelect.value;
    if (!objName) {
      alert('Select an object to apply texture.');
      return;
    }
    if (!loadedTexture) {
      alert('Load a texture image first.');
      return;
    }
    const objectData = objects.find((o) => o.name === objName);
    if (!objectData) return;

    objectData.obj.material.map = loadedTexture;
    objectData.obj.material.needsUpdate = true;
  });

  // Spin toggle button
  toggleSpinBtn.addEventListener('click', () => {
    const objName = spinObjectsSelect.value;
    if (!objName) {
      alert('Select an object to toggle spin.');
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

  // Capture photo button
  capturePhotoBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera API not supported.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.style.display = 'block';

      await new Promise((res) => {
        video.onloadedmetadata = () => res();
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach((track) => track.stop());
      video.style.display = 'none';

      const dataUrl = canvas.toDataURL();
      textureLoader.load(
        dataUrl,
        (texture) => {
          loadedTexture = texture;
          alert('Photo captured and texture loaded. Select an object and click "Apply Texture".');
        },
        undefined,
        () => alert('Failed to load texture from photo.')
      );
    } catch {
      alert('Camera access denied or error.');
    }
  });

  // Variables for joystick
  const joystickContainer = document.getElementById('joystick-container');
  const joystickStick = document.getElementById('joystick-stick');
  const joystickBase = document.getElementById('joystick-base');
  const joystickRadius = joystickBase.offsetWidth / 2;
  let joystickPointerId = null;
  let joystickCenter = { x: 0, y: 0 };
  let joystickPos = { x: 0, y: 0 };
  let joystickVector = { x: 0, y: 0 };

  function setJoystickPosition(x, y) {
    const rect = joystickBase.getBoundingClientRect();
    joystickCenter.x = rect.left + rect.width / 2;
    joystickCenter.y = rect.top + rect.height / 2;
    joystickPointerId = null;
    joystickPos.x = x;
    joystickPos.y = y;
    joystickStick.style.transform = `translate(${x}px, ${y}px)`;
  }

  joystickBase.addEventListener('touchstart', (event) => {
    if (joystickPointerId !== null) return;
    const touch = event.changedTouches[0];
    joystickPointerId = touch.identifier;
    setJoystickPosition(0, 0);
  });

  joystickBase.addEventListener('touchmove', (event) => {
    if (joystickPointerId === null) return;
    for (let i = 0; i < event.changedTouches.length; i++) {
      if (event.changedTouches[i].identifier === joystickPointerId) {
        const touch = event.changedTouches[i];
        const deltaX = touch.clientX - joystickCenter.x;
        const deltaY = touch.clientY - joystickCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = joystickRadius;

        let clampedX = deltaX;
        let clampedY = deltaY;
        if (distance > maxDistance) {
          const angle = Math.atan2(deltaY, deltaX);
          clampedX = Math.cos(angle) * maxDistance;
          clampedY = Math.sin(angle) * maxDistance;
        }

        joystickPos.x = clampedX;
        joystickPos.y = clampedY;
        joystickStick.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

        joystickVector.x = clampedX / maxDistance;
        joystickVector.y = clampedY / maxDistance;
        event.preventDefault();
        return;
      }
    }
  }, { passive: false });

  joystickBase.addEventListener('touchend', (event) => {
    for (let i = 0; i < event.changedTouches.length; i++) {
      if (event.changedTouches[i].identifier === joystickPointerId) {
        joystickPointerId = null;
        joystickPos.x = 0;
        joystickPos.y = 0;
        joystickVector.x = 0;
        joystickVector.y = 0;
        joystickStick.style.transform = `translate(0px, 0px)`;
        return;
      }
    }
  });

  joystickBase.addEventListener('touchcancel', () => {
    joystickPointerId = null;
    joystickPos.x = 0;
    joystickPos.y = 0;
    joystickVector.x = 0;
    joystickVector.y = 0;
    joystickStick.style.transform = `translate(0px, 0px)`;
  });

  // Animate loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // Mobile joystick movement
    if (joystickVector.x !== 0 || joystickVector.y !== 0) {
      // Move camera relative to current view direction
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(camera.up, forward).normalize();

      // joystickVector.y is vertical axis: negative is forward (up), positive backward (down)
      // joystickVector.x is horizontal axis: positive is right, negative left
      const moveSpeed = 0.15;

      camera.position.addScaledVector(forward, -joystickVector.y * moveSpeed);
      camera.position.addScaledVector(right, joystickVector.x * moveSpeed);

      // Keep camera above ground
      if (camera.position.y < 1.2) camera.position.y = 1.2;
    }

    // Spin selected objects
    const delta = clock.getDelta();
    spinningObjects.forEach((obj) => {
      obj.rotation.y += delta * 0.2;
    });

    // Raycast from center to detect hovered object
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(objects.map(o => o.obj));

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (hoveredObject !== intersected) {
        if (hoveredObject && hoveredObject !== selectedObject) {
          hoveredObject.material.emissive.set(0x000000);
          hoveredObject.material.emissiveIntensity = 0;
        }
        hoveredObject = intersected;
        if (hoveredObject !== selectedObject) {
          hoveredObject.material.emissive.set('turquoise');
          hoveredObject.material.emissiveIntensity = 0.6;
        }
      }
    } else {
      if (hoveredObject && hoveredObject !== selectedObject) {
        hoveredObject.material.emissive.set(0x000000);
        hoveredObject.material.emissiveIntensity = 0;
      }
      hoveredObject = null;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Selection on tap/click
  window.addEventListener('touchend', (event) => {
    // On mobile tap, select hovered object
    if (hoveredObject && hoveredObject !== selectedObject) {
      if (selectedObject) {
        selectedObject.material.emissive.set(0x000000);
        selectedObject.material.emissiveIntensity = 0;
      }
      selectedObject = hoveredObject;
      selectedObject.material.emissive.set('turquoise');
      selectedObject.material.emissiveIntensity = 1;
    } else if (!hoveredObject && selectedObject) {
      selectedObject.material.emissive.set(0x000000);
      selectedObject.material.emissiveIntensity = 0;
      selectedObject = null;
    }
  });

  // Also support mouse click selection for desktop
  window.addEventListener('click', () => {
    if (hoveredObject && hoveredObject !== selectedObject) {
      if (selectedObject) {
        selectedObject.material.emissive.set(0x000000);
        selectedObject.material.emissiveIntensity = 0;
      }
      selectedObject = hoveredObject;
      selectedObject.material.emissive.set('turquoise');
      selectedObject.material.emissiveIntensity = 1;
    } else if (!hoveredObject && selectedObject) {
      selectedObject.material.emissive.set(0x000000);
      selectedObject.material.emissiveIntensity = 0;
      selectedObject = null;
    }
  });
})();
