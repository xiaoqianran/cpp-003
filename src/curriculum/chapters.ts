import type { Chapter } from "./types";

/** cpp-003 课程：网格 · 纹理 · OBJ · 作业房间 */
export const CHAPTERS: Chapter[] = [
  {
    id: "ch00",
    index: 0,
    title: "导论与系列",
    subtitle: "002 → 003 边界",
    lessons: [
      {
        id: "ch00-series",
        title: "系列定位",
        minutes: 6,
        summary: "002 积能量；003 放资产。",
        refs: ["cpp-002", "Shirley The Next Week"],
        blocks: [
          {
            type: "p",
            text: "cpp-002 已讲完「光线怎么积出正确能量」。cpp-003 讲：真实资产怎么进场景、怎么被 BVH 加速、怎么贴上细节——仍是路径追踪，但内容从球和墙升级到能放下一个模型。",
          },
          {
            type: "compare",
            left: { title: "cpp-002", body: "球/四边形 · NEE·MIS·RR · 渲染方程" },
            right: { title: "cpp-003", body: "三角网格 · 纹理 UV · OBJ · 作业房间" },
          },
          {
            type: "map",
            rows: [
              { file: "cpp/mesh.h", note: "MT 求交 · cube/box/crystal" },
              { file: "cpp/texture.h", note: "checker / 双线性 image" },
              { file: "cpp/loader_obj.h", note: "内存 OBJ" },
            ],
          },
        ],
        action: { label: "打开作业房间", sceneId: 2, useNee: true, useMis: true },
      },
    ],
  },
  {
    id: "ch01",
    index: 1,
    title: "三角求交",
    subtitle: "Möller–Trumbore",
    lessons: [
      {
        id: "ch01-mt",
        title: "Möller–Trumbore 算法",
        minutes: 12,
        summary: "用边与叉积解重心坐标 (u,v)，判断点是否在三角形内。",
        refs: ["Möller & Trumbore 1997", "GAMES101"],
        blocks: [
          {
            type: "formula",
            latex: "P = (1-u-v) V0 + u V1 + v V2 ,   u≥0, v≥0, u+v≤1",
          },
          {
            type: "p",
            text: "实现见 triangle::hit。法线与 UV 用同一组重心权重插值。",
          },
        ],
        action: { label: "康奈尔网格 + 法线", sceneId: 1, debugMode: 1 },
      },
    ],
  },
  {
    id: "ch02",
    index: 2,
    title: "纹理",
    subtitle: "solid · checker · image",
    lessons: [
      {
        id: "ch02-tex",
        title: "三类纹理",
        minutes: 10,
        summary: "常量、世界空间棋盘、UV 棋盘、程序图像。",
        refs: ["Shirley Next Week ch.4"],
        blocks: [
          {
            type: "ul",
            items: [
              "solid_color / checker_texture / uv_checker_texture",
              "image_texture：双线性采样 + make_wood 木纹",
            ],
          },
        ],
        action: { label: "棋盘与贴图球", sceneId: 0 },
      },
    ],
  },
  {
    id: "ch03",
    index: 3,
    title: "Mesh 与 BVH",
    subtitle: "多三角加速",
    lessons: [
      {
        id: "ch03-bvh",
        title: "对三角建 SAH-BVH",
        minutes: 10,
        summary: "每个三角是叶；append_to 后交给 bvh_node。",
        refs: ["cpp-002 SAH"],
        blocks: [
          {
            type: "p",
            text: "场景 3 大量晶体/立方。开关 BVH 对比 ms。作业房间约 170+ 三角体。",
          },
        ],
        action: { label: "晶簇压力", sceneId: 3, useBvh: true },
      },
    ],
  },
  {
    id: "ch04",
    index: 4,
    title: "OBJ 加载",
    subtitle: "内存字符串解析",
    lessons: [
      {
        id: "ch04-obj",
        title: "最小 OBJ 加载器",
        minutes: 12,
        summary: "解析 v/vt/vn/f，扇形拆三角，scale/yaw/平移。",
        refs: ["Wavefront OBJ"],
        blocks: [
          {
            type: "p",
            text: "WASM 不便读盘：小型 OBJ 嵌成 C 字符串。接口 load_obj_string。作业房间有奖杯与四面体。",
          },
          {
            type: "map",
            rows: [
              { file: "cpp/loader_obj.h", note: "解析 + 变换" },
              { file: "cpp/scenes.h", note: "场景 2" },
            ],
          },
          {
            type: "callout",
            tone: "tip",
            text: "作业：把你的低模 OBJ 贴进 k_builtin_*。",
          },
        ],
        action: { label: "作业房间", sceneId: 2, useNee: true, useMis: true },
      },
    ],
  },
  {
    id: "ch05",
    index: 5,
    title: "纹理过滤",
    subtitle: "双线性",
    lessons: [
      {
        id: "ch05-bilinear",
        title: "双线性采样",
        minutes: 8,
        summary: "四邻域加权，木纹桌面更顺。",
        refs: ["PBRT filtering 简化"],
        blocks: [
          {
            type: "formula",
            latex: "C = (1-fx)(1-fy)C00 + fx(1-fy)C10 + (1-fx)fy C01 + fx fy C11",
          },
        ],
        action: { label: "作业房间看木纹", sceneId: 2 },
      },
    ],
  },
  {
    id: "ch06",
    index: 6,
    title: "实例变换",
    subtitle: "translate · rotate_y",
    lessons: [
      {
        id: "ch06-instance",
        title: "Instance 不复制几何",
        minutes: 10,
        summary: "一份 mesh，多次 translate/rotate 实例化；射线变到局部求交。",
        refs: ["Shirley Next Week ch.2"],
        blocks: [
          {
            type: "p",
            text: "instance.h：translate / rotate_y / scale_uniform。作业房间三把椅子、两座奖杯共用原型。",
          },
          {
            type: "map",
            rows: [
              { file: "cpp/instance.h", note: "变换包装" },
              { file: "cpp/scenes.h", note: "instance_ry_t" },
            ],
          },
        ],
        action: { label: "作业房间看多椅", sceneId: 2 },
      },
    ],
  },
  {
    id: "ch07",
    index: 7,
    title: "高度凹凸",
    subtitle: "bump from height",
    lessons: [
      {
        id: "ch07-bump",
        title: "高度图扰动法线",
        minutes: 10,
        summary: "用纹理 R 通道当高度，切空间梯度改法线，廉价的「细节」。",
        refs: ["Blinn bump mapping 简化"],
        blocks: [
          {
            type: "formula",
            latex: "n' = normalize( n - s (∂h/∂u T + ∂h/∂v B) )",
          },
          {
            type: "p",
            text: "场景 0 左侧球、场景 2 后墙。调试「法线」看几何；美观模式看照明变化。",
          },
        ],
        action: { label: "贴图球看凹凸", sceneId: 0 },
      },
    ],
  },
  {
    id: "ch08",
    index: 8,
    title: "环境天空",
    subtitle: "方向相关 miss 颜色",
    lessons: [
      {
        id: "ch08-sky",
        title: "程序天空与太阳",
        minutes: 10,
        summary: "射线未命中时按方向混合地平线/天顶，并叠加太阳圆盘。",
        refs: ["PBRT infinite light 简化"],
        blocks: [
          {
            type: "p",
            text: "Atmosphere::eval_sky。场景 0/3/4 开启 env_sky；康奈尔保持黑背景。",
          },
          {
            type: "map",
            rows: [
              { file: "cpp/atmosphere.h", note: "天空 + 雾参数" },
              { file: "cpp/path_tracer.h", note: "miss_color" },
            ],
          },
        ],
        action: { label: "室外贴图球", sceneId: 0 },
      },
    ],
  },
  {
    id: "ch09",
    index: 9,
    title: "均匀体积雾",
    subtitle: "Beer + 自由程采样",
    lessons: [
      {
        id: "ch09-fog",
        title: "齐次介质",
        minutes: 14,
        summary: "自由程 t=-ln(1-ξ)/σ；体积内各向同性散射；表面贡献乘 e^{-σt}。",
        refs: ["PBRT volume 简化", "GAMES202 体积"],
        blocks: [
          {
            type: "formula",
            latex: "T(t)=e^{-σ_t t},\quad t_{free}=-\\ln(1-ξ)/σ_t",
          },
          {
            type: "ul",
            items: [
              "场景 3：浓雾晶簇",
              "场景 2：室内薄雾",
              "NEE 阴影同样乘透射",
            ],
          },
          {
            type: "callout",
            tone: "warn",
            text: "浓雾噪声大，可开 NEE/RR 并略降分辨率。",
          },
        ],
        action: { label: "雾中晶簇", sceneId: 3, useBvh: true, useNee: true },
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
