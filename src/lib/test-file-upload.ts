import dotenv from "dotenv";
import { createS3Client } from "./s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

async function testFileUpload() {
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

    // Create S3 client
    const s3Client = createS3Client();

    // Create a test file content
    const testContent = "This is a test file for upload testing.";
    const buffer = Buffer.from(testContent, "utf-8");
    
    // Define upload parameters
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const key = "test/test-file.txt";
    
    // Upload the test file
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: "text/plain",
    });

    console.log("Uploading test file...");
    const response = await s3Client.send(command);
    console.log("File uploaded successfully");
    console.log("Response:", response);
    
    // Generate public URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
    console.log("Public URL:", publicUrl);
    
    return true;
  } catch (error) {
    console.error("Failed to upload file:", error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFileUpload().then(success => {
    if (success) {
      console.log("File upload test completed successfully");
      process.exit(0);
    } else {
      console.log("File upload test failed");
      process.exit(1);
    }
  });
}

export { testFileUpload };