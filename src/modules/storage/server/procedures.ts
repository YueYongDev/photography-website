import { z } from "zod";

import { createPhotoUploadTicket } from "@/lib/qiniu-storage";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const supportedImageType = z
  .string()
  .refine(
    (value) =>
      [
        "image/avif",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(value),
    "Unsupported image type"
  );

export const storageRouter = createTRPCRouter({
  createPhotoUpload: protectedProcedure
    .input(z.object({ contentType: supportedImageType }))
    .mutation(({ input }) => createPhotoUploadTicket(input.contentType)),
});
