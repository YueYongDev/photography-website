import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { PageTransitionContainer } from "@/components/page-transition";

const DashboardPage = () => {
  return (
    <PageTransitionContainer>
      <DashboardView />
    </PageTransitionContainer>
  );
};

export default DashboardPage;
