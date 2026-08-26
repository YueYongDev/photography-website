import { TravelSection } from "../sections/travel-section";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type TravelArchive =
  inferRouterOutputs<AppRouter>["travel"]["getArchive"];

export const TravelView = ({ archive }: { archive: TravelArchive }) => {
  return (
    <div className="min-h-screen w-full">
      <TravelSection archive={archive} />
    </div>
  );
};
