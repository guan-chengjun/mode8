import { CONFIG } from '../config.js';

/**
 * 跳楼机运行动画状态机
 *
 * 完整运转流程：
 *   IDLE（待机）→ RISING（缓慢上升）→ HOVER（顶部悬停 2s，锁钩锁定）
 *   → DROPPING（自由落体加速）→ BRAKING（磁刹减速缓冲）
 *   → SETTLING（液压缓冲+复位回初始位置）→ IDLE
 */
export class DropTowerAnimation {
  /**
   * @param {object} refs
   * @param {THREE.Group} refs.gondola 轿厢组
   * @param {function} refs.updateCables 钢丝绳更新函数
   * @param {function} refs.setLockEngaged 锁钩控制
   * @param {function} refs.compressHydraulic 液压缓冲器压缩控制
   * @param {THREE.Object3D} refs.drum 卷筒（转动动画）
   */
  constructor({ gondola, updateCables, setLockEngaged, compressHydraulic, drum }) {
    this.gondola = gondola;
    this.updateCables = updateCables;
    this.setLockEngaged = setLockEngaged;
    this.compressHydraulic = compressHydraulic;
    this.drum = drum;

    this.state = 'IDLE';
    this.playing = false;
    this.speed = 1.0;

    this.y = CONFIG.gondolaStartY;
    this.v = 0;
    this.hoverTimer = 0;
    this.brakeDecel = 0;

    this._apply();
  }

  /** 播放 / 暂停切换 */
  togglePlay() {
    if (this.state === 'IDLE' && !this.playing) {
      // 从待机开始新一轮
      this.playing = true;
      this.state = 'RISING';
    } else {
      this.playing = !this.playing;
    }
    return this.playing;
  }

  /** 重置回初始状态 */
  reset() {
    this.state = 'IDLE';
    this.playing = false;
    this.y = CONFIG.gondolaStartY;
    this.v = 0;
    this.hoverTimer = 0;
    this.setLockEngaged(false);
    this.compressHydraulic(0);
    this._apply();
  }

  setSpeed(s) { this.speed = s; }

  /** 每帧更新，dt 为真实时间差（秒） */
  update(rawDt) {
    if (!this.playing) return;
    const dt = rawDt * this.speed;
    const C = CONFIG;

    switch (this.state) {
      case 'RISING': {
        this.y += C.riseSpeed * dt;
        this.v = C.riseSpeed;
        this.drum.rotation.z += C.riseSpeed * dt / 0.6; // 卷筒收绳
        if (this.y >= C.gondolaTopY) {
          this.y = C.gondolaTopY;
          this.v = 0;
          this.state = 'HOVER';
          this.hoverTimer = 0;
          this.setLockEngaged(true); // 锁钩锁定
        }
        break;
      }

      case 'HOVER': {
        this.v = 0;
        this.hoverTimer += dt;
        if (this.hoverTimer >= C.hoverTime) {
          this.setLockEngaged(false); // 解锁释放
          this.state = 'DROPPING';
          this.v = 0;
        }
        break;
      }

      case 'DROPPING': {
        this.v += C.gravity * dt;      // 自由落体加速
        this.y -= this.v * dt;
        if (this.y <= C.brakeStartY) {
          this.y = C.brakeStartY;
          this.state = 'BRAKING';
          // 由 v² = 2·a·s 求匀减速所需的减速度，使轿厢到达底部时速度恰好降为 0
          const s = C.brakeStartY - C.gondolaStartY;
          this.brakeDecel = (this.v * this.v) / (2 * s);
        }
        break;
      }

      case 'BRAKING': {
        this.v -= this.brakeDecel * dt; // 磁刹减速
        this.y -= Math.max(this.v, 0) * dt;
        // 液压缓冲器随最后 1.2m 行程逐渐压缩
        const compressZone = 1.2;
        const remain = this.y - C.gondolaStartY;
        if (remain < compressZone) {
          this.compressHydraulic(1 - remain / compressZone);
        }
        if (this.v <= 0 || this.y <= C.gondolaStartY) {
          this.y = C.gondolaStartY;
          this.v = 0;
          this.state = 'SETTLING';
          this.hoverTimer = 0;
        }
        break;
      }

      case 'SETTLING': {
        // 液压缓冲器回弹复位，随后回到待机
        this.hoverTimer += dt;
        const t = Math.min(this.hoverTimer / 1.0, 1);
        this.compressHydraulic(1 - t);
        if (t >= 1) {
          this.state = 'IDLE';
          this.playing = false; // 完成一个循环后停止
        }
        break;
      }
    }

    this._apply();
  }

  _apply() {
    this.gondola.position.y = this.y;
    this.updateCables(this.y);
  }

  /** 当前阶段中文名 */
  get phaseName() {
    return {
      IDLE: '待机',
      RISING: '上升',
      HOVER: '顶部悬停（锁钩锁定）',
      DROPPING: '自由落体',
      BRAKING: '磁刹减速',
      SETTLING: '缓冲复位',
    }[this.state];
  }
}
