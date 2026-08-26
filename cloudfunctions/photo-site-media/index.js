const crypto = require("crypto");
const http = require("http");
const { DeleteObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const KEY_PATTERN = /^photo-site\/photos\/[a-f0-9-]{16,80}\.(?:avif|gif|jpe?g|png|webp)$/;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
}

function secretsEqual(provided, expected) {
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function isAuthorized(req) {
  const expected = process.env.MEDIA_GATEWAY_SECRET || "";
  const authorization = req.headers.authorization || "";
  const provided = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  return secretsEqual(provided, expected);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Image exceeds the 2 MiB gateway limit"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function createStorageClient() {
  const region = requiredEnv("CLOUDBASE_STATIC_REGION");
  const accessKeyId = requiredEnv("TENCENTCLOUD_SECRETID");
  const secretAccessKey = requiredEnv("TENCENTCLOUD_SECRETKEY");
  const sessionToken = process.env.TENCENTCLOUD_SESSIONTOKEN;

  return new S3Client({
    region,
    endpoint: `https://cos.${region}.myqcloud.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
      ...(sessionToken ? { sessionToken } : {}),
    },
  });
}

async function putObject(req, res) {
  const key = req.headers["x-photo-site-key"];
  const contentType = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();

  if (typeof key !== "string" || !KEY_PATTERN.test(key)) {
    sendJson(res, 400, { error: "invalid_object_key" });
    return;
  }
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    sendJson(res, 415, { error: "unsupported_image_type" });
    return;
  }

  const body = await readBody(req);
  if (!body.length) {
    sendJson(res, 400, { error: "empty_image" });
    return;
  }

  await createStorageClient().send(
    new PutObjectCommand({
      Bucket: requiredEnv("CLOUDBASE_STATIC_BUCKET"),
      Key: key,
      Body: body,
      ContentLength: body.length,
      ContentType: contentType,
      ContentDisposition: "inline",
      CacheControl: "public, max-age=300, s-maxage=600",
    })
  );

  const publicBase = requiredEnv("CLOUDBASE_STATIC_PUBLIC_URL").replace(/\/$/, "");
  sendJson(res, 201, { key, publicUrl: `${publicBase}/${key}` });
}

async function deleteObject(req, res) {
  const key = req.headers["x-photo-site-key"];
  if (typeof key !== "string" || !KEY_PATTERN.test(key)) {
    sendJson(res, 400, { error: "invalid_object_key" });
    return;
  }

  await createStorageClient().send(
    new DeleteObjectCommand({
      Bucket: requiredEnv("CLOUDBASE_STATIC_BUCKET"),
      Key: key,
    })
  );
  sendJson(res, 200, { deleted: true, key });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      ok: true,
      credentialsAvailable: Boolean(
        process.env.TENCENTCLOUD_SECRETID && process.env.TENCENTCLOUD_SECRETKEY
      ),
    });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "unauthorized" });
    return;
  }

  try {
    if (req.method === "PUT" && req.url === "/object") {
      await putObject(req, res);
      return;
    }
    if (req.method === "DELETE" && req.url === "/object") {
      await deleteObject(req, res);
      return;
    }
    sendJson(res, 404, { error: "not_found" });
  } catch (error) {
    console.error("Media gateway request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    if (!res.headersSent) {
      sendJson(res, error && error.statusCode ? error.statusCode : 500, {
        error: "storage_operation_failed",
      });
    }
  }
});

server.listen(9000, "0.0.0.0");
