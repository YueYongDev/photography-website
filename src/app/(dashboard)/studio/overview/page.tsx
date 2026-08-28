import { PageTransitionContainer } from "@/components/page-transition";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const StudioOverviewPage = () => {
  void trpc.summary.getSummary.prefetch();
  void trpc.travel.getCitySets.prefetch({ limit: 4 });

  return (
    <HydrateClient>
      <PageTransitionContainer>
        <DashboardView />
      </PageTransitionContainer>
    </HydrateClient>
  );
};

export default StudioOverviewPage;
