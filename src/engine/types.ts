/** 前端唯一配置源 — 与 C++ EngineConfig 对齐 */

export type SceneId = 0 | 1 | 2 | 3 | 4;
export type DebugMode = 0 | 1 | 2 | 3 | 4;

export type EngineConfig = {
  sceneId: SceneId;
  resIdx: number;
  spp: number;
  maxDepth: number;
  debugMode: DebugMode;
  bvh: boolean;
  nee: boolean;
  mis: boolean;
  rr: boolean;
  vfov: number;
  defocus: number;
  yaw: number;
  pitch: number;
  radius: number;
  background: [number, number, number];
};

export type ConfigPatch = Partial<EngineConfig> & { label?: string };

export const SCENES: { id: SceneId; name: string; desc: string }[] = [
  { id: 0, name: "棋盘与贴图球", desc: "天空环境 + 轻雾 + 凹凸" },
  { id: 1, name: "纹理康奈尔", desc: "面光 · 无雾（对照）" },
  { id: 2, name: "作业房间", desc: "室内薄雾 · OBJ · instance" },
  { id: 3, name: "雾中晶簇", desc: "浓雾天空 + instance BVH" },
  { id: 4, name: "经典三球", desc: "室外天空 · 衔接 002" },
];

export const DEBUG_MODES = [
  { id: 0 as const, name: "美观（路径追踪）" },
  { id: 1 as const, name: "法线" },
  { id: 2 as const, name: "深度" },
  { id: 3 as const, name: "发光体" },
  { id: 4 as const, name: "UV 坐标" },
];

export const RES_PRESETS = [
  { label: "快速 320×180", w: 320, h: 180 },
  { label: "均衡 480×270", w: 480, h: 270 },
  { label: "清晰 640×360", w: 640, h: 360 },
] as const;

export const ORBIT_YAW_SENS = 0.005;
export const ORBIT_PITCH_SENS = 0.004;

export function sceneBackground(sceneId: SceneId): [number, number, number] {
  // 室外由 C++ Atmosphere 接管；此处仅作 apply 回退
  if (sceneId === 1) return [0, 0, 0];
  if (sceneId === 2) return [0.05, 0.05, 0.06];
  return [0.55, 0.65, 0.9];
}

export function sceneDefaults(sceneId: SceneId): Pick<
  EngineConfig,
  "yaw" | "pitch" | "radius" | "vfov" | "defocus" | "maxDepth" | "background"
> {
  const background = sceneBackground(sceneId);
  if (sceneId === 1) {
    return { yaw: 0, pitch: 0.05, radius: 3.4, vfov: 40, defocus: 0, maxDepth: 50, background };
  }
  if (sceneId === 2) {
    return { yaw: 0.35, pitch: 0.12, radius: 5.2, vfov: 42, defocus: 0, maxDepth: 40, background };
  }
  if (sceneId === 3) {
    return { yaw: 0.3, pitch: 0.2, radius: 16, vfov: 25, defocus: 0, maxDepth: 48, background };
  }
  if (sceneId === 4) {
    return { yaw: 0.35, pitch: 0.18, radius: 6.2, vfov: 30, defocus: 0.25, maxDepth: 24, background };
  }
  return { yaw: 0.3, pitch: 0.15, radius: 6.5, vfov: 30, defocus: 0.2, maxDepth: 24, background };
}

export function defaultConfig(): EngineConfig {
  const sceneId: SceneId = 2; // 作业房间默认
  return {
    sceneId,
    resIdx: 0,
    spp: 1,
    debugMode: 0,
    bvh: true,
    nee: true,
    mis: true,
    rr: true,
    ...sceneDefaults(sceneId),
  };
}

export function selectScene(cfg: EngineConfig, sceneId: SceneId): EngineConfig {
  return { ...cfg, sceneId, ...sceneDefaults(sceneId) };
}

export function lessonToPatch(a: {
  sceneId?: SceneId;
  debugMode?: DebugMode;
  useNee?: boolean;
  useMis?: boolean;
  useBvh?: boolean;
  useRr?: boolean;
  maxDepth?: number;
}): ConfigPatch {
  const p: ConfigPatch = {};
  if (a.sceneId !== undefined) Object.assign(p, sceneDefaults(a.sceneId), { sceneId: a.sceneId });
  if (a.debugMode !== undefined) p.debugMode = a.debugMode;
  if (a.useNee !== undefined) p.nee = a.useNee;
  if (a.useMis !== undefined) p.mis = a.useMis;
  if (a.useBvh !== undefined) p.bvh = a.useBvh;
  if (a.useRr !== undefined) p.rr = a.useRr;
  if (a.maxDepth !== undefined) p.maxDepth = a.maxDepth;
  return p;
}

export function applyPatch(cfg: EngineConfig, patch: ConfigPatch): EngineConfig {
  const { label: _l, ...rest } = patch;
  return { ...cfg, ...rest };
}

export function orbitPosition(
  yaw: number,
  pitch: number,
  radius: number,
  target: [number, number, number],
) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return {
    x: target[0] + radius * cp * sy,
    y: target[1] + radius * sp,
    z: target[2] + radius * cp * cy,
  };
}

export function lookTarget(sceneId: SceneId): [number, number, number] {
  if (sceneId === 1) return [0, 1, 0];
  if (sceneId === 2) return [0, 0.9, -0.2];
  if (sceneId === 3) return [0, 0.5, 0];
  return [0, 1, 0];
}

export function radiusRange(sceneId: SceneId) {
  if (sceneId === 1) return { min: 1.8, max: 6 };
  if (sceneId === 2) return { min: 2.5, max: 10 };
  if (sceneId === 3) return { min: 8, max: 28 };
  return { min: 3, max: 14 };
}

export function statusLine(
  cfg: EngineConfig,
  samples: number,
  passMs: number,
  prims: number,
): string {
  const res = RES_PRESETS[cfg.resIdx]!;
  return `${res.w}×${res.h} · ${samples} spp · ${passMs.toFixed(0)} ms · ${prims} 体 · BVH ${cfg.bvh ? "开" : "关"} · NEE ${cfg.nee ? "开" : "关"}`;
}
