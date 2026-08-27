import { NextResponse } from "next/server";
import { checkQiniuStorageConnection } from "@/lib/qiniu-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await Promise.race([
      checkQiniuStorageConnection(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Qiniu health check timed out")), 5_000)
      ),
    ]);

    return NextResponse.json({
      status: "ok",
      storage: "reachable",
      provider: "qiniu-kodo",
    });
  } catch (error) {
    console.error("Qiniu storage health check failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        status: "degraded",
        storage: "unreachable",
        provider: "qiniu-kodo",
      },
      { status: 503 }
    );
  }
}
