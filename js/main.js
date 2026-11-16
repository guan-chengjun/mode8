import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { CONFIG } from './config.js';
import { buildTower } from './builders/tower.js';
import { buildGondola } from './builders/gondola.js';
import { buildHoist } from './builders/hoist.js';
import { buildLock } from './builders/lock.js';
import { buildMagneticBrake } from './builders/brake.js';
import { buildHydraulic } from './builders/hydraulic.js';
import { buildBase } from './builders/base.js';

import { DropTowerAnimation } from './systems/animation.js';
import { XraySystem } from './systems/xray.js';
import { InteractionSystem } from './systems/interaction.js';

// ---------- 渲染器 / 场景 / 相机 ----------
const container = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);
scene.fog = new THREE.Fog(0x0b1020, 80, 160);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(...CONFIG.cameraStart);

// ---------- 轨道相机：旋转 / 缩放 / 平移 ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(...CONFIG.cameraTarget);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 8;
controls.maxDistance = 120;
controls.maxPolarAngle = Math.PI / 2 - 0.02; // 防止钻到地面以下

// ---------- 灯光 ----------
scene.add(new THREE.AmbientLight(0x8899bb, 0.5));

const sun = new THREE.DirectionalLight(0xfff2dd, 1.6);
sun.position.set(30, 60, 25);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -10;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
fill.position.set(-25, 30, -20);
scene.add(fill);

// ---------- 建模 ----------
const tower = buildTower();
const gondola = buildGondola();
const hoist = buildHoist();
const lock = buildLock();
const magBrake = buildMagneticBrake();
const hydraulic = buildHydraulic();
const base = buildBase();
scene.add(tower, gondola, hoist.group, lock.group, magBrake, hydraulic.group, base);

// ---------- 系统 ----------
const animation = new DropTowerAnimation({
  gondola,
  updateCables: hoist.updateCables,
  setLockEngaged: lock.setEngaged,
  compressHydraulic: hydraulic.compress,
  drum: hoist.drum,
});

const xray = new XraySystem(scene);
xray.collect();

new InteractionSystem(camera, scene, renderer.domElement);

// ---------- UI 绑定 ----------
const btnXray = document.getElementById('btn-xray');
const btnPlay = document.getElementById('btn-play');
const btnReset = document.getElementById('btn-reset');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const statusPhase = document.getElementById('status-phase');
const statusHeight = document.getElementById('status-height');
const statusSpeed = document.getElementById('status-speed');

btnXray.addEventListener('click', () => {
  const on = xray.toggle();
  btnXray.textContent = `透视模式：${on ? '开' : '关'}`;
  btnXray.classList.toggle('active', on);
});

btnPlay.addEventListener('click', () => {
  const playing = animation.togglePlay();
  btnPlay.textContent = playing ? '⏸ 暂停' : '▶ 播放';
});

btnReset.addEventListener('click', () => {
  animation.reset();
  btnPlay.textContent = '▶ 播放';
});

speedSlider.addEventListener('input', () => {
  const s = parseFloat(speedSlider.value);
  animation.setSpeed(s);
  speedValue.textContent = `${s.toFixed(2).replace(/\.?0+$/, '')}×`;
});

// ---------- 窗口自适应 ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- 渲染循环 ----------
const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05); // 限制最大步长，防止切后台后跳变

  animation.update(dt);
  lock.update(dt);
  controls.update();

  // 状态面板
  statusPhase.textContent = animation.phaseName;
  statusHeight.textContent = animation.y.toFixed(1);
  statusSpeed.textContent = animation.v.toFixed(1);
  // 一轮结束后恢复播放按钮文字
  if (!animation.playing && animation.state === 'IDLE') {
    btnPlay.textContent = '▶ 播放';
  }

  renderer.render(scene, camera);
}

tick();
