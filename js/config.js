/**
 * 全局参数配置 —— 所有尺寸单位为米（m），时间单位为秒（s）
 */
export const CONFIG = {
  // 塔架
  towerHeight: 38,        // 塔架总高
  towerWidth: 6,          // 塔架截面宽度（正方形截面边长）
  trussLevels: 9,         // 桁架层数
  railOffset: 3.4,        // 导轨距塔中心距离

  // 轿厢行程
  gondolaStartY: 2.2,     // 初始（底部）高度
  gondolaTopY: 33,        // 塔顶悬停高度
  brakeStartY: 9,         // 磁刹介入高度（制动区起点）

  // 运动参数
  riseSpeed: 3.2,         // 上升速度 m/s
  resetSpeed: 2.0,        // 复位速度 m/s
  hoverTime: 2.0,         // 顶部悬停时间 s
  gravity: 9.8,           // 自由落体加速度 m/s²

  // 场景
  groundSize: 120,
  cameraStart: [26, 22, -26],
  cameraTarget: [0, 16, 0],
};
