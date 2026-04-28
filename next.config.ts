import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactStrictMode: true,
  // 静态导出 -> Cloudflare Pages.
  // 配套约束: 不能用 server-only 特性 (API routes / SSR / cookies / headers).
  output: "export",
  // 必需: 让 next 输出 out/work/index.html (而不是 out/work.html).
  // SPA fallback 需要这个目录形式, _redirects 才能把 /work/<uuid> rewrite 到它.
  trailingSlash: true,
  // next/image 优化器需要 server runtime, 静态导出必须关.
  images: { unoptimized: true },
};

export default nextConfig;
