import * as THREE from 'three';
import { makeMaterial, box, cylinder, COLORS } from './materials.js';

/**
 * 液压缓冲器：最底部二次缓冲防护（4 个，分布于轿厢落点下方）
 * 返回 { group, compress(amount) } —— amount ∈ [0,1] 表示压缩行程比例
 */
export function buildHydraulic() {
  const group = new THREE.Group();
  group.name = 'hydraulic';

  const bodyMat = makeMaterial(COLORS.hydraulic, { metalness: 0.6, roughness: 0.4 });
  const rodMat = makeMaterial(0xd0d4da, { metalness: 0.9, roughness: 0.2 });
  const padMat = makeMaterial(0x333338, { metalness: 0.1, roughness: 0.9 });

  const positions = [
    [-1.8, -4.0], [1.8, -4.0], [-1.8, -2.2], [1.8, -2.2],
  ];

  const rods = [];
  const ROD_TRAVEL = 0.7; // 最大压缩行程 m

  for (const [x, z] of positions) {
    // 缸体（inner：透视模式可见内部结构，这里缸体本身作为内部件展示）
    const body = cylinder(0.22, 0.26, 1.0, bodyMat, 'hydraulic', 'inner');
    body.position.set(x, 0.5, z);
    group.add(body);

    // 底座法兰
    const flange = cylinder(0.35, 0.4, 0.15, bodyMat, 'hydraulic', 'inner');
    flange.position.set(x, 0.08, z);
    group.add(flange);

    // 活塞杆（可压缩，inner）
    const rod = cylinder(0.1, 0.1, ROD_TRAVEL, rodMat, 'hydraulic', 'inner');
    rod.position.set(x, 1.0 + ROD_TRAVEL / 2, z);
    group.add(rod);
    rods.push(rod);

    // 顶部缓冲垫
    const pad = cylinder(0.3, 0.3, 0.12, padMat, 'hydraulic', 'inner');
    pad.position.set(x, 1.0 + ROD_TRAVEL + 0.06, z);
    group.add(pad);
    rods.push(pad); // 垫随杆一起运动
  }

  /**
   * 设置压缩量：0 = 全伸出，1 = 全压缩
   */
  function compress(amount) {
    const drop = amount * ROD_TRAVEL;
    for (let i = 0; i < rods.length; i += 2) {
      const rod = rods[i];
      const pad = rods[i + 1];
      rod.scale.y = 1 - amount * 0.9;
      rod.position.y = 1.0 + ROD_TRAVEL / 2 - drop / 2;
      pad.position.y = 1.0 + ROD_TRAVEL + 0.06 - drop;
    }
  }

  return { group, compress };
}
