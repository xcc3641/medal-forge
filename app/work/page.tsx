"use client";

import { useEffect, useState } from "react";
import { MedalWorkbench } from "@/components/medal-workbench";

/// 静态导出: 这一个 page 同时承担 /work/ 和 /work/<uuid>/ 两种 URL.
/// CF Pages 的 _redirects 把 /work/* rewrite (200) 到 /work/, 真实 path
/// 仍然在 window.location.pathname 里能读到. 服务端预渲染时 window 不存在,
/// 所以先渲染 null, 客户端 mount 后再解析 id, 避免 hydration mismatch.
export default function WorkPage() {
  const [resolved, setResolved] = useState<{ id?: string } | null>(null);

  useEffect(() => {
    const match = window.location.pathname.match(/\/work\/([^/]+)/);
    setResolved({ id: match?.[1] });
  }, []);

  if (!resolved) return null;
  return <MedalWorkbench initialWorkId={resolved.id} />;
}
