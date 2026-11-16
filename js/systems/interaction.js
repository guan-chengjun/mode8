import * as THREE from 'three';
import { PARTS_DATA } from '../partsData.js';

/**
 * 部件点击交互：射线拾取 → 弹窗显示部件信息
 */
export class InteractionSystem {
  /**
   * @param {THREE.Camera} camera
   * @param {THREE.Scene} scene
   * @param {HTMLElement} domElement 渲染画布
   */
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.popup = document.getElementById('part-popup');
    this.elName = document.getElementById('popup-name');
    this.elRole = document.getElementById('popup-role');
    this.elPrinciple = document.getElementById('popup-principle');

    // 区分点击与拖拽：记录按下位置
    let downX = 0, downY = 0;
    domElement.addEventListener('pointerdown', (e) => {
      downX = e.clientX; downY = e.clientY;
    });
    domElement.addEventListener('pointerup', (e) => {
      // 移动超过 5px 视为拖拽，不触发拾取
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
      this._pick(e, domElement);
    });

    document.getElementById('popup-close').addEventListener('click', () => {
      this.popup.classList.add('hidden');
    });
  }

  _pick(event, dom) {
    const rect = dom.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    for (const hit of hits) {
      // 沿父链向上查找带 partId 的对象
      let obj = hit.object;
      while (obj && !obj.userData.partId) obj = obj.parent;
      if (!obj) continue;

      // 透视模式下外壳半透明仍可点，但跳过不可见对象
      if (!this._isVisible(hit.object)) continue;

      const data = PARTS_DATA[obj.userData.partId];
      if (data) {
        this.elName.textContent = data.name;
        this.elRole.textContent = data.role;
        this.elPrinciple.textContent = data.principle;
        this.popup.classList.remove('hidden');
        return;
      }
    }
    // 点击空白处关闭弹窗
    this.popup.classList.add('hidden');
  }

  _isVisible(obj) {
    let o = obj;
    while (o) {
      if (o.visible === false) return false;
      o = o.parent;
    }
    return true;
  }
}
