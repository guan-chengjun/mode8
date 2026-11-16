import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { makeMaterial, box, cylinder, COLORS } from './materials.js';

/**
 * 轿厢（载人座舱）：座舱框架 + 座椅 + 安全压杆 + 导向轮组
 * 返回 { group, update(y) } —— group 的 y 由动画系统直接设置 position.y
 */
export function buildGondola() {
  const group = new THREE.Group();
  group.name = 'gondola';

  const frameMat = makeMaterial(COLORS.cabin, { metalness: 0.4, roughness: 0.5 });
  const seatMat = makeMaterial(COLORS.seat, { metalness: 0.1, roughness: 0.8 });
  const barMat = makeMaterial(COLORS.safetyBar, { metalness: 0.5, roughness: 0.4 });
  const wheelMat = makeMaterial(0x222222, { metalness: 0.2, roughness: 0.9 });

  const half = CONFIG.towerWidth / 2;

  // ---- 座舱底板 ----
  const floor = box(5.2, 0.3, 2.4, frameMat, 'gondola');
  floor.position.set(0, 0.15, -half - 1.6);
  group.add(floor);

  // ---- 靠背框架 ----
  const back = box(5.2, 2.6, 0.25, frameMat, 'gondola');
  back.position.set(0, 1.6, -half - 0.55);
  group.add(back);

  // ---- 顶部吊梁（连接钢丝绳吊点）----
  const topBeam = box(5.2, 0.35, 0.35, frameMat, 'gondola');
  topBeam.position.set(0, 3.1, -half - 0.55);
  group.add(topBeam);

  // 吊耳（锁钩卡位处）
  const lug = box(0.5, 0.6, 0.3, frameMat, 'gondola');
  lug.position.set(0, 3.6, -half - 0.55);
  group.add(lug);

  // ---- 四个座椅 ----
  for (let i = 0; i < 4; i++) {
    const x = -1.95 + i * 1.3;
    const seatBase = box(1.0, 0.15, 0.9, seatMat, 'seat');
    seatBase.position.set(x, 0.85, -half - 1.5);
    const seatBack = box(1.0, 1.3, 0.15, seatMat, 'seat');
    seatBack.position.set(x, 1.55, -half - 1.05);
    group.add(seatBase, seatBack);

    // ---- 安全压杆（U 形，简化为一根横杆 + 两侧摆臂）----
    const barGroup = new THREE.Group();
    const crossBar = cylinder(0.06, 0.06, 1.0, barMat, 'safetyBar');
    crossBar.rotation.z = Math.PI / 2;
    crossBar.position.set(0, 0, 0);
    barGroup.add(crossBar);
    for (const s of [-1, 1]) {
      const arm = cylinder(0.05, 0.05, 0.7, barMat, 'safetyBar');
      arm.rotation.x = Math.PI / 4;
      arm.position.set(s * 0.5, -0.18, -0.18);
      barGroup.add(arm);
    }
    barGroup.position.set(x, 1.35, -half - 1.45);
    group.add(barGroup);
  }

  // ---- 导向轮组（左右各两组，抱合导轨）----
  const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
  for (const side of [-1, 1]) {
    for (const wy of [0.6, 2.6]) {
      // 承重轮（正面压导轨）
      const w1 = new THREE.Mesh(wheelGeo, wheelMat);
      w1.rotation.x = Math.PI / 2;
      w1.position.set(side * 2.2, wy, -half - 0.28);
      w1.userData.partId = 'guideWheels';
      // 侧向导轮
      const w2 = new THREE.Mesh(wheelGeo, wheelMat);
      w2.rotation.z = Math.PI / 2;
      w2.position.set(side * 2.2 + side * 0.21, wy, -half - 0.35);
      w2.userData.partId = 'guideWheels';
      group.add(w1, w2);
    }
  }

  // ---- 底部涡流制动导电板（随轿厢运动，穿过永磁体阵列减速）----
  const finMat = makeMaterial(COLORS.copper, { metalness: 0.9, roughness: 0.25 });
  const fin = box(3.2, 1.6, 0.12, finMat, 'magBrake');
  fin.position.set(0, -0.8, -half - 0.55);
  group.add(fin);

  return group;
}
