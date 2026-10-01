import "server-only";

type SqlParameter = string | number | boolean | null;

function toParameter(value: unknown): SqlParameter {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.toISOString();
  throw new Error("Unsupported PostgreSQL parameter type");
}

/** Free CloudBase shared clusters expose HTTPS SQL, but no TCP endpoint. */
export async function executePgSql(query: string, parameters: unknown[] = []) {
  const envId = process.env.CLOUDBASE_ENV_ID;
  const apiKey = process.env.CLOUDBASE_API_KEY;
  if (!envId || !/^[a-z0-9-]+$/.test(envId) || !apiKey) {
    throw new Error("CLOUDBASE_ENV_ID and server-only CLOUDBASE_API_KEY must be configured");
  }

  const response = await fetch(`https://${envId}.api.tcloudbasegateway.com/v1/rdb/exec-pgsql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql: query, parameters: parameters.map(toParameter), role: "cloudbase_postgres" }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const result: unknown = await response.json();
  if (!response.ok || !Array.isArray(result)) {
    const code = result && typeof result === "object" && "code" in result ? String(result.code) : "INVALID_RESPONSE";
    // SQL errors can contain passwords, session tokens or photo text. Never log the payload.
    throw new Error(`CloudBase PostgreSQL request failed (${response.status}, ${code})`);
  }
  if (!result.every((row): row is Record<string, unknown> => row !== null && typeof row === "object" && !Array.isArray(row))) {
    throw new Error("CloudBase PostgreSQL returned invalid rows");
  }
  return result;
}

/** Return ordered arrays for Drizzle; the HTTP API sorts JSON object keys. */
export async function drizzlePgQuery(query: string, parameters: unknown[], method: "all" | "execute") {
  const statement = query.trim().replace(/;$/, "");
  if (method === "all") {
    // Keep the column order (including repeated column names) inside PostgreSQL.
    // json_each, unlike jsonb_each, preserves the SELECT list's order.
    const rows = await executePgSql(`WITH "__drizzle" AS (${statement})
      SELECT (SELECT json_agg(value ORDER BY ordinality)
        FROM json_each(row_to_json("__drizzle")) WITH ORDINALITY) AS "__values"
      FROM "__drizzle"`, parameters);
    return { rows: rows.map((row) => {
      if (!Array.isArray(row.__values)) throw new Error("PostgreSQL row mapping failed");
      return row.__values;
    }) };
  }
  // Better Auth uses the affected-row count for session revocation and bulk writes.
  // pg-proxy returns the row array directly, so RETURNING makes its length accurate.
  const sql = /^(insert|update|delete)\b/i.test(statement) && !/\breturning\b/i.test(statement)
    ? `${statement} RETURNING 1 AS "affected"`
    : statement;
  return { rows: await executePgSql(sql, parameters) };
}
