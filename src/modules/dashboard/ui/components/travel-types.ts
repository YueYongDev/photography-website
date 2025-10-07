import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type TravelCitySetsOutput =
  inferRouterOutputs<AppRouter>["travel"]["getCitySets"];

export type DashboardTravelCitySet =
  TravelCitySetsOutput["items"][number];
