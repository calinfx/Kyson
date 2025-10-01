// main.js - Mobile joystick and 3D desert environment with selection
// Uses global THREE and OrbitControls loaded via script tags

(() => {
  // Check global THREE and OrbitControls
  if (typeof THREE === 'undefined' || typeof THREE.OrbitControls === 'undefined') {
    console.error('THREE or OrbitControls not loaded');
    return;
  }

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
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
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
    const opt1 = document.create
