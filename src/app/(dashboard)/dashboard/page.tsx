import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  void trpc.travel.getCitySets.prefetch({
    limit: 4,
  });
  void trpc.summary.getSummary.prefetch();

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
};

export default DashboardPage;
