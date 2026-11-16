import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { makeMaterial, box, cylinder, COLORS } from './materials.js';

/**
 * 塔架主钢结构桁架 + 导轨 + 顶部平台 + 外壳板（透视用）
 */
export function buildTower() {
  const group = new THREE.Group();
  group.name = 'tower';

  const H = CONFIG.towerHeight;
  const W = CONFIG.towerWidth;
  const half = W / 2;
  const levels = CONFIG.trussLevels;
  const levelH = H / levels;

  const steelMat = makeMaterial(COLORS.steel, { metalness: 0.7, roughness: 0.4 });
  const braceMat = makeMaterial(COLORS.steelDark, { metalness: 0.7, roughness: 0.4 });
  const railMat = makeMaterial(COLORS.rail, { metalness: 0.8, roughness: 0.3 });
  const shellMat = makeMaterial(COLORS.shell, {
    metalness: 0.1,
    roughness: 0.5,
    extra: { side: THREE.DoubleSide },
  });

  // ---- 四根主立柱（桁架弦杆）----
  const columnGeo = new THREE.BoxGeometry(0.45, H, 0.45);
  const corners = [
    [-half, -half], [half, -half], [half, half], [-half, half],
  ];
  for (const [x, z] of corners) {
    const col = new THREE.Mesh(columnGeo, steelMat);
    col.position.set(x, H / 2, z);
    col.castShadow = true;
    col.userData.partId = 'towerFrame';
    group.add(col);
  }

  // ---- 每层水平杆 + 斜腹杆 ----
  const beamLen = W;
  const diagLen = Math.sqrt(beamLen * beamLen + levelH * levelH);
  const diagAngle = Math.atan2(levelH, beamLen);

  for (let i = 0; i <= levels; i++) {
    const y = i * levelH;
    // 四个面的水平横杆
    const hFront = box(beamLen, 0.25, 0.25, braceMat, 'towerFrame');
    hFront.position.set(0, y, -half);
    const hBack = hFront.clone(); hBack.position.z = half;
    const hLeft = box(0.25, 0.25, beamLen, braceMat, 'towerFrame');
    hLeft.position.set(-half, y, 0);
    const hRight = hLeft.clone(); hRight.position.x = half;
    group.add(hFront, hBack, hLeft, hRight);

    // 斜腹杆（除顶层外每层都加）
    if (i < levels) {
      const yMid = y + levelH / 2;
      const mkDiag = (len) => {
        const d = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.18), braceMat);
        d.castShadow = true;
        d.userData.partId = 'towerFrame';
        return d;
      };
      // 前后面（XZ 平面内沿 X 方向的斜杆）
      const d1 = mkDiag(diagLen);
      d1.position.set(0, yMid, -half);
      d1.rotation.z = diagAngle;
      const d2 = mkDiag(diagLen);
      d2.position.set(0, yMid, half);
      d2.rotation.z = -diagAngle;
      // 左右面
      const d3 = mkDiag(diagLen);
      d3.position.set(-half, yMid, 0);
      d3.rotation.y = Math.PI / 2;
      d3.rotation.z = diagAngle;
      const d4 = mkDiag(diagLen);
      d4.position.set(half, yMid, 0);
      d4.rotation.y = Math.PI / 2;
      d4.rotation.z = -diagAngle;
      group.add(d1, d2, d3, d4);
    }
  }

  // ---- 轿厢导轨（正面两侧，沿全高）----
  const railH = CONFIG.gondolaTopY + 2;
  for (const side of [-1, 1]) {
    const rail = box(0.3, railH, 0.5, railMat, 'towerFrame');
    rail.position.set(side * 2.2, railH / 2, -half - 0.35);
    group.add(rail);
  }

  // ---- 顶部平台 ----
  const platform = box(W + 1.5, 0.4, W + 1.5, steelMat, 'towerFrame');
  platform.position.y = H + 0.2;
  group.add(platform);

  // ---- 外壳装饰板（shell：实体模式遮挡内部，透视模式半透明）----
  // 四面半透明罩板，仅在需要演示透视效果时体现作用
  const shellGeo = new THREE.BoxGeometry(W + 0.6, H, 0.08);
  const panels = [
    { pos: [0, H / 2, -half - 0.3], rotY: 0 },
    { pos: [0, H / 2, half + 0.3], rotY: 0 },
    { pos: [-half - 0.3, H / 2, 0], rotY: Math.PI / 2 },
    { pos: [half + 0.3, H / 2, 0], rotY: Math.PI / 2 },
  ];
  for (const p of panels) {
    const panel = new THREE.Mesh(shellGeo, shellMat);
    panel.position.set(...p.pos);
    panel.rotation.y = p.rotY;
    panel.userData.xrayRole = 'shell';
    group.add(panel);
  }

  return group;
}
