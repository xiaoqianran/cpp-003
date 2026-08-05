# cpp-003 · 网格与纹理路径追踪

## 系列定位

**[cpp-002](https://github.com/xiaoqianran/cpp-002)** 已讲完「光线怎么积出正确能量」。

**cpp-003** 讲：真实资产怎么进场景、怎么被 BVH 加速、怎么贴上细节——仍是路径追踪，但内容从「球和墙」升级到「能放下一个模型」。

| | cpp-002 | cpp-003 |
|--|---------|---------|
| 几何 | 球 + 四边形 | **三角网格**（MT） |
| 外观 | 常量 albedo | **纹理 / UV / 双线性 / 凹凸** |
| 资产 | 无 | **OBJ · instance** |
| 大气 | 常量背景 | **程序天空 · 均匀雾** |
| 积分 | NEE·MIS·RR·BVH | **继承** |
| 教学 | 渲染方程 | **12 章资产精读**（应用内「完整课程」） |

- 仓库：https://github.com/xiaoqianran/cpp-003  
- 演示：https://xiaoqianran.github.io/cpp-003/  
- 大纲：[docs/COURSE.md](./docs/COURSE.md)

## 是否够用？

**作为一章「资产进 PT」的教学仓库：够用、可结业。**  
下一课 **[cpp-004](https://github.com/xiaoqianran/cpp-004)**：环境光 NEE + 切空间法线贴图。  
不是 PBRT 全书：mipmap、环境重要性采样、异质体积、切空间法线贴图等明确列为 004+。

## 架构

```text
UI → EngineConfig → rt_apply → engine
        camera · path_tracer · film
        mesh / texture / OBJ / instance / atmosphere
```

| 文件 | 职责 |
|------|------|
| `cpp/mesh.h` | MT 求交 · cube/box/crystal |
| `cpp/texture.h` | solid/checker/uv/image 双线性 |
| `cpp/loader_obj.h` | 内存 OBJ |
| `cpp/instance.h` | 平移/旋转/缩放实例 |
| `cpp/atmosphere.h` | 天空 · Beer · 自由程 |
| `cpp/scenes.h` | 五套场景 |
| `src/curriculum/chapters.ts` | 完整课程正文 |

## 场景

0 室外贴图球 · 1 纹理康奈尔 · **2 作业房间** · 3 雾中晶簇 · 4 经典三球

## 命令

```bash
npm run dev
npm run build:wasm
npm run build   # Pages: BASE_PATH=/cpp-003/
```
