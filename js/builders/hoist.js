import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { makeMaterial, box, cylinder, COLORS } from './materials.js';

/**
 * 顶部卷扬驱动机构：电机 + 减速器 + 卷筒 + 钢丝绳组
 * 钢丝绳长度随轿厢高度变化，由 updateCables(gondolaY) 每帧更新
 */
export function buildHoist() {
  const group = new THREE.Group();
  group.name = 'hoist';

  const H = CONFIG.towerHeight;
  const platformY = H + 0.4;

  const motorMat = makeMaterial(COLORS.motor, { metalness: 0.6, roughness: 0.4 });
  const drumMat = makeMaterial(COLORS.drum, { metalness: 0.7, roughness: 0.35 });
  const cableMat = makeMaterial(COLORS.cable, { metalness: 0.8, roughness: 0.5 });
  const coverMat = makeMaterial(0x6a7a8a, { metalness: 0.3, roughness: 0.6 });

  // ---- 驱动电机（inner：透视模式可见）----
  const motor = cylinder(0.55, 0.55, 1.6, motorMat, 'hoistMotor', 'inner');
  motor.rotation.z = Math.PI / 2;
  motor.position.set(-2.2, platformY + 0.7, 0);
  group.add(motor);
  // 电机尾部风扇罩
  const fan = cylinder(0.6, 0.6, 0.3, motorMat, 'hoistMotor', 'inner');
  fan.rotation.z = Math.PI / 2;
  fan.position.set(-3.1, platformY + 0.7, 0);
  group.add(fan);

  // ---- 减速器 ----
  const gearbox = box(1.0, 1.0, 1.0, motorMat, 'hoistMotor', 'inner');
  gearbox.position.set(-1.0, platformY + 0.7, 0);
  group.add(gearbox);

  // ---- 卷筒（inner）----
  const drum = cylinder(0.6, 0.6, 2.4, drumMat, 'drum', 'inner', 28);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(0.6, platformY + 0.7, 0);
  group.add(drum);
  // 卷筒两侧挡绳法兰
  for (const z of [-1.25, 1.25]) {
    const flange = cylinder(0.75, 0.75, 0.1, drumMat, 'drum', 'inner', 28);
    flange.rotation.x = Math.PI / 2;
    flange.position.set(0.6, platformY + 0.7, z);
    group.add(flange);
  }

  // ---- 机房外壳（shell：实体模式遮挡内部机构）----
  const housing = box(5.2, 2.2, 3.4, coverMat);
  housing.position.set(-0.6, platformY + 1.0, 0);
  housing.userData.xrayRole = 'shell';
  group.add(housing);

  // ---- 钢丝绳组（inner，4 根并联，长度动态更新）----
  const cableGroup = new THREE.Group();
  cableGroup.name = 'cables';
  const cableGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 8);
  const cables = [];
  const half = CONFIG.towerWidth / 2;
  // 吊点：从卷筒下方到轿厢顶梁
  const cableTopY = platformY + 0.1;
  const anchorZ = -half - 0.55;
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(cableGeo, cableMat);
    c.userData.partId = 'cables';
    c.userData.xrayRole = 'inner';
    const x = -1.5 + i * 1.0;
    c.position.set(x, 0, anchorZ);
    cableGroup.add(c);
    cables.push(c);
  }
  group.add(cableGroup);

  /**
   * 每帧更新钢丝绳长度
   * @param {number} gondolaY 轿厢当前高度（group.position.y）
   */
  function updateCables(gondolaY) {
    // 轿厢吊耳世界高度 = gondolaY + 3.6（吊耳局部高度）
    const bottomY = gondolaY + 3.6;
    const len = Math.max(cableTopY - bottomY, 0.05);
    for (const c of cables) {
      c.scale.y = len;
      c.position.y = cableTopY - len / 2;
    }
  }

  return { group, updateCables, drum, motor };
}
