import type { Chapter } from "./types";

/** cpp-003 课程：网格与纹理 */
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
            right: { title: "cpp-003", body: "三角网格 · 纹理 UV · 对三角 BVH" },
          },
          {
            type: "map",
            rows: [
              { file: "cpp/mesh.h", note: "MT 求交 · cube/crystal" },
              { file: "cpp/texture.h", note: "checker / image" },
              { file: "cpp/path_tracer.h", note: "积分器继承 002" },
            ],
          },
        ],
        action: { label: "打开纹理康奈尔", sceneId: 1, useNee: true, useMis: true },
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
          {
            type: "callout",
            tone: "tip",
            text: "用法线调试视图看晶体与立方体的平滑/面法线差异。",
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
              "solid_color：常量",
              "checker_texture：按世界坐标 xyz 棋盘",
              "uv_checker_texture：按三角/平面 UV",
              "image_texture：内存中的小图（演示双线性入口）",
            ],
          },
          {
            type: "quiz",
            q: "球上的贴图主要依赖？",
            options: ["仅世界 xyz 棋盘", "球面参数化得到的 UV", "只用法线 x 分量", "随机噪声"],
            answer: 1,
            explain: "sphere::hit 用 theta/phi 写 rec.u/v，再交给 image_texture。",
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
        summary: "每个三角是叶；mesh.append_to 展开进世界后交给 bvh_node。",
        refs: ["cpp-002 SAH", "GAMES101 加速"],
        blocks: [
          {
            type: "p",
            text: "场景 3 有大量晶体/立方三角。开关 BVH 对比状态栏 ms。",
          },
          {
            type: "callout",
            tone: "warn",
            text: "超大地面球会毁掉剪枝；晶簇场景用有限 quad 地面。",
          },
        ],
        action: { label: "晶簇压力", sceneId: 3, useBvh: true },
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
