# C++ 内核 · cpp-003

路径追踪积分继承 002；本课：**mesh / texture / OBJ**。

## 读序

```text
texture.h → material.h → mesh.h → loader_obj.h → scenes.h
path_tracer.h · engine.h · wasm_bridge.cpp
```

## 构建

```bash
make wasm   # public/raytracer.*
make cli
```

## 场景 id

0 贴图球 · 1 康奈尔网格 · 2 作业房间 · 3 晶簇 · 4 三球
