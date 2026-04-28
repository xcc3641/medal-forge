"use client";

export interface GlbExportOptions {
  weldVertices: boolean;
  stripUv: boolean;
  smartTessellation: boolean;
  simplifyCurves: boolean;
}

export const DEFAULT_GLB_EXPORT_OPTIONS: GlbExportOptions = {
  weldVertices: true,
  stripUv: true,
  smartTessellation: true,
  simplifyCurves: true,
};

const STORAGE_KEY = "medal-forge:glb-export-options:v1";
const CHANGE_EVENT = "medal-forge:glb-export-options:change";

/// Snapshot 缓存: useSyncExternalStore 要求 getSnapshot 在数据未变时返回同一引用,
/// 否则 React 认为状态变了 → 无限 re-render. 这里手动维护引用稳定性.
let cachedSnapshot: GlbExportOptions = DEFAULT_GLB_EXPORT_OPTIONS;
let cachedRaw: string | null = null;

function readFromStorage(): GlbExportOptions {
  if (typeof window === "undefined") return DEFAULT_GLB_EXPORT_OPTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;

    if (!raw) {
      cachedSnapshot = DEFAULT_GLB_EXPORT_OPTIONS;
      return cachedSnapshot;
    }

    const parsed = JSON.parse(raw) as Partial<GlbExportOptions>;
    cachedSnapshot = {
      weldVertices: parsed.weldVertices ?? DEFAULT_GLB_EXPORT_OPTIONS.weldVertices,
      stripUv: parsed.stripUv ?? DEFAULT_GLB_EXPORT_OPTIONS.stripUv,
      smartTessellation:
        parsed.smartTessellation ?? DEFAULT_GLB_EXPORT_OPTIONS.smartTessellation,
      simplifyCurves:
        parsed.simplifyCurves ?? DEFAULT_GLB_EXPORT_OPTIONS.simplifyCurves,
    };
    return cachedSnapshot;
  } catch {
    cachedSnapshot = DEFAULT_GLB_EXPORT_OPTIONS;
    return cachedSnapshot;
  }
}

export function loadGlbExportOptions(): GlbExportOptions {
  return readFromStorage();
}

export function saveGlbExportOptions(options: GlbExportOptions): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    // 同 tab 写入不会触发原生 'storage' 事件 (只跨 tab 触发), 这里手动派发.
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage 满了 / 隐身模式 — 静默忽略, 用户偏好不存就用默认.
  }
}

export function subscribeGlbExportOptions(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function getServerGlbExportOptions(): GlbExportOptions {
  return DEFAULT_GLB_EXPORT_OPTIONS;
}
