<template>
  <div ref="container" class="relative w-full h-[500px] md:h-[650px] overflow-hidden cursor-grab active:cursor-grabbing">
    <!-- 3D WebGL Canvas 渲染容器 -->
    <div ref="canvasWrapper" class="w-full h-full"></div>

    <!-- 氛圍裝飾幾何文字與指引 -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
      <p class="text-xs uppercase tracking-[0.3em] font-serif text-dark-gold/70 dark:text-dark-gold/70 light:text-light-bronze/70">
        3D CELESTIAL ASTROLABE · 拖曳以轉動渾天星儀
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

const canvasWrapper = ref<HTMLDivElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let sphereGroup: THREE.Group;
let stars: THREE.Points;
let animationFrameId: number;

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationX = 0;
let targetRotationY = 0;

onMounted(() => {
  if (!canvasWrapper.value) return;

  const width = canvasWrapper.value.clientWidth;
  const height = canvasWrapper.value.clientHeight;

  // 1. 初始化場景與攝影機
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 9;

  // 2. 建立渲染器 (支援抗鋸齒與透明度)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrapper.value.appendChild(renderer.domElement);

  // 3. 建立渾天儀組件
  sphereGroup = new THREE.Group();
  scene.add(sphereGroup);

  // 金色金屬材質
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5c378,
    metalness: 0.85,
    roughness: 0.25,
    wireframe: false,
  });

  const bronzeMaterial = new THREE.MeshStandardMaterial({
    color: 0x7b61ff,
    metalness: 0.6,
    roughness: 0.4,
    transparent: true,
    opacity: 0.7,
  });

  // 環1: 天球赤道環
  const ringGeo1 = new THREE.TorusGeometry(3.2, 0.04, 16, 100);
  const ring1 = new THREE.Mesh(ringGeo1, goldMaterial);
  sphereGroup.add(ring1);

  // 環2: 黃道十二宮傾斜環 (傾角 23.44°)
  const ringGeo2 = new THREE.TorusGeometry(3.0, 0.05, 16, 100);
  const ring2 = new THREE.Mesh(ringGeo2, goldMaterial);
  ring2.rotation.x = (23.44 * Math.PI) / 180;
  sphereGroup.add(ring2);

  // 環3: 子午圈
  const ringGeo3 = new THREE.TorusGeometry(2.8, 0.03, 16, 100);
  const ring3 = new THREE.Mesh(ringGeo3, bronzeMaterial);
  ring3.rotation.y = Math.PI / 2;
  sphereGroup.add(ring3);

  // 環4: 二十八宿內天環
  const ringGeo4 = new THREE.TorusGeometry(2.4, 0.03, 16, 80);
  const ring4 = new THREE.Mesh(ringGeo4, goldMaterial);
  ring4.rotation.x = Math.PI / 4;
  sphereGroup.add(ring4);

  // 核心星光球 (太極元氣天核心)
  const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe5c378,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  sphereGroup.add(core);

  // 4. 周圍星塵粒子雲
  const starsGeo = new THREE.BufferGeometry();
  const starsCount = 600;
  const positions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 16;
    positions[i + 1] = (Math.random() - 0.5) * 16;
    positions[i + 2] = (Math.random() - 0.5) * 16;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starsMat = new THREE.PointsMaterial({
    color: 0xe5c378,
    size: 0.04,
    transparent: true,
    opacity: 0.7,
  });
  stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // 5. 燈光配置
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xe5c378, 2, 20);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x7b61ff, 2, 20);
  pointLight2.position.set(-5, -5, -5);
  scene.add(pointLight2);

  // 6. 交互事件綁定
  const el = canvasWrapper.value;
  el.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('resize', onWindowResize);

  // 觸控支援
  el.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);

  animate();
});

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  // 自轉緩動
  if (!isDragging) {
    targetRotationY += 0.003;
    targetRotationX += 0.001;
  }

  // 平滑跟隨旋轉
  sphereGroup.rotation.y += (targetRotationY - sphereGroup.rotation.y) * 0.05;
  sphereGroup.rotation.x += (targetRotationX - sphereGroup.rotation.x) * 0.05;

  // 星塵反向微旋
  if (stars) {
    stars.rotation.y -= 0.0008;
  }

  renderer.render(scene, camera);
}

function onMouseDown(e: MouseEvent) {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  targetRotationY += deltaX * 0.006;
  targetRotationX += deltaY * 0.006;

  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseUp() {
  isDragging = false;
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging || e.touches.length !== 1) return;
  const deltaX = e.touches[0].clientX - previousMousePosition.x;
  const deltaY = e.touches[0].clientY - previousMousePosition.y;

  targetRotationY += deltaX * 0.008;
  targetRotationX += deltaY * 0.008;

  previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function onTouchEnd() {
  isDragging = false;
}

function onWindowResize() {
  if (!canvasWrapper.value) return;
  const w = canvasWrapper.value.clientWidth;
  const h = canvasWrapper.value.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  if (renderer) renderer.dispose();
});
</script>
