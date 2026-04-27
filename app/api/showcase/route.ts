import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const file = await readFile(
    path.join(process.cwd(), "public", "showcase", "medal-forge-works.zip"),
  );

  return new Response(new Uint8Array(file), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": 'attachment; filename="medal-forge-showcase.zip"',
      "Content-Type": "application/zip",
    },
  });
}
