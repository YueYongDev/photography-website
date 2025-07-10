import { db } from "@/db/drizzle";
import { photos } from "@/db/schema/photos";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const mapRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const data = await db.select().from(photos);

    return data;
  }),
});
