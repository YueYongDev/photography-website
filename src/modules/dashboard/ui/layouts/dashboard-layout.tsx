import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import styles from "../studio.module.css";

export const DashboardLayout = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; image?: string | null };
}) => {
  return (
    <SidebarProvider
      className={styles.shell}
      style={{ "--sidebar-width": "17.5rem" } as React.CSSProperties}
    >
      <DashboardSidebar user={user} />
      <SidebarInset className={styles.workspace}>
        <DashboardNavbar user={user} />
        <div className={styles.workspaceMain}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
