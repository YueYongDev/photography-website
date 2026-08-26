import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { PageTransitionContainer } from "@/components/page-transition";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  await Promise.all([
    trpc.summary.getSummary.prefetch(),
    trpc.travel.getCitySets.prefetch({ limit: 4 }),
  ]);

  return (
    <HydrateClient>
      <PageTransitionContainer>
        <DashboardView />
      </PageTransitionContainer>
    </HydrateClient>
  );
};

export default DashboardPage;
