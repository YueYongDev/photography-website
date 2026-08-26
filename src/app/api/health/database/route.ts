import { checkDatabaseConnection } from "@/db/drizzle";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getDatabaseErrorMetadata(error: unknown) {
  if (!error || typeof error !== "object") {
    return { name: "UnknownError", code: "UNKNOWN" };
  }

  const candidate = error as {
    name?: unknown;
    code?: unknown;
    errno?: unknown;
    sqlState?: unknown;
  };

  return {
    name: typeof candidate.name === "string" ? candidate.name : "Error",
    code: typeof candidate.code === "string" ? candidate.code : "UNKNOWN",
    errno: typeof candidate.errno === "number" ? candidate.errno : undefined,
    sqlState:
      typeof candidate.sqlState === "string" ? candidate.sqlState : undefined,
  };
}

export async function GET() {
  try {
    await Promise.race([
      checkDatabaseConnection(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database health check timed out")), 5_000)
      ),
    ]);

    return NextResponse.json({ status: "ok", database: "reachable" });
  } catch (error) {
    // Keep diagnostics useful without logging the connection string, host,
    // credentials, query text, or raw driver error message.
    console.error(
      "Database health check failed",
      getDatabaseErrorMetadata(error)
    );
    return NextResponse.json(
      { status: "degraded", database: "unreachable" },
      { status: 503 }
    );
  }
}
