import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { makeMaterial, box, cylinder, COLORS } from './materials.js';

/**
 * 底部基座 + 控制柜 + 地面
 */
export function buildBase() {
  const group = new THREE.Group();
  group.name = 'base';

  const concreteMat = makeMaterial(COLORS.concrete, { metalness: 0.05, roughness: 0.95 });
  const cabinetMat = makeMaterial(COLORS.cabinet, { metalness: 0.4, roughness: 0.6 });
  const screenMat = makeMaterial(0x1a2a1a, {
    metalness: 0.2,
    roughness: 0.3,
    extra: { emissive: 0x2a6a3a, emissiveIntensity: 0.8 },
  });

  // ---- 混凝土基座 ----
  const base = box(12, 1.2, 12, concreteMat, 'base');
  base.position.y = 0.6;
  group.add(base);

  // 基座台阶
  const step = box(14, 0.3, 14, concreteMat, 'base');
  step.position.y = 0.15;
  group.add(step);

  // ---- 控制柜 ----
  const cabinet = box(1.6, 2.2, 0.9, cabinetMat, 'controlCabinet');
  cabinet.position.set(7.5, 2.3, 2);
  cabinet.rotation.y = -Math.PI / 6;
  group.add(cabinet);

  // 柜门显示屏（柜体绕 y 轴旋转 -π/6，正面法线朝 (sin(-π/6), 0, cos(-π/6))）
  const frontX = 7.5 + Math.sin(-Math.PI / 6) * 0.48;
  const frontZ = 2 + Math.cos(-Math.PI / 6) * 0.48;
  const screen = box(0.9, 0.6, 0.05, screenMat, 'controlCabinet');
  screen.position.set(frontX, 2.8, frontZ);
  screen.rotation.y = -Math.PI / 6;
  group.add(screen);

  // 急停按钮（红色）
  const estop = cylinder(0.08, 0.08, 0.1, makeMaterial(0xcc2222), 'controlCabinet');
  estop.rotation.x = Math.PI / 2;
  estop.rotation.y = -Math.PI / 6;
  estop.position.set(frontX, 2.1, frontZ);
  group.add(estop);

  // ---- 地面 ----
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(CONFIG.groundSize / 2, 48),
    makeMaterial(0x2a3444, { metalness: 0, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  // 网格辅助线
  const grid = new THREE.GridHelper(CONFIG.groundSize, 40, 0x3a4a66, 0x252f45);
  grid.position.y = 0.01;
  group.add(grid);

  return group;
}
