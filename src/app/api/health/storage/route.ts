import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.CLOUDBASE_MEDIA_GATEWAY_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      {
        status: "degraded",
        storage: "gateway_not_configured",
        provider: "cloudbase-static-hosting",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    const health = (await response.json()) as {
      ok?: boolean;
      credentialsAvailable?: boolean;
    };
    if (!response.ok || !health.ok || !health.credentialsAvailable) {
      throw new Error(`Media gateway health returned ${response.status}`);
    }

    return NextResponse.json({
      status: "ok",
      storage: "reachable",
      provider: "cloudbase-static-hosting",
    });
  } catch (error) {
    console.error("CloudBase media gateway health check failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        status: "degraded",
        storage: "unreachable",
        provider: "cloudbase-static-hosting",
      },
      { status: 503 }
    );
  }
}
