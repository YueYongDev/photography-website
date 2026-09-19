import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const roadbookRoot =
  "/Users/yueyong/Documents/Codex/2026-09-07/wo/outputs";
const roadbookFile = "georgia-solo-travel-guide-2026.html";
const mapFile = "georgia-east-loop-map.png";

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

const isSafeAssetName = (value: string) =>
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);

const resolveRoadbookAsset = (asset: string[] | undefined) => {
  if (!asset || asset.length === 0) {
    return path.join(roadbookRoot, roadbookFile);
  }

  if (asset.length === 1 && asset[0] === mapFile) {
    return path.join(roadbookRoot, mapFile);
  }

  if (
    asset.length === 2 &&
    asset[0] === "georgia-assets" &&
    isSafeAssetName(asset[1])
  ) {
    return path.join(roadbookRoot, "georgia-assets", asset[1]);
  }

  return null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset?: string[] }> },
) {
  const { asset } = await params;
  const filePath = resolveRoadbookAsset(asset);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const contents = await readFile(filePath);
    const contentType = contentTypes[path.extname(filePath).toLowerCase()];

    if (!contentType) {
      return new Response("Unsupported file type", { status: 415 });
    }

    const body =
      path.extname(filePath).toLowerCase() === ".html"
        ? contents
            .toString("utf8")
            .replace(
              "<head>",
              '<head>\n  <base href="/local-roadbook/georgia/">',
            )
        : new Uint8Array(contents);

    return new Response(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch {
    return new Response("Local roadbook is unavailable", { status: 404 });
  }
}
