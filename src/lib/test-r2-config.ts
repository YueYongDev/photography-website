import dotenv from "dotenv";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { createS3Client } from "./s3-client";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Create S3 client after loading environment variables
const s3Client = createS3Client();

async function testR2Config() {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = [
      "CLOUDFLARE_R2_ENDPOINT",
      "CLOUDFLARE_R2_ACCESS_KEY_ID",
      "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
      "CLOUDFLARE_R2_BUCKET_NAME",
      "CLOUDFLARE_R2_PUBLIC_URL"
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      console.error("Missing environment variables:", missingEnvVars);
      process.exit(1);
    }

    console.log("All required environment variables are set");

    // Test connection by listing objects in the bucket
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1
    });

    const response = await s3Client.send(command);
    console.log("Successfully connected to Cloudflare R2");
    console.log("Bucket name:", bucketName);
    console.log("Number of objects in bucket:", response.KeyCount);
    
    return true;
  } catch (error) {
    console.error("Failed to connect to Cloudflare R2:", error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testR2Config().then(success => {
    if (success) {
      console.log("Cloudflare R2 configuration is correct");
      process.exit(0);
    } else {
      console.log("Cloudflare R2 configuration is incorrect");
      process.exit(1);
    }
  });
}

export { testR2Config };