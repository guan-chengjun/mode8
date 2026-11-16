import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { makeMaterial, box, COLORS } from './materials.js';

/**
 * 磁缓冲制动系统：塔架底部两侧的永磁体阵列
 * （导电板安装在轿厢底部，见 gondola.js）
 */
export function buildMagneticBrake() {
  const group = new THREE.Group();
  group.name = 'magBrake';

  const half = CONFIG.towerWidth / 2;
  const brakeTop = CONFIG.brakeStartY;   // 制动区起点
  const brakeBottom = 1.0;               // 制动区终点
  const zoneH = brakeTop - brakeBottom;

  const magnetMat = makeMaterial(COLORS.magnet, { metalness: 0.5, roughness: 0.4 });
  const mountMat = makeMaterial(COLORS.steelDark, { metalness: 0.6, roughness: 0.5 });
  const housingMat = makeMaterial(0x707a84, { metalness: 0.4, roughness: 0.6 });

  // 左右两侧永磁体阵列（inner：透视模式可见）
  for (const side of [-1, 1]) {
    // 安装背板
    const backplate = box(0.15, zoneH, 1.2, mountMat, 'magBrake', 'inner');
    backplate.position.set(side * 1.95, brakeBottom + zoneH / 2, -half - 0.55);
    group.add(backplate);

    // 永磁体块阵列（N/S 交替，4 行 × 2 列）
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 2; col++) {
        const m = box(0.25, zoneH / 8 - 0.1, 0.5, magnetMat, 'magBrake', 'inner');
        m.position.set(
          side * 1.8,
          brakeBottom + (row + 0.5) * (zoneH / 8),
          -half - 0.85 + col * 0.6
        );
        group.add(m);
      }
    }

    // 防护外壳（shell）
    const housing = box(0.5, zoneH + 0.4, 1.5, housingMat);
    housing.position.set(side * 1.95, brakeBottom + zoneH / 2, -half - 0.55);
    housing.userData.xrayRole = 'shell';
    group.add(housing);
  }

  return group;
}
