// main.js - 3D desert environment with mobile joystick controls, version display, and debug logs

(() => {
  const VERSION = '1.1';
  console.log(`3D Desert Environment - Version ${VERSION}`);

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
  scene.add(directionalLight
