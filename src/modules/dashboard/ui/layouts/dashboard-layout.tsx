import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <DashboardNavbar />
        <div className="flex flex-1 h-[calc(100vh-4rem)] mt-16">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
