import * as THREE from 'three';

/**
 * 共享材质与工具函数
 *
 * X 光透视约定：每个 mesh 设置 userData.xrayRole
 *   'shell' —— 外壳/装饰件：实体模式不透明，透视模式变为半透明
 *   'inner' —— 内部结构：实体模式隐藏，透视模式显示
 *   不设置  —— 常规件：两种模式均正常显示
 */

export function makeMaterial(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: opts.metalness ?? 0.3,
    roughness: opts.roughness ?? 0.6,
    transparent: true, // 预留透视切换能力
    ...opts.extra,
  });
}

/** 创建 Box mesh 并附加元数据 */
export function box(w, h, d, material, partId, xrayRole) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (partId) mesh.userData.partId = partId;
  if (xrayRole) mesh.userData.xrayRole = xrayRole;
  return mesh;
}

/** 创建 Cylinder mesh 并附加元数据 */
export function cylinder(rTop, rBottom, h, material, partId, xrayRole, segments = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (partId) mesh.userData.partId = partId;
  if (xrayRole) mesh.userData.xrayRole = xrayRole;
  return mesh;
}

/** 常用颜色 */
export const COLORS = {
  steel: 0x8a929e,       // 钢结构
  steelDark: 0x5a626e,
  rail: 0xb8c0cc,
  cabin: 0xd84a3a,       // 轿厢红
  seat: 0x2a4a8a,
  safetyBar: 0xf0c040,
  motor: 0x3a6ea5,
  drum: 0xc07830,
  cable: 0x333333,
  magnet: 0x7a2a8a,      // 永磁体紫
  copper: 0xc07840,      // 导电板铜色
  hydraulic: 0x4a7a4a,
  concrete: 0x9a9a94,
  cabinet: 0x3a5a3a,
  shell: 0x4a6a9a,       // 外壳板
};
