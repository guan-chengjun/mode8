# 跳楼机（Drop Tower）交互式 3D 可视化

基于 Three.js 的游乐场跳楼机工作原理交互式演示项目。采用工程化多文件结构，全部部件程序化建模、独立命名、可单独点选。

## 功能

- **轨道相机**：鼠标左键拖拽 360° 旋转、滚轮缩放、右键平移
- **透视开关**：一键切换实体渲染 / X 光透视模式，透视模式下内部钢架、钢丝绳、制动器、液压结构全部可见
- **动画控制系统**：播放 / 暂停、重置、0.25×–3× 速度滑块；完整还原真实运转流程：
  1. 轿厢缓慢上升至塔顶
  2. 顶部悬停 2 秒（锁钩锁定）
  3. 自由落体加速下落（g = 9.8 m/s²）
  4. 底部磁刹减速缓冲（匀减速至 0）
  5. 液压缓冲、复位回到初始位置
- **部件点击交互**：点击任意结构部件，弹窗显示名称、作用、工作原理

## 运行方式

项目使用 ES Module + import map，**必须通过 HTTP 服务访问**（不能直接双击打开 html 文件）。Three.js 从 jsDelivr CDN 加载，需联网。

任选一种方式启动本地服务器：

```bash
# 方式一：Python（推荐，Windows 一般自带）
python -m http.server 8000

# 方式二：Node.js
npx serve .

# 方式三：VS Code 安装 Live Server 插件，右键 index.html → Open with Live Server
```

然后浏览器访问 <http://localhost:8000>

## 目录结构

```
├── index.html              入口页面（UI 面板 + import map）
├── css/style.css           界面样式
├── js/
│   ├── main.js             主程序：场景、相机、灯光、渲染循环、UI 绑定
│   ├── config.js           全局参数（塔高、行程、速度、重力等）
│   ├── partsData.js        部件说明数据库（名称/作用/原理）
│   ├── builders/           部件建模模块
│   │   ├── materials.js    共享材质与工具函数
│   │   ├── tower.js        塔架主钢结构桁架 + 导轨 + 外壳板
│   │   ├── gondola.js      轿厢（座椅、安全压杆、导向轮组、制动导电板）
│   │   ├── hoist.js        顶部卷扬驱动机构（电机、卷筒、钢丝绳组）
│   │   ├── lock.js         塔顶锁止机构（卡位锁钩）
│   │   ├── brake.js        磁缓冲制动系统（永磁体阵列）
│   │   ├── hydraulic.js    液压缓冲器
│   │   └── base.js         底部基座、控制柜、地面
│   └── systems/            交互系统
│       ├── animation.js    运行动画状态机
│       ├── xray.js         X 光透视模式
│       └── interaction.js  射线拾取与信息弹窗
└── docs/PARTS.md           部件说明文档
```

## 扩展：引入外部 GLB 模型

部件目前为程序化建模。如需替换为精细 GLB 模型，在对应 builder 中使用 `GLTFLoader` 加载后放入 group 即可，注意为可点选部件设置 `userData.partId`：

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const gltf = await new GLTFLoader().loadAsync('models/gondola.glb');
gltf.scene.traverse(o => { o.userData.partId = 'gondola'; });
```

透视模式通过 `userData.xrayRole`（`'shell'` / `'inner'`）标记参与切换的 mesh，详见 `js/builders/materials.js` 头部注释。
