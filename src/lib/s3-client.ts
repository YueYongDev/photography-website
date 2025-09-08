import { S3Client } from "@aws-sdk/client-s3";

// Function to initialize S3 client with Cloudflare R2 configuration
export function createS3Client() {
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!endpoint) {
    throw new Error("CLOUDFLARE_R2_ENDPOINT is not defined in environment variables");
  }

  if (!accessKeyId) {
    throw new Error("CLOUDFLARE_R2_ACCESS_KEY_ID is not defined in environment variables");
  }

  if (!secretAccessKey) {
    throw new Error("CLOUDFLARE_R2_SECRET_ACCESS_KEY is not defined in environment variables");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}
