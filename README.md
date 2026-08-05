# cpp-003 · 网格与纹理路径追踪

## 系列定位

**[cpp-002](https://github.com/xiaoqianran/cpp-002)** 已讲完「光线怎么积出正确能量」。

**cpp-003** 讲：真实资产怎么进场景、怎么被 BVH 加速、怎么贴上细节——仍是路径追踪，但内容从「球和墙」升级到「能放下一个模型」。

| | cpp-002 | cpp-003 |
|--|---------|---------|
| 几何 | 球 + 四边形 | **三角网格**（MT 求交） |
| 外观 | 常量 albedo | **纹理 / UV 棋盘 / 程序图像** |
| 积分 | NEE · MIS · RR | **继承**，少改积分器 |
| 焦点 | 渲染方程 | **资产管线** |

- 仓库：https://github.com/xiaoqianran/cpp-003  
- 演示（部署后）：https://xiaoqianran.github.io/cpp-003/

## 架构

继承 002 的 Config 驱动：

```text
UI → EngineConfig → rt_apply → engine
        camera · path_tracer · film
        mesh / texture / material / SAH-BVH
```

新增模块：

| 文件 | 职责 |
|------|------|
| `cpp/mesh.h` | 三角 · Möller–Trumbore · 立方/晶体 mesh |
| `cpp/texture.h` | solid / checker / UV checker / image |
| `cpp/material.h` | 朗伯采样纹理 |
| `cpp/loader_obj.h` | 内存 OBJ 解析 |
| `cpp/instance.h` | 平移/旋转/缩放实例 |
| `cpp/atmosphere.h` | 程序天空 · 均匀体积雾 |
| `cpp/scenes.h` | 作业房间、康奈尔、晶簇 |

## 场景

0 棋盘贴图球 · 1 纹理康奈尔 · **2 作业房间（OBJ 奖杯）** · 3 晶簇 BVH · 4 经典三球

## 命令

```bash
npm run dev
npm run build:wasm
npm run build          # BASE_PATH=/cpp-003/ 用于 Pages
```

## 课程路线（UI「完整课程」逐步扩充）

三角 → UV → Mesh+BVH → 纹理 → OBJ → instance → 凹凸 → 天空/雾
