import * as THREE from 'three';

/**
 * X 光透视模式
 * 遍历场景中带 userData.xrayRole 的 mesh：
 *   shell —— 实体模式不透明；透视模式变为半透明（opacity 0.08）
 *   inner —— 实体模式隐藏；透视模式显示
 */
export class XraySystem {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;
    this.shellMeshes = [];
    this.innerMeshes = [];
  }

  /** 建模完成后调用，收集所有标记过的 mesh */
  collect() {
    this.shellMeshes = [];
    this.innerMeshes = [];
    this.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const role = obj.userData.xrayRole;
      if (role === 'shell') this.shellMeshes.push(obj);
      else if (role === 'inner') this.innerMeshes.push(obj);
    });
    this._apply();
  }

  toggle() {
    this.enabled = !this.enabled;
    this._apply();
    return this.enabled;
  }

  _apply() {
    for (const m of this.shellMeshes) {
      m.material.opacity = this.enabled ? 0.08 : 1.0;
      m.material.depthWrite = !this.enabled;
    }
    for (const m of this.innerMeshes) {
      m.visible = this.enabled;
    }
  }
}
