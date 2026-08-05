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
