"use client";

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildMedalGroup, disposeObject3D } from "@/lib/model-builder";
import {
  DEFAULT_GLB_EXPORT_OPTIONS,
  type GlbExportOptions,
} from "@/lib/export-options";
import type { MedalSettings } from "@/lib/types";

/// mergeVertices 容差: 1e-4 是经验值. 太松会把不该合的顶点合掉,
/// 太严合不到几个. ExtrudeGeometry 的边界顶点精度大致 1e-5, 给一个数量级 buffer.
const WELD_TOLERANCE = 1e-4;

function applyExportOptimizations(
  group: THREE.Group,
  options: GlbExportOptions,
) {
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    let geometry = child.geometry as THREE.BufferGeometry;

    if (options.stripUv && geometry.getAttribute("uv")) {
      geometry.deleteAttribute("uv");
    }

    if (options.weldVertices) {
      const merged = mergeVertices(geometry, WELD_TOLERANCE);
      // mergeVertices 必返回新 geometry; 旧的得手动 dispose.
      if (merged !== geometry) {
        geometry.dispose();
        geometry = merged;
      }
      geometry.computeVertexNormals();
      child.geometry = geometry;
    }
  });
}

export async function exportMedalGlb(
  svgText: string,
  settings: MedalSettings,
  options: GlbExportOptions = DEFAULT_GLB_EXPORT_OPTIONS,
): Promise<Blob> {
  const group = buildMedalGroup(svgText, settings, null, {
    smartTessellation: options.smartTessellation,
    simplifyCurves: options.simplifyCurves,
  });
  applyExportOptimizations(group, options);

  const exporter = new GLTFExporter();

  try {
    return await new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        group,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(
              new Blob([result], {
                type: "model/gltf-binary",
              }),
            );
            return;
          }

          resolve(
            new Blob([JSON.stringify(result, null, 2)], {
              type: "model/gltf+json",
            }),
          );
        },
        (error) => reject(error),
        { binary: true },
      );
    });
  } finally {
    disposeObject3D(group);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
