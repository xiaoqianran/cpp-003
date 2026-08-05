import type { Chapter } from "./types";

/**
 * cpp-003 完整课程
 * 对照：GAMES101（几何/纹理/加速）· Shirley The Next Week · PBRT shapes/textures/volumes 简化
 * 目标：本仓库「资产进路径追踪」章节做到可自学闭环——概念 → 公式 → 代码地图 → 实验 → 自测
 */
export const CHAPTERS: Chapter[] = [
  // ═══════════════════════════════════════════════════════════
  {
    id: "ch00",
    index: 0,
    title: "导论 · 系列地图",
    subtitle: "002 与 003 的边界",
    lessons: [
      {
        id: "ch00-why",
        title: "为什么需要 003",
        minutes: 8,
        summary: "002 解决「光怎么积能量」；003 解决「东西怎么进场景」。",
        refs: ["GAMES101 L8–L10", "Shirley The Next Week 前言", "cpp-002"],
        blocks: [
          {
            type: "p",
            text: "cpp-002 已讲完「光线怎么积出正确能量」：朗伯/金属/玻璃、NEE、MIS、俄罗斯轮盘、SAH-BVH、康奈尔箱。你得到的是正确的蒙特卡洛积分器。",
          },
          {
            type: "p",
            text: "但真实画面里几乎没有「完美球」：角色、家具、道具都是三角网格；颜色来自纹理；同一把椅子会复制多次；室外还有天空与雾。003 在不推倒积分器的前提下，把资产管线接进去。",
          },
          {
            type: "compare",
            left: {
              title: "cpp-002",
              body: "球 + 四边形 · 常量 albedo · 面光 NEE · 渲染方程数值解",
            },
            right: {
              title: "cpp-003",
              body: "三角网格 · UV/纹理 · OBJ · instance · 凹凸 · 天空/雾 · 作业房间",
            },
          },
          {
            type: "mermaid",
            title: "系列依赖",
            code: `flowchart LR
  A[002 积分器] --> B[003 几何资产]
  A --> C[003 外观纹理]
  B --> D[作业场景]
  C --> D
  D --> E[可展示的路径追踪作品]`,
          },
          {
            type: "callout",
            tone: "tip",
            text: "学 003 时默认你已会「一条路径的权重」；每课都会用「打开实验」把镜头/开关拨到该知识点。",
          },
        ],
        action: { label: "先看作业房间总览", sceneId: 2, useNee: true, useMis: true },
      },
      {
        id: "ch00-map",
        title: "仓库地图与读序",
        minutes: 10,
        summary: "从 hit_record.u/v 一路读到 atmosphere。",
        refs: ["docs/ARCHITECTURE.md", "cpp/README.md"],
        blocks: [
          {
            type: "ol",
            items: [
              "mesh.h — 三角与内置几何",
              "texture.h + material.h — 外观",
              "loader_obj.h — 资产进内存",
              "instance.h — 变换不复制",
              "atmosphere.h + path_tracer.h — 天空与雾",
              "scenes.h — 五套实验场景",
            ],
          },
          {
            type: "map",
            rows: [
              { file: "cpp/mesh.h", note: "MT 求交 · cube/box/crystal" },
              { file: "cpp/texture.h", note: "solid/checker/uv/image 双线性" },
              { file: "cpp/loader_obj.h", note: "OBJ 字符串解析" },
              { file: "cpp/instance.h", note: "translate / rotate_y / scale" },
              { file: "cpp/atmosphere.h", note: "天空 · Beer · 自由程" },
              { file: "cpp/path_tracer.h", note: "积分 + 雾 + miss 天空" },
              { file: "src/engine/*", note: "EngineConfig → rt_apply" },
            ],
          },
          {
            type: "quiz",
            q: "003 相对 002 最不该重写的部分是？",
            options: ["path_tracer 主积分逻辑", "三角求交", "纹理采样", "OBJ 解析"],
            answer: 0,
            explain: "积分器已在 002 验证；003 主要扩展几何与外观，path_tracer 只增量接雾/天空。",
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch01",
    index: 1,
    title: "三角形求交",
    subtitle: "Möller–Trumbore",
    lessons: [
      {
        id: "ch01-why-tri",
        title: "为什么是三角",
        minutes: 8,
        summary: "任意多边形可三角化；GPU/DCC 通用；与重心坐标天然契合。",
        refs: ["GAMES101 L8", "PBRT Triangle"],
        blocks: [
          {
            type: "p",
            text: "工业界几乎所有曲面最终都变成三角形（或细分曲面求值后再三角）。一个三角形由三点确定一个平面片，求交可解析，且重心坐标同时给出插值参数。",
          },
          {
            type: "ul",
            items: [
              "封闭流形：外向法线一致",
              "非流形/裂缝：会产生漏光（path tracer 常见伪影）",
              "风序（winding）：决定 front_face",
            ],
          },
          {
            type: "callout",
            tone: "info",
            text: "本课不求交四边形原生：OBJ 的 f 四边形在加载时扇形拆成三角。",
          },
        ],
      },
      {
        id: "ch01-mt",
        title: "Möller–Trumbore 算法",
        minutes: 18,
        summary: "用边向量与标量三重积解 t 与重心 (u,v)，无需求显式平面方程。",
        refs: ["Möller & Trumbore 1997", "GAMES101 L10"],
        blocks: [
          {
            type: "h",
            text: "射线与三角",
          },
          {
            type: "formula",
            title: "参数方程",
            latex: "R(t) = O + t D",
          },
          {
            type: "formula",
            title: "重心表示",
            latex: "P = (1-u-v) V0 + u V1 + v V2 ,   u≥0, v≥0, u+v≤1",
          },
          {
            type: "p",
            text: "令 E1=V1-V0, E2=V2-V0, T=O-V0。MT 把「射线参数 t + 重心 u,v」写成线性系统，用 Cramer / 标量三重积求解，避免显式求平面再投影。",
          },
          {
            type: "formula",
            title: "核心量（实现见 triangle::hit）",
            latex: "det = E1 · (D × E2) ,   u = T·(D×E2)/det ,   v = D·(T×E1)/det ,   t = E2·(T×E1)/det",
          },
          {
            type: "ol",
            items: [
              "det≈0 → 射线与平面平行，否",
              "u∉[0,1] 或 v<0 或 u+v>1 → 平面命中在三角外，否",
              "t 不在 ray_t 内 → 否",
              "否则命中，写 rec.t / p / u / v / normal",
            ],
          },
          {
            type: "code",
            title: "与仓库对应（概念伪码）",
            lang: "cpp",
            code: `// cpp/mesh.h  triangle::hit
auto e1 = v1.p - v0.p, e2 = v2.p - v0.p;
auto pvec = cross(dir, e2);
auto det = dot(e1, pvec);
// ... u,v,t ...
rec.u = w*v0.u + u*v1.u + v*v2.u; // 重心插值 UV`,
          },
          {
            type: "callout",
            tone: "warn",
            text: "单面/双面：本实现不剔除背面（det 符号两边都可），玻璃与薄片更稳；若做阴影伪装面可加 backface cull。",
          },
          {
            type: "quiz",
            q: "重心坐标 (u,v) 中，顶点 V0 对应的权重是？",
            options: ["u", "v", "1-u-v", "u+v"],
            answer: 2,
            explain: "P=(1-u-v)V0 + u V1 + v V2，故 V0 权重为 w=1-u-v。",
          },
        ],
        action: { label: "康奈尔网格 · 法线调试", sceneId: 1, debugMode: 1 },
      },
      {
        id: "ch01-bary",
        title: "重心插值：法线与 UV",
        minutes: 12,
        summary: "同一组 (w,u,v) 插值顶点属性，得到光滑着色与贴图坐标。",
        refs: ["GAMES101 L8 插值", "PBRT Triangle::Intersect"],
        blocks: [
          {
            type: "formula",
            latex: "n = normalize(w n0 + u n1 + v n2) ,   uv = w uv0 + u uv1 + v uv2",
          },
          {
            type: "p",
            text: "面法线 cross(E1,E2) 用于无顶点法线时的回退；有 vn 时用插值法线做「伪光滑」（Phong 插值），几何仍是平的——高光会「转」但剪影仍是折线。",
          },
          {
            type: "compare",
            left: { title: "面法线", body: "每个三角一个 n，硬边清晰，低模卡通感" },
            right: { title: "顶点法线插值", body: "视觉光滑，适合角色；需 compute_vertex_normals 或 OBJ vn" },
          },
          {
            type: "callout",
            tone: "tip",
            text: "调试模式「UV」把 (u,v) 显示成红绿，可立刻看出贴图如何铺在三角上。",
          },
        ],
        action: { label: "作业房间 · UV 调试", sceneId: 2, debugMode: 4 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch02",
    index: 2,
    title: "Mesh 结构",
    subtitle: "顶点 · 索引 · 内置体",
    lessons: [
      {
        id: "ch02-layout",
        title: "vertex 与索引三角",
        minutes: 10,
        summary: "SoA/AoS 任选；本课 AoS：position + normal + uv，indices 每 3 个一三角。",
        refs: ["glTF mesh 概念", "Shirley Next Week"],
        blocks: [
          {
            type: "code",
            title: "本仓库布局",
            lang: "cpp",
            code: `struct vertex { point3 p; vec3 n; double u,v; };
class triangle_mesh {
  vector<vertex> verts;
  vector<int> indices; // 0,1,2, 0,2,3, ...
  void append_to(hittable_list&); // 展开为 triangle 对象
};`,
          },
          {
            type: "p",
            text: "教学实现选择「每三角一个 triangle 可击中物」以便 BVH 叶清晰；产品级常用「mesh 一片 + 内部 BVH/embree」。先求懂，再求快。",
          },
          {
            type: "ul",
            items: [
              "make_cube_mesh：6 面 × 2 三角，每面独立 UV",
              "make_box_mesh：任意半轴，桌面/椅腿",
              "make_crystal_mesh：双锥晶体，演示 compute_vertex_normals",
            ],
          },
        ],
        action: { label: "康奈尔看晶体与立方", sceneId: 1 },
      },
      {
        id: "ch02-aabb",
        title: "三角的 AABB",
        minutes: 8,
        summary: "叶节点包围盒 = 三顶点 AABB，供 SAH-BVH 剪枝。",
        refs: ["GAMES101 L10", "cpp-002 bvh"],
        blocks: [
          {
            type: "p",
            text: "三角形 AABB 可能很「空」（斜长三角），SAH 会倾向把大空盒切掉。极薄三角靠 aabb::pad_to_minimums 避免数值漏交。",
          },
          {
            type: "mermaid",
            title: "从 mesh 到 BVH",
            code: `flowchart TB
  M[triangle_mesh] --> A[append_to list]
  A --> T1[triangle]
  A --> T2[triangle]
  A --> Tn[...]
  T1 --> B[bvh_node SAH]
  T2 --> B
  Tn --> B`,
          },
        ],
        action: { label: "晶簇开 BVH", sceneId: 3, useBvh: true },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch03",
    index: 3,
    title: "BVH 与多三角",
    subtitle: "从 002 的加速到网格压力",
    lessons: [
      {
        id: "ch03-sah",
        title: "SAH-BVH 复习（对三角）",
        minutes: 12,
        summary: "叶是三角；内部节点盒并；最长轴分桶估计 SAH。",
        refs: ["cpp-002 BVH 课", "GAMES101 L10"],
        blocks: [
          {
            type: "p",
            text: "002 已实现 SAH-BVH。003 不重写加速结构：mesh 展开后的 triangle 与 sphere/quad 一样进同一棵树。",
          },
          {
            type: "formula",
            title: "SAH 思想",
            latex: "Cost ≈ C_trav + (A_L/A) N_L C_hit + (A_R/A) N_R C_hit",
          },
          {
            type: "callout",
            tone: "warn",
            text: "超大地面球（r=1000）会毁掉剪枝：射线几乎总先进大球叶。晶簇场景改用有限 quad 地面。",
          },
          {
            type: "quiz",
            q: "开关 BVH 时应用什么指标对比？",
            options: ["仅 spp", "状态栏 ms/帧 + 观感", "仅 primitive 数", "仅 yaw 角"],
            answer: 1,
            explain: "加速结构不改收敛到的期望亮度，主要改每帧耗时；用 ms 与拖拽跟手度。",
          },
        ],
        action: { label: "雾中晶簇测 BVH", sceneId: 3, useBvh: true, maxDepth: 48 },
      },
      {
        id: "ch03-instance-bvh",
        title: "Instance 与 BVH 的关系",
        minutes: 10,
        summary: "顶层 BVH 的叶可以是 instance；内部再对共享 mesh 求交。",
        refs: ["PBRT TransformedPrimitive", "Shirley instance"],
        blocks: [
          {
            type: "p",
            text: "场景 3 用「一个晶体原型 + 上百 instance」：内存按一份几何计，BVH 顶层节点数 = 实例数级。每个 instance 的 AABB 是变换后的盒。",
          },
          {
            type: "compare",
            left: { title: "全展开", body: "N 份完全独立三角，内存 ×N，BVH 叶 ×N" },
            right: { title: "instance", body: "1 份几何 + N 个变换包装，命中时射线进局部" },
          },
        ],
        action: { label: "作业房间多椅", sceneId: 2 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch04",
    index: 4,
    title: "纹理系统",
    subtitle: "从常量到双线性图像",
    lessons: [
      {
        id: "ch04-model",
        title: "texture 接口",
        minutes: 10,
        summary: "value(u,v,p) → color；材质只依赖接口，不依赖贴图来源。",
        refs: ["Shirley Next Week ch.4", "PBRT Texture"],
        blocks: [
          {
            type: "code",
            lang: "cpp",
            code: `class texture {
  virtual color value(double u, double v, const point3& p) const = 0;
};`,
          },
          {
            type: "ul",
            items: [
              "solid_color — 常量",
              "checker_texture — 世界坐标 xyz 棋盘（无 UV 也行）",
              "uv_checker_texture — 参数域棋盘（靠 hit.u/v）",
              "image_texture — 程序图/内存 RGB + 双线性",
            ],
          },
          {
            type: "mermaid",
            title: "采样数据流",
            code: `flowchart LR
  Hit[hit_record u v p] --> Tex[texture.value]
  Tex --> Mat[lambertian attenuation]
  Mat --> PT[path_tracer 权重]`,
          },
        ],
        action: { label: "棋盘与贴图球", sceneId: 0 },
      },
      {
        id: "ch04-uv-sphere",
        title: "球面 UV",
        minutes: 10,
        summary: "用法线方向的球坐标得到 (u,v)，才能在球上铺 image。",
        refs: ["GAMES101 纹理", "Shirley sphere UV"],
        blocks: [
          {
            type: "formula",
            latex: "θ = arccos(-y) ,   φ = atan2(-z,x)+π ,   u=φ/(2π) ,   v=θ/π",
          },
          {
            type: "p",
            text: "实现于 sphere::hit。两极收缩、经线接缝是球面参数化固有问题；高级课可谈 cube map / ptex。",
          },
          {
            type: "quiz",
            q: "世界空间棋盘 checker_texture 主要依赖？",
            options: ["仅 u", "仅 v", "点的 xyz", "光线方向"],
            answer: 2,
            explain: "它按 floor(p/scale) 奇偶取色，不需要 UV。",
          },
        ],
        action: { label: "贴图球 + UV 调试", sceneId: 0, debugMode: 4 },
      },
      {
        id: "ch04-bilinear",
        title: "双线性过滤",
        minutes: 12,
        summary: "四邻域加权，减轻放大锯齿；缩小仍可能闪烁（需 mipmap，本课未做）。",
        refs: ["PBRT image texture", "GAMES101 纹理过滤"],
        blocks: [
          {
            type: "formula",
            latex: "C = (1-fx)(1-fy)C00 + fx(1-fy)C10 + (1-fx)fy C01 + fx fy C11",
          },
          {
            type: "p",
            text: "image_texture 默认 bilinear=true。make_wood 生成木纹程序图用于桌面。缩小 aliasing 要用 mipmap/各向异性——标为进阶作业。",
          },
          {
            type: "callout",
            tone: "tip",
            text: "作业房间默认看木纹桌：近看是否「糊得合理」，远看是否闪（无 mip 时正常）。",
          },
        ],
        action: { label: "作业房间看木纹", sceneId: 2 },
      },
      {
        id: "ch04-gamma",
        title: "纹理与 gamma（概念）",
        minutes: 8,
        summary: "贴图文件常是 sRGB；着色应在线性空间。本课程序纹素已按线性写。",
        refs: ["PBRT radiometry", "GAMES101 色彩"],
        blocks: [
          {
            type: "p",
            text: "真实 PNG 多是 sRGB 编码：读入后应 decode 到线性再参与光照，最后输出再 encode。本课 image 为程序生成线性值；接外部 PNG 时勿忘 gamma。",
          },
          {
            type: "callout",
            tone: "warn",
            text: "把 sRGB 当线性乘 BRDF → 暗部更脏、饱和失真。",
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch05",
    index: 5,
    title: "材质接纹理",
    subtitle: "朗伯 albedo 贴图",
    lessons: [
      {
        id: "ch05-lambert-tex",
        title: "lambertian 读 texture",
        minutes: 10,
        summary: "attenuation = tex->value(u,v,p)；BRDF 仍为 albedo/π。",
        refs: ["002 朗伯推导", "Shirley textured lambertian"],
        blocks: [
          {
            type: "formula",
            latex: "f_r = A(u,v)/π ,   余弦采样时权重 ≈ A(u,v)",
          },
          {
            type: "p",
            text: "NEE/MIS 路径里 brdf_lambert 同样要采同一张纹理，否则直接光与间接光 albedo 不一致。",
          },
          {
            type: "map",
            rows: [
              { file: "cpp/material.h", note: "lambertian + bump" },
              { file: "cpp/path_tracer.h", note: "scatter / NEE 共用 brdf" },
            ],
          },
        ],
        action: { label: "纹理康奈尔", sceneId: 1, useNee: true, useMis: true },
      },
      {
        id: "ch05-bump",
        title: "高度凹凸（Bump）",
        minutes: 14,
        summary: "用高度场梯度扰动法线，廉价细节；不改几何剪影。",
        refs: ["Blinn 1978", "PBRT bump mapping"],
        blocks: [
          {
            type: "formula",
            latex: "n' = normalize( n - s (∂h/∂u T + ∂h/∂v B) )",
          },
          {
            type: "p",
            text: "本课用纹理 R 通道当高度 h，有限差分估 ∂h/∂u、∂h/∂v；T,B 来自 onb.build_from_w(n)。真·法线贴图是 RGB 存切空间法线，需完整 TBN（进阶）。",
          },
          {
            type: "compare",
            left: { title: "Bump/高度", body: "一通道，实现简单，轮廓仍直" },
            right: { title: "位移/细分", body: "真改几何，剪影变，成本高" },
          },
          {
            type: "quiz",
            q: "凹凸贴图能改变物体的剪影（轮廓）吗？",
            options: ["能", "不能", "仅金属能", "仅有雾时能"],
            answer: 1,
            explain: "只改着色法线，几何命中仍是原三角/球。",
          },
        ],
        action: { label: "凹凸球场景", sceneId: 0 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch06",
    index: 6,
    title: "OBJ 加载",
    subtitle: "资产从文件语义进内核",
    lessons: [
      {
        id: "ch06-format",
        title: "Wavefront OBJ 子集",
        minutes: 12,
        summary: "v / vt / vn / f；索引从 1 起；负索引相对末尾。",
        refs: ["Wavefront OBJ", "Shirley mesh input"],
        blocks: [
          {
            type: "ul",
            items: [
              "v x y z — 顶点位置",
              "vt u v — 纹理坐标",
              "vn x y z — 法线",
              "f v/vt/vn — 面（本课扇形三角化）",
            ],
          },
          {
            type: "p",
            text: "浏览器 WASM 不便任意读盘：把小型 OBJ 嵌成 C 字符串（奖杯、四面体）。接口 load_obj_string(text, mat, center, scale, yaw)。",
          },
          {
            type: "code",
            lang: "cpp",
            title: "使用方式",
            code: `auto mesh = load_obj_string(k_builtin_trophy_obj(), gold,
                            point3(0.15,0.82,-0.25), 0.55, 0.4);
mesh.append_to(world);`,
          },
          {
            type: "callout",
            tone: "tip",
            text: "作业：导出低模 OBJ，粘进 k_builtin_* 或扩 rt_load_obj 接口。",
          },
        ],
        action: { label: "作业房间看奖杯", sceneId: 2, useNee: true },
      },
      {
        id: "ch06-winding",
        title: "索引、绕组与法线",
        minutes: 8,
        summary: "无 vn 时按面累加生成顶点法线；绕组决定朝向。",
        refs: ["GAMES101 网格"],
        blocks: [
          {
            type: "p",
            text: "compute_vertex_normals：对每个三角面法线累加到三顶点再单位化。若面绕序不一致，法线会「翻花」。",
          },
          {
            type: "quiz",
            q: "OBJ 面索引通常从几开始？",
            options: ["0", "1", "-1", "任意"],
            answer: 1,
            explain: "Wavefront 规范 1-based；实现里要 -1。",
          },
        ],
        action: { label: "奖杯法线调试", sceneId: 2, debugMode: 1 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch07",
    index: 7,
    title: "实例变换",
    subtitle: "一份几何，多处出现",
    lessons: [
      {
        id: "ch07-math",
        title: "射线进局部，命中回世界",
        minutes: 14,
        summary: "变换物体 ≡ 逆变换射线；法线用逆转置。",
        refs: ["GAMES101 变换", "PBRT Transform", "Shirley instance"],
        blocks: [
          {
            type: "formula",
            title: "位置",
            latex: "x_local = M^{-1} x_world ,   命中后 x_world = M x_local",
          },
          {
            type: "formula",
            title: "法线",
            latex: "n_world ∝ (M^{-1})^{T} n_local   （均匀缩放可单位化简化）",
          },
          {
            type: "p",
            text: "translate：原点平移。rotate_y：绕 Y。scale_uniform：均匀缩放。instance_ry_t = translate∘rotate_y。",
          },
          {
            type: "mermaid",
            title: "命中流程",
            code: `sequenceDiagram
  participant R as 世界射线
  participant I as instance
  participant M as mesh
  R->>I: hit
  I->>I: R' = M^{-1} R
  I->>M: hit(R')
  M-->>I: rec_local
  I->>I: p,n 变回世界
  I-->>R: rec_world`,
          },
          {
            type: "quiz",
            q: "对法线应用与点相同的线性部分 M 而不用逆转置，会怎样？",
            options: ["永远正确", "非均匀缩放下法线错误", "只影响 UV", "只影响颜色"],
            answer: 1,
            explain: "法线是协变的，需 (M^{-1})^T；均匀缩放碰巧常还能「看起来行」。",
          },
        ],
        action: { label: "多椅多奖杯", sceneId: 2 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch08",
    index: 8,
    title: "环境与体积",
    subtitle: "天空 + 均匀雾",
    lessons: [
      {
        id: "ch08-sky",
        title: "程序天空",
        minutes: 10,
        summary: "miss 时按方向混合地平线/天顶，并加太阳圆盘。",
        refs: ["PBRT InfiniteAreaLight 简化", "GAMES101 环境光概念"],
        blocks: [
          {
            type: "p",
            text: "真实环境贴图是 lat-long HDR。本课用解析渐变 + 太阳盘演示「方向相关 miss 颜色」，接积分器零成本。",
          },
          {
            type: "formula",
            latex: "L_env(ω) = mix(horizon, zenith; smoothstep(y)) + sun_disk(ω)",
          },
          {
            type: "callout",
            tone: "info",
            text: "康奈尔（场景1）关闭 env_sky，避免「开窗漏光」破坏封闭箱假设。",
          },
        ],
        action: { label: "室外贴图球", sceneId: 0 },
      },
      {
        id: "ch08-beer",
        title: "Beer 定律与自由程",
        minutes: 16,
        summary: "齐次介质：透射指数衰减；用逆变换采样散射距离。",
        refs: ["PBRT Volume Scattering", "GAMES202 体积（概念）"],
        blocks: [
          {
            type: "formula",
            title: "透射",
            latex: "T(t) = exp(-σ_t t)",
          },
          {
            type: "formula",
            title: "自由程采样",
            latex: "t = -ln(1-ξ) / σ_t",
          },
          {
            type: "ol",
            items: [
              "与表面求交得 t_hit（或 ∞）",
              "采样 t_free；若 t_free < t_hit → 体积散射",
              "否则表面着色，并乘 T(t_hit)",
              "体积内各向同性：新方向均匀球面，权重 ≈ albedo=σ_s/σ_t",
            ],
          },
          {
            type: "p",
            text: "NEE 阴影射线同样乘 T(dist)。深度将尽时雾路径回退估天空，避免整屏黑。",
          },
          {
            type: "quiz",
            q: "σ_t 变大时，平均自由程？",
            options: ["变长", "变短", "不变", "变为零"],
            answer: 1,
            explain: "E[t]=1/σ_t，密度越大散射越频繁。",
          },
        ],
        action: { label: "雾中晶簇", sceneId: 3, useBvh: true, maxDepth: 48 },
      },
      {
        id: "ch08-limit",
        title: "本课体积的边界",
        minutes: 6,
        summary: "无异质介质、无 delta tracking 优化、无光谱；教学用齐次各向同性。",
        refs: ["PBRT next steps"],
        blocks: [
          {
            type: "ul",
            items: [
              "已做：齐次 σ_t、各向同性、与表面耦合、阴影透射",
              "未做：异质密度场、多重散射优化、光谱介质、雾的 NEE",
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch09",
    index: 9,
    title: "与积分器协同",
    subtitle: "002 能力在 003 场景中",
    lessons: [
      {
        id: "ch09-nee",
        title: "NEE / MIS 仍然有效",
        minutes: 10,
        summary: "有面光的场景（康奈尔、房间）继续用 002 的直接光采样。",
        refs: ["cpp-002 NEE 课", "Veach MIS"],
        blocks: [
          {
            type: "p",
            text: "纹理只改 albedo(u,v)；NEE 估直接光照公式不变。关掉 NEE 看房间噪声爆炸，是最好的复习。",
          },
          {
            type: "callout",
            tone: "warn",
            text: "室外无面光时 NEE 帮不上太阳——太阳在 miss 里，要用环境重要性采样（未做，004 候选）。",
          },
        ],
        action: { label: "房间 NEE 开", sceneId: 2, useNee: true, useMis: true },
      },
      {
        id: "ch09-debug",
        title: "调试视图清单",
        minutes: 8,
        summary: "法线 / 深度 / 发光 / UV — 资产课的示波器。",
        refs: ["实践经验"],
        blocks: [
          {
            type: "ul",
            items: [
              "法线 — 插值是否光滑、instance 旋转是否带上法线",
              "深度 — 相机与尺度是否离谱",
              "发光 — 面光四边形在哪",
              "UV — 贴图拉伸、接缝",
            ],
          },
        ],
        action: { label: "房间 UV", sceneId: 2, debugMode: 4 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch10",
    index: 10,
    title: "作业场景精读",
    subtitle: "作业房间是总装课",
    lessons: [
      {
        id: "ch10-room",
        title: "作业房间拆解",
        minutes: 14,
        summary: "墙地灯 + box 家具 + OBJ 奖杯 + instance 椅 + 薄雾 + 凹凸墙。",
        refs: ["本仓库 scenes.h scene 2"],
        blocks: [
          {
            type: "mermaid",
            title: "场景图",
            code: `flowchart TB
  Room[作业房间]
  Room --> Walls[quad 墙地顶]
  Room --> Lamp[面光]
  Room --> Table[box 木桌]
  Room --> Chairs[instance 椅 x3]
  Room --> Trophy[OBJ 奖杯 x2]
  Room --> Fog[室内薄雾]
  Room --> Bump[后墙 bump]`,
          },
          {
            type: "ol",
            items: [
              "先法线调试确认尺度与朝向",
              "再 UV 看木纹桌",
              "开 NEE 降噪",
              "对比无雾/有雾空气感",
            ],
          },
          {
            type: "map",
            rows: [
              { file: "cpp/scenes.h", note: "scene_id==2" },
              { file: "cpp/loader_obj.h", note: "奖杯 OBJ" },
              { file: "cpp/instance.h", note: "椅与奖杯复制" },
            ],
          },
        ],
        action: { label: "作业房间总览", sceneId: 2, useNee: true, useMis: true, useRr: true },
      },
      {
        id: "ch10-project",
        title: "课程项目建议",
        minutes: 10,
        summary: "可评分的扩展清单。",
        refs: ["教学设计"],
        blocks: [
          {
            type: "ol",
            items: [
              "必做：替换内嵌 OBJ 为自己的低模，摆进房间",
              "必做：为桌面换一张 image（可程序生成）",
              "选做：mipmap 或 checker 抗锯齿对比截图",
              "选做：instance 环形阵列 12 把椅子",
              "选做：调 σ_t 三档雾浓度对比",
              "挑战：环境贴图 lat-long + 余弦重要性采样太阳",
            ],
          },
          {
            type: "callout",
            tone: "tip",
            text: "提交物建议：3 张调试视图 + 1 张美观 esp + 简短报告（用了哪些课概念）。",
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  {
    id: "ch11",
    index: 11,
    title: "对照表与进阶",
    subtitle: "GAMES101 / Shirley / PBRT",
    lessons: [
      {
        id: "ch11-table",
        title: "知识点对照",
        minutes: 10,
        summary: "你在本仓库练的每一项，对应外部课程哪里。",
        refs: ["GAMES101", "Ray Tracing The Next Week", "PBRT 4th"],
        blocks: [
          {
            type: "ul",
            items: [
              "GAMES101 几何/变换/纹理过滤 → mesh · instance · bilinear",
              "GAMES101 加速结构 → 复用 002 SAH-BVH 于三角",
              "Shirley Next Week → 纹理、实例、体积雾（简化版）",
              "PBRT shapes/textures/volumes → 工业对照，本课为教学裁剪",
            ],
          },
          {
            type: "compare",
            left: { title: "本课已覆盖", body: "三角·UV·纹理·OBJ·instance·bump·天空·齐次雾·作业房" },
            right: {
              title: "明确未覆盖（004+）",
              body: "切空间法线贴图、mipmap、异质体积、环境 NEE、细分曲面、GPU",
            },
          },
        ],
      },
      {
        id: "ch11-enough",
        title: "怎样算「学完 003」",
        minutes: 6,
        summary: "能力清单自检。",
        refs: [],
        blocks: [
          {
            type: "ol",
            items: [
              "能手推 MT 的 u,v,t 含义",
              "能解释 hit.u/v 如何驱动纹理",
              "能说清 instance 为何省内存",
              "能写自由程采样公式并解释 T(t)",
              "能独立改 scenes.h 搭一个新道具场景",
            ],
          },
          {
            type: "callout",
            tone: "info",
            text: "功能上 003 已是可演示的「资产路径追踪」；教学上以本完整课程 + 实验台为准。未做项见对照表，留给后续仓库。",
          },
        ],
        action: { label: "回到作业房间验收", sceneId: 2, useNee: true, useMis: true },
      },
    ],
  },
];

export function allLessons() {
  return CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ chapter: c, lesson: l })));
}

export function findLesson(id: string) {
  for (const c of CHAPTERS) {
    const l = c.lessons.find((x) => x.id === id);
    if (l) return { chapter: c, lesson: l };
  }
  return null;
}
