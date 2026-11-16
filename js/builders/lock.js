import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { makeMaterial, box, cylinder, COLORS } from './materials.js';

/**
 * 塔顶锁止机构：锁钩 + 驱动推杆
 * 悬停时锁钩旋入轿厢吊耳卡位；返回 { group, setEngaged(engaged) }
 */
export function buildLock() {
  const group = new THREE.Group();
  group.name = 'lock';

  const H = CONFIG.towerHeight;
  const half = CONFIG.towerWidth / 2;
  // 锁钩安装在塔顶平台边缘，与轿厢吊耳同高（悬停时吊耳在 gondolaTopY + 3.6）
  const lockY = CONFIG.gondolaTopY + 3.6;
  const lockZ = -half - 0.55;

  const steelMat = makeMaterial(COLORS.steelDark, { metalness: 0.7, roughness: 0.35 });
  const hookMat = makeMaterial(0xd0a030, { metalness: 0.6, roughness: 0.4 });

  // 固定支座（inner）
  const bracket = box(0.8, 0.8, 0.5, steelMat, 'lockHook', 'inner');
  bracket.position.set(0, lockY, lockZ + 0.9);
  group.add(bracket);

  // 驱动推杆（电磁/液压推杆，inner）
  const actuator = cylinder(0.12, 0.12, 1.0, steelMat, 'lockHook', 'inner');
  actuator.rotation.x = Math.PI / 3;
  actuator.position.set(0, lockY + 0.5, lockZ + 0.9);
  group.add(actuator);

  // 锁钩本体（绕铰点旋转，inner）
  const hookPivot = new THREE.Group();
  hookPivot.position.set(0, lockY, lockZ + 0.55);
  const hookArm = box(0.18, 0.18, 0.9, hookMat, 'lockHook', 'inner');
  hookArm.position.z = -0.35;
  const hookTip = box(0.18, 0.45, 0.18, hookMat, 'lockHook', 'inner');
  hookTip.position.set(0, -0.14, -0.75);
  hookPivot.add(hookArm, hookTip);
  hookPivot.rotation.x = -Math.PI / 3; // 初始为脱开状态（向上抬起）
  group.add(hookPivot);

  /**
   * 设置锁钩啮合状态（带简单插值动画由调用方逐帧驱动亦可，这里直接切换目标角）
   * @param {boolean} engaged true=锁定（钩住吊耳） false=脱开
   */
  let targetAngle = -Math.PI / 3;
  function setEngaged(engaged) {
    targetAngle = engaged ? 0 : -Math.PI / 3;
  }

  /** 每帧平滑逼近目标角度 */
  function update(dt) {
    const diff = targetAngle - hookPivot.rotation.x;
    hookPivot.rotation.x += diff * Math.min(1, dt * 6);
  }

  return { group, setEngaged, update };
}
